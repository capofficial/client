<script>
	import { isLong } from '@lib/stores'
</script>

<style>
	.direction-select {
		display: flex;
		align-items: center;
		overflow: hidden;
	}
	a {
		padding: 27px 20px;
		box-sizing: border-box;
	}
	a:not(.active):hover {
		color: var(--text100);
	}
	a.active {
		font-weight: 600;
		border-top: 4px solid var(--primary);
		padding-top: 23px;
		background-color: var(--layer25);
	}
	.long.active {
		color: var(--primary);
	}
	.short.active {
		color: var(--secondary);
		border-color: var(--secondary);

	}
</style>

<div class='direction-select'>
	<a class='long' class:active={$isLong == true} on:click={() => {isLong.set(true)}}>Long</a>
	<a class='short' class:active={$isLong == false} on:click={() => {isLong.set(false)}}>Short</a>
</div>