<script>

	import { setResolution } from '@lib/chart'
	import { chartResolution, chartLoading } from '@lib/stores'
	import { LOADING_ICON } from '@lib/icons'

</script>

<style>

	.chart-bar {
		display: flex;
		align-items: center;
		height: 38px;
		grid-gap: 12px;
		gap: 12px;
		background-color: var(--layer50);
		border-radius: var(--base-radius);
		padding: 0 16px;
		user-select: none;
	}

	a {
		font-size: 90%;
		transition: all 100ms ease-in-out;
	}
	a:hover:not(.active) {
		color: var(--text100);
	}
	.active {
		color: var(--primary);
	}

	.loading {
		pointer-events: none;
	}

	.loading-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--text400);
	}
	.loading-icon :global(svg) {
		width: 18px;
	}

</style>

<div class='chart-bar' class:loading={$chartLoading}>
	<a class:active={$chartResolution == 60} on:click={async () => {await setResolution(60)}}>1m</a>
	<a class:active={$chartResolution == 300} on:click={async () => {await setResolution(300)}}>5m</a>
	<a class:active={$chartResolution == 900} on:click={async () => {await setResolution(900)}}>15m</a>
	<a class:active={$chartResolution == 3600} on:click={async () => {await setResolution(3600)}}>1h</a>
	<a class:active={$chartResolution == 14400} on:click={async () => {await setResolution(14400)}}>4h</a>
	<a class:active={$chartResolution == 86400} on:click={async () => {await setResolution(86400)}}>1D</a>
	{#if $chartLoading}<div class='loading-icon'>{@html LOADING_ICON}</div>{/if}
</div>