import { get } from 'svelte/store'
import { createChart, ColorType, LineStyle } from 'lightweight-charts'

import { CURRENCY_DECIMALS } from './config'
import { formatUnits, formatOrder, formatPosition, formatForDisplay, formatPriceForDisplay } from './formatters'
import { selectedMarket, orders, positions, chartResolution, chartLoading, showOrdersOnChart, showPositionsOnChart, hoveredOHLC, chartIndicators } from './stores'
import { saveUserSetting, getPrecision } from './utils'
import { calculateSMA, calculateEMA, calculateRSI, calculateMACD } from './indicators'

import { getMarketCandles } from '@api/prices'

let candles = []; // current candle set

// In s
let end;
let earliestCandleDate;

let chart;
let candlestickSeries;
let indicatorSeries = [];
let chartIndicatorsUnsubscribe;

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
	indicatorSeries = [];

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
		hoveredOHLC.set(param?.seriesPrices?.get(candlestickSeries));
	});

	if (chartIndicatorsUnsubscribe) chartIndicatorsUnsubscribe();
	chartIndicatorsUnsubscribe = chartIndicators.subscribe(() => {
		syncIndicators();
	});

	applyWatermark();

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
	syncIndicators();

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

	if (hasEnabledIndicators()) syncIndicators();

}

// Technical indicators

export function setChartIndicator(indicator, enabled) {
	const indicators = Object.assign({}, get(chartIndicators), {
		[indicator]: enabled
	});
	chartIndicators.set(indicators);
	saveUserSetting('chartIndicators', indicators);
}

function hasEnabledIndicators() {
	return Object.values(get(chartIndicators) || {}).some(Boolean);
}

function syncIndicators() {
	if (!chart) return;

	clearIndicatorSeries();
	if (!candles.length || !hasEnabledIndicators()) return;

	const indicators = get(chartIndicators);

	if (indicators.ma20) {
		addLineIndicator(calculateSMA(candles, 20), {
			color: '#f5b942',
			lineWidth: 2,
			title: 'MA 20'
		});
	}

	if (indicators.ma50) {
		addLineIndicator(calculateSMA(candles, 50), {
			color: '#4bb3fd',
			lineWidth: 2,
			title: 'MA 50'
		});
	}

	if (indicators.ema20) {
		addLineIndicator(calculateEMA(candles, 20), {
			color: '#b388ff',
			lineWidth: 2,
			title: 'EMA 20'
		});
	}

	if (indicators.rsi) {
		addLineIndicator(calculateRSI(candles), {
			color: '#5ce1e6',
			lineWidth: 2,
			priceScaleId: 'rsi',
			title: 'RSI 14'
		});
		chart.priceScale('rsi').applyOptions({
			visible: false,
			scaleMargins: {
				top: indicators.macd ? 0.72 : 0.76,
				bottom: indicators.macd ? 0.16 : 0.04
			}
		});
	}

	if (indicators.macd) {
		const macd = calculateMACD(candles);
		addHistogramIndicator(macd.histogram, {
			priceScaleId: 'macd',
			priceLineVisible: false,
			lastValueVisible: false
		});
		addLineIndicator(macd.macd, {
			color: '#ff8a65',
			lineWidth: 2,
			priceScaleId: 'macd',
			title: 'MACD'
		});
		addLineIndicator(macd.signal, {
			color: '#ffd54f',
			lineWidth: 1,
			priceScaleId: 'macd',
			title: 'Signal'
		});
		chart.priceScale('macd').applyOptions({
			visible: false,
			scaleMargins: {
				top: indicators.rsi ? 0.86 : 0.78,
				bottom: 0.02
			}
		});
	}
}

function addLineIndicator(data, options) {
	if (!data.length) return;

	const series = chart.addLineSeries(Object.assign({
		priceLineVisible: false,
		lastValueVisible: false
	}, options));
	series.setData(data);
	indicatorSeries.push(series);
}

function addHistogramIndicator(data, options) {
	if (!data.length) return;

	const series = chart.addHistogramSeries(options);
	series.setData(data);
	indicatorSeries.push(series);
}

function clearIndicatorSeries() {
	for (const series of indicatorSeries) {
		chart.removeSeries(series);
	}
	indicatorSeries = [];
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
