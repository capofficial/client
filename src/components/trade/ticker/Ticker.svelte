<script>

	import { onMount, onDestroy } from 'svelte'
	import tooltip from '@lib/tooltip'

	import ColoredPrice from '@components/layout/ColoredPrice.svelte'

	import { formatForDisplay, formatPnl, formatMarketName } from '@lib/formatters'
	import { selectedAsset, selectedMarket, selectedMarketInfo, chainlinkPrice, ohlc, fundingRate, fundingRate24h, lastDayChange, prices } from '@lib/stores'

	import { MOON_CIRCLE, INFO_ICON_CIRCLE } from '@lib/icons'

	import { getChainlinkPrice } from '@api/chainlink'
	import { getFundingRate, getFundingRate24h } from '@api/markets'
	import { getMarketTickers, getMarketPrices } from '@api/prices'

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
		getMarketTickers();
		t1 = setTimeout(fetchFundingData, 1800*1000);
	}
	$: fetchFundingData($selectedMarket, $selectedAsset);

	let t3;
	async function fetchPriceData() {
		clearTimeout(t3);
		// await getMarketPrices();
		// t3 = setTimeout(fetchPriceData, 5000);
	}
	$: fetchPriceData($selectedMarket);

	onDestroy(() => {
		clearTimeout(t1);
		clearTimeout(t2);
		clearTimeout(t3);
	});

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
	}

	.left {
		display: flex;
		align-items: center;
	}

	.right {
		display: flex;
		align-items: center;
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

	@media all and (max-width: 600px) {
		.ticker {
			display: block;
		}
		.selected-market {
			width: 100%;
		}
		.stats {
			display: none;
		}
	}
	
</style>

<div class='ticker'>
	<div class="selected-market">
		<div class='left'>{formatMarketName($selectedMarket)} {#if $selectedMarketInfo?.maxLeverage}<span class='leverage'>{$selectedMarketInfo?.maxLeverage}×</span>{/if}</div>

		<div class='right'>
			{#if $selectedMarketInfo?.isClosed}
			<div class='moon-icon' use:tooltip={{content: 'Market Closed'}}>{@html MOON_CIRCLE}</div>
			{/if}
			<div class='info-icon' on:click|stopPropagation={() => showModal('MarketInfo', $selectedMarketInfo)}>{@html INFO_ICON_CIRCLE}</div>
		</div>
	</div>
	<div class='stats'>
		<div class='box'>
			<div class='label'>Last Price</div>
			<div class='value'>
				<ColoredPrice price={$prices[$selectedMarket]} />
			</div>
		</div>
		<div class='box'>
			<div class='label'>Chainlink</div>
			<div class='value'>
				{formatForDisplay($chainlinkPrice) || '-'}
			</div>
		</div>
		<div class='box' use:tooltip={{content: `24h: ${formatForDisplay($fundingRate24h*100) || 0}%`}}>
			<div class='label'>Funding / 1h</div>
			<div class='value'>
				{formatForDisplay($fundingRate*100) || 0}%
			</div>
		</div>
		<div class='box'>
			<div class='label'>24h Change</div>
			<div class='value' class:green={$lastDayChange.price*1 >= 0} class:red={$lastDayChange.price*1 < 0}>
				{@html formatPnl($lastDayChange.price)} ({@html formatPnl($lastDayChange.percent, true)})
			</div>
		</div>
		<div class='box'>
			<div class='label'>24h High</div>
			<div class='value'>
				{$ohlc[$selectedMarket]?.h || '-'}
			</div>
		</div>
		<div class='box'>
			<div class='label'>24h Low</div>
			<div class='value'>
				{$ohlc[$selectedMarket]?.l || '-'}
			</div>
		</div>
		
	</div>

</div>
