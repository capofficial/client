<script>
	import Modal from './Modal.svelte'

	import { onMount } from 'svelte'

	import Slider from '@components/layout/Slider.svelte'

	import tooltip from '@lib/tooltip'
	import { formatForDisplay } from '@lib/formatters'
	import { PENCIL_ICON, RULER_ICON, RULER_FILLED_ICON } from '@lib/icons'

	import { leverage, selectedMarket, selectedMarketInfo } from '@lib/stores'
	import { saveUserSetting } from '@lib/utils'

	function saveLeverage() {
		saveUserSetting(`leverage-${$selectedMarket}`, $leverage);
	}

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
	title='Select Leverage' 
	width='300'
	doneButton={true}
>	

	<div class='container'>

		<div class='value'>{$leverage}×</div>

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
