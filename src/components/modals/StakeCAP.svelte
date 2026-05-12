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

	const CAP_APPROVAL_SPENDER = 'Staking';

	let amount, isSubmitting, isCheckingAllowance = true, isApproving = false, walletBalance = "0.0";

	$: formattedWalletBalance = formatCAPForDisplay(walletBalance);
	$: capAllowance = $allowances['CAP']?.[CAP_APPROVAL_SPENDER];
	$: isAllowancePending = amount && (isCheckingAllowance || capAllowance === undefined);
	$: requiresApproval = amount && !isAllowancePending && capAllowance * 1 <= amount * 1;

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
			await getAllowance('CAP', CAP_APPROVAL_SPENDER);
		} finally {
			isCheckingAllowance = false;
		}
	}

	async function _approveAsset() {
		isApproving = true;
		try {
			const success = await approveAsset('CAP', CAP_APPROVAL_SPENDER);
			if (success) {
				await checkAllowance();
				await getBalance();
			}
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
				{#if isAllowancePending || requiresApproval}
				<Button noSubmit={true} isLoading={isCheckingAllowance || isApproving} label={`Approve CAP`} on:click={_approveAsset} />
				{:else}
				<Button isLoading={isSubmitting} label={`Stake`} />
				{/if}
			</div>
		</form>

	</div>

</Modal>
