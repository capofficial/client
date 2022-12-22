<script>

	import { onDestroy } from 'svelte'

	import Modal from './Modal.svelte'

	import LabelValue from '@components/layout/LabelValue.svelte'

	import { formatForDisplay, letterify } from '@lib/formatters'
	import { getUserVolume, getUserRebate, getUserVolumeRebate, getUserStakingRebate, getRebateParams, getUserFeesSaved, getReferralRebate } from '@api/discounts'
	import { getUserCAPStake } from '@api/cap'
	import { address, CAPStake, trailing30dayVolume, currentFeeRebate, feeRebateFromVolume, feeRebateFromStaking, totalFeesSaved, rebateParams, feeRebateFromReferral } from '@lib/stores'
	import { getAssets } from '@lib/utils'

	let assets = getAssets();

	let isLoading = true, t;
	async function fetchData() {
		// TODO: these should be grouped in one param
		clearTimeout(t);
		getUserVolume();
		getUserRebate();
		getUserVolumeRebate();
		getUserStakingRebate();
		getUserFeesSaved();
		getRebateParams();
		getUserCAPStake();
		getReferralRebate();
		t = setTimeout(fetchData, 60 * 1000);
	}
	$: fetchData($address);

	onDestroy(() => {
		clearTimeout(t);
	});

</script>

<style>
	.row {
		border-bottom: 1px solid var(--layer1-hover);
	}
	.row.nb, .row:last-child {
		border-bottom: none;
	}
	.row.hasNote {
	}
	.note {
		padding: 0 var(--base-padding);
		line-height: 1.458;
		color: var(--text1-alt);
		font-size: 80%;
		padding-right: 60px;
	}
	.note.b {
		border-bottom: 1px solid var(--layer1-hover);
		padding-bottom: var(--base-padding);
	}
</style>

<Modal title='Fee Discounts'>

	<div class='row'><LabelValue hasPadding={true} label='Current Discount Rate' value={`${100 * $currentFeeRebate}%`} /></div>

	<div class='row nb'><LabelValue hasPadding={true} label='30-day Weighted Volume' value={`${formatForDisplay($trailing30dayVolume)}`} note='This is equal to USD volume × Fee Percent × 100.' /></div>
	<div class='row nb hasNote'><LabelValue hasPadding={true} label='Discount from Volume' value={`${100 * $feeRebateFromVolume}%`} /></div>
	<div class='note b'>Discount starts at <strong>{formatForDisplay($rebateParams[2]/100)}%</strong> for <strong>{letterify($rebateParams[0])}</strong> in weighted volume and increases up to <strong>{formatForDisplay($rebateParams[3]/100)}%</strong> for <strong>{letterify($rebateParams[1])}</strong> in weighted volume.</div>

	<div class='row nb'><LabelValue hasPadding={true} label='CAP Staked' value={`${formatForDisplay($CAPStake)}`} /></div>
	<div class='row nb hasNote'><LabelValue hasPadding={true} label='Discount from CAP Staking' value={`${100 * $feeRebateFromStaking}%`} /></div>
	<div class='note b'>Discount starts at <strong>{formatForDisplay($rebateParams[6]/100)}%</strong> for <strong>{$rebateParams[4]}</strong> CAP staked and increases up to <strong>{formatForDisplay($rebateParams[7]/100)}%</strong> for <strong>{$rebateParams[5]}</strong> CAP staked.</div>

	<div class='row nb hasNote'><LabelValue hasPadding={true} label='Discount from Referral Code' value={`${100 * $feeRebateFromReferral}%`} /></div>
	<div class='note b'>Use a referral code to get a <strong>10%</strong> discount on your fees.</div>


	{#each assets as asset}
		<div class='row nb'><LabelValue hasPadding={true} label={`Total Fees Saved (${asset})`} value={formatForDisplay($totalFeesSaved[asset]) || 0} /></div>
	{/each}

</Modal>