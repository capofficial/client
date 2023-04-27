<script>

	import tooltip from '@lib/tooltip'

	import Rewards from './Rewards.svelte'

	import { pageName, showMobileNav } from '@lib/stores'
	import { TROPHY_ICON, BULLET_LIST_ICON } from '@lib/icons'

	function toggleMobileNav() {
		showMobileNav.set(!$showMobileNav);
	}
</script>


<style>

	img {
		height: 22px;
		margin-right: 12px;
	}

	.nav {
		display: flex;
		align-items: center;
		grid-gap: 8px;
		gap: 8px;
	}

	a {
		color: var(--text0);
		text-decoration: none;
		padding: 8px 12px;
		border-radius: var(--base-radius);
		transition: all 100ms ease-in-out;
		font-weight: 500;
	}
	a:hover  {
		background-color: var(--layer1);
	}
	 a.active {
	 	color: var(--primary);
		background-color: var(--primary-highlighted);
	}

	a.leaderboard-link {
		color: gold;
		display: flex;
		align-items: center;
	}
	a.leaderboard-link.active {
		color: var(--primary);
		background-color: var(--primary-highlighted);
	}
	a.leaderboard-link :global(svg) {
		fill: currentColor;
		height: 18px;
	}

	.mobile-nav {
		display: block;
		position: absolute;
		top: 70px;
		left: 200px;
		width: 160px;
		z-index: 1000;
		background-color: var(--layer0);
		padding: 20px;
		border: 1px solid var(--layer100);
		border-radius: var(--base-radius);
	}
	.mobile-button {
		display: none;
	}

	.mobile-button :global(svg) {
		height: 20px;
		fill: inherit;
	}

	.mobile-nav a {
		display: none;
		padding: 10px 8px;
	}
	.mobile-nav a.display-desktop {
		display: block;
	}
	.mobile-nav a.close {
		display: none;
		font-size: 90%;
		color: var(--text500);
	}

	@media all and (max-width: 600px) {
		.nav {
			display: none;
		}
		.mobile-nav {
			display: block;
			position: absolute;
			top: 0;
			right: 0;
			left: 0;
			bottom: 0;
			width: 100%;
		}
		.mobile-nav a {
			display: block;
			font-size: 120%;
			padding: 16px 8px;
		}
		.mobile-button {
			display: flex;
			align-items: center;
		}
	}

</style>

<div class='nav'>
	<a class:active={$pageName == 'Trade'} href='/trade'>Trade</a>
	<a class:active={$pageName == 'Pool'} href='/pool'>Pool</a>
	<a class:active={$pageName == 'Stake'} href='/stake'>Stake</a>
	<a on:click|stopPropagation={toggleMobileNav} class:active={$showMobileNav}>…</a>
</div>

{#if $showMobileNav}
<div class='mobile-nav'>
	<a on:click={toggleMobileNav} class='close'>Close</a>
	<a on:click={toggleMobileNav} href='/'>Home</a>
	<a on:click={toggleMobileNav} href='/leaderboard' class='display-desktop'>Leaderboard</a>
	<a on:click={toggleMobileNav} href='/trade'>Trade</a>
	<a on:click={toggleMobileNav} href='/pool'>Pool</a>
	<a on:click={toggleMobileNav} href='/stake'>Stake</a>
	<a on:click={toggleMobileNav} href='https://docs.cap.io' target='_blank' class='display-desktop'>Docs</a>
</div>
{/if}

<div class='mobile-button' on:click|stopPropagation={toggleMobileNav}>
	{@html BULLET_LIST_ICON}
</div>

<Rewards/>