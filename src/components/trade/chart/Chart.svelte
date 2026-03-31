<script>

	import { onMount } from 'svelte'

	import ChartBar from './ChartBar.svelte'
	import TradingViewFullChart from './TradingViewFullChart.svelte'

	import { initChart, loadCandles, onNewPrice } from '@lib/chart'
	import { chartHeight, selectedMarket, hoveredOHLC, prices, chartMode } from '@lib/stores'
	import { setPageTitle } from '@lib/ui'
	import { formatPriceForDisplay, formatMarketName, formatPnl } from '@lib/formatters'
	import { saveUserSetting, getUserSetting } from '@lib/utils'

	let chartConfigured = false;

	// Get saved chart mode from localStorage
	const savedChartMode = getUserSetting('chartMode') || 'simple';
	import { writable } from 'svelte/store';
	const localChartMode = writable(savedChartMode);

	onMount(() => {
		initChart(() => {
			chartConfigured = true;
		});
	});

	function _loadCandles(chartConfigured) {
		if (!chartConfigured) return;
		loadCandles();
	}

	$: _loadCandles(chartConfigured, $selectedMarket);

	function setNewPrice(_prices) {
		// For selected market
		const price = _prices[$selectedMarket];
		if (!price) return;
		setPageTitle(`${formatPriceForDisplay(price)} ${formatMarketName($selectedMarket)}`);
		onNewPrice(price);
	}

	$: setNewPrice($prices);

	function toggleChartMode() {
		const newMode = $localChartMode === 'simple' ? 'full' : 'simple';
		localChartMode.set(newMode);
		saveUserSetting('chartMode', newMode);
	}

	// Sync with global store
	$: chartMode.set($localChartMode);

</script>

<style>
	.wrapper {
		position: relative;
		height: 100%;
	}
	.chart-bar {
		position: absolute;
		top: 20px;
		left: 25px;
		z-index: 190;
		display: flex;
		align-items: center;
	}
	.current-ohlc {
		font-size: 80%;
		margin-left: 16px;
		line-height: 1.418;
	}
	.chart {
		height: 100%;
	}

	.label {
		color: var(--layer300);
		font-weight: 600;
	}

	.mode-toggle {
		position: absolute;
		top: 20px;
		right: 25px;
		z-index: 190;
		display: flex;
		align-items: center;
		height: 38px;
		grid-gap: 12px;
		gap: 12px;
		background-color: var(--layer50);
		border-radius: var(--base-radius);
		padding: 0 16px;
		user-select: none;
	}

	.mode-toggle button {
		font-size: 95%;
		background: none;
		border: none;
		color: var(--text300);
		cursor: pointer;
		padding: 0;
		transition: all 100ms ease-in-out;
	}

	.mode-toggle button:hover:not(.active) {
		color: var(--text100);
	}

	.mode-toggle button.active {
		color: var(--primary);
		font-weight: 600;
	}

	.tv-chart {
		height: 100%;
		width: 100%;
	}

	@media all and (max-width: 1280px) {
		.current-ohlc {
			display: none;
		}
	}

	@media all and (max-width: 768px) {
		.mode-toggle {
			top: 10px;
			right: 15px;
			font-size: 80%;
		}
	}
</style>

<div class='wrapper'>
	<div class='chart-bar'>
		<ChartBar />
		{#if $hoveredOHLC && $localChartMode === 'simple'}
		<div class='current-ohlc'>
			<span class='label'>O:</span> <span class='value' class:green={$hoveredOHLC.open <= $hoveredOHLC.close} class:red={$hoveredOHLC.open > $hoveredOHLC.close}>{$hoveredOHLC.open}</span> 
			<span class='label'>H:</span> <span class='value' class:green={$hoveredOHLC.open <= $hoveredOHLC.close} class:red={$hoveredOHLC.open > $hoveredOHLC.close}>{$hoveredOHLC.high}</span> 
			<span class='label'>L:</span> <span class='value' class:green={$hoveredOHLC.open <= $hoveredOHLC.close} class:red={$hoveredOHLC.open > $hoveredOHLC.close}>{$hoveredOHLC.low}</span> 
			<span class='label'>C:</span> <span class='value' class:green={$hoveredOHLC.open <= $hoveredOHLC.close} class:red={$hoveredOHLC.open > $hoveredOHLC.close}>{$hoveredOHLC.close}</span> 
				<br/>
			<span class='label'>Change:</span> <span class='value' class:green={$hoveredOHLC.open <= $hoveredOHLC.close} class:red={$hoveredOHLC.open > $hoveredOHLC.close}>
				{@html formatPnl($hoveredOHLC.close * 1 - $hoveredOHLC.open * 1)} ({@html formatPnl(100 * ($hoveredOHLC.close * 1 - $hoveredOHLC.open * 1) / $hoveredOHLC.open, true)})
			</span>
			<span class='label'>Amplitude:</span> <span class='value' class:green={$hoveredOHLC.open <= $hoveredOHLC.close} class:red={$hoveredOHLC.open > $hoveredOHLC.close}>
				{@html formatPnl($hoveredOHLC.open <= $hoveredOHLC.close ? $hoveredOHLC.high * 1 - $hoveredOHLC.low * 1 : $hoveredOHLC.low * 1 - $hoveredOHLC.high * 1)}
			</span>
		</div>
		{/if}
	</div>

	<div class='mode-toggle'>
		<button class:active={$localChartMode === 'simple'} on:click={() => { localChartMode.set('simple'); saveUserSetting('chartMode', 'simple'); }}>
			Simple
		</button>
		<span style="color: var(--layer300);">|</span>
		<button class:active={$localChartMode === 'full'} on:click={() => { localChartMode.set('full'); saveUserSetting('chartMode', 'full'); }}>
			Full
		</button>
	</div>

	{#if $localChartMode === 'full'}
		<div class='tv-chart'>
			<TradingViewFullChart />
		</div>
	{:else}
		<div id='chart' class='chart'></div>
	{/if}
</div>
