<script>

	import { onMount, onDestroy } from 'svelte'

	import Ticker from './ticker/Ticker.svelte'
	import Chart from './chart/Chart.svelte'
	import Account from './account/Account.svelte'
	import NewOrder from './order/NewOrder.svelte'
	import Markets from './markets/Markets.svelte'

	import { getMarketInfo } from '@api/markets'
	import { connectSocket, closeSocket } from '@api/socket'
	import { selectedMarketInfo, accountHeight } from '@lib/stores'
	import { setLeverageForSelectedMarket } from '@lib/utils'

	$: setLeverageForSelectedMarket($selectedMarketInfo);

	onMount(() => {
		// Connect websocket
		connectSocket();
	});

	onDestroy(() => {
		closeSocket();
	});

</script>

<style>
	.grid {
		display: grid;
		grid-template-rows: 70px 1fr 1fr var(--account-height);
		grid-template-columns: 320px 1fr 1fr 310px;
		grid-template-areas: 
			"ticker ticker ticker sidebar"
			"chart chart chart sidebar"
			"chart chart chart sidebar"
			"account account account sidebar";
		grid-gap: 1px;
		height: calc(100vh - 80px);
		background-color: var(--layer100);
		overflow: hidden; /* overflow fix */
	}

	/*@media all and (max-height: 800px) {
		:global(:root) {
			--account-height: 200px;
		}
	}*/

	@media all and (max-width: 600px) {
		.grid {
			grid-template-rows: auto 300px 300px auto var(--account-height);
			grid-template-columns: 100%;
			grid-template-areas: 
				"ticker"
				"chart"
				"sidebar"
				"account";
			grid-gap: 1px;
			height: auto;
			overflow: initial; /* overflow fix */
			width: 100%;
		}
	}
	
	.ticker {
		grid-area: ticker;
		background-color: var(--layer0);
	}
	.chart {
		grid-area: chart;
		background-color: var(--layer0);
	}
	.account {
		grid-area: account;
		overflow: hidden;
		background-color: var(--layer0);
		width: 100%;
	}
	.sidebar {
		grid-area: sidebar;
		background-color: var(--layer0);
	}
</style>

<div class='grid' style={`--account-height: ${$accountHeight}px`}>
	<div class='ticker'><Ticker /></div>
	<div class='chart'><Chart /></div>
	<div class='sidebar'><NewOrder /></div>
	<div class='account'><Account /></div>
</div>