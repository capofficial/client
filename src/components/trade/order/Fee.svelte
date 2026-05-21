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
		if (!totalSize || !market || !$marketInfos[market]) return 0;
		return totalSize * $marketInfos[market].fee * 1 / BPS_DIVIDER;
	}

	function toNum(v) {
		return v == null ? 0 : (v.toString ? v.toString() * 1 : v * 1);
	}

	function getReferralDiscountBps(info) {
		if (!info) return 0;
		return toNum(
			info.referralDiscountBps
			?? info.referralFeeDiscountBps
			?? info.referralDiscount
			?? info.referralFeeDiscount
			?? info.referralRebate
			?? 0
		);
	}

	function bpsToPercent(bps) {
		return formatForDisplay(100 * bps / BPS_DIVIDER) + '%';
	}

	function getFeeTooltip() {
		const info = $marketInfos[market];
		if (!info) return '';

		const baseFee = BASE_FEES_BPS[market] ?? toNum(info.fee);
		const currentFee = toNum(info.fee);
		const totalDiscount = Math.max(baseFee - currentFee, 0);
		const referralDiscount = Math.min(getReferralDiscountBps(info), totalDiscount);
		const stakingVolumeDiscount = Math.max(totalDiscount - referralDiscount, 0);

		return `
			<div style="display:flex;flex-direction:column;gap:4px;font-size:13px;line-height:1.4">
				<div style="font-weight:600;margin-bottom:2px">Fee breakdown</div>
				<div>Base fee: ${bpsToPercent(baseFee)}</div>
				<div>Staking & volume discount: -${bpsToPercent(stakingVolumeDiscount)}</div>
				<div>Referral discount: -${bpsToPercent(referralDiscount)}</div>
				<div style="border-top:1px solid rgba(255,255,255,0.15);padding-top:4px;margin-top:2px;font-weight:500">Effective fee: ${bpsToPercent(currentFee)}</div>
			</div>
		`;
	}

	let feeAmount = 0;
	$: feeAmount = getFeeAmount(totalSize, market, $marketInfos);
	$: feeTooltip = getFeeTooltip(market, $marketInfos);

	let tooltipOptions;
	$: tooltipOptions = {
		content: feeTooltip,
		allowHTML: true,
		interactive: true,
		trigger: 'click mouseenter focus'
	};

</script>

<style>
	.flex-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex: 1 1 auto;
		font-size: 95%;
	}
	.label {
		cursor: default;
		text-transform: capitalize;
		color: var(--text400);
	}
	.value {
		cursor: help;
		text-transform: capitalize;
	}
	.value.secondary {
		color: var(--secondary);
	}
</style>

<div class='flex-row'>
	<div class='label'>Fee ({formatForDisplay(($marketInfos[market]?.fee || 0)/100)}%)</div>
	<div class='value' class:secondary={isSecondaryColor} use:tooltip={tooltipOptions}>
		{feeAmount ? `${formatForDisplay(feeAmount)} ${asset}` : '-'}
	</div>
</div>
