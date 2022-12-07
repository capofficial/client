<script>
	
	import { onMount } from 'svelte'
	
	import Modal from './Modal.svelte'
	import Input from '@components/layout/Input.svelte'
	import Button from '@components/layout/Button.svelte'
	import LabelValue from '@components/layout/LabelValue.svelte'
	import OrderDetails from '@components/trade/order/OrderDetails.svelte'

	import { approveAsset, getAllowance } from '@api/assets'
	import { formatPnl, formatUnits, formatForDisplay } from '@lib/formatters'
	import { prices, allowances } from '@lib/stores'
	import { focusInput, hideModal } from '@lib/ui'
	import { getUPL } from '@lib/utils'

	import { submitCloseOrder } from '@api/orders'
	import { getMarketInfo } from '@api/markets'

	export let data;

	let amount, isSubmitting, sizeToClosePercent = 0;

	async function submit() {
		if (!amount) return focusInput('Size to Close');
		isSubmitting = true;
		const success = await submitCloseOrder({
			market: data.market,
			asset: data.assetAddress,
			isLong: !data.isLong,
			size: amount
		});
		isSubmitting = false;
	}

	let pnl;

	async function calculatePnl(_prices, _amount) {
		if (!_amount) {
			pnl = 0;
			return;
		}
		let price = _prices[data.market]
		let _data = {...data};
		_data.size = Math.min(_amount * 1, data.size * 1);
		pnl = getUPL(_data, price);
	}

	$: calculatePnl($prices, amount);

	function setSizeToClosePercent(_amount) {
		if (!data.size) return;
		sizeToClosePercent = 100 * _amount / data.size;
		if (sizeToClosePercent > 100) sizeToClosePercent = 100;
	}

	$: setSizeToClosePercent(amount);

	let isApproving = false;
	async function _approveAsset() {
		isApproving = true;
		const success = await approveAsset(data.asset, 'FundStore');
		isApproving = false;
	}

	$: getAllowance(data.asset, 'FundStore');

	onMount(() => {
		focusInput('Size to Close');
	});

</script>

<style>

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

<Modal title='Close Position' width={340}>
	
	<div class='container'>

		<form on:submit|preventDefault={submit}>

			<div class='group'>
				<Input label='Size to Close' asset={data.asset} bind:value={amount} />
			</div>

			<div class='row'>
				<LabelValue label='Max' value={`${formatForDisplay(data.size)} ${data.asset}`} on:click={() => amount = data.size} isClickable={true} />
			</div>

			<div class='row'>
				<LabelValue label='P/L (approx)' value={`${pnl ? `${formatPnl(pnl)} ${data.asset}` : '-'}`} />
			</div>

			<div class='row'>
				<LabelValue label='Size to Close (%)' value={`${formatForDisplay(sizeToClosePercent)}%`} />
			</div>

			<OrderDetails market={data.market} asset={data.asset} size={amount} isClose={true} clickableFee={false} />

			<div class="button">
				{#if data.asset != 'ETH' && $allowances[data.asset]?.['FundStore'] * 1 == 0}
				<Button noSubmit={true} isLoading={isApproving} label={`Approve ${data.asset}`} on:click={_approveAsset} />
				{:else}
				<Button isSmall={true} isLoading={isSubmitting} label={`Submit Close Order`} />
				{/if}
			</div>

		</form>

	</div>

</Modal>
