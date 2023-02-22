<script>
	import { onMount, onDestroy } from 'svelte'

	import Table from '@components/layout/table/Table.svelte'
	import Row from '@components/layout/table/Row.svelte'
	import Cell from '@components/layout/table/Cell.svelte'

	import { getStats } from '@api/earn' 

	import { stats, address } from '@lib/stores'
	import { formatPnl, formatForDisplay, numberWithCommas } from '@lib/formatters'
	import { shortAddress } from '@lib/utils'

	let isLoading = true;
	let retried = false;
	let t;

	async function loadStats() {
		if (!$address && !retried) {
			// retry in a bit
			t = setTimeout(loadStats, 1000);
			retried = true;
			return;
		}
		clearTimeout(t);
		isLoading = true
		await getStats();
		isLoading = false;
	}

	$: loadStats($address);

	let currentDate = new Date();

	let month = currentDate.toLocaleString('default', { month: 'short' });
	let year = currentDate.getFullYear();

	// SET PRIZES HERE

	let totalPrize = 100000; // USD

</script>

<style>
	.wrapper {
		padding: 20px var(--base-padding);
		max-width: 1280px;
		margin: 0 auto;
	}

	.header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 16px;
	}

	.title {
		font-weight: 600;
		font-size: 24px;
		padding-bottom: 12px;
	}
	.subtitle {
		color: var(--text300);
	}

	.buttons a:first-child {
		margin-right: 8px;
	}

	.buttons a {
		color: var(--primary);
	}

	.buttons a.active {
		color: var(--text0);
		font-weight: 600;
		pointer-events: none;
	}

	.grayed {
		opacity: 0.5;
		font-size: 80%;
		display: block;
	}

	.table {
		border: 1px solid var(--layer100);
		border-radius: 6px;
	}

	.table-header {
		display: grid;
		align-items: center;
		height: 38px;
		border-bottom: 1px solid var(--layer100);
		grid-template-columns: var(--grid-template);
		color: var(--text300);
		font-size: 85%;
	}

	.row {
		display: grid;
		align-items: center;
		grid-template-columns: var(--grid-template);
		border-bottom: 1px solid var(--layer0-hover);
		height: 50px;
	}

	.cell {
		display: flex;
		align-items: center;
		text-transform: capitalize;
		height: 100%;
		padding: 0 25px;
		justify-content: flex-end;
		text-align: right;
	}
	.cell.la {
		justify-content: flex-start;
		text-align: left;
	}
	.cell.highlighted {
		background-color: var(--layer50);
	}

	.cell img {
		margin-right: 8px;
		width: 18px;
	}

	.grayed {
		opacity: 0.5;
		font-size: 80%;
		display: block;
	}

	@media all and (max-width: 600px) {
		.table, .header {
			min-width: 960px;
		}
	}

	.table {
		--grid-template: repeat(5, 1fr);
	}

</style>

<div class='wrapper'>

	<div class='header'>
		<div class='left'>
			<div class='title'>
				Stats ({month} {year})
			</div>
			<div class='subtitle'>Win cash prizes every month proportional to your trading volume. Updated every 5min.</div>
		</div>
		<div class='right buttons'>
		</div>
	</div>

	<div class='table'>
		<div class='table-header'>
			<div class='cell la'></div>
			<div class='cell'>Volume</div>
			<div class='cell'>P/L</div>
			<div class='cell'>% of Total</div>
			<div class='cell highlighted'>Prize</div>
		</div>
		<div class='table-body'>
			<div class='row'>
				<div class='cell la'>You</div>
				<div class='cell'>{numberWithCommas($stats[$address]?.volume) || 0}</div>
				<div class='cell'>{numberWithCommas($stats[$address]?.pnl) || 0}</div>
				<div class='cell'>{formatForDisplay($stats[$address]?.volume/$stats['total']?.volume * 100) + '%'}</div>
				<div class='cell'>${numberWithCommas(totalPrize * $stats[$address]?.volume/$stats['total']?.volume)}</div>
			</div>
			<div class='row'>
				<div class='cell la'>Total</div>
				<div class='cell'>{numberWithCommas($stats[$address]?.volume) || 0}</div>
				<div class='cell'>-</div>
				<div class='cell'>100%</div>
				<div class='cell'>${numberWithCommas(totalPrize)}</div>
			</div>
		</div>
	</div>

</div>