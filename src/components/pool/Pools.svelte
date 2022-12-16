<script>
	import { onDestroy } from 'svelte'
	import Button from '@components/layout/Button.svelte'

	import { getPoolBalances, getUserPoolStakes, getPoolStats } from '@api/pool'
	import { address, poolBalances, prices, weeklyPerformance, monthlyPerformance, yearlyPerformance, poolStakes } from '@lib/stores'
	import { getAssets, getAmountInUsd, getTotalAmountInUsd, getBufferBalances  } from '@lib/utils'
	import { getTransactions } from '@api/transactions'
	import { formatForDisplay, numberWithCommas } from '@lib/formatters'
	import { showModal } from '@lib/ui'

	let assets = getAssets();

	let bufferBalances = [];
	let isLoading = true, t;
	async function fetchData() {
		clearTimeout(t);
		const done = await getPoolBalances();
		getUserPoolStakes();
		getPoolStats();
		let items = await getTransactions('type=pool-payin,pool-payout,pool-deposit,pool-withdrawal,fee');
		bufferBalances = getBufferBalances(items);
		if (done) isLoading = false;
		// t = setTimeout(fetchData, 30 * 1000);
	}
	$: fetchData($address);

	onDestroy(() => {
		clearTimeout(t);
	});

</script>

<style>

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
		display: grid;
		grid-template-columns: 1fr 1fr;
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

</style>

<div class='pools'>

	<div class='header'>
		<div class='left'>
			<div class='title'>Pools</div>
			<div class='subtitle'>Pools pay out trader wins and receive losses plus fees.</div>
		</div>
		<div class='right buttons'>
			<Button isSmall={true} label={`Deposit`} on:click={() => {showModal('Deposit')}} />
			<Button isSmall={true} label={`Withdraw`} on:click={() => {showModal('Withdraw')}} />
		</div>
	</div>

	<div class='table'>
		<div class='table-header'>
			<div class='cell la'>Asset</div>
			<div class='cell'>Balance</div>
			<div class='cell'>1W Return</div>
			<div class='cell'>1M Return</div>
			<div class='cell'>1Y Return</div>
			<div class='cell'>Buffer Balance</div>
			<div class='cell highlighted'>Your Balance</div>
			<div class='cell highlighted'>% of Pool</div>
		</div>
		<div class='table-body'>
			{#each assets as asset}
			<div class='row'>
				<div class='cell la'><img src={`/asset-logos/${asset}.svg`} /> {asset}</div>
				<div class='cell'><span>{numberWithCommas($poolBalances[asset]) || 0}<br/><span class='grayed'>${formatForDisplay(getAmountInUsd(asset, $poolBalances[asset], $prices))}</span></span></div>
				<div class='cell'>{formatForDisplay($weeklyPerformance[asset] * 100) || 0}%</div>
				<div class='cell'>{formatForDisplay($monthlyPerformance[asset] * 100) || 0}%</div>
				<div class='cell'>{formatForDisplay($yearlyPerformance[asset] * 100) || 0}%</div>
				<div class='cell'>{numberWithCommas(bufferBalances[asset])}</div>
				<div class='cell highlighted'><span>{numberWithCommas($poolStakes[asset]) || 0}<br><span class='grayed'>${getAmountInUsd(asset, $poolStakes[asset], $prices)}</span></span></div>
				<div class='cell highlighted'>{$poolBalances[asset] == 0 ? 'N/A' : formatForDisplay(($poolStakes[asset])/$poolBalances[asset]  *100 )+ '%'}</div>
			</div>
			{/each}
			<div class='row'>
				<div class='cell la'>Total</div>
				<div class='cell'>${getTotalAmountInUsd($poolBalances, $prices)}</div>
				<div class='cell'>-</div>
				<div class='cell'>-</div>
				<div class='cell'>-</div>
				<div class='cell'>-</div>
				<div class='cell highlighted'>${getTotalAmountInUsd($poolStakes, $prices)}</div>
				<div class='cell highlighted'>-</div>
			</div>
		</div>
	</div>
</div>