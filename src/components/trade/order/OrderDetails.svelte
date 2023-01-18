<script>

	import LabelValue from '@components/layout/LabelValue.svelte'
	import Fee from './Fee.svelte'


	import { isLong, margin, isReduceOnly, liquidationPrice, sizeInUsd, tpPrice, slPrice } from '@lib/stores'
	import { formatForDisplay } from '@lib/formatters'

	export let market;
	export let asset;
	export let size;
	export let isClose = false;
	export let clickableFee = true;

	// $: console.log('size', size);

	let showMore = false;

</script>

<style>
	.order-info {
	}
	.row {
		display: flex;
		align-items: center;
		height: 26px;
		justify-content: space-between;
	}
	.small {
		font-size: 90%;
	}

	.label {
		cursor: default;
		text-transform: capitalize;
		color: var(--text400);
	}

	.value :global(svg) {
		fill: var(--text1);
		width: 12px;
		margin-right: 4px;
	}
	.show-more {
		color: var(--primary);
		font-size: 90%;
		padding-top: 6px;
		cursor: pointer;
	}
</style>

{#if size > 0}
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
			clickable={clickableFee}
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
				label='Size in USD' 
				value={`$${formatForDisplay($sizeInUsd)}`}
			/>
			
		</div>
	{/if}

	<div class='show-more' on:click={() => {showMore = !showMore}}>Show {#if showMore}Less{:else}More{/if}</div>

</div>
{/if}