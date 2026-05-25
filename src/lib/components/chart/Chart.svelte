	import { getPriceScale } from './utils'
	import { prices, chartCandles, chartLoading } from '$lib/stores/price'
	import { chartOrders, chartPositions, chartLines } from '$lib/stores/orders'
	import { chartLiquidationPrices } from '$lib/stores/orders'
	import { selectedMarket } from '$lib/stores/market'
	import { userSettings } from '$lib/stores/user'
	import { formatForDisplay } from '$lib/utils/format'
	let positionLines = []
	let orderLines = []
	let chartLineLines = []
	let liquidationPriceLines = []

	// Crosshair
	let crosshairMoved = false
		positionLines = []
		orderLines = []
		chartLineLines = []
		liquidationPriceLines = []
	}

	function removeLines() {
		for (const line of chartLineLines) {
			line.remove()
		}
		for (const line of liquidationPriceLines) {
			line.remove()
		}
	}

	function drawLines() {
		if ($userSettings.showChartLines) {
			drawChartLines()
		}
		if ($userSettings.showLiquidationPrice) {
			drawLiquidationPrices()
		}
	}

	function drawOrders() {
		}
	}

	function drawLiquidationPrices() {
		if (!chart) return
		const priceScale = getPriceScale($selectedMarket)
		for (const position of $chartPositions) {
			if (!position.liquidationPrice) continue
			const price = formatForDisplay(position.liquidationPrice) * 1
			const line = chart.addLineSeries({
				priceLineVisible: false,
				lastValueVisible: false,
				lineStyle: 2,
				color: '#ff2d2d',
				lineWidth: 1
			})
			line.setData([
				{ time: chartCandles[0]?.time, value: price },
				{ time: chartCandles[chartCandles.length - 1]?.time, value: price }
			])
			const label = line.createPriceLine({
				price: price,
				color: '#ff2d2d',
				lineWidth: 1,
				lineStyle: 2,
				axisLabelVisible: true,
				title: `Liq. ${position.isLong ? 'Long' : 'Short'}`
			})
			liquidationPriceLines.push(line)
		}
	}

	function drawChartLines() {
		if (!chart) return
		const priceScale = getPriceScale($selectedMarket)
	$: $chartOrders, drawLines()
	$: $chartPositions, drawLines()
	$: $chartLines, drawLines()
	$: $chartLiquidationPrices, drawLines()

	// Resize
	let resizeObserver
				bind:checked={$userSettings.showChartLines}
			/>
			<Checkbox
				label='Show Liquidation Price'
				value={true}
				onChange={() => updateUserSetting('showLiquidationPrice', !$userSettings.showLiquidationPrice)}
				bind:checked={$userSettings.showLiquidationPrice}
			/>
			<Checkbox
				label='Reduce Motion'
				value={true}
				onChange={() => updateUserSetting('reduceMotion', !$userSettings.reduceMotion)}
import { derived, writable } from 'svelte/store'
import { positions } from './positions'
import { orders } from './ordersList'

	}
})

export const chartLiquidationPrices = derived([positions], ([$positions]) => {
	if (!$positions) return []
	return $positions.filter((position) => {
		return position.liquidationPrice
	})
})

export { chartLines }
	showChartOrders: true,
	showChartPositions: true,
	showChartLines: true,
	showLiquidationPrice: true,
	reduceMotion: false
}

	import { getPriceScale } from './utils'
	import { prices, chartCandles, chartLoading } from '$lib/stores/price'
	import { chartOrders, chartPositions, chartLines } from '$lib/stores/orders'
	import { chartLiquidationPrices } from '$lib/stores/orders'
	import { selectedMarket } from '$lib/stores/market'
	import { userSettings } from '$lib/stores/user'
	import { formatForDisplay } from '$lib/utils/format'