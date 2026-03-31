<script>
	
	import Modal from './Modal.svelte'

	import { hideModal } from '@lib/ui'
	import { history, historySorted } from '@lib/stores'
	import { formatHistoryItem, formatDate, formatForDisplay, formatSide, formatOrderType } from '@lib/formatters'

	let startDate = '';
	let endDate = '';
	let isExporting = false;
	let exportProgress = 0;
	let errorMessage = '';

	function getTimestamp(dateStr) {
		if (!dateStr) return 0;
		return Math.floor(new Date(dateStr).getTime() / 1000);
	}

	function filterByDateRange(items, startTs, endTs) {
		if (!startTs && !endTs) return items;
		return items.filter(item => {
			const ts = item.timestamp * 1;
			if (startTs && ts < startTs) return false;
			if (endTs) {
				// End date is inclusive, set to end of day
				const endOfDay = endTs + 86400 - 1;
				if (ts > endOfDay) return false;
			}
			return true;
		});
	}

	async function exportCSV() {
		if (isExporting) return;
		
		errorMessage = '';
		isExporting = true;
		exportProgress = 0;

		try {
			const startTs = getTimestamp(startDate);
			const endTs = getTimestamp(endDate);
			
			// Get all history items (not just the sorted/displayed ones)
			const allItems = $history;
			const filteredItems = filterByDateRange(allItems, startTs, endTs);

			if (filteredItems.length === 0) {
				errorMessage = 'No trades found in the selected date range.';
				isExporting = false;
				return;
			}

			// CSV headers
			const headers = [
				'Order ID',
				'Timestamp',
				'Date (Local)',
				'Side',
				'Market',
				'Price',
				'Size',
				'Asset',
				'Margin',
				'Leverage',
				'Order Type',
				'Reduce Only',
				'Status',
				'Reason',
				'PnL',
				'Fee',
				'Expiry',
				'OCO Order ID'
			];

			const rows = [];
			const totalItems = filteredItems.length;
			const chunkSize = 100;

			// Process in chunks to avoid blocking UI
			for (let i = 0; i < filteredItems.length; i += chunkSize) {
				const chunk = filteredItems.slice(i, i + chunkSize);
				
				for (const item of chunk) {
					const formatted = formatHistoryItem(item);
					const pnlPercent = formatted.margin * 1 > 0 && formatted.pnl 
						? ((formatted.pnl * 100) / formatted.margin).toFixed(2) + '%' 
						: '';
					
					rows.push([
						formatted.status === 'liquidated' ? 'Liq' : formatted.orderId,
						formatted.timestamp || '',
						formatted.timestamp ? formatDate(formatted.timestamp) : '',
						formatSide(formatted.isLong, formatted.isReduceOnly),
						formatted.market || '',
						formatted.price * 1 > 0 ? formatted.price : '',
						formatted.size || '',
						formatted.asset || '',
						formatted.margin || '',
						formatted.leverage ? formatted.leverage.toFixed(2) : '',
						formatOrderType(formatted.orderType),
						formatted.isReduceOnly ? 'Yes' : 'No',
						formatted.status || '',
						formatted.reason || '',
						formatted.pnl || '',
						formatted.fee || '',
						formatted.expiry ? formatDate(formatted.expiry) : '',
						formatted.cancelOrderId * 1 > 0 ? formatted.cancelOrderId : ''
					]);
				}

				exportProgress = Math.round((i + chunk.length) / totalItems * 100);
				
				// Yield to UI
				await new Promise(resolve => setTimeout(resolve, 0));
			}

			// Build CSV string
			const csvContent = [
				headers.join(','),
				...rows.map(row => row.map(cell => {
					// Escape quotes and wrap in quotes if contains comma or newline
					const str = String(cell ?? '');
					if (str.includes(',') || str.includes('"') || str.includes('\n')) {
						return '"' + str.replace(/"/g, '""') + '"';
					}
					return str;
				}).join(','))
			].join('\n');

			// Create and download file
			const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
			const url = URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			link.download = `trading-history-${new Date().toISOString().split('T')[0]}.csv`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(url);

			exportProgress = 100;
			setTimeout(() => {
				hideModal();
			}, 500);

		} catch (e) {
			console.error('CSV export error:', e);
			errorMessage = 'Failed to export CSV: ' + (e.message || 'Unknown error');
		} finally {
			isExporting = false;
		}
	}

	// Set default date range to last 30 days
	const today = new Date().toISOString().split('T')[0];
	const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
	startDate = thirtyDaysAgo;
	endDate = today;

</script>

<style>
	.container {
		padding: 20px;
	}
	.row {
		margin-bottom: 16px;
	}
	.row:last-child {
		margin-bottom: 0;
	}
	.label {
		display: block;
		font-weight: 600;
		margin-bottom: 6px;
		font-size: 14px;
	}
	input[type="date"] {
		width: 100%;
		padding: 8px 12px;
		border: 1px solid var(--layer200);
		border-radius: var(--base-radius);
		background-color: var(--layer50);
		color: var(--text0);
		font-size: 14px;
	}
	input[type="date"]:focus {
		outline: none;
		border-color: var(--primary);
	}
	.date-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 12px;
	}
	.button-row {
		display: flex;
		justify-content: flex-end;
		gap: 12px;
		margin-top: 20px;
	}
	.btn {
		padding: 10px 20px;
		border-radius: var(--base-radius);
		font-weight: 600;
		font-size: 14px;
		cursor: pointer;
		border: none;
		transition: all 100ms ease;
	}
	.btn-primary {
		background-color: var(--primary);
		color: var(--layer0);
	}
	.btn-primary:hover:not(:disabled) {
		background-color: var(--primary-highlighted);
	}
	.btn-primary:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
	.btn-secondary {
		background-color: var(--layer100);
		color: var(--text0);
	}
	.btn-secondary:hover {
		background-color: var(--layer200);
	}
	.progress-container {
		margin-top: 16px;
	}
	.progress-bar {
		height: 4px;
		background-color: var(--layer100);
		border-radius: 2px;
		overflow: hidden;
	}
	.progress-fill {
		height: 100%;
		background-color: var(--primary);
		transition: width 100ms ease;
	}
	.progress-text {
		font-size: 12px;
		color: var(--text500);
		margin-top: 6px;
		text-align: center;
	}
	.error {
		color: var(--secondary);
		font-size: 13px;
		margin-top: 12px;
		padding: 8px 12px;
		background-color: rgba(255, 77, 77, 0.1);
		border-radius: var(--base-radius);
	}
	.hint {
		font-size: 12px;
		color: var(--text500);
		margin-top: 4px;
	}
	.total-trades {
		font-size: 13px;
		color: var(--text400);
		margin-bottom: 16px;
		padding: 8px 12px;
		background-color: var(--layer50);
		border-radius: var(--base-radius);
	}
</style>

<Modal title='Export Trading History' width={380}>
	
	<div class='container'>
		
		<div class='date-row'>
			<div class='row'>
				<label class='label' for='start-date'>From</label>
				<input type="date" id="start-date" bind:value={startDate} />
			</div>
			<div class='row'>
				<label class='label' for="end-date">To</label>
				<input type="date" id="end-date" bind:value={endDate} />
			</div>
		</div>

		<div class='hint'>Leave dates empty to export all history</div>

		<div class='total-trades'>
			{$history.length} total trades in history
		</div>

		{#if errorMessage}
			<div class='error'>{errorMessage}</div>
		{/if}

		{#if isExporting}
			<div class='progress-container'>
				<div class='progress-bar'>
					<div class='progress-fill' style={`width: ${exportProgress}%`}></div>
				</div>
				<div class='progress-text'>Exporting... {exportProgress}%</div>
			</div>
		{/if}

		<div class='button-row'>
			<button class='btn btn-secondary' on:click={hideModal} disabled={isExporting}>
				Cancel
			</button>
			<button class='btn btn-primary' on:click={exportCSV} disabled={isExporting}>
				{#if isExporting}
					Exporting...
				{:else}
					Export CSV
				{/if}
			</button>
		</div>

	</div>

</Modal>
