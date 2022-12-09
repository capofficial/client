<script>
	import Modal from './Modal.svelte'

	import { onMount } from 'svelte'

	import { formatForDisplay, numberWithCommas } from '@lib/formatters'
	import { CIRCLE, CIRCLE_INSET_FILLED, SMALL_CIRCLE_FILLED } from '@lib/icons'
	import { selectedAsset, balances, address } from '@lib/stores'
	import { getAssets, saveUserSetting } from '@lib/utils'
	import { getUserAssetBalances } from '@api/assets'

	const assets = getAssets();

	async function selectAsset(asset) {
		selectedAsset.set(asset);
		saveUserSetting('selectedAsset', asset);
	}

	async function fetchData() {
		await getUserAssetBalances();
	}
	$: fetchData($address);

</script>

<style>

	.row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 var(--base-padding);
		font-weight: 500;
		cursor: pointer;
		height: 54px;
	}
	.row.active {
		background-color: var(--layer1-hover);
		cursor: default !important;
	}
	.row.active :global(svg) {
		fill: var(--primary);
	}
	.row:last-child {
		border-bottom: none;
	}

	.row img {
		width: 18px;
		margin-left: 10px;
	}

	.label, .value {
		display: flex;
		align-items: center;
	}

	.label :global(svg) {
		fill: var(--text1);
		width: 16px;
		margin-right: 10px;
	}

</style>

<Modal 
	title='Select Collateral' 
	width='300'
>
	
	{#each assets as asset}
		<div class='row' on:click={() => {selectAsset(asset)}} class:active={asset == $selectedAsset}>
			<div class='label'>
				{#if asset == $selectedAsset}{@html CIRCLE_INSET_FILLED}{:else}{@html CIRCLE}{/if}
				{asset}
			</div>
			<div class='value'>
				{numberWithCommas($balances[asset])}
				<img src={`/asset-logos/${asset}.svg`} />
			</div>
		</div>
	{/each}

</Modal>
