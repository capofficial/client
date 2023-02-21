<script>
	
	import { onMount } from 'svelte'
	
	import Modal from './Modal.svelte'
	import Input from '@components/layout/Input.svelte'
	import Button from '@components/layout/Button.svelte'
	import LabelValue from '@components/layout/LabelValue.svelte'

	import { ADDRESS_ZERO } from '@lib/config'
	import { formatForDisplay } from '@lib/formatters'
	import { approveAsset, getAllowance } from '@api/assets'
	import { addMargin, removeMargin } from '@api/positions'
	import { focusInput, hideModal } from '@lib/ui'
	import { allowances, selectedMarketInfo } from '@lib/stores'

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
	let newLiqPrice = data.position.liqprice;
	let newMargin = 0;
	function calculateNewLiquidationPrice(marginDelta, mode) {

		if (!marginDelta) marginDelta = 0;

		if (mode == 'Add') {
			newMargin = ((data.position.margin*1 + funding*1) + marginDelta);

			if (data.position.isLong) {
				newLiqPrice = data.position.price * 1 - newMargin * data.position.price / data.position.size;
			} else {
				newLiqPrice = data.position.price * 1 + newMargin * data.position.price / data.position.size;
			}
			if (newLiqPrice < 0) newLiqPrice = 0;
		} else {
			if (marginDelta >= (data.position.margin*1 + funding*1)) {
				newMargin = 0;
				margin = (data.position.margin*1 + funding*1);
			} else {
				newMargin = ((data.position.margin*1 + funding*1) - marginDelta);
			}
			if (data.position.isLong) {
				newLiqPrice = data.position.price * 1 - ((data.position.margin*1 + funding*1) - marginDelta) * data.position.price / data.position.size;
			} else {
				newLiqPrice = data.position.price * 1 + ((data.position.margin*1 + funding*1 - marginDelta)) * data.position.price / data.position.size;
			}
		}
		calculateNewLeverage();
	}

	let newLeverage = 0;
	function calculateNewLeverage() {
		newLeverage = data.position.size / newMargin;
	}

	$: calculateNewLiquidationPrice(margin, selected)

	let isApproving = false;
	async function _approveAsset() {
		isApproving = true;
		const success = await approveAsset(data.position.asset, 'FundStore');
		isApproving = false;
	}

	$: getAllowance(data.position.asset, 'PositionStore');

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
				<LabelValue label='New Liq. Price' value={`${formatForDisplay(newLiqPrice) || "-"}`} />
			</div>

			<div class='row'>
				<LabelValue label='New Leverage' value={`${formatForDisplay(newLeverage) || "-"}`} />
			</div>

			<div class='row'>
				<LabelValue label='New Margin' value={`${formatForDisplay(newMargin) || "-"}`} />
			</div>

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
