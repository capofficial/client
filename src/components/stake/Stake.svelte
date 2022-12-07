<script>

	import StakeCAP from './StakeCAP.svelte'
	import Rewards from './Rewards.svelte'
	import Payments from './Payments.svelte'

</script>

<style>
	.wrapper {
		padding: 20px var(--base-padding);
		max-width: 1280px;
		margin: 0 auto;
	}
</style>

<div class='wrapper'>

	<StakeCAP />
	<Rewards />
	<Payments />

</div>