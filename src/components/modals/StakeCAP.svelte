<script>
	
	import Modal from './Modal.svelte'
	import Input from '@components/layout/Input.svelte'
	import Button from '@components/layout/Button.svelte'
	
	import { onMount } from 'svelte'

	import { depositCAP } from '@api/cap'
	import { approveAsset, getAllowance } from '@api/assets'
	import { allowances } from '@lib/stores'
	import { focusInput, hideModal } from '@lib/ui'

	let amount, isSubmitting;

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

	checkAllowance();

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
