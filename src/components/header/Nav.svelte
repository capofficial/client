<script>

	import { pageName } from '@lib/stores'
	import { TROPHY_ICON, BULLET_LIST_ICON } from '@lib/icons'

	let showMobileNav = false;

	function toggleMobileNav() {
		showMobileNav = !showMobileNav;
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
		grid-gap: 12px;
		gap: 12px;
	}

	a {
		color: var(--text0);
		text-decoration: none;
		padding: 8px 12px;
		border-radius: var(--base-radius);
		transition: all 100ms ease-in-out;
	}
	a:hover  {
		background-color: var(--layer1);
	}
	 a.active {
	 	font-weight: 600;
	 	color: var(--primary);
		background-color: var(--primary-highlighted);
	}

	a.leaderboard-link {
		color: gold;
		display: flex;
		align-items: center;
		background-color: #292200;
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
		display: none;
	}
	.mobile-button {
		display: none;
	}

	.mobile-button :global(svg) {
		height: 20px;
		fill: inherit;
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
			z-index: 1000;
			background-color: var(--layer0);
			padding: 20px;
		}
		.mobile-nav a {
			display: block;
			padding: 16px 8px;
			font-size: 120%;
		}
		.mobile-nav a.close {
			font-size: 90%;
			color: var(--text500);
		}
		.mobile-button {
			display: flex;
			align-items: center;
		}
	}

</style>

<div class='nav'>
	<a class:active={$pageName == 'Leaderboard'} class='leaderboard-link' href='/leaderboard'>{@html TROPHY_ICON}</a>
	<a class:active={$pageName == 'Trade'} href='/trade'>Trade</a>
	<!-- <a class:active={$pageName == 'Earn'} href='/earn'>Earn</a> -->
	<a class:active={$pageName == 'Pool'} href='/pool'>Pool</a>
	<a class:active={$pageName == 'Stake'} href='/stake'>Stake</a>
	<a href='https://docs.cap.io' target='_blank'>Docs</a>
</div>

{#if showMobileNav}
<div class='mobile-nav'>
	<a on:click={toggleMobileNav} class='close'>Close</a>
	<a on:click={toggleMobileNav} href='/'>Home</a>
	<a on:click={toggleMobileNav} href='/leaderboard'>Leaderboard</a>
	<a on:click={toggleMobileNav} href='/trade'>Trade</a>
	<a on:click={toggleMobileNav} href='/pool'>Pool</a>
	<a on:click={toggleMobileNav} href='/stake'>Stake</a>
	<a on:click={toggleMobileNav} href='https://docs.cap.io' target='_blank'>Docs</a>
</div>
{/if}

<div class='mobile-button' on:click={toggleMobileNav}>
	{@html BULLET_LIST_ICON}
</div>
