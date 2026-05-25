<script>
	import Modal from './Modal.svelte'

	import { onMount } from 'svelte'

	import Input from '@components/layout/Input.svelte'
	import Slider from '@components/layout/Slider.svelte'

	import tooltip from '@lib/tooltip'
	import { formatForDisplay } from '@lib/formatters'
	import { PENCIL_ICON, RULER_ICON, RULER_FILLED_ICON } from '@lib/icons'

	import { leverage, selectedMarket, selectedMarketInfo } from '@lib/stores'
	import { saveUserSetting } from '@lib/utils'

	function saveLeverage() {
		if ($leverage == null || $leverage * 1 < 1) return;
		saveUserSetting(`leverage-${$selectedMarket}`, $leverage);
	}

	function clampLeverage() {
		if ($leverage == null || $leverage === '') return;
		let value = Number($leverage);
		if (!Number.isFinite(value)) return;
		value = Math.max(1, value);
		if ($selectedMarketInfo?.maxLeverage) {
			value = Math.min($selectedMarketInfo.maxLeverage * 1, value);
		}
		if (value !== $leverage) leverage.set(value);
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
	
</style>

<Modal 
	title='Choose Leverage' 
	width='300'
	doneButton={true}
>	

	<div class='container'>

		<div class='value'>{$leverage}×</div>

		<div class='bottom-spacing'>
			<Input label='Leverage' bind:value={$leverage} isSecondaryColor={true} />
		</div>

		<Slider bind:value={$leverage} maxValue={$selectedMarketInfo.maxLeverage} noTooltip={true} integersOnly={true} showDots={false}/>
	
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
