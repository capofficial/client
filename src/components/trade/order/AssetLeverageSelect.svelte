<script>
	import { selectedAsset, leverage } from '@lib/stores'
	import { showModal } from '@lib/ui'
	import tooltip from '@lib/tooltip'
</script>

<style>
	.select {
		display: flex;
		align-items: center;
		overflow: hidden;
		border-radius: var(--base-radius);
		gap: 1px;
		grid-gap: 1px;
		font-size: 90%;
	}
	a {
		padding: 6px 12px;
		background-color: var(--layer100);
	}
	a:hover {
		background-color: var(--layer200);
	}
</style>

<div class='select'>
	<a use:tooltip={{content: 'Collateral'}} on:click|stopPropagation={() => {showModal('AssetSelect')}}>{$selectedAsset}</a>
	<a use:tooltip={{content: 'Leverage'}} on:click|stopPropagation={() => {showModal('LeverageSelect')}}>{$leverage}×</a>
</div>