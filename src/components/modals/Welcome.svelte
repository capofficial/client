<script>

	import { onDestroy } from 'svelte'

	import Button from '@components/layout/Button.svelte'
	import Modal from './Modal.svelte'

	import { navigateTo } from '@lib/routing'
	import { hideModal } from '@lib/ui'
	import { saveUserSetting } from '@lib/utils'

	const guideItems = [
		{
			title: 'Trade',
			copy: 'Open long or short perpetual positions, then manage active orders and position risk from the account panel.',
			href: '/trade'
		},
		{
			title: 'Pool',
			copy: 'Deposit assets into CAP pools or withdraw available liquidity from the pool dashboard.',
			href: '/pool'
		},
		{
			title: 'Stake',
			copy: 'Stake CAP, review rewards, and manage unstaking from the staking dashboard.',
			href: '/stake'
		}
	];

	function closeWelcomeModal() {
		saveUserSetting('welcomeModalDismissed', true);
		hideModal();
	}

	function navigateFromWelcomeModal(path) {
		navigateTo(path);
		closeWelcomeModal();
	}

	onDestroy(() => {
		saveUserSetting('welcomeModalDismissed', true);
	});

</script>

<style>

	.content {
		padding: var(--base-padding);
	}

	.lede {
		margin: 0 0 var(--base-padding);
		color: var(--text200);
		line-height: 1.45;
	}

	.section {
		border-top: 1px solid var(--layer200);
		padding-top: var(--base-padding);
		margin-top: var(--base-padding);
	}

	.section-title {
		font-size: 14px;
		font-weight: 600;
		color: var(--text0);
		margin-bottom: var(--semi-padding);
	}

	.guide-list {
		display: grid;
		grid-template-columns: 1fr;
		gap: 0;
		border: 1px solid var(--layer200);
		border-radius: var(--base-radius);
		overflow: hidden;
	}

	.guide-item {
		display: grid;
		grid-template-columns: 82px 1fr auto;
		gap: var(--semi-padding);
		align-items: center;
		padding: 14px;
		background-color: var(--layer50);
		border-bottom: 1px solid var(--layer200);
	}

	.guide-item:last-child {
		border-bottom: 0;
	}

	.guide-name {
		font-weight: 600;
		color: var(--text0);
	}

	.guide-copy {
		color: var(--text300);
		font-size: 13px;
		line-height: 1.35;
	}

	a {
		color: var(--primary);
		text-decoration: none;
		cursor: pointer;
	}

	.bridge-actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--semi-padding);
	}

	.bridge-link {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 38px;
		padding: 0 16px;
		border-radius: var(--base-radius);
		background-color: var(--layer100);
		font-weight: 600;
	}

	.bridge-link.primary {
		color: var(--primary-darkest);
		background-color: var(--primary);
	}

	.bridge-note {
		margin-top: var(--semi-padding);
		color: var(--text400);
		font-size: 12px;
		line-height: 1.35;
	}

	.footer {
		display: flex;
		justify-content: flex-end;
		margin-top: var(--base-padding);
	}

	@media all and (max-width: 600px) {
		.guide-item {
			grid-template-columns: 1fr;
		}
		.bridge-actions {
			flex-direction: column;
		}
		.bridge-link {
			width: 100%;
			box-sizing: border-box;
		}
	}

</style>

<Modal title='Welcome to CAP' width={560}>
	<div class='content'>
		<p class='lede'>
			CAP is a decentralized trading dashboard for perpetual markets, liquidity pools, and CAP staking on Arbitrum One.
		</p>

		<div class='section'>
			<div class='section-title'>Dashboard</div>
			<div class='guide-list'>
				{#each guideItems as item}
					<div class='guide-item'>
						<div class='guide-name'>{item.title}</div>
						<div class='guide-copy'>{item.copy}</div>
						<a href={item.href} on:click|preventDefault={() => navigateFromWelcomeModal(item.href)}>Open</a>
					</div>
				{/each}
			</div>
		</div>

		<div class='section'>
			<div class='section-title'>Bridge</div>
			<div class='bridge-actions'>
				<a class='bridge-link primary' href='https://portal.arbitrum.io/bridge' target='_blank' rel='noreferrer'>Open Arbitrum Bridge</a>
				<a class='bridge-link' href='https://docs.cap.io/intro/setting-up-your-wallet' target='_blank' rel='noreferrer'>Wallet Setup</a>
			</div>
			<div class='bridge-note'>
				Use the official Arbitrum portal or CAP docs when moving funds. Always verify the destination chain before confirming a wallet transaction.
			</div>
		</div>

		<div class='footer'>
			<Button label='Got it' noSubmit={true} on:click={closeWelcomeModal} />
		</div>
	</div>
</Modal>
