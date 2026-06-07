<script>
	
	import Modal from './Modal.svelte'
	import Input from '@components/layout/Input.svelte'
	import Button from '@components/layout/Button.svelte'
	
	import { onMount } from 'svelte'

	import { depositCAP, getCAPWalletBalance } from '@api/cap'
	import { approveAsset, getAllowance } from '@api/assets'
	import { formatCAPForDisplay } from "@lib/formatters"
	import { allowances } from '@lib/stores'
	import { focusInput, hideModal } from '@lib/ui'
	import LabelValue from '../layout/LabelValue.svelte'

	const CAP_STAKING_SPENDER = 'Staking';

	let amount, isSubmitting, isApproving, isCheckingAllowance = true, walletBalance = "0.0";

	$: formattedWalletBalance = formatCAPForDisplay(walletBalance);

	async function submit() {

		if (!amount) return focusInput('Amount');
		isSubmitting = true;

		const success = await depositCAP(amount);
		if (success) {
			hideModal();
		}
		isSubmitting = false;

	}

	async function checkAllowance() {
		isCheckingAllowance = true;
		try {
			await getAllowance('CAP', CAP_STAKING_SPENDER);
		} finally {
			isCheckingAllowance = false;
		}
	}

	async function _approveAsset() {
		isApproving = true;
		try {
			await approveAsset('CAP', CAP_STAKING_SPENDER);
		} finally {
			isApproving = false;
		}
	}

	async function getBalance() {
		walletBalance = await getCAPWalletBalance();
	}

	checkAllowance();
	getBalance();

	onMount(() => {
		focusInput('Amount');
	});

</script>

<style>


</style>

<Modal title='Stake CAP' width={280}>
	
	<div class='container'>

		<form on:submit|preventDefault={submit}>

			<div class="group">
				<Input label='Amount' bind:value={amount} />
				<LabelValue
					label="Wallet Balance"
					value={formattedWalletBalance}
					isClickable={true}
					hasSemiPadding={true}
					on:click={() => { amount = formattedWalletBalance; }}
				/>
			</div>

			<div>
				{#if isCheckingAllowance}
				<Button noSubmit={true} isLoading={true} label={`Approve CAP`} />
				{:else if ($allowances['CAP']?.[CAP_STAKING_SPENDER] || 0) * 1 <= amount * 1}
				<Button noSubmit={true} isLoading={isApproving} label={`Approve CAP`} on:click={_approveAsset} />
				{:else}
				<Button isLoading={isSubmitting} label={`Stake`} />
				{/if}
			</div>
		</form>

	</div>

</Modal>
