<script>
	import Modal from './Modal.svelte'
	import Button from '@components/layout/Button.svelte'

	import {
		formatHistoryItem,
		formatOrderType,
		formatSide
	} from '@lib/formatters'
	import { get } from 'svelte/store'
	import { address } from '@lib/stores'
	import { hideModal, showToast } from '@lib/ui'
	import { getUserHistoryForExport } from '@api/history'

	let timeframe = '30';
	let customFrom;
	let customTo;
	let isExporting = false;
	let exportedCount = 0;

	const columns = [
		['orderId', 'ID'],
		['timestamp', 'Time'],
		['isLong', 'Side'],
		['market', 'Market'],
		['price', 'Price'],
		['size', 'Size'],
		['asset', 'Asset'],
		['margin', 'Margin'],
		['leverage', 'Leverage'],
		['orderType', 'Type'],
		['isReduceOnly', 'Reduce Only'],
		['status', 'Status'],
		['reason', 'Reason'],
		['pnl', 'PnL'],
		['fee', 'Fee'],
		['expiry', 'Expiry'],
		['cancelOrderId', 'OCO']
	];

	function getDateStart(dateString) {
		if (!dateString) return;
		return new Date(`${dateString}T00:00:00`).getTime() / 1000;
	}

	function getDateEnd(dateString) {
		if (!dateString) return;
		return new Date(`${dateString}T23:59:59`).getTime() / 1000;
	}

	function getRange() {
		const now = Date.now() / 1000;

		if (timeframe == 'all') {
			return {fromTimestamp: 0, toTimestamp: now};
		}

		if (timeframe == 'custom') {
			return {
				fromTimestamp: getDateStart(customFrom) || 0,
				toTimestamp: getDateEnd(customTo) || now
			};
		}

		return {
			fromTimestamp: now - (timeframe * 1 * 24 * 60 * 60),
			toTimestamp: now
		};
	}

	function formatTimestamp(timestamp) {
		if (!timestamp || timestamp * 1 == 0) return '';
		return new Date(timestamp * 1000).toISOString();
	}

	function csvEscape(value) {
		if (value == undefined || value == null) return '';
		value = `${value}`;
		if (value.includes('"') || value.includes(',') || value.includes('\n')) {
			return `"${value.replace(/"/g, '""')}"`;
		}
		return value;
	}

	function getCsvValue(item, key) {
		switch(key) {
			case 'timestamp':
			case 'expiry':
				return formatTimestamp(item[key]);
			case 'isLong':
				return formatSide(item.isLong, item.isReduceOnly, item.pnl);
			case 'orderType':
				return formatOrderType(item.orderType);
			case 'isReduceOnly':
				return item.isReduceOnly ? 'Yes' : 'No';
			case 'leverage':
				return item.leverage || '';
			case 'reason':
				return item.reason || '';
			case 'cancelOrderId':
				return item.cancelOrderId * 1 > 0 ? item.cancelOrderId : '';
			default:
				return item[key] == undefined || item[key] == null ? '' : item[key];
		}
	}

	function buildCsv(rows) {
		const header = columns.map(([, label]) => csvEscape(label)).join(',');
		const csvRows = rows.map((row) => {
			const item = formatHistoryItem(row);
			return columns.map(([key]) => csvEscape(getCsvValue(item, key))).join(',');
		});
		return [header].concat(csvRows).join('\n');
	}

	function downloadCsv(csv) {
		const blob = new Blob([csv], {type: 'text/csv;charset=utf-8'});
		const url = URL.createObjectURL(blob);
		const anchor = document.createElement('a');
		anchor.href = url;
		anchor.download = `cap-history-${new Date().toISOString().slice(0, 10)}.csv`;
		document.body.appendChild(anchor);
		anchor.click();
		document.body.removeChild(anchor);
		URL.revokeObjectURL(url);
	}

	async function exportHistory() {
		if (!get(address)) {
			showToast('Connect a wallet before exporting history.');
			return;
		}

		isExporting = true;
		exportedCount = 0;

		try {
			const rows = await getUserHistoryForExport(getRange());
			exportedCount = rows.length;
			downloadCsv(buildCsv(rows));
			showToast(`Exported ${rows.length} history items.`, 1);
			hideModal();
		} catch(e) {
			console.error('history export failed', e);
			showToast('History export failed.');
		}

		isExporting = false;
	}
</script>

<style>
	.note {
		color: var(--text300);
		font-size: 90%;
		line-height: 1.418;
		margin-bottom: var(--base-padding);
	}

	.select {
		width: 100%;
		height: 48px;
		padding: 0 14px;
		border: 1px solid var(--layer200);
		border-radius: var(--base-radius);
		background-color: var(--layer50);
		color: var(--text0);
		font: inherit;
	}

	.date-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--semi-padding);
	}

	label {
		display: block;
		color: var(--text400);
		font-size: 80%;
		margin-bottom: 6px;
	}

	input {
		width: 100%;
		box-sizing: border-box;
		height: 48px;
		padding: 0 14px;
		border: 1px solid var(--layer200);
		border-radius: var(--base-radius);
		background-color: var(--layer50);
		color: var(--text0);
		font: inherit;
	}

	.count {
		color: var(--text300);
		font-size: 85%;
		margin-top: var(--semi-padding);
	}
</style>

<Modal title='Export Trading History' width={360}>
	<div class='container'>
		<div class='note'>
			Download a CSV report for the currently selected history status filters.
		</div>

		<div class='group'>
			<select class='select' bind:value={timeframe}>
				<option value='7'>Last 7 days</option>
				<option value='30'>Last 30 days</option>
				<option value='90'>Last 90 days</option>
				<option value='all'>All history</option>
				<option value='custom'>Custom range</option>
			</select>
		</div>

		{#if timeframe == 'custom'}
			<div class='group date-grid'>
				<div>
					<label for='history-export-from'>From</label>
					<input id='history-export-from' type='date' bind:value={customFrom} />
				</div>
				<div>
					<label for='history-export-to'>To</label>
					<input id='history-export-to' type='date' bind:value={customTo} />
				</div>
			</div>
		{/if}

		<Button isLoading={isExporting} label='Download CSV' on:click={exportHistory} />

		{#if exportedCount}
			<div class='count'>{exportedCount} rows exported.</div>
		{/if}
	</div>
</Modal>
