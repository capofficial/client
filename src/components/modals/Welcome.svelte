<script>

	import Modal from './Modal.svelte'

	import { hideModal } from '@lib/ui'
	import { saveUserSetting } from '@lib/utils'

	function finish() {
		saveUserSetting('hasSeenWelcome', true);
		hideModal();
	}

</script>

<style>

	.content {
		padding: var(--base-padding);
	}

	.lead {
		color: var(--text200);
		line-height: 1.45;
		margin-bottom: var(--base-padding);
	}

	.steps {
		display: grid;
		gap: 10px;
		margin-bottom: var(--base-padding);
	}

	.step {
		padding: 14px;
		border: 1px solid var(--layer100);
		border-radius: var(--base-radius);
		background-color: var(--layer50);
	}

	.step-title {
		font-weight: 600;
		margin-bottom: 5px;
	}

	.step-body {
		color: var(--text300);
		font-size: 90%;
		line-height: 1.4;
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		margin-bottom: var(--base-padding);
	}

	.actions a,
	button {
		height: 38px;
		padding: 0 14px;
		border-radius: var(--base-radius);
		font-weight: 600;
		text-decoration: none;
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}

	.actions a {
		color: var(--primary);
		background-color: var(--primary-highlighted);
	}

	button {
		color: var(--primary-darkest);
		background-color: var(--primary);
		width: auto;
	}

	.note {
		color: var(--text400);
		font-size: 85%;
		line-height: 1.4;
	}

</style>

<Modal title='Welcome to CAP' width={460}>
	<div class='content'>
		<div class='lead'>
			CAP is a decentralized trading dashboard for perpetual markets and liquidity pools on Arbitrum.
		</div>

		<div class='steps'>
			<div class='step'>
				<div class='step-title'>1. Connect a wallet</div>
				<div class='step-body'>Use an Arbitrum wallet to trade, provide liquidity, stake CAP, and view account activity.</div>
			</div>
			<div class='step'>
				<div class='step-title'>2. Bridge funds to Arbitrum</div>
				<div class='step-body'>Bridge ETH or supported collateral before trading. Keep ETH available for gas.</div>
			</div>
			<div class='step'>
				<div class='step-title'>3. Start from the dashboard</div>
				<div class='step-body'>Trade opens markets, Pool manages liquidity, and Stake manages CAP staking.</div>
			</div>
		</div>

		<div class='actions'>
			<a href='https://bridge.arbitrum.io/' target='_blank' rel='noreferrer'>Arbitrum Bridge</a>
			<a href='https://docs.cap.io/trade' target='_blank' rel='noreferrer'>Trading Docs</a>
			<a href='https://docs.cap.io/pool' target='_blank' rel='noreferrer'>Pool Docs</a>
			<button type='button' on:click={finish}>Got it</button>
		</div>

		<div class='note'>
			You can reopen this guide from Help in the navigation.
		</div>
	</div>
</Modal>
