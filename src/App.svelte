<script>

	import { onMount, onDestroy } from 'svelte'

	import Modals from '@components/layout/Modals.svelte'
	import Errors from '@components/layout/Errors.svelte'
	import Toasts from '@components/layout/Toasts.svelte'

	import Header from '@components/header/Header.svelte'

	import { USD_CONVERSION_MARKETS } from '@lib/config'
	import { loadRoute, catchLinks, navigateTo } from '@lib/routing'
	import { component, address } from '@lib/stores'
	import { hidePopoversOnKeydown, hidePopoversOnClick } from '@lib/ui'
	import { runAndInterval, hashString, getChainData } from '@lib/utils'

	import { getUserAssetBalances } from '@api/assets'
	import { listenToEvents } from '@api/listener'
	import { getMarketPrices } from '@api/prices'

	let interval1;

	let checkingCode = true;
	let codeValid = false;
	let error = false;
	let code = localStorage.getItem('betaCode');

	async function checkCode() {

		// CHECK BETA PRIVATE CODE

		checkingCode = true;

		localStorage.setItem('betaKey', hashString(navigator.userAgent));

		if (code) {
			const dataEndpoint = getChainData('dataEndpoint');
			try {
				const response = await fetch(`${dataEndpoint}/check-code?code=${code}&key=${localStorage.getItem('betaKey')}`);
				const json = await response.json();

				if (json && json.success) {
					codeValid = true;
					localStorage.setItem('betaCode', code);
				} else {
					error = true;
				}
			} catch(e) {
				console.error('Code check', e);
			}
		}

		checkingCode = false;

		if (!codeValid) return;

		continueWithMount();
		
	}

	function continueWithMount() {

		// Set ref code if there isn't one
		let params = new URLSearchParams(location.search);
		let entries = params.entries();
		const obj = Object.fromEntries(entries);
		if (obj && obj.r) {
			const refCode = localStorage.getItem('refCode');
			if (!refCode) {
				localStorage.setItem('refCode', obj.r);
			}
			window.history.replaceState({}, document.title, location.pathname);
		}
		
		loadRoute();
		catchLinks((path) => navigateTo(path));

		// For back button functionality
		window.onpopstate = () => loadRoute();

		// Always available price data for currency conversion
		interval1 = runAndInterval(() => {
			getMarketPrices(Object.values(USD_CONVERSION_MARKETS));
		}, 2 * 60 * 1000);
	}

	onMount(async () => {

		await checkCode();

	});

	// User asset balances
	let t1;
	// async function fetchData() {
	// 	clearTimeout(t1);
	// 	await getUserAssetBalances();
	// 	t1 = setTimeout(fetchData, 10 * 1000);
	// }
	// $: fetchData($address);

	onDestroy(() => {
		clearInterval(interval1);
		clearTimeout(t1);
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

</style>

<svelte:window on:keydown={hidePopoversOnKeydown} on:click={hidePopoversOnClick} />

{#if codeValid}

<Errors />
<Modals />
<Toasts />
<Header />

<svelte:component this={$component}/>

{:else}

	{#if checkingCode}
	<div class='note'>Checking access...</div>
	{:else if error}
	<div class='note'>Submitted code is invalid.</div>
	{/if}
	
	{#if !checkingCode}
	<form class='code-check' on:submit|preventDefault={checkCode}>
		<div><input placeholder="Beta code" bind:value={code}></div>
		<div><button type='submit'>Submit</button></div>
	</form>

	<div class='note'>Enter the code you received in the Discord to access the CAP private beta.</div>

	<div class='note'><strong>Important note, please read:</strong> only use funds you can afford to lose. The CAP private beta is meant for testing purposes only. There can be bugs and exploits that result in the complete loss of funds. No refunds will be made in case of lost funds. Thanks for helping CAP test its new product.</div>


	{/if}
{/if}