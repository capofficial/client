<script>
	import { onMount } from 'svelte'
	import { submitAddMargin, submitRemoveMargin } from '@api'
	import { getLiquidationPrice } from '@lib/utils'
	import { addMarginAmount, removeMarginAmount } from '@lib/stores'
	import { showToast } from '@lib/ui'
	import { focusInput } from '@lib/utils'
	let loading = false
	let errors = {}

	$: newLiquidationPrice = data.isAdding ? getLiquidationPrice(data.position, $addMarginAmount) : getLiquidationPrice(data.position, -$removeMarginAmount)
	$: currentLiquidationPrice = data.position.liquidationPrice

	async function handleSubmit() {
		errors = {}
		if (!amount) {
				</div>
			</div>

			<div class='row'>
				<div class='label'>Current Liquidation Price</div>
				<div class='value'>{currentLiquidationPrice ? `$${formatNumber(currentLiquidationPrice)}` : '-'}</div>
			</div>

			{#if amount}
			<div class='row'>
				<div class='label'>New Liquidation Price</div>
				<div class='value'>{newLiquidationPrice ? `$${formatNumber(newLiquidationPrice)}` : '-'}</div>
			</div>
			{/if}

			<div class='buttons'>
				<Button isLoading={loading} label={data.isAdding ? 'Add Margin' : 'Remove Margin'} />
			</div>
		margin-bottom: 20px;
	}

	.row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 12px;
		font-size: 14px;
	}
	.label { color: var(--text-secondary); }
	.value { font-weight: 600; }

	.buttons {
		margin-top: 20px;
	}