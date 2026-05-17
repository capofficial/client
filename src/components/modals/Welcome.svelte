<script>
	import Modal from './Modal.svelte'
	import { BOOK_ICON, CHECKMARK_CIRCLE_ICON, INFO_ICON_CIRCLE } from '@lib/icons'
	import { hideModal } from '@lib/ui'
	import { navigateTo } from '@lib/routing'
	import { saveUserSetting } from '@lib/utils'

	const bridgeUrl = 'https://bridge.arbitrum.io/';
	const docsUrl = 'https://docs.cap.io';

	function dismissWelcome() {
		saveUserSetting('hasSeenWelcome', true);
		hideModal();
	}

	function remindLater() {
		hideModal();
	}

	function goTo(path) {
		dismissWelcome();
		navigateTo(path);
	}
</script>

<style>
	.welcome {
		padding: var(--base-padding);
	}

	.lede {
		color: var(--text200);
		line-height: 1.45;
		margin-bottom: var(--base-padding);
	}

	.section {
		padding: var(--base-padding) 0;
		border-top: 1px solid var(--layer100);
	}
	.section:first-of-type {
		border-top: none;
		padding-top: 0;
	}

	.section-title {
		display: flex;
		align-items: center;
		gap: 8px;
		font-weight: 600;
		margin-bottom: 12px;
	}
	.section-title :global(svg) {
		width: 17px;
		height: 17px;
		fill: var(--primary);
	}

	.steps {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 12px;
	}

	.step {
		border: 1px solid var(--layer100);
		border-radius: var(--base-radius);
		padding: 14px;
		background-color: var(--layer50);
		min-height: 112px;
	}
	.step .label {
		color: var(--primary);
		font-size: 12px;
		font-weight: 600;
		letter-spacing: 0;
		text-transform: uppercase;
		margin-bottom: 8px;
	}
	.step .copy {
		color: var(--text200);
		font-size: 14px;
		line-height: 1.38;
	}

	.bridge {
		display: grid;
		grid-template-columns: 1.2fr 1fr;
		gap: 12px;
		align-items: stretch;
	}

	.bridge-copy {
		color: var(--text200);
		line-height: 1.45;
	}

	.checklist {
		border: 1px solid var(--layer100);
		border-radius: var(--base-radius);
		padding: 14px;
		background-color: var(--layer50);
	}
	.check {
		display: flex;
		align-items: flex-start;
		gap: 8px;
		color: var(--text200);
		font-size: 14px;
		line-height: 1.35;
		margin-bottom: 10px;
	}
	.check:last-child {
		margin-bottom: 0;
	}
	.check :global(svg) {
		flex: 0 0 auto;
		width: 16px;
		height: 16px;
		fill: var(--primary);
		margin-top: 1px;
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		padding-top: var(--base-padding);
		border-top: 1px solid var(--layer100);
	}

	button,
	a.button {
		height: 42px;
		border-radius: var(--base-radius);
		padding: 0 16px;
		font-weight: 600;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		text-decoration: none;
	}
	button.primary,
	a.button.primary {
		color: var(--primary-darkest);
		background-color: var(--primary);
	}
	button.secondary,
	a.button.secondary {
		color: var(--text0);
		background-color: var(--layer100);
	}
	button.ghost {
		color: var(--text300);
		background-color: transparent;
	}
	button:hover,
	a.button:hover {
		opacity: 0.9;
	}

	@media all and (max-width: 600px) {
		.welcome {
			padding: 16px;
		}
		.steps,
		.bridge {
			grid-template-columns: 1fr;
		}
		.step {
			min-height: 0;
		}
		.actions {
			flex-direction: column;
		}
		button,
		a.button {
			width: 100%;
		}
	}
</style>

<Modal title='Welcome to CAP' width={640}>
	<div class='welcome'>
		<div class='lede'>
			CAP is a decentralized perpetuals trading dashboard on Arbitrum. Use it to trade supported markets, provide liquidity through pools, and stake CAP while keeping custody in your wallet.
		</div>

		<div class='section'>
			<div class='section-title'>{@html BOOK_ICON}<span>Start with the main flows</span></div>
			<div class='steps'>
				<div class='step'>
					<div class='label'>1. Fund</div>
					<div class='copy'>Connect a wallet and bring trading collateral such as USDC or ETH to Arbitrum before placing orders.</div>
				</div>
				<div class='step'>
					<div class='label'>2. Trade</div>
					<div class='copy'>Choose a market, collateral, leverage, and size, then review fees, take-profit, stop-loss, and liquidation risk.</div>
				</div>
				<div class='step'>
					<div class='label'>3. Earn</div>
					<div class='copy'>Pool and Stake pages let liquidity providers and CAP stakers manage deposits, withdrawals, and rewards.</div>
				</div>
			</div>
		</div>

		<div class='section'>
			<div class='section-title'>{@html INFO_ICON_CIRCLE}<span>Bridge funds to Arbitrum</span></div>
			<div class='bridge'>
				<div class='bridge-copy'>
					If your wallet funds are on another network, bridge them to Arbitrum first. Use the official Arbitrum bridge, then return to CAP and confirm the connected network before trading.
				</div>
				<div class='checklist'>
					<div class='check'>{@html CHECKMARK_CIRCLE_ICON}<span>Use the same wallet address on both networks.</span></div>
					<div class='check'>{@html CHECKMARK_CIRCLE_ICON}<span>Keep ETH on Arbitrum for gas.</span></div>
					<div class='check'>{@html CHECKMARK_CIRCLE_ICON}<span>Wait for the bridge transaction to finish before placing an order.</span></div>
				</div>
			</div>
		</div>

		<div class='actions'>
			<button class='primary' type='button' on:click|stopPropagation={() => goTo('/trade')}>Start trading</button>
			<a class='button secondary' href={bridgeUrl} target='_blank' rel='noreferrer'>Open bridge</a>
			<a class='button secondary' href={docsUrl} target='_blank' rel='noreferrer'>Read docs</a>
			<button class='secondary' type='button' on:click|stopPropagation={dismissWelcome}>Got it</button>
			<button class='ghost' type='button' on:click|stopPropagation={remindLater}>Remind me next time</button>
		</div>
	</div>
</Modal>
