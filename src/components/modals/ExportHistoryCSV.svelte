<script>

	import Button from '@components/layout/Button.svelte'
	import Modal from './Modal.svelte'

	import { DEFAULT_HISTORY_COUNT } from '@lib/config'
	import {
		formatHistoryItem,
		formatDate,
		formatForDisplay,
		formatOrderType,
		formatSide,
		formatMarketName,
		formatPriceForDisplay
	} from '@lib/formatters'
	import { hideModal, showToast } from '@lib/ui'

	import { fetchUserHistoryPage } from '@api/history'

	const PAGE_SIZE = Math.max(DEFAULT_HISTORY_COUNT, 100);
	const headers = [
		'ID',
		'Time',
		'Side',
		'Market',
		'Price',
		'Size',
		'Margin',
		'Leverage',
		'Order Type',
		'Reduce Only',
		'Status',
		'Reason',
		'P/L',
		'Fee',
		'Expiry',
		'OCO Order ID'
	];

	let toDate = getDateInputValue(new Date());
	let fromDate = getDateInputValue(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
	let isExporting = false;
	let exportedCount = 0;
	let errorMessage = '';

	function getDateInputValue(date) {
		return date.toISOString().slice(0, 10);
	}

	function getDateBounds() {
		return {
			from: fromDate ? new Date(`${fromDate}T00:00:00`).getTime() / 1000 : null,
			to: toDate ? new Date(`${toDate}T23:59:59.999`).getTime() / 1000 : null
		};
	}

	function isInRange(item, from, to) {
		const timestamp = item.timestamp * 1;
		if (from && timestamp < from) return false;
		if (to && timestamp > to) return false;
		return true;
	}

	function formatAmount(amount, asset) {
		if (amount == undefined || amount === '') return '';
		return `${formatForDisplay(amount)} ${asset}`;
	}

	function formatPnlForCSV(item) {
		if (!item.pnl) return '';
		const percent = item.margin * 1 ? 100 * item.pnl / item.margin : 0;
		return `${formatForDisplay(item.pnl)} ${item.asset} (${formatForDisplay(percent)}%)`;
	}

	function getCSVRows(items) {
		return items.map((item) => {
			item = formatHistoryItem(item);
			return [
				item.status == 'liquidated' ? 'liq' : item.orderId,
				formatDate(item.timestamp) || '',
				formatSide(item.isLong, item.isReduceOnly),
				formatMarketName(item.market),
				item.price * 1 > 0 ? formatPriceForDisplay(item.price) : '',
				formatAmount(item.size, item.asset),
				formatAmount(item.margin, item.asset),
				item.leverage ? `${formatForDisplay(item.leverage)}x` : '',
				formatOrderType(item.orderType),
				item.isReduceOnly ? 'Yes' : 'No',
				item.status,
				item.reason || '',
				formatPnlForCSV(item),
				formatAmount(item.fee, item.asset),
				formatDate(item.expiry) || '',
				item.cancelOrderId * 1 > 0 ? item.cancelOrderId : ''
			];
		});
	}

	function buildCSV(rows) {
		const workerCode = `
			function escapeCSV(value) {
				value = value == null ? '' : String(value);
				if (/[",\\n]/.test(value)) return '"' + value.replace(/"/g, '""') + '"';
				return value;
			}
			self.onmessage = function(event) {
				const csv = event.data.rows.map(function(row) {
					return row.map(escapeCSV).join(',');
				}).join('\\n');
				self.postMessage(csv);
			};
		`;
		const workerUrl = URL.createObjectURL(new Blob([workerCode], { type: 'text/javascript' }));
		const worker = new Worker(workerUrl);

		return new Promise((resolve, reject) => {
			worker.onmessage = (event) => {
				worker.terminate();
				URL.revokeObjectURL(workerUrl);
				resolve(event.data);
			};
			worker.onerror = (event) => {
				worker.terminate();
				URL.revokeObjectURL(workerUrl);
				reject(event);
			};
			worker.postMessage({ rows });
		});
	}

	function downloadCSV(csv) {
		const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		const range = fromDate || toDate ? `-${fromDate || 'all'}-${toDate || 'now'}` : '';
		link.href = url;
		link.download = `cap-history${range}.csv`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	}

	async function exportHistory() {
		if (isExporting) return;
		errorMessage = '';
		exportedCount = 0;

		const { from, to } = getDateBounds();
		if (from && to && from > to) {
			errorMessage = 'From date must be before the to date.';
			return;
		}

		isExporting = true;

		try {
			let skip = 0;
			let rows = [headers];
			let shouldContinue = true;

			while (shouldContinue) {
				const page = await fetchUserHistoryPage({ first: PAGE_SIZE, skip }) || [];
				const filteredPage = page.filter((item) => isInRange(item, from, to));
				rows = rows.concat(getCSVRows(filteredPage));
				exportedCount += filteredPage.length;

				const lastItem = page[page.length - 1];
				if (page.length < PAGE_SIZE || !lastItem || from && lastItem.timestamp * 1 < from) {
					shouldContinue = false;
				} else {
					skip += PAGE_SIZE;
					await new Promise((resolve) => setTimeout(resolve));
				}
			}

			if (rows.length == 1) {
				errorMessage = 'No history found for the selected range.';
				return;
			}

			downloadCSV(await buildCSV(rows));
			showToast(`Exported ${exportedCount} history items.`, 1);
			hideModal();
		} catch(e) {
			console.error('history CSV export error', e);
			errorMessage = 'Unable to export history. Please try again.';
		} finally {
			isExporting = false;
		}
	}

</script>

<style>

	.content {
		padding: var(--base-padding);
	}

	.note {
		color: var(--text300);
		line-height: 1.45;
		margin-bottom: var(--base-padding);
	}

	.range {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--semi-padding);
	}

	label {
		display: grid;
		gap: 8px;
		color: var(--text300);
		font-size: 13px;
		font-weight: 600;
	}

	input {
		height: 42px;
		border-radius: var(--base-radius);
		border: 1px solid var(--layer200);
		background-color: var(--layer50);
		color: var(--text0);
		padding: 0 12px;
		font-size: 14px;
		font-family: inherit;
		box-sizing: border-box;
	}

	input:focus {
		border-color: var(--primary);
	}

	.error {
		margin-top: var(--semi-padding);
		color: var(--secondary);
		font-size: 13px;
	}

	.footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-top: var(--base-padding);
	}

	.progress {
		color: var(--text400);
		font-size: 13px;
	}

	@media all and (max-width: 600px) {
		.range {
			grid-template-columns: 1fr;
		}
	}

</style>

<Modal title='Export History' width={460}>
	<form class='content' on:submit|preventDefault={exportHistory}>
		<div class='note'>
			Download a CSV report for the selected trading history range. Leave dates empty to export all available history.
		</div>

		<div class='range'>
			<label>
				From
				<input type='date' bind:value={fromDate} />
			</label>
			<label>
				To
				<input type='date' bind:value={toDate} />
			</label>
		</div>

		{#if errorMessage}
		<div class='error'>{errorMessage}</div>
		{/if}

		<div class='footer'>
			<div class='progress'>{#if isExporting}Preparing {exportedCount} rows...{/if}</div>
			<Button label='Download CSV' noSubmit={false} isLoading={isExporting} />
		</div>
	</form>
</Modal>
