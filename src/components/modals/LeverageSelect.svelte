<script>
	import Modal from './Modal.svelte'

	import Slider from '@components/layout/Slider.svelte'

	import { leverage, selectedMarket, selectedMarketInfo } from '@lib/stores'
	import { saveUserSetting } from '@lib/utils'

	let leverageInput = '';
	let isEditingInput = false;

	function clampLeverage(value) {
		const maxLeverage = $selectedMarketInfo?.maxLeverage * 1;
		const numericValue = value * 1;
		const currentLeverage = $leverage * 1 || 1;

		if (!maxLeverage || isNaN(numericValue)) return currentLeverage;
		if (numericValue < 1) return 1;
		if (numericValue > maxLeverage) return maxLeverage;
		return Math.round(numericValue);
	}

	function setLeverageValue(value) {
		const nextValue = clampLeverage(value);
		leverage.set(nextValue);
		leverageInput = `${nextValue}`;
	}

	function saveLeverage() {
		if ($leverage == null || $leverage * 1 < 1) return;
		saveUserSetting(`leverage-${$selectedMarket}`, $leverage);
	}

	function handleInput(event) {
		isEditingInput = true;
		leverageInput = event.currentTarget.value;
	}

	function commitInput() {
		isEditingInput = false;
		if (leverageInput === '') {
			leverageInput = `${$leverage}`;
			return;
		}

		setLeverageValue(leverageInput);
	}

	function handleKeydown(event) {
		if (event.key === 'Enter') {
			event.preventDefault();
			commitInput();
			event.currentTarget.blur();
		}
	}

	$: if (!isEditingInput && `${$leverage}` !== leverageInput) {
		leverageInput = `${$leverage}`;
	}

	$: saveLeverage($leverage);

</script>

<style>

	.value {
		font-size: 48px;
		text-align: center;
		padding-bottom: 12px;
	}

	.input-wrapper {
		padding-bottom: 20px;
	}

	.input-label {
		font-size: 12px;
		font-weight: 600;
		letter-spacing: 0.04rem;
		text-transform: uppercase;
		color: var(--text300);
		padding-bottom: 8px;
	}

	.input {
		width: 100%;
		height: 48px;
		box-sizing: border-box;
		border-radius: 6px;
		border: 1px solid var(--layer200);
		background-color: var(--layer50);
		color: var(--text0);
		text-align: center;
		font-size: 24px;
		font-weight: 600;
		caret-color: var(--primary);
	}

	.input:hover {
		border-color: var(--layer300);
	}

	.input:focus {
		border-color: var(--primary);
	}

	.helper {
		padding-top: 8px;
		font-size: 12px;
		text-align: center;
		color: var(--text300);
	}
	
</style>

<Modal 
	title='Choose Leverage' 
	width='300'
	doneButton={true}
>	

	<div class='container'>

		<div class='value'>{$leverage}×</div>

		<div class='input-wrapper'>
			<div class='input-label'>Type leverage</div>
			<input
				class='input'
				type='number'
				min='1'
				max={$selectedMarketInfo.maxLeverage}
				step='1'
				bind:value={leverageInput}
				on:input={handleInput}
				on:blur={commitInput}
				on:keydown={handleKeydown}
			/>
			<div class='helper'>Min 1× · Max {$selectedMarketInfo.maxLeverage}×</div>
		</div>

		<Slider bind:value={$leverage} maxValue={$selectedMarketInfo.maxLeverage} noTooltip={true} integersOnly={true} showDots={false}/>
	
	</div>

</Modal>
