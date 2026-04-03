import { get } from 'svelte/store'
import { createChart, ColorType, LineStyle } from 'lightweight-charts'

import { CURRENCY_DECIMALS } from './config'
import { formatUnits, formatOrder, formatPosition, formatForDisplay, formatPriceForDisplay } from './formatters'
import { selectedMarket, orders, positions, chartResolution, chartLoading, showOrdersOnChart, showPositionsOnChart, hoveredOHLC } from './stores'
import { saveUserSetting, getPrecision } from './utils'

import { getMarketCandles } from '@api/prices'
import { calculateSMA, calculateEMA, calculateRSI, calculateMACD, calculateBollingerBands } from './indicators'
import { getUserSetting } from './utils'

let candles = []; // current candle set

// In s
let end;
let earliestCandleDate;

let chart;
let candlestickSeries;

// how much history to load for each resolution (in ms)
const lookbacks = {
	60: 8 * 60 * 60,
	300: 24 * 60 * 60,
	900: 48 * 60 * 60,
	3600: 12 * 24 * 60 * 60,
	14400: 4 * 12 * 24 * 60 * 60,
	86400: 24 * 12 * 24 * 60 * 60,
};

function correctedTime(time) {
	const timezoneOffsetMinutes = new Date().getTimezoneOffset();
	return time - (timezoneOffsetMinutes * 60);
}

function applyWatermark() {
	chart && chart.applyOptions({
	    watermark: {
	        color: 'rgb(44,44,46)',
	        visible: true,
	        text: get(selectedMarket),
	        fontSize: 72,
	        horzAlign: 'center',
	        vertAlign: 'center',
	    },
	});
}

export function initChart(cb) {

	const chartElem = document.getElementById('chart');

	chart = createChart(chartElem);

	new ResizeObserver((entries) => {
		if (entries.length === 0 || entries[0].target !== chartElem) return;
		const newRect = entries[0].contentRect;
		chart.applyOptions({ height: newRect.height });
	}).observe(chartElem);

	window.onresize = () => {
		if (window.innerWidth > 650) {
			chart.applyOptions({ width: window.innerWidth - 315 });
		} else {
			chart.applyOptions({ width: window.innerWidth });
		}
	};

	window.dispatchEvent(new Event('resize'));

	chart.applyOptions({
		layout: {
		    background: {
		        type: ColorType.Solid,
		        color: '#1c1d1c',
		    },
		    textColor: '#b3b3b3',
		    fontSize: 13,
		    fontFamily: 'Inter var'
		},
		grid: {
	        vertLines: {
	            color: '#2d2e2d',
	            style: 4,
	            visible: true,
	        },
	        horzLines: {
	            color: '#2d2e2d',
	            style: 4,
	            visible: true,
	        },
	    },
	    rightPriceScale: {
	    	borderVisible: true, 
	    	entireTextOnly: true,
	    	visible: true,
	    	borderColor: '#2d2e2d',
	    	autoScale: true
	    },
	    leftPriceScale: {
	    	visible: false,
	    },
		timeScale: {
			timeVisible: true,
			borderVisible: true,
	    	borderColor: '#2d2e2d'
		},
		crosshair: {
			mode: 0,
			vertLine: {
				color: '#888',
				width: 1,
				labelBackgroundColor: '#585958'
			},
			horzLine: {
				color: '#888',
				width: 1,
				labelBackgroundColor: '#585958'
			}
		}
	});

	candlestickSeries = chart.addCandlestickSeries({
		upColor: 'rgb(64,214,67)',
	    downColor: '#FF5324',
	    wickUpColor: 'rgb(64,214,67)',
	    wickDownColor: '#FF5324',
	});

	chart.timeScale().subscribeVisibleTimeRangeChange(onVisibleTimeRangeChanged);
	chart.timeScale().subscribeVisibleLogicalRangeChange(onVisibleLogicalRangeChanged);

	orders.subscribe((_orders) => {
		loadOrderLines(_orders);
	});
	showOrdersOnChart.subscribe(() => {
		loadOrderLines();
	});

	positions.subscribe((_positions) => {
		loadPositionLines(_positions);
	});
	showPositionsOnChart.subscribe(() => {
		loadPositionLines();
	});

	chart.subscribeCrosshairMove(param => {
		if (!param?.seriesPrices || param?.seriesPrices.size == 0) {
			hoveredOHLC.set();
		} else {
			param?.seriesPrices.forEach((value) => {
		    	hoveredOHLC.set(value);
		    });
		}
	});

	applyWatermark();
	
	// Load saved indicators after chart is initialized
	setTimeout(() => {
		loadSavedIndicators();
	}, 500);

	cb();

}

let isLoadingCandles = false;
async function onVisibleLogicalRangeChanged(newVisibleLogicalRange) {
    // const barsInfo = candlestickSeries.barsInLogicalRange(newVisibleLogicalRange);
    // if (barsInfo !== null && barsInfo.barsBefore < 5) {
    //     const resolution = get(chartResolution);
    //     if (isLoadingCandles) return;
    //     isLoadingCandles = true;
    //     await loadCandles(end - lookbacks[resolution]);
    //     isLoadingCandles = false;
    // }
}

async function onVisibleTimeRangeChanged(newVisibleTimeRange) {
	const resolution = get(chartResolution);
	// console.log('newVisibleTimeRange', newVisibleTimeRange, earliestCandleDate);
	if (isLoadingCandles) return;
	isLoadingCandles = true;
	if (newVisibleTimeRange.from <= earliestCandleDate) {
		await loadCandles(newVisibleTimeRange.from);
	}
	isLoadingCandles = false;
}

export async function setResolution(resolution) {
	chartResolution.set(resolution);
	saveUserSetting('chartResolution', resolution);
	await loadCandles();
}

let lastMarket;
let lastResolution;
let candleData = {};

export async function loadCandles(_end) {

	applyWatermark();
	chartLoading.set(true);

	const resolution = get(chartResolution);
	const market = get(selectedMarket);

	if (lastMarket != market || resolution != lastResolution) {
		lastMarket = market;
		lastResolution = resolution;
		candleData = {};
		candles = [];
		earliestCandleDate = null;
	}

	if (!candlestickSeries) return;

	if (!_end) _end = Date.now()/1000;

	end = parseInt(_end);

	const apiCandles = await getMarketCandles({market, resolution, end});

	// After API returns, market and/or resolution may have changed in the meantime
	if (market != get(selectedMarket) || resolution != get(chartResolution)) {
		return;
	}

	for (const item of apiCandles) {
		const time = correctedTime(item.t);
		candleData[time] = {
			time,
			low: item.l,
			high: item.h,
			open: item.o,
			close: item.c
		};
	}

	candles = Object.values(candleData).sort((a,b) => {
		if (a.time > b.time) return 1;
		if (a.time < b.time) return -1;
		return 0;
	});

	// Smooth candles
	candles = candles.map((candle, index) => {
		let previousCandle = candles[index-1];
		if (previousCandle) {
			candle.open = previousCandle.close;
		}
		return candle;
	});

	// set data
	candlestickSeries.setData(candles || []);

	// Set chart precision
	if (candles.length) {
		const lastCandle = candles[candles.length-1];
		const precision = getPrecision(formatPriceForDisplay(lastCandle.close * 1));
		candlestickSeries.applyOptions({
		    priceFormat: {
		        type: 'price',
		        precision: precision,
		        minMove: 1/10**precision,
		    },
		});

		// set earliest candle
		earliestCandleDate = candles[0].time;
	}

	// chart.timeScale().fitContent();
	chart.priceScale('right').applyOptions({autoScale: true});

	// redraw order and position lines
	loadOrderLines();
	loadPositionLines();


	chartLoading.set(false);

}

export function onNewPrice(price) {

	const market = get(selectedMarket);

	if (lastMarket != market) {
		return;
	}

	if (!candlestickSeries || !candles.length) return;
	
	// add data point to current candle set
	// use update with time = last time for this resolution
	// get last data point to update ohlc values based on given data point

	let lastCandle = candles[candles.length - 1];
	if (!lastCandle) return;

	const timestamp = correctedTime(Date.now() / 1000); // TODO: this should be timestamp from DB
	const resolution = get(chartResolution);

	if (timestamp >= lastCandle.time + resolution) {
		// new candle
		let candle = {
			time: parseInt(resolution * parseInt(timestamp/resolution)),
			low: price,
			high: price,
			open: lastCandle.close || price, // smoothing
			close: price
		}
		candles.push(candle);
		candlestickSeries.update(candle);
	} else {
		// update existing candle
		if (lastCandle.low > price) lastCandle.low = price;
		if (lastCandle.high < price) lastCandle.high = price;
		lastCandle.close = price;
		candles[candles.length - 1] = lastCandle;
		candlestickSeries.update(lastCandle);
	}

}

// Order and position lines

let orderLines = [];
let positionLines = [];

function loadOrderLines(_orders) {

	if (!_orders) _orders = get(orders);

	if (!candlestickSeries) {
		setTimeout(() => {
			loadOrderLines(_orders);
		}, 2000);
		return;
	}

	clearOrderLines();

	if (!get(showOrdersOnChart)) return;

	for (let _order of _orders) {

		_order = formatOrder(_order);

		if (isNaN(_order.price*1) || _order.market != get(selectedMarket)) continue;

		orderLines.push(
			candlestickSeries.createPriceLine({
			    price: _order.price,
			    color: 'rgb(72,72,74)',
			    lineWidth: 1,
			    lineStyle: LineStyle.Solid,
			    axisLabelVisible: true,
			    title: `${_order.isLong ? '▲' : '▼'} ${formatForDisplay(_order.size)} ${_order.asset}`,
			})
		);

	}

}

function loadPositionLines(_positions) {

	if (!_positions) _positions = get(positions);

	if (!candlestickSeries) {
		setTimeout(() => {
			loadPositionLines(_positions);
		}, 2000);
		return;
	}

	clearPositionLines();


	if (!get(showPositionsOnChart)) return;

	let markers = [];

	for (let _position of _positions) {

		_position = formatPosition(_position);

		if (_position.market != get(selectedMarket)) continue;

		positionLines.push(
			candlestickSeries.createPriceLine({
			    price: _position.price,
			    color: _position.isLong ? '#00D604' : '#FF5000',
			    lineWidth: 1,
			    lineStyle: LineStyle.Solid,
			    axisLabelVisible: true,
			    title: `${_position.isLong ? '▲' : '▼'} ${formatForDisplay(_position.size)} ${_position.asset}`,
			})
		);

		// markers.push({
		// 	time: _position.timestamp.toNumber(),
		// 	position: _position.isLong ? 'belowBar' : 'aboveBar',
		// 	color: _position.isLong ? '#00D604' : '#FF5000',
		// 	shape: _position.isLong ? 'arrowUp' : 'arrowDown',
		// 	id: 'pos',
		// 	text: `${formatForDisplay(_position.size)} ${_position.asset}`,
		// 	size: 2
		// });

	}

	// markers.sort((a,b) => {
	// 	if (a.timestamp > b.timestamp) return 1;
	// 	if (a.timestamp < b.timestamp) return -1;
	// 	return 0;
	// });

	// console.log('markers', markers);

	// candlestickSeries.setMarkers(markers);

}

function clearOrderLines() {
	for (const priceline of orderLines) {
		candlestickSeries.removePriceLine(priceline);
	}
	orderLines = [];
}

function clearPositionLines() {
	for (const priceline of positionLines) {
		candlestickSeries.removePriceLine(priceline);
	}
	candlestickSeries.setMarkers([]);
	positionLines = [];
}

// Technical Indicators
let indicatorSeries = {};

const indicatorColors = {
	ma20: '#ff6b6b',
	ma50: '#4ecdc4',
	ema12: '#ffe66d',
	ema26: '#a8e6cf',
	bbUpper: '#ffd93d',
	bbLower: '#ffd93d',
	bbMiddle: '#ff8b94'
};

export function toggleIndicator(indicator, enabled) {
	if (!chart || !candlestickSeries || !candles.length) return;
	
	if (!enabled) {
		// Remove indicator
		if (indicatorSeries[indicator]) {
			if (Array.isArray(indicatorSeries[indicator])) {
				indicatorSeries[indicator].forEach(series => {
					chart.removeSeries(series);
				});
			} else {
				chart.removeSeries(indicatorSeries[indicator]);
			}
			delete indicatorSeries[indicator];
		}
		return;
	}
	
	// Add indicator based on type
	switch(indicator) {
		case 'ma20':
			addMA(20, 'ma20');
			break;
		case 'ma50':
			addMA(50, 'ma50');
			break;
		case 'ema12':
			addEMA(12, 'ema12');
			break;
		case 'ema26':
			addEMA(26, 'ema26');
			break;
		case 'rsi':
			addRSI();
			break;
		case 'macd':
			addMACD();
			break;
		case 'bb':
			addBollingerBands();
			break;
	}
}

function addMA(period, key) {
	const maData = calculateSMA(candles, period);
	if (!maData.length) return;
	
	const series = chart.addLineSeries({
		color: indicatorColors[key],
		lineWidth: 2,
		priceLineVisible: false,
		lastValueVisible: true,
		title: `MA(${period})`
	});
	
	series.setData(maData);
	indicatorSeries[key] = series;
}

function addEMA(period, key) {
	const emaData = calculateEMA(candles, period);
	if (!emaData.length) return;
	
	const series = chart.addLineSeries({
		color: indicatorColors[key],
		lineWidth: 2,
		priceLineVisible: false,
		lastValueVisible: true,
		title: `EMA(${period})`
	});
	
	series.setData(emaData);
	indicatorSeries[key] = series;
}

function addRSI() {
	const rsiData = calculateRSI(candles, 14);
	if (!rsiData.length) return;
	
	// Add RSI as a separate pane
	const rsiSeries = chart.addLineSeries({
		color: '#ff8b94',
		lineWidth: 2,
		priceLineVisible: false,
		lastValueVisible: true,
		title: 'RSI(14)',
		priceScaleId: 'rsi',
		scaleMargins: {
			top: 0.8,
			bottom: 0.95
		}
	});
	
	rsiSeries.setData(rsiData);
	indicatorSeries['rsi'] = rsiSeries;
}

function addMACD() {
	const { macdLine, signalLine, histogram } = calculateMACD(candles);
	if (!macdLine.length) return;
	
	// Add MACD line
	const macdSeries = chart.addLineSeries({
		color: '#c7ceea',
		lineWidth: 2,
		priceLineVisible: false,
		lastValueVisible: true,
		title: 'MACD',
		priceScaleId: 'macd',
		scaleMargins: {
			top: 0.85,
			bottom: 0.95
		}
	});
	macdSeries.setData(macdLine);
	
	// Add Signal line
	const signalSeries = chart.addLineSeries({
		color: '#ff8b94',
		lineWidth: 2,
		priceLineVisible: false,
		lastValueVisible: true,
		priceScaleId: 'macd'
	});
	signalSeries.setData(signalLine);
	
	indicatorSeries['macd'] = [macdSeries, signalSeries];
}

function addBollingerBands() {
	const { middle, upper, lower } = calculateBollingerBands(candles);
	if (!middle.length) return;
	
	const upperSeries = chart.addLineSeries({
		color: indicatorColors.bbUpper,
		lineWidth: 1,
		priceLineVisible: false,
		lastValueVisible: true,
		title: 'BB Upper'
	});
	upperSeries.setData(upper);
	
	const middleSeries = chart.addLineSeries({
		color: indicatorColors.bbMiddle,
		lineWidth: 1,
		priceLineVisible: false,
		lastValueVisible: true,
		title: 'BB Middle'
	});
	middleSeries.setData(middle);
	
	const lowerSeries = chart.addLineSeries({
		color: indicatorColors.bbLower,
		lineWidth: 1,
		priceLineVisible: false,
		lastValueVisible: true,
		title: 'BB Lower'
	});
	lowerSeries.setData(lower);
	
	indicatorSeries['bb'] = [upperSeries, middleSeries, lowerSeries];
}

export function clearIndicators() {
	Object.keys(indicatorSeries).forEach(key => {
		if (Array.isArray(indicatorSeries[key])) {
			indicatorSeries[key].forEach(series => {
				chart.removeSeries(series);
			});
		} else {
			chart.removeSeries(indicatorSeries[key]);
		}
	});
	indicatorSeries = {};
}

// Load saved indicators on chart init
export function loadSavedIndicators() {
	const indicators = ['ma20', 'ma50', 'ema12', 'ema26', 'rsi', 'macd', 'bb'];
	indicators.forEach(indicator => {
		if (getUserSetting(`indicator_${indicator}`)) {
			toggleIndicator(indicator, true);
		}
	});
}
