<script>

	import { onMount, onDestroy } from 'svelte'

	import Section from '@components/layout/Section.svelte'
	import Input from '@components/layout/Input.svelte'
	import Button from '@components/layout/Button.svelte'

	import { getReferralCode, setReferralCode } from '@api/referrals'
	import { address, referralCode } from '@lib/stores'
	import { getAssets, getAmountInUsd, getTotalAmountInUsd } from '@lib/utils'
	import { focusInput } from '@lib/ui'

	import Payments from './Payments.svelte'


	let t;
	async function fetchData() {
		clearTimeout(t);
		getReferralCode();
		t = setTimeout(fetchData, 5 * 60 * 1000);
	}
	$: fetchData($address);

	let newCode, isSubmitting;
	async function submit() {
		if (!newCode) return focusInput('Code');
		isSubmitting = true;
		const success = await setReferralCode(newCode);
		if (success) {
		}
		isSubmitting = false;
	}

	onMount(() => {
		focusInput('Code');
	});

	onDestroy(() => {
		clearTimeout(t);
	});

</script>

<style>

	.wrapper {
		padding: 20px var(--base-padding);
		max-width: 1280px;
		margin: 0 auto;
	}

	.section {
		max-width: 420px;
		margin: 0 auto;
	}

	.link {
		background-color: var(--layer2);
		padding: 16px 20px;
		border-radius: var(--base-radius);
		font-weight: 500;
		font-size: 20px;
		text-align: center;
		color: var(--primary);
	}

	input {
		height: 44px;
		width: 100%;
		font-size: inherit;
		box-sizing: border-box;
		background-color: transparent;
		border: 1px solid var(--layer200);
		border-radius: 6px;
		padding: 0 14px;
		outline: none;
	}
	input::placeholder {
	  color: var(--text500);
	  opacity: 1;
	}
	input::-ms-input-placeholder{
	  color: var(--text500);
	}
	input:-ms-input-placeholder {
	  color: var(--text500);
	}

	input:hover {
		border-color: var(--layer300);
	}
	input:focus {
		border-color: var(--primary);
	}	

</style>

<div class='wrapper'>

	<div class="section">

	<Section title='Referral Link' subtitle={`Share your referral link to get revenue directly to your wallet. Get 10% of the fees your referrals generate, and they get a 10% discount.`}>

		<div class='container'>

			{#if $referralCode}
			<div class='link'>https://cap.io/?r={$referralCode || '[code]'}</div>
			{:else}
			<div class="group">
				Choose a referral code{#if !$referralCode}&nbsp;to get your link{/if}:
			</div>

			<form on:submit|preventDefault={submit}>
			
				<div class="group">
					<input 
						type='text' 
						placeholder='Code' 
						bind:value={newCode}
						autocomplete="off" 
						autocorrect="off" 
						spellcheck="false"
					/>
				</div>

				<div>
					<Button isLoading={isSubmitting} label={`Submit`} />
				</div>

			</form>
			{/if}

		</div>

	</Section>
</div>

	<Payments />

</div>