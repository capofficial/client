<script>
	import { onDestroy } from 'svelte'

	import { getLeaderboard } from '@api/leaderboard' 

	import { leaderboard } from '@lib/stores'

	let isLoading = true, t;

	async function fetchData() {
		clearTimeout(t);
		await getLeaderboard();
		isLoading = false;
		// t = setTimeout(fetchData, 10 * 60 * 1000);
	}

	fetchData();

	onDestroy(() => {
		clearTimeout(t);
	});

	let currentDate = new Date();
	let month = currentDate.toLocaleString('default', { month: 'short' });
	let year = currentDate.getFullYear();

</script>

<style>
	.wrapper {
		padding: 20px var(--base-padding);
		max-width: 1280px;
		margin: 0 auto;
	}
	.container {
	  display: flex;
	  flex-wrap: wrap;
	  width: 100%;
	}
	.row {
	  display: flex;
	  width: 100%;
	}
	.user-column {
	  flex: 1;
	}
	.pnl-column {
	  flex: 1;
	}
</style>

<div class='wrapper'>

	<h3>{month} {year}</h3>

	<div class="container">
	  {#each $leaderboard as { user, pnlUsd } }
	    <div class="row">
	      <div class="user-column">{user}</div>
	      <div class="pnl-column">{pnlUsd}</div>
	    </div>
	  {/each}
	</div>

</div>