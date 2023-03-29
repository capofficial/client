<script>
	
	import Modal from './Modal.svelte'
	import Input from '@components/layout/Input.svelte'
	import Button from '@components/layout/Button.svelte'
	import LabelValue from '@components/layout/LabelValue.svelte'
	
	import { onMount } from 'svelte'

	import { BPS_DIVIDER } from '@lib/config'
	import { poolStakes, globalUPLs } from '@lib/stores'
	import { withdraw, getPoolWithdrawalTaxBps, getGlobalUPL } from '@api/pool'
	import { focusInput, hideModal } from '@lib/ui'
	import { formatForDisplay, numberWithCommas } from '@lib/formatters'
	import { getAssets } from '@lib/utils'

	let amount, asset, costBps, isSubmitting;

	async function selectAsset(_asset) {
		asset = _asset;
		getGlobalUPL(_asset);
	}

	async function submit() {

		if (!amount) return focusInput('Amount');
		isSubmitting = true;

		const success = await withdraw(asset, amount);
		if (success) {
			hideModal();
		}
		isSubmitting = false;

	}

	let t;
	async function calculateDepositCost() {
		clearTimeout(t);
		t = setTimeout(async () => {
			costBps = await getPoolWithdrawalTaxBps(asset, amount);
		}, 1000);
	}

	$: calculateDepositCost(asset, amount);

	let assets = getAssets();

	onMount(() => {
		selectAsset('ETH');
		focusInput('Amount');
	});

</script>

<style>
	.select-asset a {
		color: var(--text1);
		margin-right: var(--base-padding);
	}
	.select-asset a.active {
		color: var(--primary);
	}
	.note {
		color: var(--text300);
		line-height: 1.418;
		font-size: 80%;
		padding-bottom: 20px;
	}
	.group-row {
		padding-bottom: 12px;
	}

</style>

<Modal title='Pool Withdraw' width={280}>
	
	<div class='container'>

		<div class="group select-asset">
			{#each assets as _asset}
				<a class:active={_asset == asset} on:click={() => {selectAsset(_asset)}}>{_asset}</a>
			{/each}
		</div>

		<form on:submit|preventDefault={submit}>

			<div class="group">
				<Input label='Amount' bind:value={amount} />
			</div>

			<div class="group">
				<div class='group-row'><LabelValue label='Available' value={formatForDisplay($poolStakes[asset])} isClickable={true} on:click={() => {amount = $poolStakes[asset]}} /></div>
					<div class='group-row'><LabelValue label='Total Trader UP/L' value={numberWithCommas($globalUPLs[asset])} /></div>
				<LabelValue label='Withdrawal Cost' value={`${costBps || 0}%`} />
			</div>

			<div class="group">
				
			</div>

			<div>
				<Button isLoading={isSubmitting} label={`Withdraw`} />
			</div>
			
		</form>

	</div>

</Modal>