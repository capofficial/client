<script>

	import { onMount, onDestroy } from 'svelte'

	import Input from '@components/layout/Input.svelte'
	import DDInput from '@components/layout/DropdownInput.svelte'
	import Checkbox from '@components/layout/Checkbox.svelte'
	import Button from '@components/layout/Button.svelte'
	import LabelValue from '@components/layout/LabelValue.svelte'
	import Slider from '@components/layout/Slider.svelte'

	import DirectionSelect from './DirectionSelect.svelte'
	import AssetLeverageSelect from './AssetLeverageSelect.svelte'
	import OrderTypeSelect from './OrderTypeSelect.svelte'
	import OrderDetails from './OrderDetails.svelte'

	import { BPS_DIVIDER } from '@lib/config'
	import { CHEVRON_DOWN, XMARK_ICON, INFO_ICON_CIRCLE } from '@lib/icons'
	import { formatForDisplay } from '@lib/formatters'
	import { focusInput, showModal } from '@lib/ui'
	import {getUserSetting, saveUserSetting, getSize} from '@lib/utils'

	import {
		address,
		allowances,
		isLong,
		orderType,
		selectedAsset,
		selectedMarket,
		size,
		buyingPower,
		price,
		hasTPSL,
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
		submittingOrder
	} from '@lib/stores'

	import { approveAsset, getAllowance, getUserAssetBalances } from '@api/assets'
	import { submitOrder } from '@api/orders'

	let showAdvanced = false;
	let displaySizeOrMargin;

	onMount(() => {
		displaySizeOrMargin = getUserSetting('displaySizeOrMargin');
		if (!displaySizeOrMargin) setDisplaySizeOrMargin('Margin')
	})

	function setDisplaySizeOrMargin(sizeOrMargin) {
		displaySizeOrMargin = sizeOrMargin;
		saveUserSetting('displaySizeOrMargin', sizeOrMargin)
	}
	
	function clearAdvanced(_showAdvanced) {
		if (_showAdvanced) return;
		tpPrice.set();
		slPrice.set();
		isReduceOnly.set(false);
		hasTPSL.set(false);
		isProtectedOrder.set(false);
	}
	$: clearAdvanced(showAdvanced);
	
	let highlightedPriceButton;
	async function submit() {
		if (!$size) return focusInput('Size');
		if ($orderType != 0 && !$price || $isProtectedOrder && !$price) {
			if ($orderType == 1) return focusInput('Limit Price');
			if ($orderType == 2) return focusInput('Stop Price');
		}
		if ($hasTPSL && !$tpPrice && !$slPrice) return focusInput('TP Price');
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

	onDestroy(() => {
		clearTimeout(t1);
	});

	let sizeHighlighted;

	// $: console.log('$size', $size);

	
	function setPrice(percentDiff) {
		if (!$prices[$selectedMarket]) return;
		price.set(formatForDisplay($prices[$selectedMarket] * (1 + percentDiff/100)));
		highlightedPriceButton = percentDiff;
	}

	let showPriceExecutionWarning;

	function checkWarning() {
		if ($orderType == 0 || !$price || !$prices[$selectedMarket]) {
			showPriceExecutionWarning = false;
			return;
		}
		if ($orderType == 1 && $isLong || $orderType == 2 && !$isLong) {
			if ($price >= $prices[$selectedMarket]) {
				showPriceExecutionWarning = true;
				return;
			}
		}
		if ($orderType == 1 && !$isLong || $orderType == 2 && $isLong) {
			if ($price <= $prices[$selectedMarket]) {
				showPriceExecutionWarning = true;
				return;
			}
		}

		showPriceExecutionWarning = false;
	}

	$: checkWarning($prices[$selectedMarket], $price, $orderType, $isLong);
	
  	// reset inputs on market change
	function resetOrderFields() {
		highlightedPriceButton = null;
    		price.set();
    		size.set();
    		tpPrice.set();
    		slPrice.set();
    		hasTPSL.set(false);
		isReduceOnly.set(false)
    		isProtectedOrder.set(false);
	}
	
	$: resetOrderFields($selectedMarket)
	
</script>

<style>

	.new-order {
		height: 100%;
		background-color: var(--layer25);
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
		font-size: 90%;
	}
	.advanced-handle :global(svg) {
		fill: currentColor;
		width: 10px;
	}
	
	.group {
		padding-bottom: 25px;
	}
	.row {
		font-size: 90%;
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

<div class='new-order'>

	<div class='header'>
		<DirectionSelect />
		<AssetLeverageSelect />
	</div>

	<div class='body'>

		<div class='order-type'>
			<OrderTypeSelect />
			<div class='info-icon'>{@html INFO_ICON_CIRCLE}</div>
		</div>

		<form on:submit|preventDefault={submit}>

			{#if $orderType == 1 || $orderType == 2}
				<div class='top-spacing'>
					<Input label={$orderType == 1 ? 'Limit Price' : 'Stop Price'} bind:value={$price} isSecondaryColor={!$isLong} on:click={() => {highlightedPriceButton = null}} />
				</div>
				<div class='top-spacing bottom-border'>
					<div class='price-buttons bottom-spacing'>
						{#if $orderType == 1 && !$isLong || $orderType == 2 && $isLong}
							<a on:click={() => {setPrice(2)}} class:highlighted={highlightedPriceButton == 2}>2%↑</a>
							<a on:click={() => {setPrice(5)}} class:highlighted={highlightedPriceButton == 5}>5%↑</a>
							<a on:click={() => {setPrice(10)}} class:highlighted={highlightedPriceButton == 10}>10%↑</a>
							<a on:click={() => {setPrice(20)}} class:highlighted={highlightedPriceButton == 20}>20%↑</a>
						{:else}
							<a on:click={() => {setPrice(-2)}} class:highlighted={highlightedPriceButton == -2}>2%↓</a>
							<a on:click={() => {setPrice(-5)}} class:highlighted={highlightedPriceButton == -5}>5%↓</a>
							<a on:click={() => {setPrice(-10)}} class:highlighted={highlightedPriceButton == -10}>10%↓</a>
							<a on:click={() => {setPrice(-20)}} class:highlighted={highlightedPriceButton == -20}>20%↓</a>
						{/if}
					</div>
					{#if showPriceExecutionWarning}
					<div class='warning bottom-spacing'>This order could execute immediately at the current market price.</div>
					{/if}
				</div>
			{/if}

			<div class='top-spacing bottom-spacing'>
				<DDInput label='Size' setDisplaySizeOrMargin={setDisplaySizeOrMargin} displaySizeOrMargin={displaySizeOrMargin} value={displaySizeOrMargin == 'Margin' ? ($margin.toFixed(4)) : $size} onChangeValue={newValue => size.set(displaySizeOrMargin == 'Margin' ? getSize(newValue, $leverage) : newValue)} isSecondaryColor={!$isLong} placeholder={`0.0 ${$selectedAsset}`} isInvalid={$maxSize && $size > formatForDisplay($maxSize) * 1} />
			</div>
			
			<div class='slider-container bottom-spacing'>
				<Slider bind:value={$size} maxValue={$maxSize} bind:isActive={sizeHighlighted} isSecondaryColor={!$isLong} nullValue={true} />
			</div>

			<div class='bottom-spacing bottom-border'>
				<LabelValue 
					label={`${$isLong ? 'Buying Power' : 'Selling Power'}`}
					value={`${formatForDisplay($maxSize)} ${$selectedAsset}`}
					on:click={size.set(formatForDisplay($maxSize))}
				/>
			</div>

			<div class='top-spacing bottom-spacing advanced-handle' on:click={() => showAdvanced = !showAdvanced}>
				Advanced {#if showAdvanced}{@html XMARK_ICON}{:else}{@html CHEVRON_DOWN}{/if}
			</div>

			{#if showAdvanced}
			<div class='bottom-spacing'>

				<div class='semi-padding-bottom row tpsl-header'>
					<Checkbox label='Take-Profit / Stop-Loss' bind:value={$hasTPSL} isSecondaryColor={!$isLong} />
					{#if $hasTPSL}
					<a class='tpsl-help-button' on:click|stopPropagation={() => {showModal('AdvancedTPSL')}}>Details</a>
					{/if}
				</div>

				{#if $hasTPSL}
					<div>
						<div class='semi-padding-bottom'>
							<Input label='TP Price' bind:value={$tpPrice} isSecondaryColor={!$isLong} />
						</div>

						<div>
							<Input label='SL Price' bind:value={$slPrice} isSecondaryColor={!$isLong} />
						</div>

					</div>
				{/if}

				{#if !$hasTPSL}

					<div class='semi-padding-bottom row'>
						<Checkbox label='Reduce-Only' bind:value={$isReduceOnly} isSecondaryColor={!$isLong} />
					</div>

					{#if $orderType == 0}
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
				{#if $selectedAsset != 'ETH' && $allowances[$selectedAsset]?.['FundStore'] * 1 <= $margin * 1}
				<Button noSubmit={true} isLoading={isApproving} isRed={!$isLong} label={`Approve ${$selectedAsset}`} on:click={_approveAsset} />
				{:else}
				<Button isLoading={$submittingOrder} isRed={!$isLong} label={`Submit ${$isLong ? 'Buy' : 'Sell'} Order`} />
				{/if}
			</div>

			

		</form>
		
		<div class='od'>
			<OrderDetails market={$selectedMarket} asset={$selectedAsset} size={$size} displaySizeOrMargin={displaySizeOrMargin}/>
		</div>
	
	</div>

</div>
