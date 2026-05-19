<script>
	import Modal from './Modal.svelte'
	import Button from '@components/layout/Button.svelte'
	import { hideModal, showModal } from '@lib/ui'

	const bridgeUrl = 'https://bridge.arbitrum.io/';
	const docsUrl = 'https://docs.cap.io/';

	function openBridge() {
		window.open(bridgeUrl, '_blank', 'noopener,noreferrer');
	}
</script>

<style>
	.intro {
		color: var(--text200);
		line-height: 1.418;
		margin-bottom: var(--base-padding);
	}

	.steps {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--semi-padding);
		margin-bottom: var(--base-padding);
	}

	.step {
		background-color: var(--layer50);
		border: 1px solid var(--layer100);
		border-radius: var(--base-radius);
		padding: 14px;
		min-height: 112px;
	}

	.step-title {
		font-weight: 600;
		margin-bottom: 8px;
	}

	.step-body {
		color: var(--text300);
		font-size: 90%;
		line-height: 1.35;
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--semi-padding);
		align-items: center;
	}

	.link {
		color: var(--primary);
	}

	.link-button {
		padding: 0;
		width: auto;
		height: auto;
		background: transparent;
		color: var(--primary);
		font: inherit;
		font-weight: 400;
	}

	.link-button:hover:not(:active),
	.link-button:active {
		background: transparent;
		color: var(--primary-hover);
	}

	@media all and (max-width: 600px) {
		.steps {
			grid-template-columns: 1fr;
		}
	}
</style>

<Modal title='Welcome to CAP' width={620}>
	<div class='container'>
		<div class='intro'>
			CAP is a decentralized trading dashboard for opening leveraged long and short positions using ETH or USDC as margin. Connect a wallet on Arbitrum, bridge funds if needed, choose a market, then size the order in the trade panel.
		</div>

		<div class='steps'>
			<div class='step'>
				<div class='step-title'>1. Connect</div>
				<div class='step-body'>Use the wallet button in the header to connect a supported wallet on Arbitrum.</div>
			</div>
			<div class='step'>
				<div class='step-title'>2. Fund</div>
				<div class='step-body'>Bridge ETH or USDC to Arbitrum, then deposit pool funds or keep collateral in your wallet for trading.</div>
			</div>
			<div class='step'>
				<div class='step-title'>3. Trade</div>
				<div class='step-body'>Select a market, choose direction and leverage, then review order details before submitting.</div>
			</div>
		</div>

		<div class='actions'>
			<Button noSubmit={true} label='Open Arbitrum Bridge' on:click={openBridge} />
			<Button noSubmit={true} label='Connect Wallet' on:click={() => showModal('Connect')} />
			<a class='link' href={docsUrl} target='_blank' rel='noopener noreferrer'>Read docs</a>
			<button class='link-button' type='button' on:click={hideModal}>Start trading</button>
		</div>
	</div>
</Modal>
