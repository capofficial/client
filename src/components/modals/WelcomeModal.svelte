<script>
	import { onMount } from 'svelte'
	import Modal from './Modal.svelte'
	import Button from '@components/layout/Button.svelte'
	
	import { hideModal, showModal } from '@lib/ui'
	import { getUserSetting, saveUserSetting } from '@lib/utils'
	
	let currentStep = 0
	const totalSteps = 4
	
	const steps = [
		{
			title: 'Welcome to CAP',
			subtitle: 'Decentralized Perpetual Trading',
			content: `
				<p>CAP is a decentralized perpetual exchange that allows you to trade crypto assets with up to 50x leverage directly from your wallet.</p>
				<br/>
				<p><strong>Key Features:</strong></p>
				<ul>
					<li>⚡ Trade BTC, ETH, and more with leverage</li>
					<li>🔒 Non-custodial - you control your funds</li>
					<li>💰 Earn yield by providing liquidity to pools</li>
					<li>🌉 Built on Arbitrum for low fees</li>
				</ul>
			`
		},
		{
			title: 'How to Trade',
			subtitle: 'Simple 3-Step Process',
			content: `
				<p><strong>1. Connect Your Wallet</strong></p>
				<p>Click "Connect Wallet" and select your preferred wallet (MetaMask, WalletConnect, etc.)</p>
				<br/>
				<p><strong>2. Deposit Funds</strong></p>
				<p>Deposit ETH or USDC into the trading pool. You'll need to approve the asset first.</p>
				<br/>
				<p><strong>3. Place a Trade</strong></p>
				<p>Select your market, choose Long or Short, set your size, and submit your order.</p>
			`
		},
		{
			title: 'Bridge Funds to Arbitrum',
			subtitle: 'Get Your Assets Ready',
			content: `
				<p>CAP operates on Arbitrum One, a Layer 2 scaling solution for Ethereum.</p>
				<br/>
				<p><strong>If your funds are on Ethereum mainnet:</strong></p>
				<ol>
					<li>Use the official Arbitrum Bridge</li>
					<li>Transfer ETH or USDC to Arbitrum</li>
					<li>Wait ~10 minutes for confirmation</li>
					<li>Start trading on CAP!</li>
				</ol>
				<br/>
				<p><strong>Need help?</strong> Check out our documentation or join our Discord community.</p>
			`
		},
		{
			title: 'Ready to Start?',
			subtitle: 'Join the CAP Community',
			content: `
				<p>You're all set to begin trading on CAP!</p>
				<br/>
				<p><strong>Quick Links:</strong></p>
				<ul>
					<li>📖 <a href="https://docs.cap.io" target="_blank">Documentation</a></li>
					<li>💬 <a href="https://discord.gg/cap" target="_blank">Discord Community</a></li>
					<li>🐦 <a href="https://twitter.com/CAPfinance" target="_blank">Twitter</a></li>
				</ul>
				<br/>
				<p><em>This welcome guide won't show again unless you reset it in settings.</em></p>
			`
		}
	]
	
	function nextStep() {
		if (currentStep < totalSteps - 1) {
			currentStep++
		} else {
			completeWelcome()
		}
	}
	
	function prevStep() {
		if (currentStep > 0) {
			currentStep--
		}
	}
	
	function completeWelcome() {
		saveUserSetting('welcomeCompleted', true)
		saveUserSetting('welcomeCompletedAt', Date.now())
		hideModal()
	}
	
	function openBridge() {
		window.open('https://bridge.arbitrum.io/', '_blank')
	}
	
	$: currentStepData = steps[currentStep]
</script>

<style>
	.welcome-modal {
		padding: 24px;
		max-width: 480px;
	}
	
	.header {
		text-align: center;
		margin-bottom: 24px;
	}
	
	.logo {
		font-size: 48px;
		margin-bottom: 16px;
	}
	
	.title {
		font-size: 24px;
		font-weight: 700;
		margin-bottom: 8px;
		color: var(--text0);
	}
	
	.subtitle {
		font-size: 16px;
		color: var(--text300);
	}
	
	.content {
		background-color: var(--layer0);
		border-radius: 12px;
		padding: 20px;
		margin-bottom: 24px;
		min-height: 200px;
	}
	
	.content :global(p) {
		margin-bottom: 12px;
		line-height: 1.6;
		color: var(--text200);
	}
	
	.content :global(ul), .content :global(ol) {
		margin-left: 20px;
		margin-bottom: 16px;
	}
	
	.content :global(li) {
		margin-bottom: 8px;
		color: var(--text200);
	}
	
	.content :global(a) {
		color: var(--primary);
		text-decoration: none;
	}
	
	.content :global(a:hover) {
		text-decoration: underline;
	}
	
	.progress-bar {
		display: flex;
		justify-content: center;
		gap: 8px;
		margin-bottom: 24px;
	}
	
	.progress-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background-color: var(--layer200);
		transition: background-color 0.3s;
	}
	
	.progress-dot.active {
		background-color: var(--primary);
		width: 24px;
		border-radius: 4px;
	}
	
	.buttons {
		display: flex;
		justify-content: space-between;
		gap: 12px;
	}
	
	.skip-link {
		text-align: center;
		margin-top: 16px;
	}
	
	.skip-link a {
		color: var(--text300);
		font-size: 14px;
		cursor: pointer;
	}
	
	.skip-link a:hover {
		color: var(--text200);
	}
	
	.bridge-button {
		margin-top: 16px;
		text-align: center;
	}
</style>

<Modal title='' showHeader={false} width={520}>
	<div class='welcome-modal'>
		<div class='header'>
			<div class='logo'>🎯</div>
			<div class='title'>{currentStepData.title}</div>
			<div class='subtitle'>{currentStepData.subtitle}</div>
		</div>
		
		<div class='progress-bar'>
			{#each Array(totalSteps) as _, i}
				<div class='progress-dot' class:active={i === currentStep}></div>
			{/each}
		</div>
		
		<div class='content'>
			{@html currentStepData.content}
			
			{#if currentStep === 2}
				<div class='bridge-button'>
					<Button label='Open Arbitrum Bridge' on:click={openBridge} />
				</div>
			{/if}
		</div>
		
		<div class='buttons'>
			<Button 
				label={currentStep === 0 ? 'Skip' : 'Back'} 
				on:click={currentStep === 0 ? completeWelcome : prevStep}
				isSmall={true}
			/>
			<Button 
				label={currentStep === totalSteps - 1 ? 'Get Started' : 'Next'} 
				on:click={nextStep}
				isSmall={true}
			/>
		</div>
		
		{#if currentStep < totalSteps - 1}
			<div class='skip-link'>
				<a on:click={completeWelcome}>Skip tutorial</a>
			</div>
		{/if}
	</div>
</Modal>
