
<script>

	import Table from '@components/layout/table/Table.svelte'
	import Row from '@components/layout/table/Row.svelte'
	import Cell from '@components/layout/table/Cell.svelte'

	import { onDestroy } from 'svelte'

	import tooltip from '@lib/tooltip'

	import { DEFAULT_ORDERS_SORT_KEY } from '@lib/config'
	import { 
		formatOrder, 
		formatForDisplay, 
		formatSide, 
		formatOrderType, 
		formatDate,
		formatMarketName
	} from '@lib/formatters'
	import { XMARK_ICON, CHAINLINK_LOGO, LOADING_ICON } from '@lib/icons'

	import { address, ordersSortKey, ordersSorted, ordersColumnsToShow, marketInfos } from '@lib/stores'
	import { showModal } from '@lib/ui'
	import { saveUserSetting } from '@lib/utils'

	import { cancelOrder, selfExecuteOrder, getUserOrders } from '@api/orders'

	export let allColumns;

	let isLoading = true, t;
	async function fetchData() {
		clearTimeout(t);
		const done = await getUserOrders();
		isLoading = false;
		t = setTimeout(fetchData, 5000);
	}
	$: fetchData($address);

	onDestroy(() => {
		clearTimeout(t);
	});

	let ordersCancelling = {};
	async function _cancelOrder(orderId) {
		ordersCancelling[orderId] = true;
		const success = await cancelOrder(orderId);
		ordersCancelling[orderId] = false;
	}

	let ordersSelfExecuting = {};
	async function _selfExecuteOrder(orderId) {
		ordersSelfExecuting[orderId] = true;
		const success = await selfExecuteOrder(orderId);
		ordersSelfExecuting[orderId] = false;
	}

	$: saveUserSetting('ordersSortKey', $ordersSortKey);
	$: saveUserSetting('ordersColumnsToShow', $ordersColumnsToShow);

	let columns = [];
	$: columns = allColumns.filter((item) => $ordersColumnsToShow.includes(item.key));

	let formattedOrders = [];
	$: formattedOrders = $ordersSorted.map((order) => formatOrder(order));

	let canSelfExecute = {};

	let t1;
	function updateCanSelfExecute() {
		clearTimeout(t1);
		for (const order of $ordersSorted) {
			const marketInfo = $marketInfos[order.market];
			if (!marketInfo) continue;
			if (marketInfo.allowChainlinkExecution && order.timestamp * 1 < Date.now()/1000 - 5*60) {
				canSelfExecute[order.orderId] = true;
			} else {
				canSelfExecute[order.orderId] = false;
			}
		}
		t1 = setTimeout(updateCanSelfExecute, 5000);
	}
	$: updateCanSelfExecute($ordersSorted, $marketInfos);

	onDestroy(() => {
		clearTimeout(t1);
	});

	let showDetails = {};

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
		height: 85px;
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
		height: 46px;
		width: 8px;
		border-radius: 10px;
		background-color: var(--primary);
		margin-right: 12px;
	}
	.side-indicator.red {
		background-color: var(--secondary);
	}

	.title {
		font-weight: 600;
		margin-bottom: 6px;
	}
	.text {
		font-size: 85%;
	}
	.status {
		font-weight: 600;
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
	.empty {
		padding: 25px;
		text-align: center;
		color: var(--text500);
		font-size: 90%;
	}

	.tools :global(svg) {
		width: 16px;
		fill: currentColor;
	}
	.wrapper {
		max-height: calc(var(--account-height) - 50px - 39px);
	}
</style>

<Table
	defaultSortKey={DEFAULT_ORDERS_SORT_KEY}
	bind:sortKey={$ordersSortKey}
	columns={columns}
	isLoading={false}
	isEmpty={$ordersSorted.length == 0}
>
	
	<div class='wrapper'>
	{#each formattedOrders as order}

		<Row>

			{#if $ordersColumnsToShow.includes('orderId')}
				<Cell>{order.orderId}</Cell>
			{/if}

			{#if $ordersColumnsToShow.includes('timestamp')}
				<Cell>{formatDate(order.timestamp)}</Cell>
			{/if}

			{#if $ordersColumnsToShow.includes('isLong')}
				<Cell hasClass={order.isLong ? 'green' : 'red'}>{formatSide(order.isLong, order.isReduceOnly)}</Cell>
			{/if}

			{#if $ordersColumnsToShow.includes('market')}
				<Cell><a href={`/trade/${order.market}`}>{formatMarketName(order.market)}</a></Cell>
			{/if}

			{#if $ordersColumnsToShow.includes('price')}
				<Cell>{order.price * 1 > 0 ? formatForDisplay(order.price) : '-'}</Cell>
			{/if}

			{#if $ordersColumnsToShow.includes('size')}
				<Cell>{formatForDisplay(order.size)} {order.asset}</Cell>
			{/if}

			{#if $ordersColumnsToShow.includes('margin')}
				<Cell>{order.margin * 1 > 0 ? `${formatForDisplay(order.margin)} ${order.asset}` : '-'}</Cell>
			{/if}

			{#if $ordersColumnsToShow.includes('leverage')}
				<Cell>{order.leverage ? `${formatForDisplay(order.leverage)}×` : '-'}</Cell>
			{/if}

			{#if $ordersColumnsToShow.includes('orderType')}
				<Cell>{formatOrderType(order.orderType)}</Cell>
			{/if}

			{#if $ordersColumnsToShow.includes('isReduceOnly')}
				<Cell>{order.isReduceOnly ? 'Yes' : 'No'}</Cell>
			{/if}

			{#if $ordersColumnsToShow.includes('fee')}
				<Cell>{formatForDisplay(order.fee)} {order.asset}</Cell>
			{/if}

			{#if $ordersColumnsToShow.includes('expiry')}
				<Cell>{formatDate(order.expiry) || '-'}</Cell>
			{/if}

			{#if $ordersColumnsToShow.includes('cancelOrderId')}
				<Cell>{order.cancelOrderId * 1 > 0 ? order.cancelOrderId : '-'}</Cell>
			{/if}

			<Cell isTools={true}>
				{#if canSelfExecute[order.orderId]}
					<a use:tooltip={{content: 'Execute with Chainlink'}} on:click|stopPropagation={() => { _selfExecuteOrder(order.orderId) }}>
						{#if ordersSelfExecuting[order.orderId]}{@html LOADING_ICON}{:else}{@html CHAINLINK_LOGO}{/if}
					</a>
				{/if}
				<a use:tooltip={{content: 'Cancel'}} on:click|stopPropagation={() => { _cancelOrder(order.orderId) }}>
					{#if ordersCancelling[order.orderId]}{@html LOADING_ICON}{:else}{@html XMARK_ICON}{/if}
				</a>
			</Cell>

		</Row>

	{/each}
	</div>

</Table>

<!-- {#if formattedOrders.length > 0}

{#if !isLoading && formattedOrders.length == 0}
	<div class='empty'>Nothing to show.</div>
{:else}

	{#each formattedOrders as order}
	<div class='item' class:isLong={order.isLong} class:isShort={!order.isLong} class:active={showDetails[order.orderId]}>
		<div class='summary' on:click={() => {showDetails[order.orderId] = !showDetails[order.orderId]}}>
			<div class='description'>
				<div class='side-indicator' class:red={!order.isLong}></div>
				<div class="content">
					<div class='title'>{order.market} {formatOrderType(order.orderType)} {order.isLong ? 'Buy' : 'Sell'}</div>
					<div class='text'>{formatForDisplay(order.size)} {order.asset} {#if order.price * 1 > 0}at {formatForDisplay(order.price)}{/if}</div>
				</div>
			</div>
			<div class='status'>
				{#if order.orderType == 0}Settling{:else}Queued{/if}
			</div>
		</div>
		<div class='details'>
			<div class='info'>
				<div class='box'>
					<div class='label'>Order ID</div>
					<div class='value'>{order.orderId}</div>
				</div>
				<div class='box'>
					<div class='label'>Submitted</div>
					<div class='value'>{formatDate(order.timestamp)}</div>
				</div>
				<div class='box'>
					<div class='label'>Market</div>
					<div class='value'><a href={`/trade/${order.market}`}>{order.market}</a></div>
				</div>
				<div class='box'>
					<div class='label'>Price</div>
					<div class='value'>{order.price * 1 > 0 ? formatForDisplay(order.price) : '-'}</div>
				</div>
				<div class='box'>
					<div class='label'>Order Type</div>
					<div class='value'>{formatOrderType(order.orderType)}</div>
				</div>
				<div class='box'>
					<div class='label'>Size</div>
					<div class='value'>{formatForDisplay(order.size)} {order.asset}</div>
				</div>
				<div class='box'>
					<div class='label'>Margin</div>
					<div class='value'>{formatForDisplay(order.margin)} {order.asset}</div>
				</div>
				<div class='box'>
					<div class='label'>Leverage</div>
					<div class='value'>{formatForDisplay(order.leverage)}×</div>
				</div>
				<div class='box'>
					<div class='label'>Reduce-Only</div>
					<div class='value'>{order.isReduceOnly ? 'Yes' : 'No'}</div>
				</div>
				<div class='box'>
					<div class='label'>Fee</div>
					<div class='value'>{formatForDisplay(order.fee)} {order.asset}</div>
				</div>
				<div class='box'>
					<div class='label'>Expiry</div>
					<div class='value'>{formatDate(order.expiry) || '-'}</div>
				</div>
				<div class='box'>
					<div class='label'>OCO</div>
					<div class='value'>{order.cancelOrderId * 1 > 0 ? order.cancelOrderId : '-'}</div>
				</div>
				
			</div>
			<div class='tools'>
				{#if ordersCancelling[order.orderId] || ordersSelfExecuting[order.orderId]}
					{@html LOADING_ICON}
				{:else}
					<a on:click|stopPropagation={() => { _cancelOrder(order.orderId) }}>Cancel Order</a>
					{#if canSelfExecute[order.orderId]}<a on:click|stopPropagation={() => { _selfExecuteOrder(order.orderId) }}>Execute With Chainlink</a>{/if}
				{/if}
			</div>
		</div>
	</div>
	{/each}
{/if}

{/if} -->