<script>
	export let height = 52;
</script>

<style>
	.row {
		display: grid;
		align-items: center;
		grid-template-columns: var(--grid-template); /* Set in Table component */
		padding: 0 25px;
		border-bottom: 1px solid var(--layer0-hover);
	}
</style>

<div class='row' style={`height:${height}px`}><slot></slot></div>