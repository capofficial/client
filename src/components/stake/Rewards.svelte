<script>
	import { onDestroy } from 'svelte'
	import Button from '@components/layout/Button.svelte'

	import { getClaimableRewardsCAP, collectAllCAPRewards } from '@api/cap'
	import { formatForDisplay, numberWithCommas } from '@lib/formatters'
	import { address, claimableRewardsCAP, prices } from '@lib/stores'
	import { showModal } from '@lib/ui'
	import { getAssets, getAmountInUsd, getTotalAmountInUsd } from '@lib/utils'

	let t;
	async function fetchData() {
		clearTimeout(t);
		getClaimableRewardsCAP();
		t = setTimeout(fetchData, 60 * 1000);
	}
	$: fetchData($address);

	onDestroy(() => {
		clearTimeout(t);
	});

	let assets = getAssets();

	let isSubmitting;
	async function collect() {
		isSubmitting = true;
		const success = await collectAllCAPRewards();
		if (success) {
		}
		isSubmitting = false;
	}

</script>

<style>

	.stake-cap {
		margin-top: 48px;
	}

	.table {
		--grid-template: repeat(4, 1fr);
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
		grid-template-columns: 1fr;
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

<div class='stake-cap'>

	<div class='header'>
		<div class='left'>
			<div class='title'>Your Pending Rewards</div>
			<div class='subtitle'>CAP rewards are paid directly in underlying currency.</div>
		</div>
		<div class='right buttons'>
			<Button isSmall={true} label={`Collect Rewards`} on:click={collect} />
		</div>
	</div>

	<div class='table'>
		<div class='table-header'>
			{#each assets as asset}
			<div class='cell'><img src={`/asset-logos/${asset}.svg`} /> {asset}</div>
			{/each}
			<div class='cell'>Total</div>
		</div>
		<div class='table-body'>
			<div class='row'>
				{#each assets as asset}
					<div class='cell'>{numberWithCommas($claimableRewardsCAP[asset]) || 0} (${getAmountInUsd(asset, $claimableRewardsCAP[asset], $prices)})</div>
				{/each}
				<div class='cell'>${getTotalAmountInUsd($claimableRewardsCAP, $prices)}</div>
			</div>
		</div>
	</div>
</div>