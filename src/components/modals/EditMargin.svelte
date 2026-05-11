<script>
	
	import { onMount } from 'svelte'
	
	import Modal from './Modal.svelte'
	import Input from '@components/layout/Input.svelte'
	import Button from '@components/layout/Button.svelte'
	import LabelValue from '@components/layout/LabelValue.svelte'

	import { BPS_DIVIDER } from '@lib/config'
	import { formatForDisplay, formatPriceForDisplay } from '@lib/formatters'
	import { approveAsset, getAllowance } from '@api/assets'
	import { addMargin, removeMargin } from '@api/positions'
	import { focusInput, hideModal } from '@lib/ui'
	import { allowances, marketInfos } from '@lib/stores'

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

	let funding = data.funding || 0;
	let currentLiqPrice = 0;
	let newLiqPrice = 0;
	let newMargin = 0;
	function calculateLiquidationPrice(marginValue, marketInfosByName) {

		const liqThreshold = (marketInfosByName[data.position.market]?.liqThreshold || BPS_DIVIDER) / BPS_DIVIDER;

		if (data.position.isLong) {
			return data.position.price * 1 - liqThreshold * marginValue * data.position.price / data.position.size;
		}
		return data.position.price * 1 + liqThreshold * marginValue * data.position.price / data.position.size;

	}
	function calculateNewLiquidationPrice(marginDelta, mode, marketInfosByName) {

		const currentMargin = data.position.margin * 1 + funding * 1;
		const parsedMarginDelta = Math.max(marginDelta * 1 || 0, 0);
		const effectiveMarginDelta = mode == 'Remove' ? Math.min(parsedMarginDelta, currentMargin) : parsedMarginDelta;

		currentLiqPrice = calculateLiquidationPrice(currentMargin, marketInfosByName);

		if (mode == 'Add') {
			newMargin = currentMargin + effectiveMarginDelta;
		} else {
			newMargin = currentMargin - effectiveMarginDelta;
		}

		newLiqPrice = calculateLiquidationPrice(newMargin, marketInfosByName);
		if (newLiqPrice < 0) newLiqPrice = 0;
		calculateNewLeverage();
	}

	let newLeverage = 0;
	function calculateNewLeverage() {
		newLeverage = newMargin > 0 ? data.position.size / newMargin : 0;
	}

	$: calculateNewLiquidationPrice(margin, selected, $marketInfos)

	let isApproving = false;
	async function _approveAsset() {
		isApproving = true;
		const success = await approveAsset(data.position.asset, 'FundStore');
		isApproving = false;
	}

	$: getAllowance(data.position.asset, 'FundStore');

	onMount(() => {
		focusInput(`Add ${data.position.asset}`);
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
				<LabelValue label='Current Liq. Price' value={formatPriceForDisplay(currentLiqPrice) || "-"} />
			</div>

			<div class='row'>
				<LabelValue label='New Liq. Price' value={formatPriceForDisplay(newLiqPrice) || "-"} />
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
