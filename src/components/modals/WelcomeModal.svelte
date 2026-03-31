<script>

	import Modal from './Modal.svelte'
	import Button from '@components/layout/Button.svelte'

	import { hideModal } from '@lib/ui'
	import { address } from '@lib/stores'
	import { navigateTo } from '@lib/routing'

	let dontShowAgain = false;

	function handleDismiss() {
		if (dontShowAgain && localStorage) {
			localStorage.setItem('cap_welcome_dismissed', 'true');
		}
		hideModal();
	}

	function openBridge() {
		// Open Across bridge in new tab - direct link to bridge with Arbitrum as source
		window.open('https://app.across.to/bridge?from=Arbitrum&to=Base&token=ETH', '_blank');
	}

	function goToTrade() {
		handleDismiss();
		navigateTo('/trade');
	}

	function goToPool() {
		handleDismiss();
		navigateTo('/pool');
	}

	function goToStake() {
		handleDismiss();
		navigateTo('/stake');
	}

</script>

<style>

	.content {
		padding: var(--base-padding);
	}

	.header {
		text-align: center;
		margin-bottom: 24px;
	}

	.logo {
		height: 48px;
		margin-bottom: 16px;
	}

	.title {
		font-size: 24px;
		font-weight: 700;
		margin-bottom: 8px;
		color: var(--text0);
	}

	.subtitle {
		font-size: 14px;
		color: var(--text500);
		line-height: 1.5;
	}

	.section {
		margin-bottom: 20px;
	}

	.section-title {
		font-size: 13px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--primary);
		margin-bottom: 10px;
	}

	.section-body {
		font-size: 14px;
		color: var(--text200);
		line-height: 1.6;
	}

	.feature-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 8px;
		margin-top: 12px;
	}

	.feature-item {
		background-color: var(--layer0);
		border: 1px solid var(--layer100);
		border-radius: var(--base-radius);
		padding: 10px;
		cursor: pointer;
		transition: all 100ms ease;
		text-align: center;
	}

	.feature-item:hover {
		border-color: var(--primary);
		background-color: var(--primary-highlighted);
	}

	.feature-icon {
		font-size: 20px;
		margin-bottom: 4px;
	}

	.feature-label {
		font-size: 12px;
		font-weight: 600;
		color: var(--text0);
	}

	.bridge-card {
		background: linear-gradient(135deg, var(--layer0) 0%, var(--layer25) 100%);
		border: 1px solid var(--layer200);
		border-radius: var(--base-radius);
		padding: 16px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 16px;
	}

	.bridge-info {
		flex: 1;
	}

	.bridge-title {
		font-size: 14px;
		font-weight: 600;
		color: var(--text0);
		margin-bottom: 4px;
	}

	.bridge-desc {
		font-size: 12px;
		color: var(--text500);
	}

	.checkbox-row {
		display: flex;
		align-items: center;
		gap: 8px;
		margin: 16px 0;
		cursor: pointer;
	}

	.checkbox-row input {
		width: 16px;
		height: 16px;
		accent-color: var(--primary);
	}

	.checkbox-label {
		font-size: 13px;
		color: var(--text400);
	}

	.actions {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.actions .row {
		display: flex;
		gap: 8px;
	}

	.actions .row button {
		flex: 1;
	}

	.divider {
		border: none;
		border-top: 1px solid var(--layer100);
		margin: 16px 0;
	}

	.dismiss {
		text-align: center;
	}

	.dismiss-btn {
		background: none;
		border: none;
		color: var(--text500);
		font-size: 12px;
		cursor: pointer;
		padding: 8px;
	}

	.dismiss-btn:hover {
		color: var(--text200);
	}

	.text-link {
		color: var(--primary);
		cursor: pointer;
		text-decoration: underline;
	}

	.text-link:hover {
		color: var(--primary-hover);
	}

</style>

<Modal title='' width={460} showHeader={false}>

	<div class='content'>

		<div class='header'>
			<img class='logo' src='/im/logo.svg' alt='CAP'>
			<div class='title'>Welcome to CAP</div>
			<div class='subtitle'>
				Decentralized perpetuals trading on Arbitrum &amp; Base.
				<br>Trade with up to 50x leverage, earn yield, or stake CAP.
			</div>
		</div>

		<div class='section'>
			<div class='section-title'>Quick Start</div>
			<div class='section-body'>
				Get started by connecting your wallet and bridging funds to Arbitrum or Base using the button below.
			</div>
		</div>

		<div class='bridge-card'>
			<div class='bridge-info'>
				<div class='bridge-title'>Bridge Funds</div>
				<div class='bridge-desc'>Transfer ETH or tokens from other chains via Across Protocol</div>
			</div>
			<Button label='Bridge →' isSmall={true} on:click={openBridge} />
		</div>

		<hr class='divider'>

		<div class='section'>
			<div class='section-title'>Explore CAP</div>
			<div class='feature-grid'>
				<div class='feature-item' on:click={goToTrade} on:keydown={(e) => e.key === 'Enter' && goToTrade()} role='button' tabindex='0'>
					<div class='feature-icon'>📊</div>
					<div class='feature-label'>Trade</div>
				</div>
				<div class='feature-item' on:click={goToPool} on:keydown={(e) => e.key === 'Enter' && goToPool()} role='button' tabindex='0'>
					<div class='feature-icon'>💧</div>
					<div class='feature-label'>Pool</div>
				</div>
				<div class='feature-item' on:click={goToStake} on:keydown={(e) => e.key === 'Enter' && goToStake()} role='button' tabindex='0'>
					<div class='feature-icon'>🔒</div>
					<div class='feature-label'>Stake</div>
				</div>
				<div class='feature-item' on:click={() => window.open('https://docs.cap.io', '_blank')} on:keydown={(e) => e.key === 'Enter' && window.open('https://docs.cap.io', '_blank')} role='button' tabindex='0'>
					<div class='feature-icon'>📖</div>
					<div class='feature-label'>Docs</div>
				</div>
			</div>
		</div>

		<div class='checkbox-row'>
			<input type='checkbox' id='dont-show' bind:checked={dontShowAgain}>
			<label class='checkbox-label' for='dont-show'>Don't show this again</label>
		</div>

		<div class='dismiss'>
			<button class='dismiss-btn' on:click={handleDismiss}>Close</button>
		</div>

	</div>

</Modal>
