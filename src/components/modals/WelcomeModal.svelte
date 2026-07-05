<script>
	import { activeModal, address } from '@lib/stores'
	import { onMount } from 'svelte'
	import { setUserSetting, getUserSetting } from '@lib/utils'
	import { connectWallet } from '@api/wallet'

	let currentStep = 0
	let showBridge = false
	let bridgeAmount = ''
	let bridgeLoading = false

	const steps = [
		{
			title: 'Welcome to CAP',
			subtitle: 'Decentralized Perpetuals Trading'
		},
		{
			title: 'How It Works',
			subtitle: 'Trade with up to 100x leverage'
		},
		{
			title: 'Get Started',
			subtitle: 'Connect your wallet and bridge funds'
		}
	]

	function close() {
		setUserSetting('welcomeShown', true)
		activeModal.set(null)
	}

	function nextStep() {
		if (currentStep < steps.length - 1) {
			currentStep++
		}
	}

	function prevStep() {
		if (currentStep > 0) {
			currentStep--
		}
	}

	function toggleBridge() {
		showBridge = !showBridge
	}

	async function handleConnect() {
		await connectWallet()
	}

	// Arbitrum bridge URLs
	const BRIDGE_URLS = {
		official: 'https://bridge.arbitrum.io/',
		synapse: 'https://synapseprotocol.com/?inputCurrency=USDC&outputCurrency=USDC&outputChain=42161',
		stargate: 'https://stargate.finance/transfer',
		hop: 'https://app.hop.exchange/send?token=USDC&destNetwork=arbitrum'
	}

	function openBridge(bridge) {
		window.open(BRIDGE_URLS[bridge], '_blank')
	}
</script>

<style>
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.85);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 10000;
		backdrop-filter: blur(4px);
	}

	.modal-container {
		background: var(--layer25);
		border-radius: 16px;
		max-width: 520px;
		width: 90%;
		max-height: 90vh;
		overflow-y: auto;
		box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
		border: 1px solid var(--layer100);
	}

	.modal-header {
		padding: 24px 24px 0;
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
	}

	.logo-area {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.logo {
		width: 48px;
		height: 48px;
		background: var(--primary);
		border-radius: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 700;
		font-size: 20px;
		color: #000;
	}

	.close-btn {
		background: transparent;
		border: none;
		color: var(--text400);
		cursor: pointer;
		font-size: 24px;
		padding: 4px;
		line-height: 1;
		transition: color 0.2s;
	}

	.close-btn:hover {
		color: var(--text0);
	}

	.modal-content {
		padding: 24px;
	}

	.step-title {
		font-size: 28px;
		font-weight: 700;
		color: var(--text0);
		margin-bottom: 8px;
	}

	.step-subtitle {
		font-size: 16px;
		color: var(--text300);
		margin-bottom: 24px;
	}

	/* Step 0: Welcome */
	.welcome-features {
		display: grid;
		gap: 16px;
	}

	.feature {
		background: var(--layer50);
		border-radius: 12px;
		padding: 16px;
		display: flex;
		gap: 12px;
		align-items: flex-start;
	}

	.feature-icon {
		width: 40px;
		height: 40px;
		background: var(--primary-highlighted);
		border-radius: 10px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 20px;
		flex-shrink: 0;
	}

	.feature-text h4 {
		font-weight: 600;
		color: var(--text0);
		margin-bottom: 4px;
	}

	.feature-text p {
		font-size: 14px;
		color: var(--text400);
		line-height: 1.4;
	}

	/* Step 1: How It Works */
	.how-it-works {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.step-item {
		display: flex;
		gap: 16px;
		align-items: flex-start;
	}

	.step-number {
		width: 32px;
		height: 32px;
		background: var(--primary);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 700;
		color: #000;
		flex-shrink: 0;
	}

	.step-content h4 {
		font-weight: 600;
		color: var(--text0);
		margin-bottom: 4px;
	}

	.step-content p {
		font-size: 14px;
		color: var(--text400);
		line-height: 1.4;
	}

	/* Step 2: Bridge */
	.bridge-section {
		margin-top: 16px;
	}

	.bridge-toggle {
		background: var(--layer50);
		border: 1px solid var(--layer100);
		border-radius: 12px;
		padding: 16px;
		cursor: pointer;
		display: flex;
		justify-content: space-between;
		align-items: center;
		transition: border-color 0.2s;
		width: 100%;
		color: var(--text0);
		font-size: 16px;
	}

	.bridge-toggle:hover {
		border-color: var(--primary);
	}

	.bridge-options {
		margin-top: 16px;
		display: grid;
		gap: 12px;
	}

	.bridge-option {
		background: var(--layer50);
		border: 1px solid var(--layer100);
		border-radius: 12px;
		padding: 16px;
		cursor: pointer;
		display: flex;
		justify-content: space-between;
		align-items: center;
		transition: all 0.2s;
		width: 100%;
		color: var(--text0);
	}

	.bridge-option:hover {
		border-color: var(--primary);
		background: var(--layer100);
	}

	.bridge-name {
		font-weight: 600;
	}

	.bridge-tag {
		font-size: 12px;
		color: var(--primary);
		background: var(--primary-highlighted);
		padding: 4px 8px;
		border-radius: 4px;
	}

	.connect-section {
		margin-bottom: 20px;
	}

	.connect-btn {
		width: 100%;
		background: var(--primary);
		border: none;
		border-radius: 12px;
		padding: 16px;
		font-size: 16px;
		font-weight: 600;
		color: #000;
		cursor: pointer;
		transition: background 0.2s;
	}

	.connect-btn:hover {
		background: var(--primary-hover);
	}

	.connected-status {
		background: var(--primary-highlighted);
		border-radius: 12px;
		padding: 16px;
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.connected-dot {
		width: 12px;
		height: 12px;
		background: var(--primary);
		border-radius: 50%;
	}

	.connected-text {
		font-weight: 500;
		color: var(--primary);
	}

	/* Navigation */
	.modal-footer {
		padding: 0 24px 24px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 16px;
	}

	.step-dots {
		display: flex;
		gap: 8px;
	}

	.dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--layer200);
		transition: all 0.2s;
	}

	.dot.active {
		background: var(--primary);
		width: 24px;
		border-radius: 4px;
	}

	.nav-buttons {
		display: flex;
		gap: 12px;
	}

	.nav-btn {
		padding: 12px 24px;
		border-radius: 8px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
		border: none;
	}

	.nav-btn.secondary {
		background: var(--layer100);
		color: var(--text0);
	}

	.nav-btn.secondary:hover {
		background: var(--layer200);
	}

	.nav-btn.primary {
		background: var(--primary);
		color: #000;
	}

	.nav-btn.primary:hover {
		background: var(--primary-hover);
	}

	.help-link {
		text-align: center;
		margin-top: 16px;
	}

	.help-link a {
		color: var(--primary);
		text-decoration: none;
		font-size: 14px;
	}

	.help-link a:hover {
		text-decoration: underline;
	}
</style>

<div class="modal-overlay" on:click|self={close}>
	<div class="modal-container">
		<div class="modal-header">
			<div class="logo-area">
				<div class="logo">CAP</div>
			</div>
			<button class="close-btn" on:click={close}>×</button>
		</div>

		<div class="modal-content">
			<h2 class="step-title">{steps[currentStep].title}</h2>
			<p class="step-subtitle">{steps[currentStep].subtitle}</p>

			{#if currentStep === 0}
				<div class="welcome-features">
					<div class="feature">
						<div class="feature-icon">📈</div>
						<div class="feature-text">
							<h4>Up to 100x Leverage</h4>
							<p>Trade crypto perpetuals with high leverage on a decentralized platform.</p>
						</div>
					</div>
					<div class="feature">
						<div class="feature-icon">🔒</div>
						<div class="feature-text">
							<h4>Non-Custodial</h4>
							<p>Your funds stay in your wallet. Trade directly from your connected account.</p>
						</div>
					</div>
					<div class="feature">
						<div class="feature-icon">⚡</div>
						<div class="feature-text">
							<h4>Low Fees</h4>
							<p>Competitive trading fees on Arbitrum with fast, cheap transactions.</p>
						</div>
					</div>
					<div class="feature">
						<div class="feature-icon">🏆</div>
						<div class="feature-text">
							<h4>Earn CAP Rewards</h4>
							<p>Trade to earn CAP tokens. Stake CAP to share in protocol fees.</p>
						</div>
					</div>
				</div>
			{:else if currentStep === 1}
				<div class="how-it-works">
					<div class="step-item">
						<div class="step-number">1</div>
						<div class="step-content">
							<h4>Connect Your Wallet</h4>
							<p>Use MetaMask, WalletConnect, or Coinbase Wallet to connect to CAP.</p>
						</div>
					</div>
					<div class="step-item">
						<div class="step-number">2</div>
						<div class="step-content">
							<h4>Bridge Funds to Arbitrum</h4>
							<p>If your funds are on Ethereum or another chain, bridge USDC to Arbitrum.</p>
						</div>
					</div>
					<div class="step-item">
						<div class="step-number">3</div>
						<div class="step-content">
							<h4>Deposit to CAP</h4>
							<p>Deposit USDC from your wallet to your CAP trading account.</p>
						</div>
					</div>
					<div class="step-item">
						<div class="step-number">4</div>
						<div class="step-content">
							<h4>Start Trading</h4>
							<p>Choose a market, set your leverage, and open long or short positions.</p>
						</div>
					</div>
				</div>
			{:else if currentStep === 2}
				<div class="connect-section">
					{#if $address}
						<div class="connected-status">
							<div class="connected-dot"></div>
							<span class="connected-text">Wallet Connected: {$address.slice(0, 6)}...{$address.slice(-4)}</span>
						</div>
					{:else}
						<button class="connect-btn" on:click={handleConnect}>
							Connect Wallet
						</button>
					{/if}
				</div>

				<div class="bridge-section">
					<button class="bridge-toggle" on:click={toggleBridge}>
						<span>🌉 Need to bridge funds to Arbitrum?</span>
						<span>{showBridge ? '▲' : '▼'}</span>
					</button>

					{#if showBridge}
						<div class="bridge-options">
							<button class="bridge-option" on:click={() => openBridge('official')}>
								<span class="bridge-name">Arbitrum Bridge</span>
								<span class="bridge-tag">Official</span>
							</button>
							<button class="bridge-option" on:click={() => openBridge('synapse')}>
								<span class="bridge-name">Synapse Protocol</span>
								<span class="bridge-tag">Fast</span>
							</button>
							<button class="bridge-option" on:click={() => openBridge('stargate')}>
								<span class="bridge-name">Stargate Finance</span>
								<span class="bridge-tag">Multi-chain</span>
							</button>
							<button class="bridge-option" on:click={() => openBridge('hop')}>
								<span class="bridge-name">Hop Protocol</span>
								<span class="bridge-tag">Low fees</span>
							</button>
						</div>
					{/if}
				</div>

				<div class="help-link">
					<a href="https://docs.cap.io" target="_blank" rel="noopener">
						📚 Read the full documentation →
					</a>
				</div>
			{/if}
		</div>

		<div class="modal-footer">
			<div class="step-dots">
				{#each steps as _, i}
					<div class="dot" class:active={i === currentStep}></div>
				{/each}
			</div>
			<div class="nav-buttons">
				{#if currentStep > 0}
					<button class="nav-btn secondary" on:click={prevStep}>Back</button>
				{/if}
				{#if currentStep < steps.length - 1}
					<button class="nav-btn primary" on:click={nextStep}>Next</button>
				{:else}
					<button class="nav-btn primary" on:click={close}>Get Started</button>
				{/if}
			</div>
		</div>
	</div>
</div>
