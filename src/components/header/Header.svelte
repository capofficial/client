<script>
	import Logo from './Logo.svelte'
	import Nav from './Nav.svelte'
	import Connect from './Connect.svelte'
	import { pageName } from '@lib/stores'
	import { showModal } from '@lib/ui'
</script>


<style>
	header {
		display: flex;
		flex-direction: row;
		padding: var(--base-padding);
		align-items: center;
		justify-content: space-between;
		border-bottom: 1px solid var(--layer100);
	}
	.left {
		display: flex;
		flex-direction: row;
		align-items: center;
	}
	.right { display: flex; align-items: center; gap: 8px; }
	.welcome {
		width: 44px;
		height: 44px;
		border: 1px solid var(--layer200);
		border-radius: var(--base-radius);
		background: transparent;
		color: var(--text0);
		font: inherit;
		cursor: pointer;
	}
	.welcome:focus-visible { outline: 2px solid var(--primary); outline-offset: 3px; }
</style>

<header>
	<div class='left'>
		<Logo />
		<Nav />
	</div>
	<div class='right'>
		{#if $pageName == 'Trade'}
		<button class='welcome' data-welcome-trigger aria-label='Open welcome guide' title='Welcome guide' on:click|stopPropagation={() => showModal('Welcome')}>?</button>
		{/if}
		<Connect />
	</div>
</header>
