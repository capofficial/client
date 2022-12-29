function getPeriodPerformance(period) {
	const { balance, startingBalance, deposits, withdrawals } = period;

	const income = balance + withdrawals - deposits - startingBalance;
	const startingBalanceNet = startingBalance + deposits - withdrawals;
	// account for variable timing of deposits and withdrawals within period
	const smearedStart = (startingBalance + startingBalanceNet) / 2;

	return smearedStart ? income / smearedStart : 0;
}

function getPoolPerformance(periods, latestIndex, oldestIndex) {
	if (oldestIndex >= periods.length) {
		oldestIndex = periods.length - 1;
	}
	return -1 + periods.slice(latestIndex, oldestIndex+1)
		.reduce((rate, period) => rate * (1 + getPeriodPerformance(period)), 1);
}

export function getPoolsPerformance(stats, latestIndex, oldestIndex) {
	if (!stats) return;
	return Object.entries(stats).reduce((perf, [assetLabel, data]) => {
		if (!data.length) return perf;
		perf[assetLabel] = getPoolPerformance(data, latestIndex, oldestIndex);
		return perf;
	}, {});
}
