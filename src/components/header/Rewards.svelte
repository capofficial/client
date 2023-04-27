<script>

	import tooltip from '@lib/tooltip'

	import { onDestroy } from 'svelte'

	import { GIFT_ICON } from '@lib/icons'
	import { address, reward } from '@lib/stores' 
	import { formatForDisplay } from '@lib/formatters'

	import { getReward, claimReward } from '@api/rewards'

	let isLoading = false, t;
	async function fetchData() {
		clearTimeout(t);
		const done = await getReward();
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

</script>

<style>

	.rewards {
		display: flex;
		align-items: center;
		padding: 8px;
		background-color: gold;
		margin-left: 12px;
		border-radius: var(--base-radius);
		color: #222;
		cursor: pointer;
		font-weight: 500;
	}
	.rewards:hover {
		background-color: #F5D000;
	}
	.rewards :global(svg) {
		height: 16px;
		fill: currentColor;
		margin-right: 6px;
	}

</style>

<div class='rewards' on:click={claim} use:tooltip={{content: 'Claim Rewards'}}>
	{@html GIFT_ICON} {#if isLoading}Claiming…{:else}{formatForDisplay($reward)} ARB{/if}
</div>