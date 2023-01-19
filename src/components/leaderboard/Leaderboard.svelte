<script>
	import { onMount, onDestroy } from 'svelte'

	import { getLeaderboard } from '@api/leaderboard' 

	import { leaderboard } from '@lib/stores'

	let isLoading = true, t;

	let showPreviousLeaderboard = false;

	async function loadLeaderboard(isPrevious) {
		if (isPrevious) {
			showPreviousLeaderboard = true;
			await getLeaderboard({previous: true});
		} else {
			showPreviousLeaderboard = false;
			await getLeaderboard();
		}
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

	let currentPrizes = {
		1: '25000'
	};

	let previousPrizes = {
		1: '25000'
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
	
	.table {
		--grid-template: 70px 1fr 1fr 1fr;
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

	.buttons a {
		color: var(--primary);
	}

	.buttons a.active {
		color: var(--text0);
		font-weight: 600;
		pointer-events: none;
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
			<div class='subtitle'>Rank and win prizes monthly based on your trading P/L.</div>
		</div>
		<div class='right buttons'>
			<a class:active={showPreviousLeaderboard == false} on:click={() => {loadLeaderboard()}}>Current Month</a> | 
			<a class:active={showPreviousLeaderboard == true} on:click={() => {loadLeaderboard(true)}}>Last Month</a>
		</div>
	</div>

	<div class='table'>
		<div class='table-header'>
			<div class='cell la'>Rank</div>
			<div class='cell la'>User</div>
			<div class='cell'>P/L</div>
			<div class='cell highlighted'>Prize</div>
		</div>
		<div class='table-body'>
			{#each $leaderboard as { user, pnlUsd }, i }
			<div class='row'>
				<div class='cell la'>{i+1}</div>
				<div class='cell la'>{user}</div>
				<div class='cell'>{pnlUsd}</div>
				<div class='cell'>{getPrize(i+1)}</div>
			</div>
			{/each}
		</div>
	</div>

</div>