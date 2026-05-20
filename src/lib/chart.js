import { get } from 'svelte/store'
import { createChart, ColorType, LineStyle } from 'lightweight-charts'

import { CURRENCY_DECIMALS } from './config'
import { formatUnits, formatOrder, formatPosition, formatForDisplay, formatPriceForDisplay } from './formatters'
import { selectedMarket, orders, positions, chartResolution, chartLoading, chartIndicators, showOrdersOnChart, showPositionsOnChart, hoveredOHLC } from './stores'
import { saveUserSetting, getPrecision } from './utils'

import { getMarketCandles } from '@api/prices'

let candles = []; // current candle set

// In s
let end;
let earliestCandleDate;

let chart;
let candlestickSeries;
let indicatorSeries = {};

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

function getCloses() {
	return candles
		.map((candle) => ({
			time: candle.time,
			value: candle.close * 1
		}))
		.filter((point) => point.time && !isNaN(point.value));
}

function movingAverage(points, period) {
	let data = [];
	let sum = 0;

	points.forEach((point, index) => {
		sum += point.value;
		if (index >= period) {
			sum -= points[index - period].value;
		}
		if (index >= period - 1) {
			data.push({
				time: point.time,
				value: sum / period
			});
		}
	});

	return data;
}

function exponentialMovingAverage(points, period) {
	if (points.length < period) return [];

	const multiplier = 2 / (period + 1);
	let data = [];
	let seed = 0;

	for (let i = 0; i < period; i += 1) {
		seed += points[i].value;
	}

	let ema = seed / period;
	data.push({
		time: points[period - 1].time,
		value: ema
	});

	for (let i = period; i < points.length; i += 1) {
		ema = (points[i].value - ema) * multiplier + ema;
		data.push({
			time: points[i].time,
			value: ema
		});
	}

	return data;
}

function relativeStrengthIndex(points, period = 14) {
	if (points.length <= period) return [];

	let gains = 0;
	let losses = 0;
	let data = [];

	for (let i = 1; i <= period; i += 1) {
		const change = points[i].value - points[i - 1].value;
		if (change >= 0) {
			gains += change;
		} else {
			losses -= change;
		}
	}

	let averageGain = gains / period;
	let averageLoss = losses / period;

	for (let i = period; i < points.length; i += 1) {
		if (i > period) {
			const change = points[i].value - points[i - 1].value;
			const gain = Math.max(change, 0);
			const loss = Math.max(-change, 0);
			averageGain = (averageGain * (period - 1) + gain) / period;
			averageLoss = (averageLoss * (period - 1) + loss) / period;
		}

		const rsi = averageLoss === 0 ? 100 : 100 - (100 / (1 + averageGain / averageLoss));
		data.push({
			time: points[i].time,
			value: rsi
		});
	}

	return data;
}

function mapByTime(points) {
	return points.reduce((acc, point) => {
		acc[point.time] = point.value;
		return acc;
	}, {});
}

function macd(points, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
	const fast = mapByTime(exponentialMovingAverage(points, fastPeriod));
	const slow = mapByTime(exponentialMovingAverage(points, slowPeriod));
	const macdLine = points
		.filter((point) => fast[point.time] !== undefined && slow[point.time] !== undefined)
		.map((point) => ({
			time: point.time,
			value: fast[point.time] - slow[point.time]
		}));
	const signalLine = exponentialMovingAverage(macdLine, signalPeriod);
	const signal = mapByTime(signalLine);
	const histogram = macdLine
		.filter((point) => signal[point.time] !== undefined)
		.map((point) => ({
			time: point.time,
			value: point.value - signal[point.time],
			color: point.value - signal[point.time] >= 0 ? 'rgba(64,214,67,0.45)' : 'rgba(255,83,36,0.45)'
		}));

	return {
		macdLine,
		signalLine,
		histogram
	};
}

function removeIndicatorSeries(key) {
	const group = indicatorSeries[key];
	if (!group) return;

	for (const series of group) {
		chart.removeSeries(series);
	}

	delete indicatorSeries[key];
}

function ensureIndicatorSeries(key) {
	if (indicatorSeries[key]) return indicatorSeries[key];

	if (key === 'sma20') {
		indicatorSeries[key] = [
			chart.addLineSeries({
				color: '#5C9DFF',
				lineWidth: 2,
				priceLineVisible: false,
				lastValueVisible: false
			})
		];
	} else if (key === 'ema20') {
		indicatorSeries[key] = [
			chart.addLineSeries({
				color: '#F5B84B',
				lineWidth: 2,
				priceLineVisible: false,
				lastValueVisible: false
			})
		];
	} else if (key === 'rsi14') {
		indicatorSeries[key] = [
			chart.addLineSeries({
				color: '#B785FF',
				lineWidth: 2,
				priceScaleId: 'rsi',
				priceLineVisible: false,
				lastValueVisible: true
			}),
			chart.addLineSeries({
				color: 'rgba(179,179,179,0.35)',
				lineWidth: 1,
				lineStyle: LineStyle.Dashed,
				priceScaleId: 'rsi',
				priceLineVisible: false,
				lastValueVisible: false
			}),
			chart.addLineSeries({
				color: 'rgba(179,179,179,0.35)',
				lineWidth: 1,
				lineStyle: LineStyle.Dashed,
				priceScaleId: 'rsi',
				priceLineVisible: false,
				lastValueVisible: false
			})
		];
		chart.priceScale('rsi').applyOptions({
			scaleMargins: {
				top: 0.72,
				bottom: 0.12
			}
		});
	} else if (key === 'macd') {
		indicatorSeries[key] = [
			chart.addLineSeries({
				color: '#5C9DFF',
				lineWidth: 2,
				priceScaleId: 'macd',
				priceLineVisible: false,
				lastValueVisible: false
			}),
			chart.addLineSeries({
				color: '#F5B84B',
				lineWidth: 2,
				priceScaleId: 'macd',
				priceLineVisible: false,
				lastValueVisible: false
			}),
			chart.addHistogramSeries({
				priceScaleId: 'macd',
				priceLineVisible: false,
				lastValueVisible: false
			})
		];
		chart.priceScale('macd').applyOptions({
			scaleMargins: {
				top: 0.84,
				bottom: 0.02
			}
		});
	}

	return indicatorSeries[key];
}

function updateIndicatorSeries() {
	if (!chart || !candles.length) return;

	const settings = get(chartIndicators) || {};
	const closes = getCloses();
	const activeKeys = ['sma20', 'ema20', 'rsi14', 'macd'];

	for (const key of activeKeys) {
		if (!settings[key]) {
			removeIndicatorSeries(key);
			continue;
		}

		const series = ensureIndicatorSeries(key);
		if (!series) continue;

		if (key === 'sma20') {
			series[0].setData(movingAverage(closes, 20));
		} else if (key === 'ema20') {
			series[0].setData(exponentialMovingAverage(closes, 20));
		} else if (key === 'rsi14') {
			const rsi = relativeStrengthIndex(closes, 14);
			series[0].setData(rsi);
			series[1].setData(rsi.map((point) => ({ time: point.time, value: 70 })));
			series[2].setData(rsi.map((point) => ({ time: point.time, value: 30 })));
		} else if (key === 'macd') {
			const data = macd(closes);
			series[0].setData(data.macdLine);
			series[1].setData(data.signalLine);
			series[2].setData(data.histogram);
		}
	}
}

export function toggleChartIndicator(key) {
	const next = {
		...(get(chartIndicators) || {}),
		[key]: !(get(chartIndicators) || {})[key]
	};
	chartIndicators.set(next);
	saveUserSetting('chartIndicators', next);
	updateIndicatorSeries();
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
	chartIndicators.subscribe(() => {
		updateIndicatorSeries();
	});

	chart.subscribeCrosshairMove(param => {
		const value = param?.seriesPrices?.get(candlestickSeries);
		if (!value) {
			hoveredOHLC.set();
		} else {
			hoveredOHLC.set(value);
		}
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
	updateIndicatorSeries();

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

	updateIndicatorSeries();

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
			    title: `${_order.isLong ? '?' : '?'} ${formatForDisplay(_order.size)} ${_order.asset}`,
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
			    title: `${_position.isLong ? '?' : '?'} ${formatForDisplay(_position.size)} ${_position.asset}`,
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
