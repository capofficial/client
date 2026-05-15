<script>
	
	import Modal from './Modal.svelte'
	import Button from '@components/layout/Button.svelte'

	import { onMount } from 'svelte'
	import { get } from 'svelte/store'
	import { historySorted } from '@lib/stores'
	import { formatDate } from '@lib/formatters'
	import { hideModal } from '@lib/ui'

	let isExporting = false;
	let startDate = '';
	let endDate = '';

	// Set sensible defaults
	let now = new Date();
	let thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
	startDate = thirtyDaysAgo.toISOString().split('T')[0];
	endDate = now.toISOString().split('T')[0];

	function formatForCsv(value) {
		if (value === undefined || value === null) return '';
		const str = String(value);
		if (str.includes(',') || str.includes('"') || str.includes('\n')) {
			return '"' + str.replace(/"/g, '""') + '"';
		}
		return str;
	}

	async function exportCsv() {
		isExporting = true;

		try {
			const items = get(historySorted);

			if (!items || items.length === 0) {
				alert('No trades to export.');
				isExporting = false;
				return;
			}

			// Filter by date range
			const start = startDate ? new Date(startDate).getTime() / 1000 : 0;
			const end = endDate ? new Date(endDate + 'T23:59:59').getTime() / 1000 : Infinity;

			const filtered = items.filter(item => {
				const ts = item.timestamp;
				return ts >= start && ts <= end;
			});

			if (filtered.length === 0) {
				alert('No trades found in the selected date range.');
				isExporting = false;
				return;
			}

			const columns = [
				{ key: 'orderId', label: 'Order ID' },
				{ key: 'timestamp', label: 'Date' },
				{ key: 'isLong', label: 'Side' },
				{ key: 'market', label: 'Market' },
				{ key: 'price', label: 'Price' },
				{ key: 'size', label: 'Size' },
				{ key: 'margin', label: 'Margin' },
				{ key: 'leverage', label: 'Leverage' },
				{ key: 'orderType', label: 'Order Type' },
				{ key: 'status', label: 'Status' },
				{ key: 'pnl', label: 'PnL' },
				{ key: 'fee', label: 'Fee' },
				{ key: 'asset', label: 'Asset' },
				{ key: 'isReduceOnly', label: 'Reduce Only' },
				{ key: 'reason', label: 'Reason' },
				{ key: 'cancelOrderId', label: 'OCO Order' }
			];

			const formatters = {
				date: (v) => v ? formatDate(v) : '',
				side: (v) => v ? 'Long' : 'Short',
				boolean: (v) => v ? 'Yes' : 'No'
			};

			// Use web worker for large datasets
			if (filtered.length > 500 && typeof Worker !== 'undefined') {
				const worker = new Worker('/export-worker.js');

				worker.onmessage = function(e) {
					if (e.data.error) {
						alert(e.data.error);
					} else {
						downloadCsv(e.data.csv);
					}
					worker.terminate();
					isExporting = false;
				};

				worker.postMessage({
					items: filtered.map(item => ({
						orderId: item.status === 'liquidated' ? 'Liq' : item.orderId,
						timestamp: formatters.date(item.timestamp),
						isLong: formatters.side(item.isLong),
						market: item.market || '',
						price: item.price * 1 > 0 ? item.price : '',
						size: item.size || '',
						margin: item.margin || '',
						leverage: item.leverage || '',
						orderType: item.orderType || '',
						status: item.status || '',
						pnl: item.pnl || '',
						fee: item.fee || '',
						asset: item.asset || '',
						isReduceOnly: formatters.boolean(item.isReduceOnly),
						reason: item.reason || '',
						cancelOrderId: item.cancelOrderId * 1 > 0 ? item.cancelOrderId : ''
					})),
					columns: columns,
					formatters: {}
				});

			} else {
				// Process synchronously for small datasets
				let csv = columns.map(c => c.label).join(',') + '\n';

				for (const item of filtered) {
					const row = [
						formatForCsv(item.status === 'liquidated' ? 'Liq' : item.orderId),
						formatForCsv(formatters.date(item.timestamp)),
						formatForCsv(formatters.side(item.isLong)),
						formatForCsv(item.market),
						formatForCsv(item.price * 1 > 0 ? item.price : ''),
						formatForCsv(item.size),
						formatForCsv(item.margin),
						formatForCsv(item.leverage || ''),
						formatForCsv(item.orderType),
						formatForCsv(item.status),
						formatForCsv(item.pnl || ''),
						formatForCsv(item.fee),
						formatForCsv(item.asset),
						formatForCsv(formatters.boolean(item.isReduceOnly)),
						formatForCsv(item.reason || ''),
						formatForCsv(item.cancelOrderId * 1 > 0 ? item.cancelOrderId : '')
					];
					csv += row.join(',') + '\n';
				}

				downloadCsv(csv);
				isExporting = false;
			}

		} catch(e) {
			console.error('Export error', e);
			isExporting = false;
		}
	}

	function downloadCsv(csv) {
		const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = `cap-trading-history-${startDate}-to-${endDate}.csv`;
		link.click();
		URL.revokeObjectURL(url);
		hideModal();
	}

</script>

<style>
	.row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 16px;
	}

	.row label {
		color: var(--text300);
		font-size: 90%;
	}

	.row input {
		background: var(--layer50);
		border: 1px solid var(--layer100);
		border-radius: 4px;
		color: var(--text1);
		padding: 6px 10px;
		font-size: 90%;
		width: 140px;
	}

	.hint {
		color: var(--text400);
		font-size: 80%;
		margin-bottom: 16px;
	}

	.button {
		margin-top: 8px;
	}
</style>

<Modal title='Export Trading History' width={300}>

	<div class='container'>

		<div class='row'>
			<label for='start-date'>From</label>
			<input type='date' id='start-date' bind:value={startDate} />
		</div>

		<div class='row'>
			<label for='end-date'>To</label>
			<input type='date' id='end-date' bind:value={endDate} />
		</div>

		<div class='hint'>
			Default: last 30 days. Large exports are processed in a background thread.
		</div>

		<div class='button'>
			<Button isLoading={isExporting} label='Download CSV' on:click={exportCsv} />
		</div>

	</div>

</Modal>
