<script>
	
	import Modal from './Modal.svelte'
	import Input from '@components/layout/Input.svelte'
	import Button from '@components/layout/Button.svelte'
	import LabelValue from '@components/layout/LabelValue.svelte'

	import { onMount } from 'svelte'

	import { BPS_DIVIDER } from '@lib/config'
	import { deposit, getPoolWithdrawalFee } from '@api/pool'
	import { approveAsset, getAllowance } from '@api/assets'
	import { allowances, poolWithdrawalFees } from '@lib/stores'
	import { focusInput, hideModal } from '@lib/ui'
	import { getAssets } from '@lib/utils'

	let amount, asset, depositFeeBps, isSubmitting;

	async function selectAsset(_asset) {
		asset = _asset;
		getPoolWithdrawalFee(_asset);
	}

	async function submit() {

		if (!amount) return focusInput('Amount');
		isSubmitting = true;

		const success = await deposit(asset, amount);
		if (success) {
			hideModal();
		}
		isSubmitting = false;

	}

	let assets = getAssets();

	async function checkAllowance(_asset) {
		await getAllowance(_asset, 'FundStore');
	}

	async function _approveAsset() {
		const result = await approveAsset(asset, 'FundStore');
	}

	$: checkAllowance(asset);

	onMount(() => {
		selectAsset('ETH');
		focusInput('Amount');
	});

</script>

<style>
	.select-asset a {
		color: var(--text200);
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

</style>

<Modal title='Pool Deposit' width={280}>
	
	<div class='container'>

		<form on:submit|preventDefault={submit}>

		<div class="group select-asset">
			{#each assets as _asset}
				<a class:active={_asset == asset} on:click={() => {selectAsset(_asset)}}>{_asset}</a>
			{/each}
		</div>

		<div class="group">
			<Input label='Amount' bind:value={amount} />
		</div>
		
		<div class='note'>There are no deposit fees.{#if $poolWithdrawalFees[asset]} The withdrawal fee is currently {$poolWithdrawalFees[asset]}%.{/if}</div>

		<div>
			{#if asset != 'ETH' && $allowances[asset]?.['FundStore'] * 1 <= amount * 1}
			<Button label={`Approve ${asset}`} on:click={_approveAsset} />
			{:else}
			<Button isLoading={isSubmitting} label={`Deposit`} />
			{/if}
			
		</div>

	</form>

	</div>

</Modal>
