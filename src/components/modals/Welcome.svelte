<script>
	
	import Modal from './Modal.svelte'
	import Button from '@components/layout/Button.svelte'

	import { hideModal } from '@lib/ui'
	import { saveUserSetting } from '@lib/utils'

	let step = 0;
	const steps = ['Welcome', 'Getting Started', 'Funding', 'Trading', 'Tips'];

	function next() {
		if (step < steps.length - 1) {
			step++;
		} else {
			dismiss();
		}
	}

	function prev() {
		if (step > 0) step--;
	}

	function dismiss() {
		saveUserSetting('hasSeenWelcome', true);
		hideModal();
	}

</script>

<style>
	.content {
		padding: 24px;
		line-height: 1.6;
	}

	.step-indicator {
		display: flex;
		gap: 6px;
		margin-bottom: 20px;
	}
	.dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--layer200);
		transition: background 0.2s;
	}
	.dot.active {
		background: var(--primary);
	}

	h3 {
		font-size: 16px;
		font-weight: 600;
		margin-bottom: 12px;
		color: var(--text0);
	}

	p {
		color: var(--text200);
		font-size: 90%;
		margin-bottom: 10px;
	}

	ul {
		padding-left: 18px;
		margin-bottom: 12px;
	}
	li {
		color: var(--text200);
		font-size: 90%;
		margin-bottom: 6px;
		line-height: 1.5;
	}

	.highlight {
		color: var(--primary);
		font-weight: 500;
	}

	.link {
		color: var(--primary);
		text-decoration: none;
	}
	.link:hover {
		text-decoration: underline;
	}

	.actions {
		display: flex;
		justify-content: space-between;
		padding: 16px 24px;
		border-top: 1px solid var(--layer100);
	}

	.skip {
		background: none;
		border: none;
		color: var(--text300);
		cursor: pointer;
		font-size: 85%;
		padding: 6px 12px;
	}
	.skip:hover {
		color: var(--text200);
	}

	.nav {
		display: flex;
		gap: 8px;
	}

	.step-content {
		min-height: 180px;
	}

	.icon-row {
		display: flex;
		gap: 20px;
		margin: 16px 0;
	}
	.icon-item {
		text-align: center;
		flex: 1;
	}
	.icon-emoji {
		font-size: 28px;
		margin-bottom: 6px;
	}
	.icon-label {
		font-size: 80%;
		color: var(--text300);
	}

	.info-box {
		background: var(--layer50);
		border: 1px solid var(--layer100);
		border-radius: 6px;
		padding: 12px;
		margin: 12px 0;
		font-size: 85%;
		color: var(--text200);
	}
</style>

<Modal title={steps[step]} width={460}>

	<div class='content'>

		<div class='step-indicator'>
			{#each steps as _, i}
			<div class='dot' class:active={i <= step}></div>
			{/each}
		</div>

		<div class='step-content'>
			{#if step === 0}
				<h3>Welcome to CAP</h3>
				<p>CAP is a <span class="highlight">decentralized perpetuals exchange</span> on Arbitrum. Trade with low fees, deep liquidity, and no sign-up required.</p>
				<div class="icon-row">
					<div class="icon-item">
						<div class="icon-emoji">⚡</div>
						<div class="icon-label">Fast</div>
					</div>
					<div class="icon-item">
						<div class="icon-emoji">🔒</div>
						<div class="icon-label">Non-custodial</div>
					</div>
					<div class="icon-item">
						<div class="icon-emoji">💰</div>
						<div class="icon-label">Low fees</div>
					</div>
				</div>
				<p>Connect your wallet to get started. This quick walkthrough covers the basics.</p>

			{:else if step === 1}
				<h3>Getting Started</h3>
				<ul>
					<li><span class="highlight">Connect</span> your wallet using the button in the top right</li>
					<li>Make sure you're on the <span class="highlight">Arbitrum</span> network</li>
					<li>You'll need <span class="highlight">ETH</span> for trading and gas fees, or <span class="highlight">USDC</span> for trading stablecoin pairs</li>
				</ul>
				<div class="info-box">
					CAP supports MetaMask, WalletConnect, Coinbase Wallet, and other popular wallets.
				</div>

			{:else if step === 2}
				<h3>Funding Your Account</h3>
				<ul>
					<li>Bridge funds to <span class="highlight">Arbitrum</span> using the official bridge at <a class="link" href="https://bridge.arbitrum.io" target="_blank" rel="noopener">bridge.arbitrum.io</a></li>
					<li>Or use <a class="link" href="https://app.across.to" target="_blank" rel="noopener">Across</a> for faster bridging</li>
					<li>Once on Arbitrum, deposit into the CAP trading account from the <span class="highlight">Pools</span> page</li>
				</ul>
				<div class="info-box">
					Tip: Bridging ETH to Arbitrum usually takes a few minutes. USDC bridging may take longer depending on the bridge.
				</div>

			{:else if step === 3}
				<h3>Trading</h3>
				<ul>
					<li>Choose a <span class="highlight">market</span> from the top bar (BTC, ETH, etc.)</li>
					<li>Select <span class="highlight">Long</span> or <span class="highlight">Short</span></li>
					<li>Set your <span class="highlight">size</span> and <span class="highlight">leverage</span></li>
					<li>Set optional <span class="highlight">Take Profit</span> and <span class="highlight">Stop Loss</span> levels</li>
					<li>Click <span class="highlight">Submit Order</span> to open your position</li>
				</ul>
				<p>Monitor your positions in the dashboard below the chart.</p>

			{:else if step === 4}
				<h3>Tips for Success</h3>
				<ul>
					<li>Start with <span class="highlight">small positions</span> to learn the interface</li>
					<li>Always set a <span class="highlight">stop loss</span> to manage risk</li>
					<li>Check the <span class="highlight">Pool</span> page to see available liquidity</li>
					<li>Use the <span class="highlight">Settings</span> gear icon to customize your dashboard</li>
					<li>Your <span class="highlight">History</span> tab tracks all past trades and P/L</li>
				</ul>
				<div class="info-box">
					Need help? Join the community on <a class="link" href="https://discord.gg/cap" target="_blank" rel="noopener">Discord</a> or check the FAQ.
				</div>
			{/if}
		</div>

	</div>

	<div class='actions'>
		<button class='skip' on:click={dismiss}>Skip</button>
		<div class='nav'>
			{#if step > 0}
				<Button noSubmit={true} isSmall={true} label="Back" on:click={prev} />
			{/if}
			<Button noSubmit={true} isSmall={true} label={step < steps.length - 1 ? 'Next' : 'Get Started'} on:click={next} />
		</div>
	</div>

</Modal>