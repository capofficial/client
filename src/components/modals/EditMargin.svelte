<script>
	
	import { onMount } from 'svelte'
	
	import Modal from './Modal.svelte'
	import Input from '@components/layout/Input.svelte'
	import Button from '@components/layout/Button.svelte'
	import LabelValue from '@components/layout/LabelValue.svelte'

	import { ADDRESS_ZERO } from '@lib/config'
	import { formatForDisplay, numberWithCommas } from '@lib/formatters'
	import { approveAsset, getAllowance, getUserAssetBalances } from '@api/assets'
	import { addMargin, removeMargin } from '@api/positions'
	import { focusInput, hideModal } from '@lib/ui'
	import { allowances, balances, selectedMarketInfo } from '@lib/stores'

	export let data;

	let margin, isSubmitting;

	async function _addMargin() {

		if (!margin) return focusInput('Add Margin');
		isSubmitting = true;

		const success = await addMargin(data.position.market, data.position.assetAddress, margin);
		if (success) {
			hideModal();
		}
		isSubmitting = false;

	}

	async function _removeMargin() {

		if (!margin) return focusInput('Remove Margin');
		isSubmitting = true;

		const success = await removeMargin(data.position.market, data.position.assetAddress, margin);
		if (success) {
			hideModal();
		}
		isSubmitting = false;

	}

	let selected = 'Add';
	function select(_s) {
		selected = _s;
		setTimeout(() => {
			focusInput(`${selected} ${data.position.asset}`);
		}, 50);
	}

	let funding = data.funding || data.position.funding || 0;
	let currentMargin = data.position.margin * 1 + funding * 1;
	let maxRemovableMargin = currentMargin > 0 ? currentMargin : 0;
	let newLiqPrice = data.position.liqprice;
	let newMargin = 0;
	let availableWalletBalance = 0;
	function calculateNewLiquidationPrice(marginDelta, mode) {

		if (!marginDelta) marginDelta = 0;

		if (mode == 'Add') {
			newMargin = currentMargin + marginDelta;

			if (data.position.isLong) {
				newLiqPrice = data.position.price * 1 - newMargin * data.position.price / data.position.size;
			} else {
				newLiqPrice = data.position.price * 1 + newMargin * data.position.price / data.position.size;
			}
			if (newLiqPrice < 0) newLiqPrice = 0;
		} else {
			if (marginDelta >= currentMargin) {
				newMargin = 0;
				margin = currentMargin;
			} else {
				newMargin = currentMargin - marginDelta;
			}
			if (data.position.isLong) {
				newLiqPrice = data.position.price * 1 - (currentMargin - marginDelta) * data.position.price / data.position.size;
			} else {
				newLiqPrice = data.position.price * 1 + (currentMargin - marginDelta) * data.position.price / data.position.size;
			}
		}
		calculateNewLeverage();
	}

	let newLeverage = 0;
	function calculateNewLeverage() {
		newLeverage = data.position.size / newMargin;
	}

	$: calculateNewLiquidationPrice(margin, selected)
	$: availableWalletBalance = $balances[data.position.asset] || 0;

	let isApproving = false;
	async function _approveAsset() {
		isApproving = true;
		const success = await approveAsset(data.position.asset, 'FundStore');
		isApproving = false;
	}

	$: getAllowance(data.position.asset, 'FundStore');

	onMount(() => {
		focusInput(`Add ${data.position.asset}`);
		getUserAssetBalances([data.position.asset]);
	});

</script>

<style>

	.selector a {
		color: var(--text1);
		margin-right: var(--base-padding);
	}
	.selector a.active {
		color: var(--primary);
	}

	.row {
		display: flex;
		align-items: center;
		height: 26px;
		justify-content: space-between;
	}

	.button {
		margin-top: 20px;
	}

	.note {
		margin-top: 20px;
		color: var(--text400);
		font-size: 85%;
		line-height: 1.318;
	}

</style>

<Modal title='Edit Margin' width={280}>
	
	<div class='container'>

		<div class='group selector'>
			<a class:active={selected=='Add'} on:click={() => {select('Add')}}>Add</a>
			<a class:active={selected=='Remove'} on:click={() => {select('Remove')}}>Remove</a>
		</div>

		<form on:submit|preventDefault={selected == 'Add' ? _addMargin : _removeMargin}>
			
			<div class='group'>
				<Input label={`${selected} ${data.position.asset}`} bind:value={margin} />
			</div>

			<div class='row'>
				{#if selected == 'Add'}
					<LabelValue label='Wallet Balance' value={numberWithCommas(availableWalletBalance)} isClickable={true} on:click={() => { margin = availableWalletBalance }} />
				{:else}
					<LabelValue label='Available Margin' value={numberWithCommas(maxRemovableMargin)} isClickable={true} on:click={() => { margin = maxRemovableMargin }} />
				{/if}
			</div>

			<div class='row'>
				<LabelValue label='New Liq. Price' value={`${formatForDisplay(newLiqPrice) || "-"}`} />
			</div>

			<div class='row'>
				<LabelValue label='New Leverage' value={`${formatForDisplay(newLeverage) || "-"}`} />
			</div>

			<div class='row'>
				<LabelValue label='New Margin' value={`${formatForDisplay(newMargin) || "-"}`} />
			</div>

			{#if selected=='Remove'}
			<div class='note'>Margin removal is only available on markets with a Chainlink price.</div>
			{/if}

			<div class='button'>
				{#if data.position.asset != 'ETH' && $allowances[data.position.asset]?.['FundStore'] * 1 <= margin * 1}
				<Button noSubmit={true} isLoading={isApproving} label={`Approve ${data.position.asset}`} on:click={_approveAsset} />
				{:else}
				<Button isLoading={isSubmitting} label={`${selected} Margin`} />
				{/if}
			</div>
			
		</form>

	</div>

</Modal>
