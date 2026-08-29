import { formatCurrency, formatPercent } from './formatters';

const PRESET_PERCENTS = [0.5, 1, 2, 3, 5];

export function createTpSlInput(container, opts = {}) {
  const {
    label,
    type, // 'tp' or 'sl'
    entryPrice,
    positionSize,
    side, // 'long' or 'short'
    currentPrice,
    onChange,
  } = opts;

  const wrapper = document.createElement('div');
  wrapper.className = `tp-sl-input tp-sl-${type}`;

  const labelEl = document.createElement('label');
  labelEl.textContent = label || (type === 'tp' ? 'Take Profit' : 'Stop Loss');
  wrapper.appendChild(labelEl);

  const inputRow = document.createElement('div');
  inputRow.className = 'tp-sl-row';

  const priceInput = document.createElement('input');
  priceInput.type = 'number';
  priceInput.step = 'any';
  priceInput.placeholder = 'Price';
  priceInput.className = 'tp-sl-price';

  const percentInput = document.createElement('input');
  percentInput.type = 'number';
  percentInput.step = 'any';
  percentInput.placeholder = '%';
  percentInput.className = 'tp-sl-percent';

  const pnlInput = document.createElement('input');
  pnlInput.type = 'number';
  pnlInput.step = 'any';
  pnlInput.placeholder = 'P/L $';
  pnlInput.className = 'tp-sl-pnl';

  inputRow.append(priceInput, percentInput, pnlInput);
  wrapper.appendChild(inputRow);

  const presets = document.createElement('div');
  presets.className = 'tp-sl-presets';
  PRESET_PERCENTS.forEach(pct => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = `+${pct}%`;
    btn.className = 'tp-sl-preset-btn';
    btn.onclick = () => setFromPercent(pct);
    presets.appendChild(btn);
  });
  wrapper.appendChild(presets);

  const info = document.createElement('div');
  info.className = 'tp-sl-info';
  wrapper.appendChild(info);

  container.appendChild(wrapper);

  let suppressSync = false;

  function calcPnl(price) {
    if (!entryPrice || !positionSize) return { amount: 0, percent: 0 };
    const diff = side === 'long' ? price - entryPrice : entryPrice - price;
    const amount = diff * positionSize;
    const percent = (diff / entryPrice) * 100;
    return { amount, percent };
  }

  function updateInfo(price) {
    const { amount, percent } = calcPnl(price);
    info.textContent = `P/L: ${formatCurrency(amount)} (${formatPercent(percent)})`;
  }

  function setFromPrice(price, source) {
    if (suppressSync) return;
    suppressSync = true;
    priceInput.value = price;
    const { amount, percent } = calcPnl(price);
    percentInput.value = percent.toFixed(4);
    pnlInput.value = amount.toFixed(2);
    updateInfo(price);
    suppressSync = false;
    if (source !== 'price') onChange?.({ type, price, percent, pnl: amount });
  }

  function setFromPercent(pct, source) {
    if (!entryPrice) return;
    const direction = side === 'long' ? 1 : -1;
    const price = entryPrice * (1 + (direction * pct) / 100);
    if (suppressSync) return;
    suppressSync = true;
    percentInput.value = pct;
    priceInput.value = price.toFixed(6);
    const { amount } = calcPnl(price);
    pnlInput.value = amount.toFixed(2);
    updateInfo(price);
    suppressSync = false;
    if (source !== 'percent') onChange?.({ type, price, percent: pct, pnl: amount });
  }

  function setFromPnl(pnlAmount, source) {
    if (!entryPrice || !positionSize) return;
    const diff = pnlAmount / positionSize;
    const price = side === 'long' ? entryPrice + diff : entryPrice - diff;
    if (suppressSync) return;
    suppressSync = true;
    pnlInput.value = pnlAmount;
    priceInput.value = price.toFixed(6);
    const { percent } = calcPnl(price);
    percentInput.value = percent.toFixed(4);
    updateInfo(price);
    suppressSync = false;
    if (source !== 'pnl') onChange?.({ type, price, percent, pnl: pnlAmount });
  }

  priceInput.addEventListener('input', () => {
    const v = parseFloat(priceInput.value);
    if (!isNaN(v)) setFromPrice(v, 'price');
  });

  percentInput.addEventListener('input', () => {
    const v = parseFloat(percentInput.value);
    if (!isNaN(v)) setFromPercent(v, 'percent');
  });

  pnlInput.addEventListener('input', () => {
    const v = parseFloat(pnlInput.value);
    if (!isNaN(v)) setFromPnl(v, 'pnl');
  });

  return {
    setPrice: p => setFromPrice(p),
    setPercent: p => setFromPercent(p),
    setPnl: p => setFromPnl(p),
    destroy: () => wrapper.remove(),
  };
}
