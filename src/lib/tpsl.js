function toNumber(value) {
	const number = value * 1;
	return Number.isFinite(number) ? number : 0;
}

export function getEntryPrice(orderPrice, marketPrice) {
	const explicitPrice = toNumber(orderPrice);
	if (explicitPrice > 0) return explicitPrice;
	return toNumber(marketPrice);
}

export function getTPSLPriceFromMovePercent(entryPrice, movePercent, isLong, isProfitTarget) {
	entryPrice = toNumber(entryPrice);
	movePercent = toNumber(movePercent);
	if (entryPrice <= 0 || movePercent <= 0) return 0;

	const direction = isProfitTarget === isLong ? 1 : -1;
	const targetPrice = entryPrice * (1 + direction * movePercent / 100);
	return Number.isFinite(targetPrice) && targetPrice > 0 ? targetPrice : 0;
}

export function getTPSLPriceFromPercent(entryPrice, pnlPercent, leverage, isLong, isProfitTarget) {
	entryPrice = toNumber(entryPrice);
	pnlPercent = toNumber(pnlPercent);
	leverage = toNumber(leverage);
	if (entryPrice <= 0 || pnlPercent <= 0 || leverage <= 0) return 0;

	return getTPSLPriceFromMovePercent(entryPrice, pnlPercent / leverage, isLong, isProfitTarget);
}

export function getTPSLPriceFromAmount(entryPrice, pnlAmount, size, isLong, isProfitTarget) {
	entryPrice = toNumber(entryPrice);
	pnlAmount = toNumber(pnlAmount);
	size = toNumber(size);
	if (entryPrice <= 0 || pnlAmount <= 0 || size <= 0) return 0;

	return getTPSLPriceFromMovePercent(entryPrice, pnlAmount * 100 / size, isLong, isProfitTarget);
}

export function getTPSLMetricsFromPrice(entryPrice, targetPrice, size, leverage, isLong, isProfitTarget) {
	entryPrice = toNumber(entryPrice);
	targetPrice = toNumber(targetPrice);
	size = toNumber(size);
	leverage = toNumber(leverage);
	if (entryPrice <= 0 || targetPrice <= 0 || leverage <= 0) {
		return { isValid: false, pnlAmount: 0, pnlPercent: 0, movePercent: 0 };
	}

	const priceDiff = isProfitTarget === isLong
		? targetPrice - entryPrice
		: entryPrice - targetPrice;

	if (priceDiff <= 0) {
		return { isValid: false, pnlAmount: 0, pnlPercent: 0, movePercent: 0 };
	}

	const movePercent = 100 * priceDiff / entryPrice;
	return {
		isValid: true,
		movePercent,
		pnlPercent: movePercent * leverage,
		pnlAmount: size > 0 ? size * movePercent / 100 : 0
	};
}
