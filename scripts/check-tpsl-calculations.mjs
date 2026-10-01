import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../src/lib/tpsl.js', import.meta.url), 'utf8')
	.replaceAll('export function ', 'function ');

const context = {};
vm.runInNewContext(`${source}
this.getEntryPrice = getEntryPrice;
this.getTPSLPriceFromMovePercent = getTPSLPriceFromMovePercent;
this.getTPSLPriceFromPercent = getTPSLPriceFromPercent;
this.getTPSLPriceFromAmount = getTPSLPriceFromAmount;
this.getTPSLMetricsFromPrice = getTPSLMetricsFromPrice;
`, context);

assert.equal(context.getEntryPrice('', 100), 100);
assert.equal(context.getEntryPrice(125, 100), 125);

assert.equal(context.getTPSLPriceFromMovePercent(100, 2, true, true), 102);
assert.equal(context.getTPSLPriceFromMovePercent(100, 2, true, false), 98);
assert.equal(context.getTPSLPriceFromMovePercent(100, 2, false, true), 98);
assert.equal(context.getTPSLPriceFromMovePercent(100, 2, false, false), 102);

assert.equal(context.getTPSLPriceFromPercent(100, 20, 10, true, true), 102);
assert.equal(context.getTPSLPriceFromPercent(100, 20, 10, false, false), 102);
assert.equal(context.getTPSLPriceFromPercent(100, 500, 5, true, false), 0);
assert.equal(context.getTPSLPriceFromPercent(100, 505, 5, true, false), 0);

assert.equal(context.getTPSLPriceFromAmount(100, 2, 100, true, true), 102);
assert.equal(context.getTPSLPriceFromAmount(100, 2, 100, false, true), 98);
assert.equal(context.getTPSLPriceFromAmount(100, 100, 100, true, false), 0);
assert.equal(context.getTPSLPriceFromAmount(100, 101, 100, true, false), 0);

const longTp = context.getTPSLMetricsFromPrice(100, 102, 100, 10, true, true);
assert.equal(longTp.isValid, true);
assert.equal(longTp.pnlAmount, 2);
assert.equal(longTp.pnlPercent, 20);

const shortSl = context.getTPSLMetricsFromPrice(100, 102, 100, 10, false, false);
assert.equal(shortSl.isValid, true);
assert.equal(shortSl.pnlAmount, 2);
assert.equal(shortSl.pnlPercent, 20);

assert.equal(context.getTPSLMetricsFromPrice(100, 98, 100, 10, true, true).isValid, false);
assert.equal(context.getTPSLMetricsFromPrice(100, 102, 100, 10, true, false).isValid, false);

console.log('TP/SL calculation checks passed');
