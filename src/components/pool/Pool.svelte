<script>

	import Pools from './Pools.svelte'
	import PoolTransactions from './PoolTransactions.svelte'

</script>

<style>
	.wrapper {
		padding: 20px var(--base-padding);
		max-width: 1280px;
		margin: 0 auto;
	}
</style>

<div class='wrapper'>

	<Pools />
	<PoolTransactions />

</div>