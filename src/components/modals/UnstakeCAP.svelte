<script>
	
	import Modal from './Modal.svelte'
	import Input from '@components/layout/Input.svelte'
	import Button from '@components/layout/Button.svelte'
	import LabelValue from '@components/layout/LabelValue.svelte'

	import { onMount } from 'svelte'

	import { withdrawCAP } from '@api/cap'
	import { formatCAPForDisplay } from '@lib/formatters'
	import { CAPStake } from '@lib/stores'
	import { focusInput, hideModal } from '@lib/ui'

	let amount, isSubmitting;

	$: formattedCAPStaked = formatCAPForDisplay($CAPStake);

	async function submit() {

		if (!amount) return focusInput('Amount');
		isSubmitting = true;

		const success = await withdrawCAP(amount);
		if (success) {
			hideModal();
		}
		isSubmitting = false;

	}

	onMount(() => {
		focusInput('Amount');
	});


</script>

<style>


</style>

<Modal title='Unstake CAP' width={280}>
	
	<div class='container'>

		<form on:submit|preventDefault={submit}>
			<div class="group">
				<Input label='Amount' bind:value={amount} />
				<LabelValue
					label="CAP Staked"
					value={formattedCAPStaked}
					isClickable={true}
					hasSemiPadding={true}
					on:click={() => { amount = formattedCAPStaked; }}
				/>
			</div>

			<div>
				<Button isLoading={isSubmitting} label={`Unstake`} />
			</div>
		</form>

	</div>

</Modal>
