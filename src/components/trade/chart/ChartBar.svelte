<script>

	import { setResolution, toggleChartIndicator } from '@lib/chart'
	import { chartResolution, chartLoading, chartIndicators } from '@lib/stores'
	import { LOADING_ICON } from '@lib/icons'

	let showIndicators = false;

	const indicatorOptions = [
		{key: 'sma20', label: 'SMA 20'},
		{key: 'ema20', label: 'EMA 20'},
		{key: 'rsi14', label: 'RSI 14'},
		{key: 'macd', label: 'MACD'}
	];

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
		font-size: 95%;
		transition: all 100ms ease-in-out;
	}
	a:hover:not(.active) {
		color: var(--text100);
	}
	.active {
		color: var(--primary);
	}

	.chart-bar.loading > a {
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
	.indicators {
		position: relative;
	}
	.indicator-button {
		color: var(--text200);
	}
	.indicator-button.active {
		color: var(--primary);
	}
	.indicator-menu {
		position: absolute;
		top: 28px;
		right: 0;
		z-index: 210;
		display: grid;
		gap: 8px;
		min-width: 132px;
		padding: 10px;
		background-color: var(--layer50);
		border: 1px solid var(--layer200);
		border-radius: var(--base-radius);
		box-shadow: 0 8px 24px rgba(0,0,0,0.28);
	}
	.indicator-option {
		display: flex;
		align-items: center;
		gap: 8px;
		color: var(--text200);
		font-size: 90%;
		white-space: nowrap;
		cursor: pointer;
	}
	.indicator-option input {
		margin: 0;
	}

</style>

<div class='chart-bar' class:loading={$chartLoading}>
	<a class:active={$chartResolution == 60} on:click={async () => {await setResolution(60)}}>1m</a>
	<a class:active={$chartResolution == 300} on:click={async () => {await setResolution(300)}}>5m</a>
	<a class:active={$chartResolution == 900} on:click={async () => {await setResolution(900)}}>15m</a>
	<a class:active={$chartResolution == 3600} on:click={async () => {await setResolution(3600)}}>1h</a>
	<a class:active={$chartResolution == 14400} on:click={async () => {await setResolution(14400)}}>4h</a>
	<a class:active={$chartResolution == 86400} on:click={async () => {await setResolution(86400)}}>1D</a>
	<div class='indicators'>
		<a
			class='indicator-button'
			class:active={Object.values($chartIndicators || {}).some(Boolean)}
			on:click={() => {showIndicators = !showIndicators}}
		>
			Indicators
		</a>
		{#if showIndicators}
			<div class='indicator-menu'>
				{#each indicatorOptions as option}
					<label class='indicator-option'>
						<input
							type='checkbox'
							checked={($chartIndicators || {})[option.key]}
							on:change={() => toggleChartIndicator(option.key)}
						/>
						<span>{option.label}</span>
					</label>
				{/each}
			</div>
		{/if}
	</div>
	{#if $chartLoading}<div class='loading-icon'>{@html LOADING_ICON}</div>{/if}
</div>
