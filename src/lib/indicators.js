function getClose(candle) {
	return candle.close * 1;
}

export function calculateSMA(candles, period) {
	if (!candles || candles.length < period) return [];

	const values = [];
	let sum = 0;

	for (let index = 0; index < candles.length; index++) {
		sum += getClose(candles[index]);
		if (index >= period) sum -= getClose(candles[index - period]);

		if (index >= period - 1) {
			values.push({
				time: candles[index].time,
				value: sum / period
			});
		}
	}

	return values;
}

export function calculateEMA(candles, period) {
	if (!candles || candles.length < period) return [];

	const values = [];
	const multiplier = 2 / (period + 1);
	let sum = 0;

	for (let index = 0; index < period; index++) {
		sum += getClose(candles[index]);
	}

	let previousEMA = sum / period;
	values.push({
		time: candles[period - 1].time,
		value: previousEMA
	});

	for (let index = period; index < candles.length; index++) {
		previousEMA = (getClose(candles[index]) - previousEMA) * multiplier + previousEMA;
		values.push({
			time: candles[index].time,
			value: previousEMA
		});
	}

	return values;
}

export function calculateRSI(candles, period = 14) {
	if (!candles || candles.length <= period) return [];

	const values = [];
	let gains = 0;
	let losses = 0;

	for (let index = 1; index <= period; index++) {
		const change = getClose(candles[index]) - getClose(candles[index - 1]);
		if (change >= 0) {
			gains += change;
		} else {
			losses -= change;
		}
	}

	let averageGain = gains / period;
	let averageLoss = losses / period;

	values.push({
		time: candles[period].time,
		value: getRSIValue(averageGain, averageLoss)
	});

	for (let index = period + 1; index < candles.length; index++) {
		const change = getClose(candles[index]) - getClose(candles[index - 1]);
		const gain = change > 0 ? change : 0;
		const loss = change < 0 ? -change : 0;

		averageGain = (averageGain * (period - 1) + gain) / period;
		averageLoss = (averageLoss * (period - 1) + loss) / period;

		values.push({
			time: candles[index].time,
			value: getRSIValue(averageGain, averageLoss)
		});
	}

	return values;
}

function getRSIValue(averageGain, averageLoss) {
	if (!averageLoss) return averageGain ? 100 : 50;

	const relativeStrength = averageGain / averageLoss;
	return 100 - 100 / (1 + relativeStrength);
}

export function calculateMACD(candles, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
	if (!candles || candles.length < slowPeriod + signalPeriod) {
		return {
			macd: [],
			signal: [],
			histogram: []
		};
	}

	const fastEMA = calculateEMA(candles, fastPeriod);
	const slowEMA = calculateEMA(candles, slowPeriod);
	const macd = [];
	const fastOffset = slowPeriod - fastPeriod;

	for (let index = 0; index < slowEMA.length; index++) {
		const fastPoint = fastEMA[index + fastOffset];
		const slowPoint = slowEMA[index];
		if (!fastPoint || !slowPoint) continue;

		macd.push({
			time: slowPoint.time,
			value: fastPoint.value - slowPoint.value
		});
	}

	const signal = calculateEMAFromValues(macd, signalPeriod);
	const signalOffset = signalPeriod - 1;
	const histogram = [];

	for (let index = signalOffset; index < macd.length; index++) {
		const signalPoint = signal[index - signalOffset];
		if (!signalPoint) continue;

		const value = macd[index].value - signalPoint.value;
		histogram.push({
			time: macd[index].time,
			value,
			color: value >= 0 ? 'rgba(64, 214, 67, 0.45)' : 'rgba(255, 83, 36, 0.45)'
		});
	}

	return {
		macd,
		signal,
		histogram
	};
}

function calculateEMAFromValues(points, period) {
	if (!points || points.length < period) return [];

	const values = [];
	const multiplier = 2 / (period + 1);
	let sum = 0;

	for (let index = 0; index < period; index++) {
		sum += points[index].value;
	}

	let previousEMA = sum / period;
	values.push({
		time: points[period - 1].time,
		value: previousEMA
	});

	for (let index = period; index < points.length; index++) {
		previousEMA = (points[index].value - previousEMA) * multiplier + previousEMA;
		values.push({
			time: points[index].time,
			value: previousEMA
		});
	}

	return values;
}
