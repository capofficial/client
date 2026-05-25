<script>
	import Modal from './Modal.svelte'

	import Input from '@components/layout/Input.svelte'
	import Slider from '@components/layout/Slider.svelte'

	import { leverage, selectedMarket, selectedMarketInfo } from '@lib/stores'
	import { saveUserSetting } from '@lib/utils'

	function clampLeverage() {
		if ($leverage == null || !$selectedMarketInfo?.maxLeverage) return;
		const next = Math.round($leverage * 1);
		const clamped = Math.min($selectedMarketInfo.maxLeverage * 1, Math.max(1, next));
		if (clamped !== $leverage * 1) {
			leverage.set(clamped);
		}
	}

	function saveLeverage() {
		if ($leverage == null || $leverage * 1 < 1) return;
		saveUserSetting(`leverage-${$selectedMarket}`, $leverage);
	}

	$: clampLeverage($leverage, $selectedMarketInfo);
	$: saveLeverage($leverage);

</script>

<style>

	.value {
		font-size: 48px;
		text-align: center;
		padding-bottom: 25px;
	}

	.leverage-input {
		padding-top: 16px;
	}
	
</style>

<Modal 
	title='Choose Leverage' 
	width='300'
	doneButton={true}
>	

	<div class='container'>

		<div class='value'>{$leverage}×</div>

		<Slider bind:value={$leverage} maxValue={$selectedMarketInfo.maxLeverage} noTooltip={true} integersOnly={true} showDots={false}/>

		<div class='leverage-input'>
			<Input label='Leverage' bind:value={$leverage} />
		</div>
	
	</div>

	<!-- <div class='flex-row semi-padding-bottom'>
		<div class='leverage-select'>
			<input class='range' id='range' type='range' bind:this={rangeElem} bind:value={$leverage} min='1' max={$selectedMarketInfo.maxLeverage} on:mousedown={rangeIsActive} on:mouseup={rangeIsInactive}> 
		</div>
		<div class='value' class:active={rangeActive}>
			<div bind:this={rangeValues}>
				{#each leverages as lev}
				<div>{lev}</div>
				{/each}
			</div>
		</div>
	</div> -->

</Modal>
