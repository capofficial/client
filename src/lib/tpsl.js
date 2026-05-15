export function calculateTPSLPrice(params) {
  const { referencePrice, pnlPercent, leverage, isLong, side } = params;
  const ref = toPositiveNumber(referencePrice);
  const percent = toPositiveNumber(pnlPercent);
  const lev = toPositiveNumber(leverage);

  if (!ref || !percent || !lev) return undefined;

  const priceMove = (percent / 100) / lev;
  const direction = getTargetDirection(side, isLong);
  if (!direction) return undefined;

  const price = ref * (1 + direction * priceMove);
  return price > 0 ? price : undefined;
}

export function calculateTPSLPercent(params) {
  const { referencePrice, targetPrice, pnlAmount, size, leverage, isLong, side } = params;
  const lev = toPositiveNumber(leverage);
  if (!lev) return undefined;

  if (toPositiveNumber(pnlAmount) && toPositiveNumber(size)) {
    return 100 * pnlAmount * lev / size;
  }

  const ref = toPositiveNumber(referencePrice);
  const target = toPositiveNumber(targetPrice);
  if (!ref || !target) return undefined;

  const direction = getTargetDirection(side, isLong);
  if (!direction) return undefined;

  const percent = 100 * lev * direction * (target - ref) / ref;
  return percent > 0 ? percent : undefined;
}

export function calculateTPSLAmount(params) {
  const { size, pnlPercent, leverage } = params;
  const orderSize = toPositiveNumber(size);
  const percent = toPositiveNumber(pnlPercent);
  const lev = toPositiveNumber(leverage);

  if (!orderSize || !percent || !lev) return undefined;

  return orderSize * (percent / 100) / lev;
}

function getTargetDirection(side, isLong) {
  if (side === 'take-profit') return isLong ? 1 : -1;
  if (side === 'stop-loss') return isLong ? -1 : 1;
}

function toPositiveNumber(value) {
  const number = value * 1;
  return Number.isFinite(number) && number > 0 ? number : undefined;
}
