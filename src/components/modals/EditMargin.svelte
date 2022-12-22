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

		if (!margin) return focusInput('Margin');
		isSubmitting = true;

		const success = await addMargin(data.market, data.assetAddress, margin);
		if (success) {
			hideModal();
		}
		isSubmitting = false;

	}

	async function _removeMargin() {

		if (!margin) return focusInput('Margin');
		isSubmitting = true;

		const success = await removeMargin(data.market, data.assetAddress, margin);
		if (success) {
			hideModal();
		}
		isSubmitting = false;

	}

	let selected = 'add';
	function select(_s) {
		selected = _s;
		focusInput('Margin');
	}


	let newLiqPrice = data.liqprice;
	let newMargin = 0;
	function calculateNewLiquidationPrice(marginDelta, mode) {

		if (mode == 'add')
		{
			newMargin = ((data.margin*1 + data.funding*1) + marginDelta);

			if (data.isLong)
			{
				newLiqPrice = data.price * 1 - newMargin * data.price / data.size;
			} 
			else 
			{
				newLiqPrice = data.price * 1 + newMargin * data.price / data.size;
			}

			if (newLiqPrice < 0)
			{
				newLiqPrice = 0.00;
			}
		}
		else
		{

			if (marginDelta >= (data.margin*1 + data.funding*1))
			{
				newMargin = 0;
				margin = (data.margin*1 + data.funding*1);
			}
			else
			{
				newMargin = ((data.margin*1 + data.funding*1) - marginDelta);
			}

			if (data.isLong)
			{
				newLiqPrice = data.price * 1 - ((data.margin*1 + data.funding*1) - marginDelta) * data.price / data.size;
			} 
			else 
			{
				newLiqPrice = data.price * 1 + ((data.margin*1 + data.funding*1 - marginDelta)) * data.price / data.size;
			}
			
		}

		calculateNewLeverage()
	}

	let newLeverage = 0;
	function calculateNewLeverage() {
			newLeverage = data.size / newMargin;
	}

	$: calculateNewLiquidationPrice(margin, selected)

	let isApproving = false;
	async function _approveAsset() {
		isApproving = true;
		const success = await approveAsset(data.asset, 'FundStore');
		isApproving = false;
	}

	$: getAllowance(data.asset, 'PositionStore');

	onMount(() => {
		focusInput('Margin');
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

	.note {
		color: var(--text1);
		line-height: 1.418;
		font-size: 85%;
	}
	.pb {
		padding-bottom: var(--base-padding);
	}

	.datacontainer {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		font-size: 85%;
	}

	.margindata {
		display: flex;
		flex-direction: row;
	}

	.datalabel {
		flex-grow: 1;
		align-self: center;
		margin-top: 2px;
		font-size: 110%;
	}

	.currentvalue {
		opacity: 0.25;
	}

	.newvalue {
		font-size: 150%;
	}

</style>

<Modal title='Edit Margin' width={280}>
	
	<div class='container'>

		<div class='group selector'>
			<a class:active={selected=='add'} on:click={() => {select('add')}}>Add</a>
			<a class:active={selected=='remove'} on:click={() => {select('remove')}}>Remove</a>
		</div>

		{#if selected == 'remove' && $selectedMarketInfo?.chainlinkFeed == ADDRESS_ZERO}
			<div class='note'>Margin removal is available only for Chainlink-supported markets.</div>
		{:else}

			<form on:submit|preventDefault={selected == 'add' ? _addMargin : _removeMargin}>
				
				<div class='group'>
					<Input asset={data.asset} label='Margin' bind:value={margin} />
				</div>

				<div class='datacontainer pb'>					
					<div class='margindata'>
						<div class='datalabel'>Liq. Price</div>
						<div><span class='currentvalue'>{formatForDisplay(data.liqprice)} 🠞</span> <span class='newvalue'>{formatForDisplay(newLiqPrice)}</span></div>
					</div>
					<div class='margindata'>
						<div class='datalabel'>Leverage</div>
						<div><span class='currentvalue'>{formatForDisplay(data.leverage)}x 🠞</span> <span class='newvalue'>{formatForDisplay(newLeverage)}x</span></div>
					</div>
					<div class='margindata'>
						<div class='datalabel'>Margin</div>
						<div><span class='currentvalue'>{formatForDisplay(data.margin)} 🠞</span> <span class='newvalue'>{formatForDisplay(newMargin)}</span></div>
					</div>
				</div>

				{#if selected == 'remove'}<div class='note pb'>Margin removal is available only for Chainlink-supported markets.</div>{/if}

				{#if data.asset != 'ETH' && $allowances[data.asset]?.['FundStore'] * 1 <= margin * 1}
				<Button noSubmit={true} isLoading={isApproving} label={`Approve ${data.asset}`} on:click={_approveAsset} />
				{:else}
				<Button isSmall={true} isLoading={isSubmitting} label={selected == 'add' ? 'Add Margin' : 'Remove Margin'} />
				{/if}
				
			</form>

		{/if}

	</div>

</Modal>
