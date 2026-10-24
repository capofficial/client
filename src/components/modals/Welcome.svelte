<script>
	import { onMount, createEventDispatcher } from 'svelte'

	const dispatch = createEventDispatcher();
	let dialog;

	function dismiss() {
		dispatch('dismiss');
	}

	function clickBackdrop(event) {
		if (event.target != dialog) return;
		const rect = dialog.getBoundingClientRect();
		if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dismiss();
	}

	onMount(() => {
		const previousFocus = document.activeElement;
		// Native dialog tabbing may reach browser chrome/body. Handle Escape before
		// the app's global modal shortcut so every dismissal is remembered.
		const onKeydown = (event) => {
			if (event.key != 'Escape' || !dialog.open) return;
			event.preventDefault();
			event.stopPropagation();
			dismiss();
		};
		window.addEventListener('keydown', onKeydown, true);
		dialog.showModal();
		return () => {
			window.removeEventListener('keydown', onKeydown, true);
			dialog.close();
			const target = previousFocus?.isConnected && previousFocus != document.body
				? previousFocus : document.querySelector('[data-welcome-trigger]');
			target?.focus();
		};
	});
</script>

<dialog bind:this={dialog} aria-labelledby='welcome-title' aria-describedby='welcome-summary'
	on:cancel|preventDefault={dismiss} on:keydown|stopPropagation on:click|stopPropagation={clickBackdrop}>
	<header>
		<h2 id='welcome-title'>Welcome to CAP</h2>
		<button class='close' aria-label='Close welcome guide' on:click={dismiss}>×</button>
	</header>
	<div class='content'>
		<p id='welcome-summary'>CAP is an on-chain perpetuals exchange. Explore markets and charts without connecting; connect a compatible wallet when you are ready to manage collateral and orders.</p>

		<section aria-labelledby='welcome-dashboard'>
			<h3 id='welcome-dashboard'>Find your way around</h3>
			<ol>
				<li>Select a market to view its price and chart.</li>
				<li>Use the order panel to choose your direction and order settings. Review margin, leverage, fees and liquidation price before confirming.</li>
				<li>Manage positions, orders and history in the account panel. On a phone, use the Chart, New Order and Account tabs.</li>
			</ol>
		</section>

		<section aria-labelledby='welcome-bridge'>
			<h3 id='welcome-bridge'>Bridge funds from Arbitrum</h3>
			<ol>
				<li>Open the <a href='https://bridge.arbitrum.io' target='_blank' rel='noopener noreferrer'>official Arbitrum bridge</a> and select Arbitrum One as the source.</li>
				<li>Choose a supported destination, token and amount. Check the destination and network fees before confirming in your wallet.</li>
				<li>For a withdrawal to Ethereum, allow at least seven days, then return to the bridge's transaction history to claim the funds when ready.</li>
			</ol>
			<p>Follow the bridge's <a href='https://docs.arbitrum.io/arbitrum-bridge/quickstart' target='_blank' rel='noopener noreferrer'>current instructions and status</a>.</p>
		</section>

		<section aria-labelledby='welcome-funding'>
			<h3 id='welcome-funding'>Funding the dashboard</h3>
			<p>This client defaults to Arbitrum. Check your selected wallet network and supported collateral first. To move funds from Ethereum to Arbitrum, select Ethereum as the source and Arbitrum One as the destination. Funds already on your selected network do not need that transfer.</p>
			<p>Native USDC and bridged USDC are different assets; confirm which token the dashboard accepts before bridging.</p>
		</section>
	</div>
	<footer>
		<p>You can reopen this guide with the ? button in the trading dashboard header.</p>
		<button class='done' on:click={dismiss}>Explore the dashboard</button>
	</footer>
</dialog>

<style>
	dialog {
		box-sizing: border-box;
		width: min(640px, calc(100vw - 24px));
		max-height: calc(100vh - 24px);
		max-height: calc(100dvh - 24px);
		padding: 0;
		border: 1px solid var(--layer200);
		border-radius: var(--base-radius);
		background: var(--layer25);
		color: var(--text0);
		font: inherit;
	}
	dialog::backdrop { background: rgba(0, 0, 0, 0.7); }
	header, footer { padding: 16px 20px; }
	header { display: flex; align-items: center; gap: 12px; border-bottom: 1px solid var(--layer100); }
	h2 { font-size: 22px; margin: 0; flex: 1; }
	h3 { font-size: 17px; margin: 0 0 8px; }
	.content { padding: 0 20px; line-height: 1.5; }
	section { margin-top: 24px; }
	p { margin: 14px 0; }
	ol { padding-left: 24px; margin: 0; }
	li + li { margin-top: 8px; }
	a { color: var(--primary); text-decoration: underline; text-underline-offset: 3px; }
	button { font: inherit; cursor: pointer; min-height: 44px; border-radius: var(--base-radius); }
	.close { width: 44px; flex-shrink: 0; background: transparent; color: var(--text0); border: 1px solid var(--layer200); font-size: 28px; }
	.done { padding: 10px 16px; background: var(--primary); color: var(--primary-darkest); border: 0; font-weight: 600; }
	footer { border-top: 1px solid var(--layer100); margin-top: 20px; }
	footer p { font-size: 14px; color: var(--text200); margin-top: 0; }
	button:focus-visible, a:focus-visible { outline: 2px solid var(--primary); outline-offset: 3px; }
	@media (max-width: 480px) {
		header, footer { padding: 12px 16px; }
		.content { padding: 0 16px; }
		h2 { font-size: 20px; }
		.done { width: 100%; }
	}
</style>
