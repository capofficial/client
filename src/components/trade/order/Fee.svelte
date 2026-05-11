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

	function toNumber(value) {
		if (value == null) return 0;
		return value.toString ? value.toString() * 1 : value * 1;
	}

	function getReferralDiscountBps(marketInfo) {
		if (!marketInfo) return 0;

		const referralDiscount = marketInfo.referralDiscountBps
			?? marketInfo.referralFeeDiscountBps
			?? marketInfo.referralDiscount
			?? marketInfo.referralFeeDiscount
			?? marketInfo.referralFee
			?? marketInfo.referralRebate
			?? 0;

		return toNumber(referralDiscount);
	}

	function formatPercentFromBps(bps) {
		return `${formatForDisplay(100 * bps / BPS_DIVIDER)}%`;
	}

	function getFeeDetails() {
		const marketInfo = $marketInfos[market];
		if (!marketInfo) return '';

		const configuredBaseFee = BASE_FEES_BPS[market];
		const baseFeeFromMarket = marketInfo.baseFee == null ? undefined : toNumber(marketInfo.baseFee);
		const baseFee = configuredBaseFee ?? baseFeeFromMarket ?? toNumber(marketInfo.fee);
		const currentFee = toNumber(marketInfo.fee);
		const totalDiscount = Math.max(baseFee - currentFee, 0);
		const referralDiscount = Math.min(getReferralDiscountBps(marketInfo), totalDiscount || Number.MAX_SAFE_INTEGER);
		const capAndVolumeDiscount = Math.max(totalDiscount - referralDiscount, 0);

		return `
			<div class='fee-details'>
				<div><strong>Fee breakdown</strong></div>
				<div>Base fee: ${formatPercentFromBps(baseFee)}</div>
				<div>CAP staking / 30-day volume discount: ${formatPercentFromBps(capAndVolumeDiscount)}</div>
				<div>Referral discount: ${formatPercentFromBps(referralDiscount)}</div>
				<div>Effective fee: ${formatPercentFromBps(currentFee)}</div>
			</div>
		`;
	}

	let feeAmount = 0;
	$: feeAmount = getFeeAmount(totalSize, market, $marketInfos);
	$: feeDetails = getFeeDetails(market, $marketInfos);

	let tooltipOptions;
	$: tooltipOptions = {
		content: feeDetails,
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
	:global(.fee-details) {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
</style>

<div class='flex-row'>
	<div class='label'>Fee ({formatForDisplay(($marketInfos[market]?.fee || 0)/100)}%)</div>
	<div class='value' class:secondary={isSecondaryColor} use:tooltip={tooltipOptions}>
		{feeAmount ? `${formatForDisplay(feeAmount)} ${asset}` : '-'}
	</div>
</div>
