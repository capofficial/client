<script>
	import { orderType, isLong } from '@lib/stores'
</script>

<style>
	.order-type-select {
		display: flex;
		align-items: center;
		overflow: hidden;
	}
	a {
		margin-right: 20px;
		font-size: 90%;
		text-transform: uppercase;
	}
	a:not(.active):hover {
		color: var(--text100);
	}
	.isLong .active {
		color: var(--primary);
	}
	.active {
		color: var(--secondary);
		font-weight: 600;
	}

</style>

<div class='order-type-select' class:isLong={$isLong}>
	<a class:active={$orderType == 0} on:click={() => {orderType.set(0)}}>Market</a>
	<a class:active={$orderType == 1} on:click={() => {orderType.set(1)}}>Limit</a>
	<a class:active={$orderType == 2} on:click={() => {orderType.set(2)}}>Stop</a>
</div>