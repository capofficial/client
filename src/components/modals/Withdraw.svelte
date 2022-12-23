<script>
	
	import Modal from './Modal.svelte'
	import Input from '@components/layout/Input.svelte'
	import Button from '@components/layout/Button.svelte'
	import LabelValue from '@components/layout/LabelValue.svelte'
	
	import { onMount } from 'svelte'

	import { BPS_DIVIDER } from '@lib/config'
	import { poolStakes, poolWithdrawalFees } from '@lib/stores'
	import { withdraw, getPoolWithdrawalFee } from '@api/pool'
	import { focusInput, hideModal } from '@lib/ui'
	import { formatForDisplay } from '@lib/formatters'
	import { getAssets } from '@lib/utils'

	let amount, asset, withdrawFeeBps, isSubmitting;

	async function selectAsset(_asset) {
		asset = _asset;
		getPoolWithdrawalFee(_asset);
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

	const setMax = () => {
	    amount = formatForDisplay($poolStakes[asset]);
	};

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
	.max {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
	.max p {
		width: 100%;
	}
	.input-box {
		display: flex;
		flex-direction: column;
		margin-bottom: 1rem;
	}

	.input-box div {
		display: grid;
		grid-template-columns: 50px 1fr;
	}

</style>

<Modal title='Pool Withdraw' width={280}>
	
	<div class='container'>

		<div class="group select-asset">
			{#each assets as _asset}
				<a class:active={_asset == asset} on:click={() => {selectAsset(_asset)}}>{_asset}</a>
			{/each}
		</div>

		<div class="group">
			<LabelValue label='Available' value={formatForDisplay($poolStakes[asset])} />
		</div>

		<form on:submit|preventDefault={submit}>

			<div class="input-box">
				<div class="">
				  <span
					on:click={() => {
					  setMax($poolStakes[asset]);
					}}
					class="max"
				  >
					<p>MAX</p>
				  </span>
				  <span> <Input label="" bind:value={amount} /></span>
				</div>
			</div>
		
			{#if $poolWithdrawalFees[asset]}
			<div class='note'>The withdrawal fee is currently {$poolWithdrawalFees[asset]}%.</div>
			{/if}

			<div>
				<Button isLoading={isSubmitting} label={`Withdraw`} />
			</div>
			
		</form>

	</div>

</Modal>