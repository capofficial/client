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

	let amount, isSubmitting, walletBalance = "0.0";

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
		await getAllowance('CAP', 'FundStore');
	}

	async function _approveAsset() {
		const result = await approveAsset('CAP', 'FundStore');
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
				{#if $allowances['CAP']?.['FundStore'] * 1 <= amount * 1}
				<Button label={`Approve CAP`} on:click={_approveAsset} />
				{:else}
				<Button isLoading={isSubmitting} label={`Stake`} />
				{/if}
			</div>
		</form>

	</div>

</Modal>
