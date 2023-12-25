<script>

	import { onMount, onDestroy } from 'svelte'
	import tooltip from '@lib/tooltip'

	import ColoredPrice from '@components/layout/ColoredPrice.svelte'
	import Markets from '../markets/Markets.svelte'

	import { formatForDisplay, formatPnl, formatMarketName, formatPriceForDisplay } from '@lib/formatters'
	import { selectedAsset, selectedMarket, selectedMarketInfo, chainlinkPrice, ohlc, fundingRate, fundingRate24h, lastDayChange, prices, showMarkets } from '@lib/stores'

	import { MOON_CIRCLE, INFO_ICON_CIRCLE, CHEVRON_DOWN, CHEVRON_UP } from '@lib/icons'

	import { getChainlinkPrice } from '@api/chainlink'
	import { getFundingRate, getFundingRate24h } from '@api/markets'
	import { getMarketTickers } from '@api/prices'

	import { showModal } from '@lib/ui'

	let t1;
	async function fetchData() {
		clearTimeout(t1);
		if (!$selectedMarketInfo?.name) return;
		getChainlinkPrice();
		t1 = setTimeout(fetchData, 60 * 1000);
	}
	$: fetchData($selectedMarket, $selectedMarketInfo);

	let t2;
	async function fetchFundingData() {
		clearTimeout(t2);
		getFundingRate();
		getFundingRate24h();
		t1 = setTimeout(fetchFundingData, 1800*1000);
	}
	$: fetchFundingData($selectedMarket, $selectedAsset);

	let t3;
	async function fetchTickers() {
		clearTimeout(t3);
		getMarketTickers('all');
		t3 = setTimeout(fetchTickers, 1800*1000);
	}

	$: fetchTickers();


	onDestroy(() => {
		clearTimeout(t1);
		clearTimeout(t2);
		clearTimeout(t3);
	});

	function toggleMarkets() {
		showMarkets.set(!$showMarkets);
	}

</script>

<style>
	.ticker {
		height: 70px;
		border-bottom: 1px solid var(--layer100);
		display: flex;
		align-items: center;
	}

	.selected-market {
		width: 321px;
		border-right: 1px solid var(--layer100);
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 20px;
		font-weight: 600;
		padding: 0 25px;
		box-sizing: border-box;
		height: 100%;
		cursor: pointer;
	}

	.left {
		display: flex;
		align-items: center;
	}

	.right {
		display: flex;
		align-items: center;
		margin-left: 12px;
	}

	.moon-icon {
		display: flex;
		align-items: center;
		margin-right: 12px;
	}
	.moon-icon :global(svg) {
		fill: var(--layer200);
		width: 18px;
	}
	.info-icon {
		display: flex;
		align-items: center;
		cursor: pointer;
		margin-left: 12px;
	}
	.info-icon :global(svg) {
		fill: var(--text200);
		width: 18px;
	}

	.stats {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0 25px;
	}
	.box {
		align-items: initial;
		justify-content: flex-start;
		margin-right: 50px;
	}

	.label {
		font-size: 85%;
		margin-bottom: 5px;
		color: var(--text400);
	}
	.value {
		font-weight: normal;
		font-weight: 600;
	}

	.leverage {
		margin-left: 12px;
	 	font-weight: 600;
		background-color: var(--layer50);
		padding: 6px 10px;
		border-radius: 8px;
		font-size: 80%;
	}

	.markets-wrapper {
		position: absolute;
		width: 320px;
		top: 148px;
		left: 0;
		bottom: 0;
		z-index: 900;
		background-color: var(--layer0);
		border-right: 1px solid var(--layer100);
		opacity:0;
		pointer-events: none;
	}
	.markets-wrapper.active {
		opacity: 1;
		pointer-events: all;
	}

	@media all and (max-width: 1500px) {
		.no-1500 {
			display: none;
		}
	}

	@media all and (max-width: 600px) {
		.leverage {
			display: none;
		}
		.selected-market {
			width: auto;
		}
		.box {
			margin-right: 0;
		}
		.no-mobile {
			display: none;
		}
		.markets-wrapper {
			width: 100%;
			border-right: none;
		}
	}


	
</style>

<div class='ticker'>
	<div class="selected-market" on:click|stopPropagation={toggleMarkets}>
		<div class='left'>{formatMarketName($selectedMarket)} {#if $selectedMarketInfo?.maxLeverage}<span class='leverage'>{$selectedMarketInfo?.maxLeverage}×</span>{/if}</div>

		<div class='right'>
			{#if $selectedMarketInfo?.isClosed}
			<div class='moon-icon' use:tooltip={{content: 'Market Closed'}}>{@html MOON_CIRCLE}</div>
			{/if}
			<div class='info-icon' on:click|stopPropagation={() => showModal('MarketInfo', $selectedMarketInfo)}>{@html INFO_ICON_CIRCLE}</div>
			<div class='info-icon'>{#if $showMarkets}{@html CHEVRON_UP}{:else}{@html CHEVRON_DOWN}{/if}</div>
		</div>
	</div>
	<div class='markets-wrapper' class:active={$showMarkets}>
		<Markets/>
	</div>
	<div class='stats'>
		<div class='box'>
			<div class='label'>Last Price (Pyth)</div>
			<div class='value'>
				<ColoredPrice price={$prices[$selectedMarket]} />
			</div>
		</div>
		<div class='box no-1500 no-mobile'>
			<div class='label'>Last Price (Chainlink)</div>
			<div class='value'>
				{formatPriceForDisplay($chainlinkPrice) || '-'}
			</div>
		</div>
		<div class='box no-mobile' use:tooltip={{content: `24h: ${formatForDisplay($fundingRate24h*100) || 0}%`}}>
			<div class='label'>Funding / 1h</div>
			<div class='value'>
				{formatForDisplay($fundingRate*100) || 0}%
			</div>
		</div>
		<div class='box no-mobile'>
			<div class='label'>24h Change</div>
			<div class='value' class:green={$lastDayChange.price*1 >= 0} class:red={$lastDayChange.price*1 < 0}>
				{@html formatPnl($lastDayChange.price, false, true)} ({@html formatPnl($lastDayChange.percent, true)})
			</div>
		</div>
		<div class='box no-1500 no-mobile'>
			<div class='label'>24h High</div>
			<div class='value'>
				{formatPriceForDisplay($ohlc[$selectedMarket]?.h) || '-'}
			</div>
		</div>
		<div class='box no-1500 no-mobile'>
			<div class='label'>24h Low</div>
			<div class='value'>
				{formatPriceForDisplay($ohlc[$selectedMarket]?.l) || '-'}
			</div>
		</div>
		
	</div>

</div>
