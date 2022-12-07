<script>
	
	import { onMount } from 'svelte'
	
	import Modal from './Modal.svelte'
	import Input from '@components/layout/Input.svelte'
	import Button from '@components/layout/Button.svelte'
	import LabelValue from '@components/layout/LabelValue.svelte'

	import { ADDRESS_ZERO } from '@lib/config'

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
