<script>

	import { onDestroy } from 'svelte'

	import { GIFT_ICON } from '@lib/icons'
	import { address, reward } from '@lib/stores' 
	import { formatForDisplay } from '@lib/formatters'

	import { getReward, claimReward } from '@api/rewards'

	let isLoading = true, t;
	async function fetchData() {
		clearTimeout(t);
		const done = await getReward();
		isLoading = false;
		t = setTimeout(fetchData, 10 * 1000);
	}
	$: fetchData($address);

	onDestroy(() => {
		clearTimeout(t);
	});

	async function claim() {
		if (isLoading) return;
		isLoading = true;
		await claimReward();
		isLoading = false;
	}

	let hovered;

</script>

<style>

	.rewards {
		display: flex;
		align-items: center;
		padding: 8px;
		background-color: gold;
		margin-left: 12px;
		border-radius: 5px;
		color: #222;
		cursor: pointer;
	}
	.rewards :global(svg) {
		height: 16px;
		fill: currentColor;
		margin-right: 6px;
	}

</style>

<div class='rewards' on:click={claim} on:mouseover={() => {hovered = true}} on:mouseout={() => {hovered = false}}>
	{#if isLoading}...{:else}
		{#if hovered}Claim Rewards{:else}{@html GIFT_ICON} {formatForDisplay($reward)} ARB{/if}
	{/if}
</div>