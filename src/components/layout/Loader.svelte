
<script>

	import { onMount } from 'svelte'

	import { LOADING_ICON } from '@lib/icons'

	export let call;

	let isLoading;

	onMount(async () => {
		isLoading = true;
		await call();
		isLoading = false;
		/*setTimeout(async () => {
			await call();
			isLoading = false;
		}, 5000);*/
	});

</script>

<style>

	.loader {
		min-height: 50px;
		height: 100%;
	}

	.icon {
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--text1);
		height: 100%;
	}
	.icon :global(svg) {
		fill: currentColor;
		width: 32px;
		height: 32px;
	}

</style>

<div class='loader'>

	{#if isLoading}
		<div class='icon'>{@html LOADING_ICON}</div>
	{:else}
		<slot></slot>
	{/if}

</div>