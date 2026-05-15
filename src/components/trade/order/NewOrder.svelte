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
	import { calculateTPSLAmount, calculateTPSLPercent, calculateTPSLPrice } from '@lib/tpsl'
	import { focusInput, showModal } from '@lib/ui'
	import {getUserSetting, saveUserSetting, getSize} from '@lib/utils'
	import { connect } from '@lib/connect'

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
	const pricePresets = [-2, -1, 1, 2];
	const tpslPresets = [25, 50, 100];
	
	function setPrice(percentDiff) {
		if (!$prices[$selectedMarket]) return;
		price.set(formatForDisplay($prices[$selectedMarket] * (1 + percentDiff/100)));
		highlightedPriceButton = percentDiff;
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
			tpPrice.set();
		}
		if (!$hasSL || $isReduceOnly) {
			slLossPercent = undefined;
			slLossAmount = undefined;
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
		hasTrigger.set(false);
		hasTP.set(false);
		hasSL.set(false);
		isReduceOnly.set(false)
		isProtectedOrder.set(false);
	}
	
	$: resetOrderFields($selectedMarket);

	

	function getReferencePrice() {
		return $price * 1 > 0 ? $price : $prices[$selectedMarket];
	}

	function formatTPSLValue(value) {
		return value ? formatForDisplay(value) : undefined;
	}

	function setTPSLFromPercent(side, percent) {
		const targetPrice = calculateTPSLPrice({
			referencePrice: getReferencePrice(),
			pnlPercent: percent,
			leverage: $leverage,
			isLong: $isLong,
			side
		});
		const amount = calculateTPSLAmount({
			size: $size,
			pnlPercent: percent,
			leverage: $leverage
		});

		if (side == 'take-profit') {
			tpProfitPercent = formatTPSLValue(percent);
			tpProfitAmount = formatTPSLValue(amount);
			if (targetPrice) tpPrice.set(formatForDisplay(targetPrice));
		} else {
			slLossPercent = formatTPSLValue(percent);
			slLossAmount = formatTPSLValue(amount);
			if (targetPrice) slPrice.set(formatForDisplay(targetPrice));
		}
	}

	function calculateTPSLPercentFromPrices() {
		if ($tpPrice > 0 && tpPriceInputActive) {
			const percent = calculateTPSLPercent({
				referencePrice: getReferencePrice(),
				targetPrice: $tpPrice,
				leverage: $leverage,
				isLong: $isLong,
				side: 'take-profit'
			});
			tpProfitPercent = formatTPSLValue(percent);
			tpProfitAmount = formatTPSLValue(calculateTPSLAmount({ size: $size, pnlPercent: percent, leverage: $leverage }));
		}
		if ($slPrice > 0 && slPriceInputActive) {
			const percent = calculateTPSLPercent({
				referencePrice: getReferencePrice(),
				targetPrice: $slPrice,
				leverage: $leverage,
				isLong: $isLong,
				side: 'stop-loss'
			});
			slLossPercent = formatTPSLValue(percent);
			slLossAmount = formatTPSLValue(calculateTPSLAmount({ size: $size, pnlPercent: percent, leverage: $leverage }));
		}
	}

	function calculateTPSLFromPercent() {
		if (tpProfitPercent > 0 && tpPercentInputActive) {
			setTPSLFromPercent('take-profit', tpProfitPercent);
		}
		if (slLossPercent > 0 && slPercentInputActive) {
			setTPSLFromPercent('stop-loss', slLossPercent);
		}
	}

	function calculateTPSLFromAmount() {
		if (tpProfitAmount > 0 && tpAmountInputActive) {
			const percent = calculateTPSLPercent({ pnlAmount: tpProfitAmount, size: $size, leverage: $leverage });
			setTPSLFromPercent('take-profit', percent);
		}
		if (slLossAmount > 0 && slAmountInputActive) {
			const percent = calculateTPSLPercent({ pnlAmount: slLossAmount, size: $size, leverage: $leverage });
			setTPSLFromPercent('stop-loss', percent);
		}
	}

	function syncTPSLAmountsFromPercent() {
		if (tpProfitPercent > 0 && !tpAmountInputActive) {
			tpProfitAmount = formatTPSLValue(calculateTPSLAmount({ size: $size, pnlPercent: tpProfitPercent, leverage: $leverage }));
		}
		if (slLossPercent > 0 && !slAmountInputActive) {
			slLossAmount = formatTPSLValue(calculateTPSLAmount({ size: $size, pnlPercent: slLossPercent, leverage: $leverage }));
		}
	}

	$: calculateTPSLPercentFromPrices($tpPrice, $slPrice);
	$: calculateTPSLFromPercent(tpProfitPercent, slLossPercent);
	$: calculateTPSLFromAmount(tpProfitAmount, slLossAmount);
	$: syncTPSLAmountsFromPercent($size, $leverage);

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
	.price-buttons button {
		flex: 1;
		text-align: center;
		border: 1px solid var(--layer200);
		padding: 8px 0;
		cursor: pointer;
		font-size: 80%;
		font-weight: 600;
		border-radius: var(--base-radius);
		background-color: transparent;
		color: inherit;
	}
	.price-buttons button.highlighted {
		background-color: var(--layer100);
	}
	.tpsl-summary {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 10px;
		font-size: 85%;
		color: var(--text300);
	}
	.tpsl-summary strong {
		color: var(--text0);
		font-weight: 600;
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
					<div class='semi-padding-bottom price-buttons'>
						{#each pricePresets as preset}
							<button type='button' class:highlighted={highlightedPriceButton == preset} on:click={() => setPrice(preset)}>{preset > 0 ? '+' : ''}{preset}%</button>
						{/each}
					</div>
				{/if}

				{#if !$isReduceOnly}

					<div class='semi-padding-bottom row tpsl-header'>
						<Checkbox label='Take-Profit' bind:value={$hasTP} isSecondaryColor={!$isLong} />
					</div>

					{#if $hasTP}
						<div>
							<div class='semi-padding-bottom'>
								<div class='semi-padding-bottom'>
									<Input label='TP Price' bind:value={$tpPrice} isSecondaryColor={!$isLong} on:focus={() => {tpPriceInputActive = true}} on:blur={() => {tpPriceInputActive = false}} />
								</div>
								<div class='semi-padding-bottom'>
									<Input label='Profit (%)' bind:value={tpProfitPercent} isSecondaryColor={!$isLong} on:focus={() => {tpPercentInputActive = true}} on:blur={() => {tpPercentInputActive = false}} />
								</div>
								<div class='semi-padding-bottom'>
									<Input label={`Profit (${$selectedAsset})`} bind:value={tpProfitAmount} isSecondaryColor={!$isLong} on:focus={() => {tpAmountInputActive = true}} on:blur={() => {tpAmountInputActive = false}} />
								</div>
								<div class='semi-padding-bottom price-buttons'>
									{#each tpslPresets as preset}
										<button type='button' on:click={() => setTPSLFromPercent('take-profit', preset)}>+{preset}%</button>
									{/each}
								</div>
								<div class='semi-padding-bottom tpsl-summary'>
									<span>Target price <strong>{formatForDisplay($tpPrice) || '-'}</strong></span>
									<span>Est. profit <strong>{formatForDisplay(tpProfitAmount) || '-'} {$selectedAsset}</strong></span>
								</div>
							</div>

						</div>
					{/if}

					<div class='semi-padding-bottom row tpsl-header'>
						<Checkbox label='Stop-Loss' bind:value={$hasSL} isSecondaryColor={!$isLong} />
					</div>

					{#if $hasSL}
						<div>
							<div>
								<div class='semi-padding-bottom'>
									<Input label='SL Price' bind:value={$slPrice} isSecondaryColor={!$isLong} on:focus={() => {slPriceInputActive = true}} on:blur={() => {slPriceInputActive = false}} />
								</div>
								<div class='semi-padding-bottom'>
									<Input label='Loss (%)' bind:value={slLossPercent} isSecondaryColor={!$isLong} on:focus={() => {slPercentInputActive = true}} on:blur={() => {slPercentInputActive = false}} />
								</div>
								<div class='semi-padding-bottom'>
									<Input label={`Loss (${$selectedAsset})`} bind:value={slLossAmount} isSecondaryColor={!$isLong} on:focus={() => {slAmountInputActive = true}} on:blur={() => {slAmountInputActive = false}} />
								</div>
								<div class='semi-padding-bottom price-buttons'>
									{#each tpslPresets as preset}
										<button type='button' on:click={() => setTPSLFromPercent('stop-loss', preset)}>-{preset}%</button>
									{/each}
								</div>
								<div class='semi-padding-bottom tpsl-summary'>
									<span>Trigger price <strong>{formatForDisplay($slPrice) || '-'}</strong></span>
									<span>Est. loss <strong>{formatForDisplay(slLossAmount) || '-'} {$selectedAsset}</strong></span>
								</div>
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
