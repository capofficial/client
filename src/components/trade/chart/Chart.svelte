<script>

	import { onMount } from 'svelte'

	import ChartBar from './ChartBar.svelte'

	import { initChart, loadCandles, onNewPrice } from '@lib/chart'
	import { chartHeight, selectedMarket, hoveredOHLC, prices } from '@lib/stores'
	import { setPageTitle } from '@lib/ui'
	import { formatForDisplay, formatMarketName, formatPnl } from '@lib/formatters'

	let chartConfigured = false;
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
		setPageTitle(`${formatForDisplay(price)} ${formatMarketName($selectedMarket)}`);
		onNewPrice(price);
	}

	$: setNewPrice($prices);

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
		line-height: 1.518;
	}
	.chart {
		height: 100%;
	}

	.label {
		color: var(--layer300);
		font-weight: 600;
	}
</style>

<div class='wrapper'>
	<div class='chart-bar'>
		<ChartBar />
		{#if $hoveredOHLC}
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
	<div id='chart' class='chart'></div>
</div>