<script>
	import { onMount, onDestroy } from 'svelte'

	import Table from '@components/layout/table/Table.svelte'
	import Row from '@components/layout/table/Row.svelte'
	import Cell from '@components/layout/table/Cell.svelte'

	import { getLeaderboard } from '@api/leaderboard' 

	import { leaderboard } from '@lib/stores'
	import { formatPnl, numberWithCommas } from '@lib/formatters'
	import { shortAddress } from '@lib/utils'

	let isLoading = true, t;

	let showPreviousLeaderboard = false;

	async function loadLeaderboard(isPrevious) {
		isLoading = true
		if (isPrevious) {
			showPreviousLeaderboard = true;
			await getLeaderboard({previous: true});
		} else {
			showPreviousLeaderboard = false;
			await getLeaderboard();
		}
		isLoading = false;
	}

	onMount(() => {
		loadLeaderboard();
	});

	onDestroy(() => {
		clearTimeout(t);
	});

	let currentDate = new Date();

	let month = currentDate.toLocaleString('default', { month: 'short' });
	let year = currentDate.getFullYear();

	const lastMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth()-1, 1);
	const lastMonth = lastMonthDate.toLocaleString('default', { month: 'short' });
	const lastMonthYear = lastMonthDate.getFullYear();

	// SET PRIZES HERE

	let currentPrizes = {
		1: '25000',
		2: '10000',
		3: '5000'
	};

	let previousPrizes = {
		1: '25000',
		2: '10000',
		3: '5000'
	};

	function getPrize(rank) {
		if (showPreviousLeaderboard) return previousPrizes[rank];
		return currentPrizes[rank];
	}

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

</style>

<div class='wrapper'>

	<div class='header'>
		<div class='left'>
			<div class='title'>
				{#if showPreviousLeaderboard}
					{lastMonth} {lastMonthYear}
				{:else}
					{month} {year}
				{/if}
			</div>
			<div class='subtitle'>Win prizes every month based on your trading P/L.</div>
		</div>
		<div class='right buttons'>
			<a class:active={showPreviousLeaderboard == false} on:click={() => {loadLeaderboard()}}>This Month</a>
			<a class:active={showPreviousLeaderboard == true} on:click={() => {loadLeaderboard(true)}}>Last Month</a>
		</div>
	</div>

	<Table
		defaultSortKey={[]}
		sortKey={['rank', false]}
		columns={[
		{key: 'Rank', gridTemplate: '70px', sortable: false},
		{key: 'User', gridTemplate: '1fr', sortable: false},
		{key: 'P/L ($)', gridTemplate: '1fr', sortable: false, rightAlign: true},
		{key: 'Prize ($)', gridTemplate: '1fr', sortable: false, rightAlign: true},
	]}
		isLoading={isLoading}
		isEmpty={$leaderboard.length == 0}
	>
		{#each $leaderboard as { user, pnlUsd }, i }
			<Row>
				<Cell>{i+1}</Cell>
				<Cell>{shortAddress(user)}</Cell>
				<Cell rightAlign={true}><span class={`cell ${pnlUsd * 1 >= 0 ? 'green' : 'red'}`}>{@html formatPnl(pnlUsd)}</span></Cell>
				<Cell rightAlign={true}>{numberWithCommas(getPrize(i+1)) || "-"}</Cell>
			</Row>
		{/each}
	</Table>

</div>