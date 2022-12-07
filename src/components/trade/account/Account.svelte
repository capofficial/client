<script>

	import { onDestroy } from 'svelte'

	import Orders from './Orders.svelte'
	import Positions from './Positions.svelte'
	import History from './History.svelte'
	import ResizeHandle from '@components/layout/ResizeHandle.svelte'

	import tooltip from '@lib/tooltip'

	import { TABLE_ICON, FILTER_ICON, XMARK_ICON } from '@lib/icons'
	import { address, ordersSorted, positionsSorted } from '@lib/stores'
	import { showModal } from '@lib/ui'

	import { cancelMultipleOrders, getUserOrders } from '@api/orders'

	let allColumns = {
		orders: [
			{key: 'orderId', gridTemplate: '0.4fr', sortable: true},
			{key: 'timestamp', gridTemplate: '1fr', sortable: true},
			{key: 'isLong', gridTemplate: '0.5fr', sortable: true},
			{key: 'market', gridTemplate: '0.5fr', sortable: true},
			{key: 'price', gridTemplate: '0.75fr', sortable: true},
			{key: 'size', gridTemplate: '1fr', sortable: true},
			{key: 'margin', gridTemplate: '1fr', sortable: true},
			{key: 'leverage', gridTemplate: '0.5fr', sortable: true},
			{key: 'orderType', gridTemplate: '0.5fr', sortable: true},
			{key: 'isReduceOnly', gridTemplate: '0.75fr', sortable: true},
			{key: 'fee', gridTemplate: '0.75fr', sortable: true},
			{key: 'expiry', gridTemplate: '1fr', sortable: true},
			{key: 'cancelOrderId', gridTemplate: '0.5fr', sortable: false},
			{key: 'tools', gridTemplate: '75px', sortable: false, permanent: true}
		],
		positions: [
			{key: 'timestamp', gridTemplate: '1fr', sortable: true},
			{key: 'isLong', gridTemplate: '0.5fr', sortable: true},
			{key: 'market', gridTemplate: '0.5fr', sortable: true},
			{key: 'price', gridTemplate: '0.75fr', sortable: true},
			{key: 'size', gridTemplate: '1fr', sortable: true},
			{key: 'margin', gridTemplate: '1fr', sortable: true},
			{key: 'leverage', gridTemplate: '0.5fr', sortable: true},
			{key: 'upl', gridTemplate: '1fr', sortable: true},
			{key: 'funding', gridTemplate: '1fr', sortable: true},
			{key: 'liqprice', gridTemplate: '1fr', sortable: true},
			{key: 'tools', gridTemplate: '30px', sortable: false, permanent: true}
		],
		history: [
			{key: 'id', gridTemplate: '0.4fr', sortable: true},
			{key: 'timestamp', gridTemplate: '1fr', sortable: true},
			{key: 'isLong', gridTemplate: '0.5fr', sortable: true},
			{key: 'market', gridTemplate: '0.5fr', sortable: true},
			{key: 'price', gridTemplate: '0.75fr', sortable: true},
			{key: 'size', gridTemplate: '1fr', sortable: true},
			{key: 'margin', gridTemplate: '1fr', sortable: true},
			{key: 'leverage', gridTemplate: '0.5fr', sortable: true},
			{key: 'orderType', gridTemplate: '0.5fr', sortable: true},
			{key: 'isReduceOnly', gridTemplate: '0.75fr', sortable: true},
			{key: 'status', gridTemplate: '1fr', sortable: true},
			{key: 'reason', gridTemplate: '1fr', sortable: true},
			{key: 'pnl', gridTemplate: '1fr', sortable: true},
			{key: 'fee', gridTemplate: '0.75fr', sortable: true},
			{key: 'expiry', gridTemplate: '1fr', sortable: true},
			{key: 'cancelOrderId', gridTemplate: '0.5fr', sortable: false}
		]
	};

	let panel = 'positions';

	async function cancelAllOrders() {
		let isCancelling = true;
		let orderIds = $ordersSorted.map((o) => o.orderId);
		const success = await cancelMultipleOrders(orderIds);
		isCancelling = false;
	}

	let isLoading = true, t;
	async function fetchData() {
		clearTimeout(t);
		const done = await getUserOrders();
		if (done) isLoading = false;
		// t = setTimeout(fetchData, 5000); // !! TEST
	}
	$: fetchData($address);

	onDestroy(() => {
		clearTimeout(t);
	});

</script>

<style>

	.account {
		max-height: var(--account-height);
	}

	.account-nav {
		padding: 10px var(--base-padding) 16px;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.account-wrapper {
		max-height: calc(var(--account-height) - 50px);
		overflow-y: hidden;
		position: relative;
	}

	.nav {
		display: flex;
		align-items: center;
		grid-gap: 8px;
		gap: 20px;
	}

	.nav a {
		color: var(--text0);
		text-decoration: none;
		border-radius: var(--base-radius);
		transition: all 100ms ease-in-out;
		vertical-align: middle;
	}
	.nav a:hover:not(.active) {
		color: var(--text100);
	}
	.nav a.active {
		font-weight: 600;
		color: var(--primary);
	}

	.tools {
		display: flex;
		align-items: center;
		margin-right: 10px;
	}

	.tools a {
		display: flex;
		align-items: center;
		color: var(--text1);
		margin-left: 16px;
		padding: 4px 0;
	}
	.tools a:hover {
		color: var(--text0);
	}
	.tools a :global(svg) {
		fill: currentColor;
		height: 16px;
	}

	
</style>

<div class='account'>

	<div class='resize-handle'><ResizeHandle /></div>

	<div class='account-nav'>
		<div class='nav'>
			<a class:active={panel == 'positions'} on:click={() => {panel = 'positions'}}>Positions{#if $positionsSorted.length}<span class='count'>({$positionsSorted.length})</span>{/if}</a>
			<a class:active={panel == 'orders'} on:click={() => {panel = 'orders'}}>Orders{#if $ordersSorted.length}<span class='count'>({$ordersSorted.length})</span>{/if}</a>
			<a class:active={panel == 'history'} on:click={() => {panel = 'history'}}>History</a>
		</div>
		<div class='tools'>
			{#if panel == 'history'}
				<a on:click|stopPropagation={() => {showModal('HistoryOrderStatus')}} use:tooltip={{content: 'Filter history'}}>{@html FILTER_ICON}</a>
			{/if}
			<a use:tooltip={{content: 'Customize columns'}} on:click|stopPropagation={() => {showModal('CustomizeColumns', {panel, allColumns: allColumns[panel]})}}>{@html TABLE_ICON}</a>
			{#if panel == 'orders' && $ordersSorted.length}
				<a class='text' on:click={cancelAllOrders} use:tooltip={{content: 'Cancel all orders'}}>{@html XMARK_ICON}</a>
			{/if}
		</div>
	</div>

	<div class='account-wrapper'>
		{#if panel == 'positions'}<Positions allColumns={allColumns['positions']} />{/if}
		{#if panel == 'orders'}<Orders allColumns={allColumns['orders']} />{/if}
		{#if panel == 'history'}<History allColumns={allColumns['history']} />{/if}
	</div>

</div>