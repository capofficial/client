<script>
	
	import Modal from './Modal.svelte'
	import Input from '@components/layout/Input.svelte'
    import { getUPL } from '@lib/utils'
    import { formatForDisplay } from '@lib/formatters'

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

    let tpPNL
    let slPNL
    let tpProfit
    let slLoss
    let displayTPProfit
    let displaySLLoss
    let invalidTakeProfit = false
    let invalidStopLoss = false
    let percentageInput = false
    let _price

function updatePNLs() {

    let tpPosition = {
        isLong: $isLong,
        size: $size,
        price: _price 
    }

    let slPosition = {
        isLong: $isLong,
        size: $size,
        price: _price
    }

    tpPNL = getUPL(tpPosition, $tpPrice)
    slPNL = getUPL(slPosition, $slPrice)
}

function getEstimatedPNL() {

    updatePNLs()

    tpProfit = (tpPNL / $margin) * 100
    slLoss = (slPNL / $margin) * 100 * -1


    if (!percentageInput)
    {
        displayTPProfit = formatForDisplay(tpProfit)
        displaySLLoss = formatForDisplay(slLoss)
    }

    validateInputs()
    getTPSLFromGainLoss()


}

function validateInputs() {

    if ($isLong)
    {
        if (_price > $tpPrice && $tpPrice > 0)
        {
            invalidTakeProfit = true
        }
        else
        {
            invalidTakeProfit = false
        }

        if (_price < $slPrice && $slPrice > 0)
        {
            invalidStopLoss = true
        }
        else
        {
            invalidStopLoss = false
        }

    }
    else
    {
        if (_price < $tpPrice && $tpPrice > 0)
        {
            invalidTakeProfit = true
        }
        else
        {
            invalidTakeProfit = false
        }

        if (_price > $slPrice && $slPrice > 0)
        {
            invalidStopLoss = true
        }
        else
        {
            invalidStopLoss = false
        }
    }

}

function getTPSLFromGainLoss() {

    console.log("percentageinput", percentageInput)
    if (percentageInput)
    {
        let estimatedTakeProfit
        let estimatedStopLoss

        if ($isLong)
        {
            estimatedTakeProfit = _price + (_price * ((displayTPProfit / 100) / $leverage))
            estimatedStopLoss = _price - (_price * ((displaySLLoss / 100) / $leverage))
        }
        else
        {
            estimatedTakeProfit = _price - (_price * ((displayTPProfit / 100) / $leverage))
            estimatedStopLoss = _price + (_price * ((displaySLLoss / 100) / $leverage))
        }

        tpPNL = ($margin / estimatedTakeProfit) * 100
        slPNL = ($margin / estimatedStopLoss) * 100 * -1 

        tpPrice.set(formatForDisplay(estimatedTakeProfit))
        slPrice.set(formatForDisplay(estimatedStopLoss))

        updatePNLs()
        validateInputs()
    }
}

function getPriceType() {
    if ($orderType == 0)
    {
        _price = $prices[$selectedMarket]
    }
    else
    {
        _price = $price
    }
}

$: getEstimatedPNL($tpPrice, $slPrice, $orderType)
$: getTPSLFromGainLoss(displayTPProfit, displaySLLoss, $orderType)
$: getPriceType($orderType)
$: validateInputs($orderType)

function onFocus() { percentageInput = true; }
function onBlur() { percentageInput = false; }

</script>

<style>

    .container {

    }
    .note {
		line-height: 1.458;
		color: var(--text1-alt);
		font-size: 80%;
        padding-top: 16px;
	}
    .warning {
		line-height: 1.458;
		color: var(--secondary);
		font-size: 80%;
	}
    .input-container {
        display: flex;
        flex-direction: row;
        gap: 10px;
    }
    .input-tpsl-width {
        flex-basis: 60%;
    }
    .input-gainloss-width {
        flex-basis: 40%;
    }
    .bottom-spacing {
		padding-bottom: 16px;
	}
	.top-spacing {
		padding-top: 16px;
	}
    .border-bottom {
        border-bottom: 1px solid var(--layer1-hover);
    }

    .input-wrapper {
		height: 42px;
		position: relative;
		font-size: 85%;
		
	}
	input {
		height: 100%;
		width: 100%;
		box-sizing: border-box;
		text-align: right;
		padding-right: 28px;
		border-radius: 6px;
		background-color: var(--layer50);
		border: 1px solid var(--layer200);
		caret-color: var(--primary);
		font-size: inherit;
		font-weight: 600;
		/*transition: padding 200ms ease-in-out;*/
	}
	input:hover {
		border-color: var(--layer300);
	}
	input:focus {
		border-color: var(--primary);
	}
	input:disabled {
		color: var(--text200);
	}	

	input::placeholder {
	  color: var(--text500);
	  opacity: 1;
	}
	input::-ms-input-placeholder{
	  color: var(--text500);
	}
	input:-ms-input-placeholder {
	  color: var(--text500);
	}

    .prefix {
		position: absolute;
		background-color: var(--layer50);
		padding-left: 14px;
		padding-right: 14px;
		margin-left: 1px;
		top: 50%;
		transform: translateY(-50%);
		pointer-events: none;
		white-space: nowrap;
		left: 0px;
		display: flex;
		align-items: center;
		text-transform: uppercase;
		letter-spacing: 0.05rem;
		font-weight: 500;
	}

    .suffix {
		position: absolute;
		background-color: var(--layer50);
		padding-left: 2px;
		padding-right: 14px;
		margin-right: 1px;
		top: 50%;
		transform: translateY(-50%);
		pointer-events: none;
		white-space: nowrap;
		right: 0px;
		display: flex;
		align-items: center;
		text-transform: uppercase;
		letter-spacing: 0.05rem;
		font-weight: 500;
	}
    

</style>

<Modal title='Take-Profit/Stop-Loss' width={450} doneButton={true}>
<div class='container'>
    {#if ($isLong && invalidTakeProfit)}
    <div class='warning red bottom-spacing'>The Take-Profit level must be <strong>higher</strong> than the {#if ($orderType == 0)}<span>current price</span>{:else if ($orderType == 1)}Limit Price{:else if ($orderType == 2)}Stop Price{/if}.</div>
    {:else if (!$isLong && invalidTakeProfit)}
    <div class='warning red bottom-spacing'>The Take-Profit level must be <strong>lower</strong> than the {#if ($orderType == 0)}<span>current price</span>{:else if ($orderType == 1)}Limit Price{:else if ($orderType == 2)}Stop Price{/if}.</div>
    {/if}
    <div class='input-container'>
        <div class='input-tpsl-width'>
            <Input label='Take Profit' bind:value={$tpPrice} isInvalid={invalidTakeProfit}/>
        </div>
        <div class='input-gainloss-width'>
            <div class='input-wrapper' on:click|stopPropagation>
                <label for='Gain' class='prefix'>
                    Gain
                </label>
                <input id='Gain' type='number' step="0.0000001" bind:value={displayTPProfit} min="0" max="10000000" maxlength="10" spellcheck="false" placeholder={`0.0`} autocomplete="off" autocorrect="off" inputmode="decimal" lang="en" on:focus={onFocus} on:blur={onBlur} >
                <label for='Gain' class='suffix'>
                    %
                </label>
            </div>
        </div>
    </div>
    {#if ($tpPrice > 0)}
    <div class='note bottom-spacing border-bottom'>When the price hits {$tpPrice} your position will automatically close, with an estimated PNL of <strong>{formatForDisplay(tpPNL)}</strong> and a profit of <strong>{displayTPProfit}%</strong></div>
    {:else}
    <div class='note bottom-spacing border-bottom'>There is no Take-Profit level set up.</div>
    {/if}
    {#if ($isLong && invalidStopLoss)}
    <div class='warning red top-spacing'>The Stop-Loss level must be <strong>lower</strong> than the {#if ($orderType == 0)}<span>current price</span>{:else if ($orderType == 1)}Limit Price{:else if ($orderType == 2)}Stop Price{/if}.</div>
    {:else if (!$isLong && invalidStopLoss)}
    <div class='warning red top-spacing'>The Stop-Loss level must be <strong>higher</strong> than the {#if ($orderType == 0)}<span>current price</span>{:else if ($orderType == 1)}Limit Price{:else if ($orderType == 2)}Stop Price{/if}.</div>
    {/if}
    <div class='input-container top-spacing'>
        <div class='input-tpsl-width'>
            <Input label='Stop Loss' bind:value={$slPrice} isInvalid={invalidStopLoss}/>
        </div>
        <div class='input-gainloss-width'>
            <div class='input-wrapper' on:click|stopPropagation>
                <label for='Loss' class='prefix'>
                    Loss
                </label>
                <input id='Loss'  type='number' step="0.0000001" bind:value={displaySLLoss} min="0" max="10000000" maxlength="10" spellcheck="false" placeholder={`0.0`} autocomplete="off" autocorrect="off" inputmode="decimal" lang="en" on:focus={onFocus} on:blur={onBlur} >
                <label for='Loss' class='suffix'>
                    %
                </label>
            </div>
        </div>
    </div>
    {#if ($slPrice > 0)}
    <div class='note'>When the price hits {$slPrice} your position will automatically close, with an estimated PNL of <strong>{formatForDisplay(slPNL)}</strong> and a loss of <strong>{displaySLLoss}%</strong></div>
    {:else}
    <div class='note'>There is no Stop-Loss level set up.</div>
    {/if}
</div>
</Modal>