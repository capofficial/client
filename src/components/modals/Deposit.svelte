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
	import { getUsdcBalance, getBalance, getWbtcBalance } from "@api/cap";

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
	let usdc_balance;
	let wbtc_balance;
  	let eth_bal;


	async function checkAllowance(_asset) {
		await getAllowance(_asset, 'FundStore');
	}

	async function _approveAsset() {
		const result = await approveAsset(asset, 'FundStore');
	}

	$: checkAllowance(asset);

	const setMax = (assetName) => {
		switch (assetName) {
		case "ETH":
			amount = eth_bal;
			break;
		case "USDC":
			amount = usdc_balance;
			break;
		case "WBTC":
			amount = wbtc_balance;
			break;
		}
  	};

	onMount(async() => {
		selectAsset('ETH');
		focusInput('Amount');
		usdc_balance = await getUsdcBalance();
        wbtc_balance = await getWbtcBalance();
        eth_bal = await getBalance();
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
		margin-bottom: 20px;
    	margin-top: 20px;
	}
	.input-box {
    	display: flex;
    	flex-direction: column;
    	margin-top: 1rem;
	  }
  .input-box div {
    	display: grid;
    	grid-template-columns: 50px 1fr;
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

</style>

<Modal title='Pool Deposit' width={280}>
	
	<div class='container'>

		<form on:submit|preventDefault={submit}>

		<div class="group select-asset">
			{#each assets as _asset}
				<a class:active={_asset == asset} on:click={() => {selectAsset(_asset)}}>{_asset}</a>
			{/each}
		</div>

		<div>
			{#if asset == "ETH"}
			  <p>Balance: {eth_bal}</p>
			{/if}
		  </div>
	
		  <div>
			{#if asset == "USDC"}
			  <p>Balance: {usdc_balance}</p>
			{/if}
		  </div>
	
		  <div>
			{#if asset == "WBTC"}
			  <p>Balance: {wbtc_balance}</p>
			{/if}
		  </div>
	
		  <div class="input-box">
			<div class="">
			  <span
				on:click={() => {
				  setMax(asset);
				}}
				class="max"
			  >
				<p>MAX</p>
			  </span>
			  <span> <Input label="" bind:value={amount} /></span>
			</div>
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
