<script>
	import { onDestroy } from 'svelte'
	import Button from '@components/layout/Button.svelte'

	import { getPoolBalances, getBufferBalances, getUserPoolStakes, getGlobalUPL } from '@api/pool'
	import { address, poolBalances, bufferBalances, prices, poolStakes, globalUPLs } from '@lib/stores'
	import { getAssets, getAmountInUsd, getTotalAmountInUsd  } from '@lib/utils'
	import { formatForDisplay, numberWithCommas } from '@lib/formatters'
	import { showModal } from '@lib/ui'
	import { connect } from '@lib/connect'

	let assets = getAssets();

	let isLoading = true, t;
	async function fetchData() {
		clearTimeout(t);
		const done = await getPoolBalances();
		getBufferBalances();
		getUserPoolStakes();
		getGlobalUPL('ETH');
		getGlobalUPL('USDC');
		if (done) isLoading = false;
	}
	$: fetchData($address);

	onDestroy(() => {
		clearTimeout(t);
	});

	let feeAPY = {};

	function setFeeAPYs(_balances) {
		if (!_balances) return;
		if (_balances['ETH']) feeAPY['ETH'] = 100 * 95 * 12 / _balances['ETH']; // Approx 95 ETH per month in fees
		if (_balances['USDC']) feeAPY['USDC'] = 100 * 100000 * 12 / _balances['USDC']; // Approx 100,000 USDC per month in fees
	}

	$: setFeeAPYs($poolBalances);

</script>

<style>

	@media all and (max-width: 600px) {
		.table, .header {
			min-width: 960px;
		}
	}

	.table {
		--grid-template: repeat(8, 1fr);
	}

	.header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 16px;
	}

	.title {
		font-weight: 600;
		font-size: 24px;
		padding-bottom: 12px;
	}
	.subtitle {
		color: var(--text300);
	}

	.buttons {
		display: flex;
		gap: var(--base-padding);
		grid-gap: var(--base-padding);
	}

	.table {
		border: 1px solid var(--layer100);
		border-radius: 6px;
	}

	.table-header {
		display: grid;
		align-items: center;
		height: 38px;
		border-bottom: 1px solid var(--layer100);
		grid-template-columns: var(--grid-template);
		color: var(--text300);
		font-size: 85%;
	}

	.row {
		display: grid;
		align-items: center;
		grid-template-columns: var(--grid-template);
		border-bottom: 1px solid var(--layer0-hover);
		height: 50px;
	}

	.cell {
		display: flex;
		align-items: center;
		text-transform: capitalize;
		height: 100%;
		padding: 0 25px;
		justify-content: flex-end;
		text-align: right;
	}
	.cell.la {
		justify-content: flex-start;
		text-align: left;
	}
	.cell.highlighted {
		background-color: var(--layer50);
	}

	.cell img {
		margin-right: 8px;
		width: 18px;
	}

	.grayed {
		opacity: 0.5;
		font-size: 80%;
		display: block;
	}

	.footnote {
		padding-top: 25px;
		color: var(--text300);
		font-size: 80%;
		line-height: 1.618;
	}
</style>

<div class='pools'>

	<div class='header'>
		<div class='left'>
			<div class='title'>Pools</div>
			<div class='subtitle'>Pools pay out trader wins and receive losses plus fees.</div>
		</div>
		<div class='right buttons'>
			{#if $address}
				<Button isSmall={true} label={`Deposit`} on:click={() => {showModal('Deposit')}} />
				<Button isSmall={true} label={`Withdraw`} on:click={() => {showModal('Withdraw')}} />
			{:else}
				<Button isSmall={true} label={`Connect Wallet`} on:click={() => {connect()}} />
			{/if}
		</div>
	</div>

	<div class='table'>
		<div class='table-header'>
			<div class='cell la'>Asset</div>
			<div class='cell'>Balance</div>
			<div class='cell'>Fee APY ¹</div>
			<div class='cell'>Total APY</div>
			<div class='cell'>Trader UP/L ²</div>
			<div class='cell'>Buffer</div>
			<div class='cell highlighted'>Your Balance</div>
			<div class='cell highlighted'>% of Pool</div>
		</div>
		<div class='table-body'>
			{#each assets as asset}
			<div class='row'>
				<div class='cell la'><img src={`/asset-logos/${asset}.svg`} /> {asset}</div>
				<div class='cell'><span>{numberWithCommas($poolBalances[asset]) || 0}<br/><span class='grayed'>${formatForDisplay(getAmountInUsd(asset, $poolBalances[asset], $prices))}</span></span></div>
				<div class='cell'>{formatForDisplay(feeAPY[asset])}%</div>
				<div class='cell'>30%+</div>
				<div class='cell'>{numberWithCommas($globalUPLs[asset])}</div>
				<div class='cell'>{numberWithCommas($bufferBalances[asset])}</div>
				<div class='cell highlighted'><span>{numberWithCommas($poolStakes[asset]) || 0}<br><span class='grayed'>${getAmountInUsd(asset, $poolStakes[asset], $prices)}</span></span></div>
				<div class='cell highlighted'>{$poolBalances[asset] == 0 ? 'N/A' : formatForDisplay(($poolStakes[asset])/$poolBalances[asset]  *100 )+ '%'}</div>
			</div>
			{/each}
			<div class='row'>
				<div class='cell la'>Total</div>
				<div class='cell'>${numberWithCommas(getTotalAmountInUsd($poolBalances, $prices))}</div>
				<div class='cell'>-</div>
				<div class='cell'>-</div>
				<div class='cell'>-</div>
				<div class='cell'>-</div>
				<div class='cell highlighted'>${numberWithCommas(getTotalAmountInUsd($poolStakes, $prices))}</div>
				<div class='cell highlighted'>-</div>
			</div>
		</div>
	</div>

	<div class='footnote'>
		¹ Does not include trader wins and losses.<br/>
		² Sum total of unrealized trader wins or losses. Updated every ~15min.
	</div>
</div>