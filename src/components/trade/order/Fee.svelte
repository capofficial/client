<script>

	import tooltip from '@lib/tooltip'

	import { BASE_FEES_BPS, BPS_DIVIDER } from '@lib/config'
	import { marketInfos } from '@lib/stores'

	import { formatForDisplay } from '@lib/formatters'

	export let size;
	export let market;
	export let asset;
	export let hasTP = false;
	export let hasSL = false;
	export let isSecondaryColor = false;

	let totalSize;
	$: totalSize = size;
	function checkTPSL() {
		// console.log(hasTP, hasSL);
		if (hasTP) {
			totalSize = size * 2;
		}
		if (hasSL) {
			totalSize = size * 2;
		}
		if (hasSL && hasTP) {
			totalSize = size * 3;
		}
		if (!hasSL && !hasTP) {
			totalSize = size;
		}
	}

	$: checkTPSL(hasTP, hasSL);

	function getFeeAmount() {
		// console.log('getFeeAmount', totalSize, market, $marketInfos[market]);
		if (!totalSize || !market || !$marketInfos[market]) return 0;
		return totalSize * $marketInfos[market].fee * 1 / BPS_DIVIDER;
	}

	let feeAmount = 0;
	$: feeAmount = getFeeAmount(totalSize, market, $marketInfos);

	function toNumber(value) {
		if (value == null) return 0;
		const number = value.toString ? value.toString() * 1 : value * 1;
		return Number.isFinite(number) ? number : 0;
	}

	function toOptionalNumber(value) {
		if (value == null) return undefined;
		const number = value.toString ? value.toString() * 1 : value * 1;
		return Number.isFinite(number) ? number : undefined;
	}

	function formatBps(bps) {
		return `${formatForDisplay(100 * bps / BPS_DIVIDER)}%`;
	}

	function getReferralDiscountBps(marketInfo) {
		return toNumber(
			marketInfo?.referralDiscountBps
				?? marketInfo?.referralFeeDiscountBps
				?? marketInfo?.referralDiscount
				?? marketInfo?.referralFeeDiscount
				?? 0
		);
	}

	function getFeeBreakdown() {
		const marketInfo = $marketInfos[market];
		if (!marketInfo) return '';

		const currentFee = toNumber(marketInfo.fee);
		const baseFee = BASE_FEES_BPS[market] ?? toOptionalNumber(marketInfo.baseFee) ?? currentFee;
		const totalDiscount = Math.max(baseFee - currentFee, 0);
		const referralDiscount = Math.min(getReferralDiscountBps(marketInfo), totalDiscount);
		const stakingAndVolumeDiscount = Math.max(totalDiscount - referralDiscount, 0);

		return `
			<div class="fee-breakdown">
				<div><strong>Fee breakdown</strong></div>
				<div>Base fee: ${formatBps(baseFee)}</div>
				<div>CAP staking / volume discount: -${formatBps(stakingAndVolumeDiscount)}</div>
				<div>Referral discount: -${formatBps(referralDiscount)}</div>
				<div>Effective fee: ${formatBps(currentFee)}</div>
			</div>
		`;
	}

	let feeBreakdown = '';
	$: feeBreakdown = getFeeBreakdown(market, $marketInfos);

	$: tooltipOptions = {
		content: feeBreakdown,
		allowHTML: true,
		interactive: true,
		trigger: 'click mouseenter focus'
	};


</script>

<style>
	.fee-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex: 1 1 auto;
		font-size: 95%;
	}
	.label {
		color: var(--text400);
		text-transform: capitalize;
	}
	.value {
		cursor: help;
		text-transform: capitalize;
	}
	.value.secondary {
		color: var(--secondary);
	}
	:global(.fee-breakdown) {
		display: flex;
		flex-direction: column;
		gap: 4px;
		text-align: left;
	}
</style>

<div class='fee-row'>
	<div class='label'>Fee ({formatForDisplay(($marketInfos[market]?.fee || 0)/100)}%)</div>
	<div
		class='value'
		class:secondary={isSecondaryColor}
		tabindex='0'
		use:tooltip={tooltipOptions}
	>
		{feeAmount ? `${formatForDisplay(feeAmount)} ${asset}` : '-'}
	</div>
</div>
