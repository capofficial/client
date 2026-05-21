<script>
	import { onMount } from 'svelte'

	import Modal from './Modal.svelte'
	import { hideModal } from '@lib/ui'
	import { saveUserSetting } from '@lib/utils'

	onMount(() => {
		saveUserSetting('hasSeenWelcomeModal', true);
	});
</script>

<style>
	.content {
		padding: var(--base-padding);
		line-height: 1.45;
	}
	.lede {
		margin: 0 0 var(--base-padding);
		color: var(--text200);
	}
	.steps {
		display: grid;
		gap: var(--semi-padding);
		margin: 0 0 var(--base-padding);
		padding: 0;
		list-style: none;
	}
	.steps li {
		padding: var(--semi-padding);
		border: 1px solid var(--layer100);
		border-radius: var(--base-radius);
		background: var(--layer0);
	}
	.steps strong {
		display: block;
		margin-bottom: 4px;
		color: var(--text0);
	}
	.steps span {
		color: var(--text300);
		font-size: 14px;
	}
	.actions {
		display: flex;
		gap: var(--semi-padding);
		flex-wrap: wrap;
	}
	.actions a,
	.actions button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-height: 38px;
		padding: 0 16px;
		border-radius: var(--base-radius);
		font-weight: 600;
	}
	.primary {
		background: var(--primary);
		color: var(--primary-darkest);
	}
	.secondary {
		background: var(--layer100);
		color: var(--text0);
	}
	@media all and (max-width: 600px) {
		.actions a,
		.actions button {
			width: 100%;
		}
	}
</style>

<Modal title='Welcome to CAP' width={520}>
	<div class='content'>
		<p class='lede'>CAP lets you trade perpetual markets and provide liquidity from Arbitrum. Here is the shortest path to getting started safely.</p>

		<ul class='steps'>
			<li>
				<strong>1. Connect an Arbitrum wallet</strong>
				<span>Use the wallet button in the header to connect and switch networks if needed.</span>
			</li>
			<li>
				<strong>2. Fund Arbitrum before trading</strong>
				<span>Bridge funds to Arbitrum, then deposit collateral before opening a position.</span>
			</li>
			<li>
				<strong>3. Review risk and fees</strong>
				<span>Check market details, leverage, liquidation price, and the docs before submitting an order.</span>
			</li>
		</ul>

		<div class='actions'>
			<a class='primary' href='https://bridge.arbitrum.io/' target='_blank' rel='noreferrer'>Bridge to Arbitrum</a>
			<a class='secondary' href='https://docs.cap.io/trade' target='_blank' rel='noreferrer'>Read trading docs</a>
			<button class='secondary' type='button' on:click={hideModal}>Got it</button>
		</div>
	</div>
</Modal>
