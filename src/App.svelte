<script>

	import { onMount, onDestroy } from 'svelte'

	import Modals from '@components/layout/Modals.svelte'
	import Errors from '@components/layout/Errors.svelte'
	import Toasts from '@components/layout/Toasts.svelte'

	import Header from '@components/header/Header.svelte'

	import { USD_CONVERSION_MARKETS } from '@lib/config'
	import { checkCountry, loadRoute, catchLinks, navigateTo } from '@lib/routing'
	import { component, address, pageName, countryDisallowed } from '@lib/stores'
	import { hidePopoversOnKeydown, hidePopoversOnClick } from '@lib/ui'
	import { runAndInterval, hashString, getChainData } from '@lib/utils'

	import { getUserAssetBalances } from '@api/assets'
	import { listenToEvents } from '@api/listener'
	import { getMarketPrices } from '@api/prices'

	let interval1;

	onMount(async () => {

		checkCountry();

		loadRoute();
		catchLinks((path) => navigateTo(path));

		// For back button functionality
		window.onpopstate = () => loadRoute();

		getMarketPrices('all');
	});

	onDestroy(() => {
		clearInterval(interval1);
	});

	// Listener
	$: listenToEvents($address);

</script>

<style>

	:global(:root) {

		/*Principles:  
			https://material.io/design/color/dark-theme.html
			https://developer.apple.com/design/human-interface-guidelines/foundations/color/
		*/

		color-scheme: dark;

		--base-padding: 20px;
		--base-radius: 6px;
		--semi-padding: calc(var(--base-padding)/2);
		--header-height: 75px;
		--sidebar-width: 320px;
		--ticker-height: 60px;

		/* Layers (gray), from darkest to lightest */
		--layer0: #1c1d1c;
		--layer25: #222322;
		--layer50: #272827;
		--layer100: #333433;
		--layer200: #494a49;
		--layer300: #606160;
		--layer400: #777777;
		--layer500: #8e8e8e;

		/* Text (white), from lightest to darkest */
		--text0: #ffffff;
		--text100: #e6e6e6;
		--text200: #cccccc;
		--text300: #b3b3b3;
		--text400: #999999;
		--text500: #808080;


		/* Brand */

		--primary: rgba(50,209,53,1.00);
		--primary-highlighted: rgba(50,209,53,0.1);
		--primary-active: rgba(50,209,53,0.75);
		--primary-hover: rgba(50,209,53,0.94);
		--primary-darkest: #121212;

		--secondary: rgba(248,76,32,1.00);
		--secondary-highlighted: rgba(248,76,32,0.1);
		--secondary-active: rgba(248,76,32,0.72);
		--secondary-hover: rgba(248,76,32,0.91);
		--secondary-darkest: #121212;

		--error: orange;
		--error-lighter: #FFC099;
		--error-light: #FF9E61;
		--error-dark: #291000;
		--error-border: #FF680A;

		--accent: blue; /*neutral, can be used for info, etc.*/

		--onboard-link-color: var(--primary);
		--action-color: var(--primary);
		--account-center-app-btn-background: var(--primary);
		--account-center-maximized-upper-action-color: var(--primary);
		--account-center-position-top: -6px;
		--account-center-position-right: -0.5rem;
		--account-center-z-index: 1000;
		--account-center-border: transparent;
		--account-center-border-radius: 6px;
		--account-center-minimized-background: transparent;
		--account-center-minimized-chain-select-background: rgb(199,199,204);

		--onboard-account-select-modal-z-index: 1000;
		--onboard-login-modal-z-index: 1000;
		--onboard-modal-z-index: 1000;
		--account-select-modal-margin-4: 1rem;
		--account-select-modal-margin-5: 0.5rem;

		--account-select-modal-font-family-normal: 'Inter', sans-serif;
		--account-select-modal-font-family-light: 'Inter', sans-serif;

		/* Old below */


		--layer0dot5: #2b2d2f;
		--layer0-hover: rgb(36,38,40);
		--layer1: #36383a;
		--layer1-hover: rgb(52,52,58);

		--layer1dot5: rgb(48,48,50);
		--layer2: #4d4e50;
		--layer3: #636466;
		--layer4: #797a7c;
		--layer4dot5: rgb(115,115,119);
		--layer5: rgb(142,142,147);
		--layer6: rgb(174,174,178);
		--layer7: rgb(199,199,204);
		--layer8: rgb(209,209,214);
		--layer9: rgb(229,229,234);

		/* Texts from lightest to darkest */

		--text0-hover: rgba(255,255,255,0.85);
		--text1: rgb(182,182,187);
		--text1-hover: rgba(182,182,187,0.85);
		--text1-alt: rgb(122,122,137);

		--text05: rgba(255,255,255,0.85);
		--text005: rgba(255,255,255,0.65);
		
		--text2: rgb(90,90,94);
		--text3: rgb(64,64,68);

		

	}

	@media all and (max-width: 600px) {
		:global(:root) {
			--account-center-position-right: 0;
		}
	}

	:global(html) {
		color: var(--text0);
		background-color: var(--layer0);
	}

	:global(.green) {
		color: var(--primary);
	}
	:global(.red) {
		color: var(--secondary);
	}
	:global(.orange) {
		color: rgb(253,167,20);
	}

	:global(.container) {
		padding: var(--base-padding);
	}
	:global(.group) {
		padding-bottom: var(--base-padding);
	}
	:global(.semi-padding-bottom) {
		padding-bottom: var(--semi-padding);
	}

	/*Tippy Tooltip*/
	:global(.tippy-box[data-theme~='cap']) {
		background-color: var(--layer200);
		color: var(--text0);
		font-weight: 400;
		font-size: 14px;
	}
	:global(.tippy-box[data-theme~='cap'][data-placement^='top'] > .tippy-arrow::before) {
	  border-top-color: var(--layer200);
	}
	:global(.tippy-box[data-theme~='cap'][data-placement^='bottom'] > .tippy-arrow::before) {
	  border-bottom-color: var(--layer200);
	}
	:global(.tippy-box[data-theme~='cap'][data-placement^='left'] > .tippy-arrow::before) {
	  border-left-color: var(--layer200);
	}
	:global(.tippy-box[data-theme~='cap'][data-placement^='right'] > .tippy-arrow::before) {
	  border-right-color: var(--layer200);
	}

	.code-check {
		padding: 25px;
	}
	.note {
		padding: 25px;
		max-width: 440px;
		line-height: 1.318;
	}
	input {
		width: 120px;
		box-sizing: border-box;
		margin-bottom: 10px;
		font-size: inherit;
		padding: 4px 10px;
	}
	button {
		padding: 4px 10px;
		width: 120px;
	}

	.overlay {
		position: fixed;
		top: 0;
		bottom:0;
		right:0;
		left:0;
		z-index:10000;
		background-color: #fff;
		padding: 20px;
		font-size: 22px;
		color: #111;
	}

</style>

<svelte:window on:keydown={hidePopoversOnKeydown} on:click={hidePopoversOnClick} />

{#if $countryDisallowed}
<div class='overlay'>You're trying to access this CAP UI from a restricted country. Check our <a href='https://docs.cap.io'>Help Center</a> for more information.</div>
{/if}

{#if $pageName != 'Home'}
<Errors />
<Modals />
<Toasts />
<Header />
{/if}

<svelte:component this={$component}/>