<script>
	import Modal from './Modal.svelte'
	import { hideModal, showModal } from '@lib/ui'
	import { localStorageStore } from '@lib/utils'

	export let showBridge = false;

	// localStorage-backed flag so we only show once per user
	const seen = localStorageStore('cap_welcome_seen', false);

	function dismiss() {
		$seen = true;
		hideModal();
	}

	function openBridge() {
		hideModal();
		showModal('Deposit');
	}

	const STEPS = [
		{
			title: 'Trade perpetuals on Arbitrum',
			body: 'CAP v4 is a perpetuals trading dashboard. Open long or short positions on supported markets with up to 10× leverage.'
		},
		{
			title: 'Provide liquidity in CAP pools',
			body: 'Earn yield by depositing into multi-asset pools. Pools show live TVL, APY, and your position size.'
		},
		{
			title: 'Bridge funds from Arbitrum',
			body: 'CAP lives on Arbitrum. Use the bridge tab inside Deposit to move USDC from Arbitrum to your trading account.'
		},
		{
			title: 'Stake CAP for rewards',
			body: 'Stake the CAP token to earn a share of protocol revenue. Unstake any time after the cooldown.'
		}
	];
</script>

<style>

	.wrap {
		padding: var(--base-padding);
	}

	.intro {
		font-size: 95%;
		color: var(--text200);
		line-height: 1.45;
		margin-bottom: var(--base-padding);
	}

	.steps {
		display: flex;
		flex-direction: column;
		gap: 12px;
		margin-bottom: var(--base-padding);
	}

	.step {
		display: flex;
		gap: 14px;
		padding: 12px 14px;
		background-color: var(--layer1dot5);
		border-radius: var(--base-radius);
		border: 1px solid var(--layer200);
	}

	.step .num {
		flex: 0 0 28px;
		height: 28px;
		border-radius: 50%;
		background-color: var(--primary);
		color: var(--text0);
		font-weight: 600;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 13px;
	}

	.step .text {
		flex: 1 1 auto;
	}

	.step .text .t {
		font-weight: 600;
		font-size: 95%;
		margin-bottom: 4px;
	}

	.step .text .b {
		color: var(--text300);
		font-size: 85%;
		line-height: 1.4;
	}

	.actions {
		display: flex;
		gap: 10px;
		justify-content: flex-end;
		align-items: center;
	}

	.cta {
		padding: 10px 18px;
		background-color: var(--primary);
		color: var(--text0);
		border: none;
		border-radius: var(--base-radius);
		cursor: pointer;
		font-weight: 500;
		font-size: 90%;
	}

	.cta.secondary {
		background-color: transparent;
		color: var(--text200);
		border: 1px solid var(--layer200);
	}

	.cta:hover { opacity: 0.9; }

	.skip {
		font-size: 85%;
		color: var(--text300);
		cursor: pointer;
		background: none;
		border: none;
		padding: 6px 10px;
	}

</style>

<Modal title='Welcome to CAP v4' width={520} showCancel={false}>

	<div class='wrap'>

		<div class='intro'>
			CAP is a perpetuals exchange and liquidity protocol on Arbitrum. Here's a quick tour to get you started.
		</div>

		<div class='steps'>
			{#each STEPS as step, i}
				<div class='step'>
					<div class='num'>{i + 1}</div>
					<div class='text'>
						<div class='t'>{step.title}</div>
						<div class='b'>{step.body}</div>
					</div>
				</div>
			{/each}
		</div>

		<div class='actions'>
			<button class='skip' on:click={dismiss}>Don't show again</button>
			<button class='cta secondary' on:click={dismiss}>Got it</button>
			<button class='cta' on:click={openBridge}>Open bridge</button>
		</div>

	</div>

</Modal>