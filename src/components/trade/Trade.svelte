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

	let isMobile = false;

	function resize() {
		if (document.documentElement.clientWidth <= 600) {
			isMobile = true;
		} else {
			isMobile = false;
		}
	}

	window.addEventListener("resize", resize);
	resize();

	let mobilePage = 'chart';

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
	.content {
		grid-area: content;
		background-color: var(--layer0);
		display: none;
	}
	.nav {
		grid-area: nav;
		background-color: var(--layer0);
		display: none;
	}
	.nav-inner {
		display: grid;
		height: 100%;
		grid-template-columns: 1fr 1fr 1fr;
		grid-gap: 1px;
	}
	.nav-inner a {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		background-color: var(--layer25);
	}
	.nav-inner a.active {
		background-color: var(--layer100);
	}
	@media all and (max-width: 600px) {
		.grid {
			grid-template-rows: 70px auto 50px;
			grid-template-columns: 100%;
			grid-template-areas: 
				"ticker"
				"content"
				"nav";
			grid-gap: 1px;
			height: calc(100vh - 80px);
			overflow: initial; /* overflow fix */
			width: 100%;
		}
		.content, .nav {
			display: block;
		}
		.chart, .account {
			display: none;
		}
	}
</style>

<div class='grid' style={`--account-height: ${$accountHeight}px`}>
	<div class='ticker'><Ticker /></div>
	{#if isMobile}
		<div class='content'>
			{#if mobilePage == 'chart'}<Chart/>{/if}
			{#if mobilePage == 'new-order'}<NewOrder/>{/if}
			{#if mobilePage == 'account'}<Account/>{/if}
		</div>
		<!-- svelte-ignore a11y-missing-attribute -->
		<div class='nav'>
			<div class='nav-inner'>
				<a class:active={mobilePage == 'chart'} on:click={() => {mobilePage = 'chart'}}>Chart</a>
				<a class:active={mobilePage == 'new-order'} on:click={() => {mobilePage = 'new-order'}}>New Order</a>
				<a class:active={mobilePage == 'account'} on:click={() => {mobilePage = 'account'}}>Account</a>
			</div>
		</div>
	{:else}
		<div class='chart'><Chart /></div>
		<div class='sidebar'><NewOrder /></div>
		<div class='account'><Account /></div>
	{/if}
</div>