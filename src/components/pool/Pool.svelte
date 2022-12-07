<script>

	import Pools from './Pools.svelte'
	import Transactions from './Transactions.svelte'

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
	<Transactions />

</div>