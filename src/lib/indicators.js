// Technical Indicators for Chart
// Calculates MA, RSI, MACD

/**
 * Calculate Simple Moving Average (SMA)
 * @param {Array} data - Array of candle data {close, time}
 * @param {number} period - SMA period
 * @returns {Array} - Array of {time, value} for SMA
 */
export function calculateSMA(data, period = 20) {
	if (!data || data.length < period) return [];
	
	const sma = [];
	for (let i = period - 1; i < data.length; i++) {
		let sum = 0;
		for (let j = 0; j < period; j++) {
			sum += data[i - j].close;
		}
		sma.push({
			time: data[i].time,
			value: sum / period
		});
	}
	return sma;
}

/**
 * Calculate Exponential Moving Average (EMA)
 * @param {Array} data - Array of candle data {close, time}
 * @param {number} period - EMA period
 * @returns {Array} - Array of {time, value} for EMA
 */
export function calculateEMA(data, period = 20) {
	if (!data || data.length < period) return [];
	
	const ema = [];
	const multiplier = 2 / (period + 1);
	
	// First EMA is SMA
	let sum = 0;
	for (let i = 0; i < period; i++) {
		sum += data[i].close;
	}
	let previousEMA = sum / period;
	
	ema.push({
		time: data[period - 1].time,
		value: previousEMA
	});
	
	// Calculate subsequent EMAs
	for (let i = period; i < data.length; i++) {
		const currentEMA = (data[i].close - previousEMA) * multiplier + previousEMA;
		ema.push({
			time: data[i].time,
			value: currentEMA
		});
		previousEMA = currentEMA;
	}
	
	return ema;
}

/**
 * Calculate Relative Strength Index (RSI)
 * @param {Array} data - Array of candle data {close, time}
 * @param {number} period - RSI period (default 14)
 * @returns {Array} - Array of {time, value} for RSI
 */
export function calculateRSI(data, period = 14) {
	if (!data || data.length < period + 1) return [];
	
	const rsi = [];
	let gains = 0;
	let losses = 0;
	
	// Calculate initial average gain/loss
	for (let i = 1; i <= period; i++) {
		const change = data[i].close - data[i - 1].close;
		if (change > 0) {
			gains += change;
		} else {
			losses += Math.abs(change);
		}
	}
	
	let avgGain = gains / period;
	let avgLoss = losses / period;
	
	// Calculate first RSI
	let rs = avgGain / avgLoss;
	let rsiValue = 100 - (100 / (1 + rs));
	
	rsi.push({
		time: data[period].time,
		value: rsiValue
	});
	
	// Calculate subsequent RSIs using smoothed averages
	for (let i = period + 1; i < data.length; i++) {
		const change = data[i].close - data[i - 1].close;
		const gain = change > 0 ? change : 0;
		const loss = change < 0 ? Math.abs(change) : 0;
		
		avgGain = ((avgGain * (period - 1)) + gain) / period;
		avgLoss = ((avgLoss * (period - 1)) + loss) / period;
		
		rs = avgGain / avgLoss;
		rsiValue = 100 - (100 / (1 + rs));
		
		rsi.push({
			time: data[i].time,
			value: rsiValue
		});
	}
	
	return rsi;
}

/**
 * Calculate MACD (Moving Average Convergence Divergence)
 * @param {Array} data - Array of candle data {close, time}
 * @param {number} fastPeriod - Fast EMA period (default 12)
 * @param {number} slowPeriod - Slow EMA period (default 26)
 * @param {number} signalPeriod - Signal line period (default 9)
 * @returns {Object} - {macdLine, signalLine, histogram}
 */
export function calculateMACD(data, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
	if (!data || data.length < slowPeriod + signalPeriod) {
		return { macdLine: [], signalLine: [], histogram: [] };
	}
	
	// Calculate fast and slow EMAs
	const fastEMA = calculateEMA(data, fastPeriod);
	const slowEMA = calculateEMA(data, slowPeriod);
	
	// Calculate MACD line (fast EMA - slow EMA)
	const macdLine = [];
	const startIndex = slowPeriod - fastPeriod;
	
	for (let i = 0; i < slowEMA.length; i++) {
		if (i + startIndex < fastEMA.length) {
			macdLine.push({
				time: slowEMA[i].time,
				value: fastEMA[i + startIndex].value - slowEMA[i].value
			});
		}
	}
	
	// Calculate signal line (EMA of MACD line)
	const signalLine = [];
	if (macdLine.length >= signalPeriod) {
		const multiplier = 2 / (signalPeriod + 1);
		
		// First signal is SMA of first signalPeriod MACD values
		let sum = 0;
		for (let i = 0; i < signalPeriod; i++) {
			sum += macdLine[i].value;
		}
		let previousSignal = sum / signalPeriod;
		
		signalLine.push({
			time: macdLine[signalPeriod - 1].time,
			value: previousSignal
		});
		
		// Calculate subsequent signal values
		for (let i = signalPeriod; i < macdLine.length; i++) {
			const currentSignal = (macdLine[i].value - previousSignal) * multiplier + previousSignal;
			signalLine.push({
				time: macdLine[i].time,
				value: currentSignal
			});
			previousSignal = currentSignal;
		}
	}
	
	// Calculate histogram (MACD line - signal line)
	const histogram = [];
	const signalStartIndex = signalPeriod - 1;
	
	for (let i = signalStartIndex; i < macdLine.length; i++) {
		if (i - signalStartIndex < signalLine.length) {
			histogram.push({
				time: macdLine[i].time,
				value: macdLine[i].value - signalLine[i - signalStartIndex].value
			});
		}
	}
	
	return { macdLine, signalLine, histogram };
}

/**
 * Calculate Bollinger Bands
 * @param {Array} data - Array of candle data {close, time}
 * @param {number} period - SMA period (default 20)
 * @param {number} stdDev - Standard deviation multiplier (default 2)
 * @returns {Object} - {middle, upper, lower}
 */
export function calculateBollingerBands(data, period = 20, stdDev = 2) {
	if (!data || data.length < period) return { middle: [], upper: [], lower: [] };
	
	const middle = calculateSMA(data, period);
	const upper = [];
	const lower = [];
	
	for (let i = period - 1; i < data.length; i++) {
		// Calculate standard deviation
		let sum = 0;
		for (let j = 0; j < period; j++) {
			sum += data[i - j].close;
		}
		const sma = sum / period;
		
		let variance = 0;
		for (let j = 0; j < period; j++) {
			variance += Math.pow(data[i - j].close - sma, 2);
		}
		const standardDeviation = Math.sqrt(variance / period);
		
		upper.push({
			time: data[i].time,
			value: sma + (standardDeviation * stdDev)
		});
		
		lower.push({
			time: data[i].time,
			value: sma - (standardDeviation * stdDev)
		});
	}
	
	return { middle, upper, lower };
}
