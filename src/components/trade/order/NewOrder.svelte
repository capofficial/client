<script>

	import { onMount, onDestroy } from 'svelte'

	import Input from '@components/layout/Input.svelte'
	import Checkbox from '@components/layout/Checkbox.svelte'
	import Button from '@components/layout/Button.svelte'
	import LabelValue from '@components/layout/LabelValue.svelte'
	import Slider from '@components/layout/Slider.svelte'

	import DirectionSelect from './DirectionSelect.svelte'
	import AssetLeverageSelect from './AssetLeverageSelect.svelte'
	import OrderDetails from './OrderDetails.svelte'

	import { BPS_DIVIDER } from '@lib/config'
	import { CHEVRON_DOWN, XMARK_ICON, INFO_ICON_CIRCLE } from '@lib/icons'
	import { formatForDisplay, numberWithCommas } from '@lib/formatters'
	import { focusInput, showModal } from '@lib/ui'
	import {getUserSetting, saveUserSetting, getSize} from '@lib/utils'
	import { connect } from '@lib/connect'
	import {
		getEntryPrice,
		getTPSLMetricsFromPrice,
		getTPSLPriceFromAmount,
		getTPSLPriceFromMovePercent,
		getTPSLPriceFromPercent
	} from '@lib/tpsl'

	import {
		address,
		allowances,
		isLong,
		selectedAsset,
		selectedMarket,
		size,
		buyingPower,
		price,
		hasTrigger,
		hasTP,
		hasSL,
		tpPrice,
		slPrice,
		leverage,
		priceAsset,
		isReduceOnly,
		margin,
		sizeInUsd,
		liquidationPrice,
		isProtectedOrder,
		balances,
		maxSize,
		prices,
		priceTimestamps,
		submittingOrder
	} from '@lib/stores'

	import { approveAsset, getAllowance, getUserAssetBalances } from '@api/assets'
	import { submitOrder } from '@api/orders'

	let showAdvanced = false;
	
	function clearAdvanced(_showAdvanced) {
		if (_showAdvanced) return;
		tpPrice.set();
		slPrice.set();
		isReduceOnly.set(false);
		hasTrigger.set(false);
		hasTP.set(false);
		hasSL.set(false);
		isProtectedOrder.set(false);
	}
	$: clearAdvanced(showAdvanced);
	
	let highlightedPriceButton;
	async function submit() {
		if (!$size) return;
		submitOrder();
		highlightedPriceButton = null;
	}

	let isApproving = false;
	async function _approveAsset() {
		isApproving = true;
		const success = await approveAsset($selectedAsset, 'FundStore');
		isApproving = false;
	}

	$: getAllowance($selectedAsset, 'FundStore');

	// User asset balances
	let t1;
	async function fetchData() {
		clearTimeout(t1);
		await getUserAssetBalances([$selectedAsset]);
		t1 = setTimeout(fetchData, 30 * 1000);
	}
	$: fetchData($address, $selectedAsset);

	let t9,timeoutElapsed;
	onMount(() => {
		t9 = setTimeout(() => {
			timeoutElapsed = true;
		}, 10000)
	})

	onDestroy(() => {
		clearTimeout(t1);
		clearTimeout(t9);
	});

	let sizeHighlighted;

	// $: console.log('$size', $size);

	let tpProfitPercent, tpProfitAmount, slLossPercent, slLossAmount;
	let tpPriceInputActive, tpPercentInputActive, tpAmountInputActive, slPriceInputActive, slPercentInputActive, slAmountInputActive;
	let highlightedTPButton, highlightedSLButton;
	const tpslMovePresets = [1, 2, 5];
	
	function setPrice(percentDiff) {
		if (!$prices[$selectedMarket]) return;
		price.set(formatForDisplay($prices[$selectedMarket] * (1 + percentDiff/100)));
		highlightedPriceButton = percentDiff;
	}

	function getCurrentTPSLEntryPrice() {
		return getEntryPrice($price, $prices[$selectedMarket]);
	}

	function getTPSLPresetLabel(isProfitTarget, percent) {
		const sign = isProfitTarget === $isLong ? '+' : '-';
		return `${sign}${percent}%`;
	}

	function formatTPSLValue(value) {
		return value > 0 ? formatForDisplay(value) : undefined;
	}

	function syncTPMetrics(targetPrice = $tpPrice) {
		const metrics = getTPSLMetricsFromPrice(getCurrentTPSLEntryPrice(), targetPrice, $size, $leverage, $isLong, true);
		if (!metrics.isValid) {
			tpProfitPercent = undefined;
			tpProfitAmount = undefined;
			return;
		}
		if (!tpPercentInputActive) tpProfitPercent = formatTPSLValue(metrics.pnlPercent);
		if (!tpAmountInputActive) tpProfitAmount = formatTPSLValue(metrics.pnlAmount);
	}

	function syncSLMetrics(targetPrice = $slPrice) {
		const metrics = getTPSLMetricsFromPrice(getCurrentTPSLEntryPrice(), targetPrice, $size, $leverage, $isLong, false);
		if (!metrics.isValid) {
			slLossPercent = undefined;
			slLossAmount = undefined;
			return;
		}
		if (!slPercentInputActive) slLossPercent = formatTPSLValue(metrics.pnlPercent);
		if (!slAmountInputActive) slLossAmount = formatTPSLValue(metrics.pnlAmount);
	}

	function setTPSLFromPreset(isProfitTarget, percent) {
		const targetPrice = getTPSLPriceFromMovePercent(getCurrentTPSLEntryPrice(), percent, $isLong, isProfitTarget);
		if (!targetPrice) return;
		if (isProfitTarget) {
			tpPrice.set(formatForDisplay(targetPrice));
			highlightedTPButton = percent;
			syncTPMetrics(targetPrice);
		} else {
			slPrice.set(formatForDisplay(targetPrice));
			highlightedSLButton = percent;
			syncSLMetrics(targetPrice);
		}
	}

	function resetFieldsOnCheck() {
		if ($hasTP || $hasSL) {
			isReduceOnly.set(false);
		}
		if ($isReduceOnly) {
			hasTP.set(false);
			hasSL.set(false);
		}
		if (!$hasTP || $isReduceOnly) {
			tpProfitPercent = undefined;
			tpProfitAmount = undefined;
			highlightedTPButton = undefined;
			tpPrice.set();
		}
		if (!$hasSL || $isReduceOnly) {
			slLossPercent = undefined;
			slLossAmount = undefined;
			highlightedSLButton = undefined;
			slPrice.set();
		}
	}

	$: resetFieldsOnCheck($hasTP, $hasSL, $isReduceOnly);
	
  	// reset inputs on market change
	function resetOrderFields() {
		highlightedPriceButton = null;
		price.set();
		size.set();
		tpPrice.set();
		slPrice.set();
		showAdvanced = false;
		tpProfitAmount = undefined;
		slLossAmount = undefined;
		highlightedTPButton = undefined;
		highlightedSLButton = undefined;
		hasTrigger.set(false);
		hasTP.set(false);
		hasSL.set(false);
		isReduceOnly.set(false)
		isProtectedOrder.set(false);
	}
	
	$: resetOrderFields($selectedMarket);

	

	function calculateTPSLPercentFromPrices() {
		if ($tpPrice > 0 && !tpPercentInputActive && !tpAmountInputActive) {
			syncTPMetrics();
		}
		if ($slPrice > 0 && !slPercentInputActive && !slAmountInputActive) {
			syncSLMetrics();
		}
	}

	function calculateTPSLFromPercent() {
		const entryPrice = getCurrentTPSLEntryPrice();
		if (tpProfitPercent > 0 && tpPercentInputActive) {
			const targetPrice = getTPSLPriceFromPercent(entryPrice, tpProfitPercent, $leverage, $isLong, true);
			tpPrice.set(formatTPSLValue(targetPrice));
			highlightedTPButton = undefined;
			if (targetPrice) {
				syncTPMetrics(targetPrice);
			} else {
				tpProfitAmount = undefined;
			}
		}
		if (slLossPercent > 0 && slPercentInputActive) {
			const targetPrice = getTPSLPriceFromPercent(entryPrice, slLossPercent, $leverage, $isLong, false);
			slPrice.set(formatTPSLValue(targetPrice));
			highlightedSLButton = undefined;
			if (targetPrice) {
				syncSLMetrics(targetPrice);
			} else {
				slLossAmount = undefined;
			}
		}
	}

	function calculateTPSLFromAmount() {
		const entryPrice = getCurrentTPSLEntryPrice();
		if (tpProfitAmount > 0 && tpAmountInputActive) {
			const targetPrice = getTPSLPriceFromAmount(entryPrice, tpProfitAmount, $size, $isLong, true);
			tpPrice.set(formatTPSLValue(targetPrice));
			highlightedTPButton = undefined;
			if (targetPrice) {
				syncTPMetrics(targetPrice);
			} else {
				tpProfitPercent = undefined;
			}
		}
		if (slLossAmount > 0 && slAmountInputActive) {
			const targetPrice = getTPSLPriceFromAmount(entryPrice, slLossAmount, $size, $isLong, false);
			slPrice.set(formatTPSLValue(targetPrice));
			highlightedSLButton = undefined;
			if (targetPrice) {
				syncSLMetrics(targetPrice);
			} else {
				slLossPercent = undefined;
			}
		}
	}

	$: calculateTPSLPercentFromPrices($tpPrice, $slPrice, $size, $leverage, $isLong, $selectedMarket);
	$: calculateTPSLFromPercent(tpProfitPercent, slLossPercent);
	$: calculateTPSLFromAmount(tpProfitAmount, slLossAmount);

	function _focusInput(name, isActive) {
		if (!isActive) return;
		setTimeout(() => {
			focusInput(name);
		}, 100);
	}

	$: _focusInput('Price', $hasTrigger);
	$: _focusInput('TP Price', $hasTP);
	$: _focusInput('SL Price', $hasSL);
	$: _focusInput('Best Price', $isProtectedOrder);
	
</script>

<style>

	.new-order {
		height: 100%;
		background-color: var(--layer25);
		overflow-y: scroll;
		/*box-shadow:
		0px 6px 10px 0px hsla(0,0%,0%,0.14), 
		0px 1px 18px 0px hsla(0,0%,0%,0.12), 
		0px 3px 5px -1px hsla(0,0%,0%,0.2);*/
	}

	.header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 70px;
		background-color: var(--layer0);
		padding-right: 25px;
	}

	.body {
		padding: 25px;
	}

	.order-type {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.info-icon {
		display: flex;
		align-items: center;
		padding: 4px;
		border-radius: 4px;
		display: none;
	}
	.info-icon:hover {
		background-color: var(--layer100);
	}
	.info-icon :global(svg) {
		fill: currentColor;
		width: 14px;
	}

	.advanced-handle {
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.advanced-handle :global(svg) {
		fill: currentColor;
		width: 12px;
	}
	
	.row {

	}

	.bottom-border {
		border-bottom: 1px solid var(--layer100);
	}
	.bottom-spacing {
		padding-bottom: 16px;
	}
	.top-spacing {
		padding-top: 16px;
	}
	.slider-container {
		padding-left: 5px;
		padding-right: 5px;
	}
	.price-buttons {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
	}
	.price-buttons a {
		flex: 1;
		text-align: center;
		border: 1px solid var(--layer200);
		padding: 8px 0;
		cursor: pointer;
		font-size: 80%;
		font-weight: 600;
		border-radius: var(--base-radius);
	}
	.price-buttons a.highlighted {
		background-color: var(--layer100);
	}
	.warning {
		color: var(--error);
		font-size: 80%;
		line-height: 1.318;
	}
	.tpsl-header {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
	}
	.tpsl-help-button {
		padding: 6px 12px;
		background-color: var(--layer100);
		border-radius: var(--base-radius);
	}
	.tpsl-help-button:hover {
		background-color: var(--layer200);
	}
	.tpsl-preset-buttons {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 8px;
		padding-bottom: var(--semi-padding);
	}
	.tpsl-preset-buttons button {
		text-align: center;
		border: 1px solid var(--layer200);
		border-radius: var(--base-radius);
		padding: 6px 0;
		font-size: 75%;
		font-weight: 600;
		background: transparent;
		color: var(--text200);
		font-family: inherit;
		line-height: 1.318;
		cursor: pointer;
	}
	.tpsl-preset-buttons button:hover,
	.tpsl-preset-buttons button.highlighted {
		background-color: var(--layer100);
	}

</style>

<div class='new-order no-scrollbar'>

	<div class='header'>
		<DirectionSelect />
		<AssetLeverageSelect />
	</div>

	<div class='body'>

		<form on:submit|preventDefault={submit}>

			<div class='bottom-spacing' class:bottom-border={$isReduceOnly}>
				<Input label={`Size (${$selectedAsset})`} bind:value={$size} isSecondaryColor={!$isLong} placeholder={`0.0`} isInvalid={$isReduceOnly ? false : $maxSize && $size > formatForDisplay($maxSize) * 1} />
			</div>
			
			{#if !$isReduceOnly}
			<div class='slider-container bottom-spacing'>
				<Slider bind:value={$size} maxValue={$maxSize} bind:isActive={sizeHighlighted} isSecondaryColor={!$isLong} nullValue={true} />
			</div>

			<div class='bottom-spacing bottom-border'>
				<LabelValue 
					label={`${$isLong ? 'Buying Power' : 'Selling Power'}`}
					value={`${numberWithCommas($maxSize)} ${$selectedAsset}`}
					on:click={size.set(formatForDisplay($maxSize))}
				/>
			</div>
			{/if}

			<div class='top-spacing bottom-spacing advanced-handle' on:click={() => showAdvanced = !showAdvanced}>
				Options {#if showAdvanced}{@html XMARK_ICON}{:else}{@html CHEVRON_DOWN}{/if}
			</div>

			{#if showAdvanced}
			<div class='bottom-spacing'>

				<div class='semi-padding-bottom row tpsl-header'>
					<Checkbox label='Limit / Stop' bind:value={$hasTrigger} isSecondaryColor={!$isLong} />
				</div>

				{#if $hasTrigger}
					<div class='semi-padding-bottom'>
						<Input label={'Price'} bind:value={$price} isSecondaryColor={!$isLong} />
					</div>
				{/if}

				{#if !$isReduceOnly}

					<div class='semi-padding-bottom row tpsl-header'>
						<Checkbox label='Take-Profit' bind:value={$hasTP} isSecondaryColor={!$isLong} />
					</div>

					{#if $hasTP}
						<div>
							<div class='tpsl-preset-buttons'>
								{#each tpslMovePresets as preset}
									<button type='button' class:highlighted={highlightedTPButton === preset} on:click={() => setTPSLFromPreset(true, preset)}>{getTPSLPresetLabel(true, preset)}</button>
								{/each}
							</div>
							<div class='semi-padding-bottom'>
								<Input label='TP Price' bind:value={$tpPrice} isSecondaryColor={!$isLong} on:focus={() => {tpPriceInputActive = true}} on:blur={() => {tpPriceInputActive = false}} />
							</div>
							<div class='semi-padding-bottom'>
								<Input label='Profit (%)' bind:value={tpProfitPercent} isSecondaryColor={!$isLong} on:focus={() => {tpPercentInputActive = true}} on:blur={() => {tpPercentInputActive = false}} />
							</div>
							<div class='semi-padding-bottom'>
								<Input label={`Profit (${$selectedAsset})`} bind:value={tpProfitAmount} isSecondaryColor={!$isLong} on:focus={() => {tpAmountInputActive = true}} on:blur={() => {tpAmountInputActive = false}} />
							</div>
						</div>
					{/if}

					<div class='semi-padding-bottom row tpsl-header'>
						<Checkbox label='Stop-Loss' bind:value={$hasSL} isSecondaryColor={!$isLong} />
					</div>

					{#if $hasSL}
						<div>
							<div class='tpsl-preset-buttons'>
								{#each tpslMovePresets as preset}
									<button type='button' class:highlighted={highlightedSLButton === preset} on:click={() => setTPSLFromPreset(false, preset)}>{getTPSLPresetLabel(false, preset)}</button>
								{/each}
							</div>
							<div class='semi-padding-bottom'>
								<Input label='SL Price' bind:value={$slPrice} isSecondaryColor={!$isLong} on:focus={() => {slPriceInputActive = true}} on:blur={() => {slPriceInputActive = false}} />
							</div>
							<div class='semi-padding-bottom'>
								<Input label='Loss (%)' bind:value={slLossPercent} isSecondaryColor={!$isLong} on:focus={() => {slPercentInputActive = true}} on:blur={() => {slPercentInputActive = false}} />
							</div>
							<div class='semi-padding-bottom'>
								<Input label={`Loss (${$selectedAsset})`} bind:value={slLossAmount} isSecondaryColor={!$isLong} on:focus={() => {slAmountInputActive = true}} on:blur={() => {slAmountInputActive = false}} />
							</div>
						</div>
					{/if}

				{/if}

				{#if !$hasTP && !$hasSL}

					<div class='semi-padding-bottom row'>
						<Checkbox label='Reduce-Only' bind:value={$isReduceOnly} isSecondaryColor={!$isLong} />
					</div>

					{#if !$hasTrigger}
						<div class='row semi-padding-bottom'>
							<Checkbox label='Protected Order' bind:value={$isProtectedOrder} isSecondaryColor={!$isLong} />
						</div>

						{#if $isProtectedOrder}
							<div>
								<Input label='Best Price' bind:value={$price} isSecondaryColor={!$isLong} />
							</div>
						{/if}

					{/if}

				{/if}

			</div>
			{/if}

			<div class='buttons bottom-spacing'>
				{#if $address}
					{#if $selectedAsset != 'ETH' && $allowances[$selectedAsset]?.['FundStore'] * 1 <= $margin * 1}
					<Button noSubmit={true} isLoading={isApproving} isRed={!$isLong} label={`Approve ${$selectedAsset}`} on:click={_approveAsset} />
					{:else}
					<Button isLoading={$submittingOrder} isRed={!$isLong} label={`${$isLong ? 'Buy / Long' : 'Sell / Short'}`} />
					{/if}
				{:else}
					<Button noSubmit={true} isRed={!$isLong} label={`Connect Wallet`} on:click={() => {connect()}} />
				{/if}
			</div>

			

		</form>
		
		<div class='od'>
			<OrderDetails market={$selectedMarket} asset={$selectedAsset} size={$size} />
		</div>

		<!-- {#if timeoutElapsed && (!$priceTimestamps[$selectedMarket] || $priceTimestamps[$selectedMarket] * 1 < Date.now() / 1000 - 2 * 60)}
		<div class='top-spacing warning'>
			<strong>Market closed.</strong> This market's price hasn't changed in a while. Submitted orders might be cancelled.
		</div>
		{/if} -->
		
	</div>

</div>
