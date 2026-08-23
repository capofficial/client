import { get } from 'svelte/store'
import {
  sma, ema, rsi, macd, bollinger, INDICATOR_META, DEFAULT_PREFS
} from "./indicators.js"
import { createChart, ColorType, LineStyle } from 'lightweight-charts'

// ---- technical indicators (issue #16) ----------------------------------
const INDICATOR_PREF_KEY = "cap.chart.indicators.v1"
let indicatorPrefs = readIndicatorPrefs()
const indicatorSeries = {} // key -> series (BB stored as [upper, mid, lower])

function readIndicatorPrefs () {
  try {
    const raw = localStorage.getItem(INDICATOR_PREF_KEY)
    if (raw) return Object.assign({}, DEFAULT_PREFS, JSON.parse(raw))
  } catch (e) { /* corrupted value -> fall back to defaults */ }
  return Object.assign({}, DEFAULT_PREFS)
}

function writeIndicatorPrefs () {
  try { localStorage.setItem(INDICATOR_PREF_KEY, JSON.stringify(indicatorPrefs)) } catch (e) {}
}

const lineOpts = (color, width = 1) => ({
  color,
  lineWidth: width,
  priceLineVisible: false,
  lastValueVisible: false,
  crosshairMarkerVisible: false
})

function addOverlayLine (key, data, color, width) {
  const s = chart.addLineSeries(Object.assign(lineOpts(color, width), {
    priceScaleId: key // private invisible scale: overlays never squash candle autoscale
  }))
  chart.priceScale(key).applyOptions({ visible: false, autoScale: true })
  s.setData(data)
  indicatorSeries[key] = s
  return s
}

function applyIndicators () {
  clearIndicators()
  if (!candles || !candles.length) return
  if (indicatorPrefs.ma20) addOverlayLine("ma20", sma(candles, 20), INDICATOR_META.ma20.color, 2)
  if (indicatorPrefs.ma50) addOverlayLine("ma50", sma(candles, 50), INDICATOR_META.ma50.color, 2)
  if (indicatorPrefs.ema12) addOverlayLine("ema12", ema(candles, 12), INDICATOR_META.ema12.color, 2)
  if (indicatorPrefs.bb) {
    const bb = bollinger(candles, 20, 2)
    indicatorSeries.bb = [
      addOverlayLine("bbU", bb.upper, INDICATOR_META.bb.color),
      addOverlayLine("bbM", bb.mid, INDICATOR_META.bb.color),
      addOverlayLine("bbL", bb.lower, INDICATOR_META.bb.color)
    ]
  }
  if (indicatorPrefs.rsi) {
    const s = addOverlayLine("rsi", rsi(candles, 14), INDICATOR_META.rsi.color, 2)
    s.createPriceLine({ price: 70, color: "#94a3b8", lineWidth: 1, lineStyle: 2, axisLabelVisible: false, title: "" })
    s.createPriceLine({ price: 30, color: "#94a3b8", lineWidth: 1, lineStyle: 2, axisLabelVisible: false, title: "" })
  }
  if (indicatorPrefs.macd) {
    const data = macd(candles)
    const m = addOverlayLine("macd", data.map(d => ({ time: d.time, value: d.macd })), INDICATOR_META.macd.color, 2)
    const sig = addOverlayLine("macdSig", data.filter(d => d.signal != null).map(d => ({ time: d.time, value: d.signal })), "#f97316")
    const hist = chart.addHistogramSeries({
      priceScaleId: "macd",
      priceLineVisible: false,
      lastValueVisible: false,
      base: 0
    })
    hist.setData(data.filter(d => d.histogram != null).map(d => ({
      time: d.time, value: d.histogram, color: d.histogram >= 0 ? "#16a34a" : "#dc2626"
    })))
    m.createPriceLine({ price: 0, color: "#94a3b8", lineWidth: 1, lineStyle: 2, axisLabelVisible: false, title: "" })
    indicatorSeries.macd = m
    indicatorSeries.macdSig = sig
    indicatorSeries.macdHist = hist
  }
}

function clearIndicators () {
  for (const key of Object.keys(indicatorSeries)) {
    const s = indicatorSeries[key]
    if (Array.isArray(s)) s.forEach(x => chart.removeSeries(x))
    else chart.removeSeries(s)
    delete indicatorSeries[key]
  }
}

// Called on every live candle tick: recompute and push only the last point.
function updateIndicators () {
  if (!candles || !candles.length) return
  const last = a => a[a.length - 1]
  if (indicatorSeries.ma20) { const p = sma(candles, 20); if (p.length) indicatorSeries.ma20.update(last(p)) }
  if (indicatorSeries.ma50) { const p = sma(candles, 50); if (p.length) indicatorSeries.ma50.update(last(p)) }
  if (indicatorSeries.ema12) { const p = ema(candles, 12); if (p.length) indicatorSeries.ema12.update(last(p)) }
  if (indicatorSeries.bb) {
    const bb = bollinger(candles, 20, 2)
    if (bb.mid.length) {
      indicatorSeries.bb[0].update(last(bb.upper))
      indicatorSeries.bb[1].update(last(bb.mid))
      indicatorSeries.bb[2].update(last(bb.lower))
    }
  }
  if (indicatorSeries.rsi) { const p = rsi(candles, 14); if (p.length) indicatorSeries.rsi.update(last(p)) }
  if (indicatorSeries.macd) {
    const data = macd(candles)
    if (data.length) {
      const d = last(data)
      indicatorSeries.macd.update({ time: d.time, value: d.macd })
      if (d.signal != null) indicatorSeries.macdSig.update({ time: d.time, value: d.signal })
      if (d.histogram != null) indicatorSeries.macdHist.update({ time: d.time, value: d.histogram, color: d.histogram >= 0 ? "#16a34a" : "#dc2626" })
    }
  }
}

function buildIndicatorToolbar (container) {
  const bar = document.createElement("div")
  bar.style.cssText = "display:flex;gap:4px;padding:4px 8px;font-size:11px;user-select:none"
  for (const key of Object.keys(INDICATOR_META)) {
    const btn = document.createElement("button")
    btn.textContent = INDICATOR_META[key].label
    btn.style.cssText = "cursor:pointer;border:1px solid #2a3140;background:transparent;color:#9aa4b2;border-radius:4px;padding:2px 8px;font-size:11px"
    const paint = () => {
      btn.style.borderColor = indicatorPrefs[key] ? INDICATOR_META[key].color : "#2a3140"
      btn.style.color = indicatorPrefs[key] ? INDICATOR_META[key].color : "#9aa4b2"
    }
    btn.addEventListener("click", () => {
      indicatorPrefs[key] = !indicatorPrefs[key]
      writeIndicatorPrefs()
      paint()
      applyIndicators()
    })
    paint()
    bar.appendChild(btn)
  }
  container.insertBefore(bar, container.firstChild)
}
// ------------------------------------------------------------------------
  buildIndicatorToolbar(container)

  applyIndicators()
import { CURRENCY_DECIMALS } from './config'
  updateIndicators()
import { formatUnits, formatOrder, formatPosition, formatForDisplay, formatPriceForDisplay } from './formatters'
import { selectedMarket, orders, positions, chartResolution, chartLoading, showOrdersOnChart, showPositionsOnChart, hoveredOHLC } from './stores'
import { saveUserSetting, getPrecision } from './utils'

import { getMarketCandles } from '@api/prices'

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
