<script>
	import { onMount, onDestroy } from 'svelte'

	import Table from '@components/layout/table/Table.svelte'
	import Row from '@components/layout/table/Row.svelte'
	import Cell from '@components/layout/table/Cell.svelte'

	import { getLeaderboard } from '@api/leaderboard' 

	import { leaderboard, loserboard } from '@lib/stores'
	import { formatPnl, numberWithCommas } from '@lib/formatters'
	import { shortAddress } from '@lib/utils'

	let isLoading = true, t;

	let showPreviousLeaderboard = false;

	async function loadLeaderboard(isPrevious) {
		isLoading = true
		if (isPrevious) {
			showPreviousLeaderboard = true;
			await getLeaderboard({previous: true});
			await getLeaderboard({losers: true, previous: true});
		} else {
			showPreviousLeaderboard = false;
			await getLeaderboard();
			await getLeaderboard({losers: true});
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
		// 1: '25000',
		// 2: '10000',
		// 3: '5000'
	};

	let previousPrizes = {
		// 1: '25000',
		// 2: '10000',
		// 3: '5000'
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

	a {
		color: var(--text0);
		text-decoration: none;
	}

	.subtitle a {
		color: var(--primary);
	}

	h3 {
		padding-top: 20px;
	}

	.tables {
		display: flex;
		gap: 20px;
	}
	.table {
		flex: 1;
	}
	@media all and (max-width: 600px) {
		.tables {
			display: block;
		}
	}
</style>

<div class='wrapper'>

	<div class='header'>
		<div class='left'>
			<div class='title'>
				Leaderboard – {#if showPreviousLeaderboard}
					{lastMonth} {lastMonthYear}
				{:else}
					{month} {year}
				{/if}
			</div>
			<div class='subtitle'>Compete for a chance to win a Milady! <a href='https://twitter.com/CapDotFinance/status/1673326985945182208' target='_blank'>Learn more</a></div>
		</div>
		<div class='right buttons'>
			<a class:active={showPreviousLeaderboard == false} on:click={() => {loadLeaderboard()}}>This Month</a>
			<a class:active={showPreviousLeaderboard == true} on:click={() => {loadLeaderboard(true)}}>Last Month</a>
		</div>
	</div>

	<div class='tables'>

		<div class='table'>

			<h3>Top Winners</h3>

			<Table
				defaultSortKey={[]}
				sortKey={['rank', false]}
				columns={[
				{key: 'Rank', gridTemplate: '70px', sortable: false},
				{key: 'User', gridTemplate: '1fr', sortable: false},
				{key: 'Profit ($)', gridTemplate: '1fr', sortable: false, rightAlign: true},
			]}
				isLoading={isLoading}
				isEmpty={$leaderboard.length == 0}
			>
				{#each $leaderboard as { user, pnlUsd }, i }
					<Row>
						<Cell>{i+1}</Cell>
						<Cell><a href={`https://arbiscan.io/address/${user}`} target="_blank">{shortAddress(user)}</a></Cell>
						<Cell rightAlign={true}><span class={`cell ${pnlUsd * 1 >= 0 ? 'green' : 'red'}`}>{@html formatPnl(pnlUsd)}</span></Cell>
					</Row>
				{/each}
			</Table>

		</div>

		<div class='table'>

			<h3>Top Losers</h3>

			<Table
				defaultSortKey={[]}
				sortKey={['rank', false]}
				columns={[
				{key: 'Rank', gridTemplate: '70px', sortable: false},
				{key: 'User', gridTemplate: '1fr', sortable: false},
				{key: 'Loss ($)', gridTemplate: '1fr', sortable: false, rightAlign: true},
			]}
				isLoading={isLoading}
				isEmpty={$loserboard.length == 0}
			>
				{#each $loserboard as { user, pnlUsd }, i }
					<Row>
						<Cell>{i+1}</Cell>
						<Cell><a href={`https://arbiscan.io/address/${user}`} target="_blank">{shortAddress(user)}</a></Cell>
						<Cell rightAlign={true}><span class={`cell ${pnlUsd * 1 >= 0 ? 'green' : 'red'}`}>{@html formatPnl(pnlUsd)}</span></Cell>
					</Row>
				{/each}
			</Table>

		</div>

	</div>

</div>