<script>
	import Modal from './Modal.svelte'
	import { address } from '@lib/stores'

	let dontShowAgain = false

	const BRIDGE_URL = 'https://app.uniswap.org/#/swap?inputCurrency=ETH&outputCurrency=0x031d35296154279dc1984dcd93e392b1f946737b&chain=arbitrum'

	function close() {
		if (dontShowAgain) {
			localStorage.setItem('cap_welcome_dismissed', '1')
		}
		// Use the Modal's built-in close (hideModal)
		const event = new CustomEvent('hidewelcome')
		window.dispatchEvent(event)
	}

	function openBridge() {
		window.open(BRIDGE_URL, '_blank', 'noopener')
	}
</script>

<style>
	.welcome-content {
		padding: var(--base-padding);
	}

	.welcome-hero {
		text-align: center;
		margin-bottom: 24px;
	}

	.welcome-hero h3 {
		margin: 0 0 8px 0;
		font-size: 20px;
		font-weight: 600;
		color: var(--text0);
	}

	.welcome-hero p {
		margin: 0;
		color: var(--text300);
		font-size: 14px;
		line-height: 1.5;
	}

	.step-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
		margin-bottom: 24px;
	}

	.step {
		display: flex;
		align-items: flex-start;
		gap: 14px;
		padding: 14px;
		background-color: var(--layer50);
		border-radius: var(--base-radius);
		border: 1px solid var(--layer100);
	}

	.step-number {
		flex-shrink: 0;
		width: 28px;
		height: 28px;
		border-radius: 50%;
		background-color: var(--primary);
		color: var(--primary-darkest);
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 700;
		font-size: 13px;
	}

	.step-text {
		flex: 1;
	}

	.step-text .step-title {
		font-weight: 600;
		font-size: 14px;
		color: var(--text0);
		margin-bottom: 4px;
	}

	.step-text .step-desc {
		font-size: 13px;
		color: var(--text300);
		line-height: 1.4;
		margin: 0;
	}

	.bridge-section {
		padding: 16px;
		background-color: rgba(50, 209, 53, 0.06);
		border: 1px solid rgba(50, 209, 53, 0.2);
		border-radius: var(--base-radius);
		margin-bottom: 20px;
	}

	.bridge-section h4 {
		margin: 0 0 8px 0;
		font-size: 14px;
		font-weight: 600;
		color: var(--primary);
	}

	.bridge-section p {
		margin: 0 0 12px 0;
		font-size: 13px;
		color: var(--text200);
		line-height: 1.4;
	}

	.bridge-btn {
		display: inline-block;
		padding: 10px 20px;
		border-radius: 8px;
		background-color: var(--primary);
		color: var(--primary-darkest);
		font-weight: 600;
		font-size: 14px;
		cursor: pointer;
		border: none;
		text-decoration: none;
	}

	.bridge-btn:hover {
		background-color: var(--primary-hover);
	}

	.footer-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-top: 12px;
		border-top: 1px solid var(--layer100);
	}

	.checkbox-wrap {
		display: flex;
		align-items: center;
		gap: 8px;
		cursor: pointer;
		user-select: none;
	}

	.checkbox-wrap input[type="checkbox"] {
		width: 16px;
		height: 16px;
		cursor: pointer;
		accent-color: var(--primary);
	}

	.checkbox-wrap label {
		font-size: 13px;
		color: var(--text300);
		cursor: pointer;
	}

	.got-it-btn {
		padding: 8px 24px;
		border-radius: 8px;
		background-color: var(--layer100);
		color: var(--text0);
		font-weight: 600;
		font-size: 14px;
		cursor: pointer;
		border: 1px solid var(--layer200);
	}

	.got-it-btn:hover {
		background-color: var(--layer200);
	}

	:global(a) {
		color: var(--primary);
		text-decoration: none;
	}

	:global(a:hover) {
		text-decoration: underline;
	}
</style>

<Modal title='Welcome to CAP' width={440}>

	<div class='welcome-content'>

		<div class='welcome-hero'>
			<h3>👋 Welcome to CAP Decentralized Perps</h3>
			<p>Trade perpetual futures with up to 100× leverage on Arbitrum — directly from your wallet.</p>
		</div>

		<div class='step-list'>

			<div class='step'>
				<div class='step-number'>1</div>
				<div class='step-text'>
					<div class='step-title'>Connect Your Wallet</div>
					<p class='step-desc'>Link MetaMask or WalletConnect to start trading. No sign-up needed.</p>
				</div>
			</div>

			<div class='step'>
				<div class='step-number'>2</div>
				<div class='step-text'>
					<div class='step-title'>Bridge Funds to Arbitrum</div>
					<p class='step-desc'>Bridge ETH or USDC from Ethereum mainnet or use USDC already on Arbitrum as collateral.</p>
				</div>
			</div>

			<div class='step'>
				<div class='step-number'>3</div>
				<div class='step-text'>
					<div class='step-title'>Start Trading</div>
					<p class='step-desc'>Choose a market, set your leverage, and open long or short positions instantly.</p>
				</div>
			</div>

		</div>

		<div class='bridge-section'>
			<h4>💰 Need CAP Tokens?</h4>
			<p>You can buy CAP on Uniswap (Arbitrum) or earn rewards by providing liquidity or staking.</p>
			<a class='bridge-btn' target='_blank' rel='noopener' href={BRIDGE_URL}>
				Buy CAP on Uniswap →
			</a>
		</div>

		<div class='footer-row'>
			<label class='checkbox-wrap'>
				<input type='checkbox' bind:checked={dontShowAgain} />
				<span>Don't show this again</span>
			</label>
			<button class='got-it-btn' on:click={close}>Got it!</button>
		</div>

	</div>

</Modal>
