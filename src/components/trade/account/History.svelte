
<script>

	import Table from '@components/layout/table/Table.svelte'
	import Row from '@components/layout/table/Row.svelte'
	import Cell from '@components/layout/table/Cell.svelte'

	import { onMount, onDestroy } from 'svelte'
	import { DOWNLOAD_ICON, LOADING_ICON } from '@lib/icons'

	import { DEFAULT_HISTORY_COUNT, DEFAULT_HISTORY_SORT_KEY } from '@lib/config'
	import { 
		formatHistoryItem, 
		formatPnl, 
		formatForDisplay, 
		formatOrderType,
		formatSide, 
		formatDate,
		formatMarketName,
		formatPriceForDisplay
	} from '@lib/formatters'
	import { address, historySortKey, historySorted, historyColumnsToShow, lastHistoryItemsCount, orders } from '@lib/stores'
	import tooltip from '@lib/tooltip'
	import { showToast } from '@lib/ui'
	import { saveUserSetting } from '@lib/utils'

	import { getUserHistory, getUserHistoryForExport } from '@api/history'

	export let allColumns;

	let base_timeout = 60 * 1000;

	let isLoading = true, t, timeout = base_timeout, fastTimeoutCount = 0;
	async function fetchData() {
		clearTimeout(t);
		// console.log('timeout', timeout);
		// Get orders for user
		const hasDiff = await getUserHistory();
		if (hasDiff) {
			timeout = base_timeout;
			fastTimeoutCount = 0;
		}
		if (timeout < base_timeout) {
			fastTimeoutCount++;
			if (fastTimeoutCount > 6) {
				timeout = base_timeout;
			}
		}
		isLoading = false;
		// t = setTimeout(fetchData, timeout);
	}
	$: fetchData($address, timeout);

	$: saveUserSetting('historySortKey', $historySortKey);
	$: saveUserSetting('historyColumnsToShow', $historyColumnsToShow);

	let loadingMore;

	onMount(() => {

		// monitor infinite scroll
		let lastFetchedItems = [];
		let itemsPerPage = DEFAULT_HISTORY_COUNT;
		let skip = itemsPerPage;
		window.onscroll = async () => {
			if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 120) {
				if (loadingMore || $lastHistoryItemsCount < itemsPerPage) return;
				// console.log('onscroll fetch', loadingMore, $lastHistoryItemsCount, itemsPerPage);
				loadingMore = true;
				await getUserHistory({first: itemsPerPage, skip});
				loadingMore = false;
				skip += itemsPerPage;
			}
		}

	});

	// let priorOrders = [];
	// function monitorOrderChanges() {
	// 	// reload history quicker if orders change
	// 	const newOrders = Object.assign([], $orders);
	// 	if (newOrders.length == 0) return;
	// 	// check diff
	// 	let hasDiff = false;
	// 	// console.log('OP', $orders, priorOrders);
	// 	for (const order of newOrders) {
	// 		if (!priorOrders.find((item) => item.orderId.eq(order.orderId))) hasDiff = true;
	// 	}
	// 	for (const order of priorOrders) {
	// 		if (!newOrders.find((item) => item.orderId.eq(order.orderId))) hasDiff = true;
	// 	}
	// 	// console.log('HP', hasDiff, priorOrders.length);
	// 	if (hasDiff && priorOrders.length > 0) timeout = 5000;
	// 	priorOrders = Object.assign([], newOrders);
	// }

	// $: monitorOrderChanges($orders);

	onDestroy(() => {
		clearTimeout(t);
	});

	let columns = [];
	$: columns = allColumns.filter((item) => $historyColumnsToShow.includes(item.key));

	let formattedHistory = [];
	$: formattedHistory = $historySorted.map((item) => formatHistoryItem(item));

	let showDetails = {};

	function getItemStatus(item) {
		if (!item) return '';
		if (item.status == 'cancelled' && item.reason != 'by-user') {
			if (item.reason == '!expired') return 'expired';
			if (item.reason == '!oco') return 'cancelled (OCO)';
			return 'failed';
		}
		return item.status;
	}

	let exportFrom = '';
	let exportTo = '';
	let isExporting = false;

	const exportHeaders = [
		'Order ID',
		'Time',
		'Side',
		'Market',
		'Price',
		'Size',
		'Margin',
		'Leverage',
		'Type',
		'Reduce-Only',
		'Status',
		'Reason',
		'P/L',
		'P/L %',
		'Fee',
		'Expiry',
		'OCO'
	];

	function getDayStartTimestamp(value) {
		if (!value) return;
		return Math.floor(new Date(`${value}T00:00:00`).getTime() / 1000);
	}

	function getDayEndTimestamp(value) {
		if (!value) return;
		return Math.floor(new Date(`${value}T23:59:59`).getTime() / 1000);
	}

	function hasExportValue(value) {
		return value !== undefined && value !== null && value !== '';
	}

	function getExportRow(rawItem) {
		const item = formatHistoryItem(rawItem);
		const pnlValue = item.pnl * 1;
		const marginValue = item.margin * 1;
		const pnlPercent = Number.isFinite(pnlValue) && Number.isFinite(marginValue) && marginValue !== 0 ? 100 * pnlValue / marginValue : '';

		return [
			item.status == 'liquidated' ? 'liq' : item.orderId,
			formatDate(item.timestamp) || '',
			formatSide(item.isLong, item.isReduceOnly),
			formatMarketName(item.market),
			item.price * 1 > 0 ? formatPriceForDisplay(item.price) : '',
			`${formatForDisplay(item.size)} ${item.asset}`,
			`${formatForDisplay(item.margin)} ${item.asset}`,
			item.leverage ? `${formatForDisplay(item.leverage)}x` : '',
			formatOrderType(item.orderType),
			item.isReduceOnly ? 'Yes' : 'No',
			item.status,
			item.reason || '',
			hasExportValue(item.pnl) ? `${formatForDisplay(item.pnl)} ${item.asset}` : '',
			hasExportValue(pnlPercent) ? `${formatForDisplay(pnlPercent, true)}%` : '',
			hasExportValue(item.fee) ? `${formatForDisplay(item.fee)} ${item.asset}` : '',
			formatDate(item.expiry) || '',
			item.cancelOrderId * 1 > 0 ? item.cancelOrderId : ''
		];
	}

	function buildCsvInWorker(headers, rows) {
		return new Promise((resolve, reject) => {
			const workerSource = `
				self.onmessage = function(event) {
					const escapeCell = function(value) {
						if (value === undefined || value === null) return '';
						const text = String(value);
						const safeText = /^[=+\\-@\\t\\r]/.test(text) ? "'" + text : text;
						if (/[",\\n\\r]/.test(safeText)) return '"' + safeText.replace(/"/g, '""') + '"';
						return safeText;
					};
					const csvRows = [event.data.headers].concat(event.data.rows);
					self.postMessage(csvRows.map(function(row) {
						return row.map(escapeCell).join(',');
					}).join('\\n'));
				};
			`;
			const workerUrl = URL.createObjectURL(new Blob([workerSource], {type: 'text/javascript'}));
			const worker = new Worker(workerUrl);
			worker.onmessage = (event) => {
				worker.terminate();
				URL.revokeObjectURL(workerUrl);
				resolve(event.data);
			};
			worker.onerror = (event) => {
				worker.terminate();
				URL.revokeObjectURL(workerUrl);
				reject(event.message);
			};
			worker.postMessage({headers, rows});
		});
	}

	function downloadCsv(csv) {
		const blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		const range = exportFrom || exportTo ? `${exportFrom || 'start'}-${exportTo || 'today'}` : 'all';
		link.href = url;
		link.download = `cap-trading-history-${range}.csv`;
		document.body.appendChild(link);
		link.click();
		link.remove();
		URL.revokeObjectURL(url);
	}

	async function exportHistory() {
		if (isExporting) return;

		const fromTimestamp = getDayStartTimestamp(exportFrom);
		const toTimestamp = getDayEndTimestamp(exportTo);

		if (fromTimestamp && toTimestamp && fromTimestamp > toTimestamp) {
			showToast('Start date must be before end date.');
			return;
		}

		isExporting = true;
		try {
			const rows = await getUserHistoryForExport({fromTimestamp, toTimestamp});
			if (!rows.length) {
				showToast('No history found for this timeframe.', 2);
				return;
			}

			const csv = await buildCsvInWorker(exportHeaders, rows.map(getExportRow));
			downloadCsv(csv);
			showToast('Trading history exported.', 1);
		} catch(e) {
			console.error('/history export error', e);
			showToast('Could not export trading history.');
		} finally {
			isExporting = false;
		}
	}

</script>

<style>
	.item {
		border-bottom: 1px solid var(--layer0);
	}
	.item:last-child {
	}
	.item.active {
		background-color: var(--layer50);
	}

	.summary {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 65px;
		padding: 0 25px;
		cursor: pointer;
		border-bottom: 1px solid var(--layer50);
	}
	.item:not(.active) .summary:hover {
		background-color: var(--layer25);
	}
	.item:last-child .summary {
		border-bottom: none;
	}

	.description {
		display: flex;
		align-items: center;
	}

	.side-indicator {
		height: 42px;
		width: 8px;
		border-radius: 10px;
		background-color: var(--primary);
		margin-right: 12px;
	}
	.side-indicator.red {
		background-color: var(--secondary);
	}

	.title {
		margin-bottom: 6px;
	}
	.text {
		font-size: 85%;
	}
	.status, .value {
		text-transform: capitalize;
	}

	.details {
		border-top: 1px solid var(--layer100);
		padding: 25px;
		font-size: 90%;
		display: none;
	}
	.item.active .details {
		display: block;
	}

	.info {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr 1fr;
		grid-template-rows: 1fr 1fr 1fr;
		grid-gap: 25px;
	}

	.box {
	}

	.box .label {
		font-weight: 600;
		margin-bottom: 6px;
	}

	a {
		color: var(--primary);
		text-decoration: none;
	}
	.isShort a {
		color: var(--secondary);
	}
	.value a {
		font-weight: 400;
	}

	.tools {
		padding-top: 25px;
	}

	.tools a {
		margin-right: 20px;
	}

	.loading-more {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 20px;
		color: var(--text400);
	}
	.loading-more :global(svg) {
		width: 22px;
	}
	.empty {
		padding: 25px;
		text-align: center;
		color: var(--text500);
		font-size: 90%;
	}
	.wrapper {
		max-height: calc(var(--account-height) - 50px - 39px);
	}
	.history-panel {
		height: 100%;
		display: flex;
		flex-direction: column;
	}
	.export-toolbar {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 10px 25px;
		border-bottom: 1px solid var(--layer100);
		background-color: var(--layer25);
	}
	.export-toolbar label {
		display: flex;
		align-items: center;
		gap: 7px;
		color: var(--text2);
		font-size: 80%;
	}
	.export-toolbar input {
		height: 28px;
		border: 1px solid var(--layer200);
		border-radius: 5px;
		background-color: var(--layer0);
		color: var(--text0);
		padding: 0 8px;
		font-size: 12px;
	}
	.export-toolbar button {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 30px;
		min-width: 30px;
		border: none;
		border-radius: 5px;
		background-color: var(--layer100);
		color: var(--text0);
		cursor: pointer;
	}
	.export-toolbar button:hover:not(:disabled) {
		background-color: var(--layer200);
	}
	.export-toolbar button:disabled {
		cursor: default;
		opacity: .6;
	}
	.export-toolbar button :global(svg) {
		width: 15px;
		fill: currentColor;
	}
	.table-shell {
		flex: 1;
		min-height: 0;
	}
	@media all and (max-width: 600px) {
		.export-toolbar {
			align-items: stretch;
			flex-wrap: wrap;
		}
		.export-toolbar label {
			flex: 1 1 120px;
		}
		.export-toolbar input {
			width: 100%;
		}
		.wrapper {
			max-height: 100%;
		}
	}
</style>

<div class='history-panel'>
<div class='export-toolbar'>
	<label>From <input type='date' bind:value={exportFrom} aria-label='Export history from date'></label>
	<label>To <input type='date' bind:value={exportTo} aria-label='Export history to date'></label>
	<button
		on:click={exportHistory}
		disabled={isExporting || isLoading}
		aria-label={isExporting ? 'Exporting history as CSV' : 'Export history as CSV'}
		aria-busy={isExporting}
		use:tooltip={{content: 'Export history as CSV'}}
	>
		{#if isExporting}{@html LOADING_ICON}{:else}{@html DOWNLOAD_ICON}{/if}
	</button>
</div>

<div class='table-shell'>
<Table
	defaultSortKey={DEFAULT_HISTORY_SORT_KEY}
	bind:sortKey={$historySortKey}
	columns={columns}
	isLoading={isLoading}
	infiniteScroll={true}
	itemsPerPage={DEFAULT_HISTORY_COUNT}
	isEmpty={$historySorted.length == 0}
	minWidth={true}
>
	<div class='wrapper'>
	{#each formattedHistory as item}

		<Row>

			{#if $historyColumnsToShow.includes('id')}
				<Cell>{item.status == 'liquidated' ? 'liq' : item.orderId}</Cell>
			{/if}

			{#if $historyColumnsToShow.includes('timestamp')}
				<Cell>{formatDate(item.timestamp)}</Cell>
			{/if}

			{#if $historyColumnsToShow.includes('isLong')}
				<Cell hasClass={item.isLong ? 'green' : 'red'}>{formatSide(item.isLong, item.isReduceOnly)}</Cell>
			{/if}

			{#if $historyColumnsToShow.includes('market')}
				<Cell><a href={`/trade/${item.market}`}>{formatMarketName(item.market)}</a></Cell>
			{/if}

			{#if $historyColumnsToShow.includes('price')}
				<Cell>{item.price * 1 > 0 ? formatPriceForDisplay(item.price) : '-'}</Cell>
			{/if}

			{#if $historyColumnsToShow.includes('size')}
				<Cell>{formatForDisplay(item.size)} {item.asset}</Cell>
			{/if}

			{#if $historyColumnsToShow.includes('margin')}
				<Cell>{formatForDisplay(item.margin)} {item.asset}</Cell>
			{/if}

			{#if $historyColumnsToShow.includes('leverage')}
				<Cell>{item.leverage ? `${formatForDisplay(item.leverage)}×` : 'N/A'}</Cell>
			{/if}

			{#if $historyColumnsToShow.includes('orderType')}
				<Cell>{formatOrderType(item.orderType)}</Cell>
			{/if}

			{#if $historyColumnsToShow.includes('isReduceOnly')}
				<Cell>{item.isReduceOnly ? 'Yes' : 'No'}</Cell>
			{/if}

			{#if $historyColumnsToShow.includes('status')}
				<Cell>{item.status}</Cell>
			{/if}

			{#if $historyColumnsToShow.includes('reason')}
				<Cell>{item.reason || '-'}</Cell>
			{/if}

			{#if $historyColumnsToShow.includes('pnl')}
				{#if !item.pnl}
					<Cell>-</Cell>
				{:else}
					<Cell hasClass={item.pnl * 1 >= 0 ? 'green' : 'red'}>{@html formatPnl(item.pnl)} ({@html formatPnl(100*item.pnl/item.margin, true)})</Cell>
				{/if}
			{/if}

			{#if $historyColumnsToShow.includes('fee')}
				<Cell>{formatForDisplay(item.fee)} {item.asset}</Cell>
			{/if}

			{#if $historyColumnsToShow.includes('expiry')}
				<Cell>{formatDate(item.expiry) || '-'}</Cell>
			{/if}

			{#if $historyColumnsToShow.includes('cancelOrderId')}
				<Cell>{item.cancelOrderId * 1 > 0 ? item.cancelOrderId : '-'}</Cell>
			{/if}


		</Row>

	{/each}
	</div>	

</Table>
</div>
</div>

<!-- {#if !isLoading && formattedHistory.length == 0}
	<div class='empty'>Nothing to show.</div>
{:else}

{#each formattedHistory as item}
<div class='item' class:active={showDetails[item.orderId]}>
	<div class='summary' on:click={() => {showDetails[item.orderId] = !showDetails[item.orderId]}}>
		<div class='description'>
			<div class="content">
				<div class='title'>{item.market} {formatSide(item.isLong, item.isReduceOnly, item.pnl)}</div>
				<div class='text'>{formatForDisplay(item.size)} {item.asset} {#if item.price * 1 > 0}at {formatForDisplay(item.price)}{/if}</div>
			</div>
		</div>
		<div class='status'>
			{#if item.pnl}
				<span class:green={item.pnl * 1 >= 0} class:red={item.pnl * 1< 0}>{@html formatPnl(item.pnl)} {item.asset} ({@html formatPnl(100*item.pnl/item.margin, true)})</span>
			{:else}
				<span class:orange={getItemStatus(item) == 'failed'}>{getItemStatus(item)}</span>
			{/if}
		</div>
	</div>
	<div class='details'>
		<div class='info'>
			<div class='box'>
				<div class='label'>Order ID</div>
				<div class='value'>{item.status == 'liquidated' ? 'Liq' : item.orderId}</div>
			</div>
			<div class='box'>
				<div class='label'>Submitted</div>
				<div class='value'>{formatDate(item.timestamp)}</div>
			</div>
			<div class='box'>
				<div class='label'>Market</div>
				<div class='value'><a href={`/trade/${item.market}`}>{item.market}</a></div>
			</div>
			<div class='box'>
				<div class='label'>Price</div>
				<div class='value'>{item.price * 1 > 0 ? formatForDisplay(item.price) : '-'}</div>
			</div>
			{#if item.reason}
			<div class='box'>
				<div class='label'>Reason</div>
				<div class='value'>{item.reason}</div>
			</div>
			{:else if item.fundingFee * 1 > 0}
			<div class='box'>
				<div class='label'>Funding</div>
				<div class='value'>{formatForDisplay(item.fundingFee)}</div>
			</div>
			{:else}
			<div class='box'>
				<div class='label'>Status</div>
				<div class='value'>{item.status}</div>
			</div>
			{/if}
			<div class='box'>
				<div class='label'>Size</div>
				<div class='value'>{formatForDisplay(item.size)} {item.asset}</div>
			</div>
			<div class='box'>
				<div class='label'>Margin</div>
				<div class='value'>{formatForDisplay(item.margin)} {item.asset}</div>
			</div>
			<div class='box'>
				<div class='label'>Leverage</div>
				<div class='value'>{item.leverage ? `${formatForDisplay(item.leverage)}×` : 'N/A'}</div>
			</div>
			<div class='box'>
				<div class='label'>Reduce-Only</div>
				<div class='value'>{item.isReduceOnly ? 'Yes' : 'No'}</div>
			</div>
			<div class='box'>
				<div class='label'>Fee</div>
				<div class='value'>{formatForDisplay(item.fee)} {item.asset}</div>
			</div>
			<div class='box'>
				<div class='label'>Expiry</div>
				<div class='value'>{formatDate(item.expiry) || '-'}</div>
			</div>
			<div class='box'>
				<div class='label'>OCO</div>
				<div class='value'>{item.cancelOrderId * 1 > 0 ? item.cancelOrderId : '-'}</div>
			</div>
			
		</div>
	</div>
</div>
{/each}

{/if}

{#if loadingMore}
	<div class='loading-more'>{@html LOADING_ICON}</div>
{/if}
 -->
