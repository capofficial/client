<script>

	export let title = '';
	export let subtitle = '';

</script>

<style>
	.section {
		background-color: var(--layer50);
		border-radius: var(--base-radius);
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}
	.header {
		padding: var(--base-padding);
		border-bottom: 1px solid var(--layer100);
	}
	.title {
		font-weight: 600;
		font-size: 18px;
	}
	.subtitle {
		padding-top: var(--semi-padding);
		color: var(--text200);
		line-height: 1.418;
		font-size: 90%;
	}
	.body {
		flex: 1 1 auto;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}
</style>

<div class='section'>
	<div class='header'>
		<div class='title'>{title}</div>
		{#if subtitle}
			<div class='subtitle'>{subtitle}</div>
		{/if}
	</div>
	<div class='body'><slot></slot></div>
</div>