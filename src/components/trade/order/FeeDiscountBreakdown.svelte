<script>

	import { CAPStake } from '@lib/stores'
	import { BPS_DIVIDER } from '@lib/config'
	import { formatForDisplay } from '@lib/formatters'
	import { stats, address } from '@lib/stores'

	export let market;
	export let baseFeeBps = 0;

	// CAP staking discount: for now showing if user has any CAP staked
	$: hasStakingDiscount = $CAPStake > 0;
	$: stakingDiscountBps = hasStakingDiscount ? Math.min(Number($CAPStake) / 100, 10) : 0; // simplified calculation

	// Volume discount: based on 30-day trading volume
	$: userStats = $stats[$address];
	$: volume = userStats?.volume || 0;
	// Volume tiers: >$1M = 5bps, >$10M = 10bps, >$100M = 15bps
	$: volumeDiscountBps = volume > 100000000 ? 15 : volume > 10000000 ? 10 : volume > 1000000 ? 5 : 0;

	// Referral discount: from referralDiscount store
	import { referralDiscount } from '@lib/stores';
	$: referralDiscountBps = $referralDiscount || 0;

	// Total discount
	$: totalDiscountBps = stakingDiscountBps + volumeDiscountBps + referralDiscountBps;

	// Effective fee
	$: effectiveFeeBps = Math.max(0, baseFeeBps - totalDiscountBps);
	$: effectiveFeePercent = formatForDisplay(effectiveFeeBps / 100);

	let showDetails = false;

	function toggleDetails() {
		showDetails = !showDetails;
	}

	function close() {
		showDetails = false;
	}

</script>

<div class='fee-discount-wrapper'>
	<div class='fee-row' on:click={toggleDetails} on:keydown={(e) => e.key === 'Enter' && toggleDetails()} role='button' tabindex='0'>
		<slot {toggleDetails} />
	</div>

	{#if showDetails}
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div class='overlay' on:click={close}></div>
		<div class='discount-popup'>
			<div class='popup-title'>Fee Discount Breakdown</div>
			
			<div class='discount-row'>
				<span class='discount-label'>Base Fee</span>
				<span class='discount-value'>{(baseFeeBps / 100).toFixed(2)}%</span>
			</div>

			<div class='discount-sep'></div>

			{#if hasStakingDiscount}
			<div class='discount-row'>
				<span class='discount-label'>
					<span class='discount-dot staking'></span>
					CAP Staking
				</span>
				<span class='discount-value discount'>-{(stakingDiscountBps / 100).toFixed(2)}%</span>
			</div>
			{/if}

			{#if volumeDiscountBps > 0}
			<div class='discount-row'>
				<span class='discount-label'>
					<span class='discount-dot volume'></span>
					30-Day Volume
				</span>
				<span class='discount-value discount'>-{(volumeDiscountBps / 100).toFixed(2)}%</span>
			</div>
			{/if}

			{#if referralDiscountBps > 0}
			<div class='discount-row'>
				<span class='discount-label'>
					<span class='discount-dot referral'></span>
					Referral
				</span>
				<span class='discount-value discount'>-{(referralDiscountBps / 100).toFixed(2)}%</span>
			</div>
			{/if}

			{#if totalDiscountBps === 0}
			<div class='no-discounts'>
				No discounts applied. Stake CAP or trade more to earn fee discounts!
			</div>
			{/if}

			<div class='discount-sep'></div>

			<div class='discount-row total-row'>
				<span class='discount-label'>Effective Fee</span>
				<span class='discount-value effective'>{(effectiveFeePercent)}%</span>
			</div>
		</div>
	{/if}
</div>

<style>

	.fee-discount-wrapper {
		position: relative;
	}

	.fee-row {
		cursor: pointer;
	}

	.overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 999;
	}

	.discount-popup {
		position: absolute;
		top: 100%;
		left: 0;
		right: 0;
		background: var(--layer25);
		border: 1px solid var(--layer200);
		border-radius: var(--base-radius);
		padding: 12px;
		z-index: 1000;
		min-width: 200px;
		box-shadow: 0 4px 12px rgba(0,0,0,0.3);
	}

	.popup-title {
		font-size: 85%;
		font-weight: 600;
		color: var(--text0);
		margin-bottom: 8px;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.discount-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 4px 0;
		font-size: 85%;
	}

	.discount-label {
		color: var(--text400);
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.discount-value {
		color: var(--text0);
	}

	.discount-value.discount {
		color: var(--success);
	}

	.discount-value.effective {
		font-weight: 600;
		color: var(--primary);
	}

	.discount-sep {
		height: 1px;
		background: var(--layer200);
		margin: 8px 0;
	}

	.discount-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		display: inline-block;
	}

	.discount-dot.staking {
		background: var(--primary);
	}

	.discount-dot.volume {
		background: var(--secondary);
	}

	.discount-dot.referral {
		background: var(--accent);
	}

	.total-row {
		font-weight: 600;
	}

	.no-discounts {
		font-size: 80%;
		color: var(--text400);
		text-align: center;
		padding: 8px 0;
	}
</style>
