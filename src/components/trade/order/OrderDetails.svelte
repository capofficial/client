<script>

	import LabelValue from '@components/layout/LabelValue.svelte'
	import Fee from './Fee.svelte'


	import { isLong, margin, isReduceOnly, liquidationPrice, sizeInUsd, tpPrice, slPrice } from '@lib/stores'
	import { formatForDisplay } from '@lib/formatters'

	export let market;
	export let asset;
	export let size;
	export let isClose = false;

	// $: console.log('size', size);

	let showMore = false;

</script>

<style>
	.order-info {
	}
	.row {
		display: flex;
		align-items: center;
		height: 30px;
		justify-content: space-between;
	}
</style>

<div class='order-info'>

	{#if !isClose}

		<div class='row'>
			<LabelValue 
				label={'Margin'}
				value={`${formatForDisplay($margin)} ${asset}`}
			/>
		</div>

	{/if}

	<div class='row'>
		<Fee
			market={market}
			asset={asset}
			size={size}
			isSecondaryColor={!isClose && !$isLong}
			hasTP={!isClose && $tpPrice * 1 > 0}
			hasSL={!isClose && $slPrice * 1 > 0}
		/>
	</div>

	{#if !isClose}

		<div class='row'>
			<LabelValue 
				label='Liq. Price' 
				value={`${size > 0 && !$isReduceOnly ? formatForDisplay($liquidationPrice) : '-'}`}
			/>
		</div>

	{/if}	


	{#if !isClose}

		<div class='row'>
			<LabelValue 
				label='Size (USD)' 
				value={`$${formatForDisplay($sizeInUsd)}`}
			/>
			
		</div>
	{/if}

</div>