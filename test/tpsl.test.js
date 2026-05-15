import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  calculateTPSLAmount,
  calculateTPSLPercent,
  calculateTPSLPrice,
} from '../src/lib/tpsl.js';

describe('TP/SL calculations', () => {
  it('keeps long take-profit target price, P/L percent, and P/L amount in sync', () => {
    const price = calculateTPSLPrice({
      referencePrice: 100,
      pnlPercent: 50,
      leverage: 10,
      isLong: true,
      side: 'take-profit',
    });

    assert.equal(price, 105);
    assert.equal(calculateTPSLPercent({
      referencePrice: 100,
      targetPrice: price,
      leverage: 10,
      isLong: true,
      side: 'take-profit',
    }), 50);
    assert.equal(calculateTPSLAmount({
      size: 1000,
      pnlPercent: 50,
      leverage: 10,
    }), 50);
  });

  it('keeps short stop-loss target price, P/L percent, and P/L amount in sync', () => {
    const price = calculateTPSLPrice({
      referencePrice: 100,
      pnlPercent: 25,
      leverage: 5,
      isLong: false,
      side: 'stop-loss',
    });

    assert.equal(price, 105);
    assert.equal(calculateTPSLPercent({
      referencePrice: 100,
      targetPrice: price,
      leverage: 5,
      isLong: false,
      side: 'stop-loss',
    }), 25);
    assert.equal(calculateTPSLAmount({
      size: 2000,
      pnlPercent: 25,
      leverage: 5,
    }), 100);
  });

  it('derives P/L percent from an amount and rejects invalid inputs', () => {
    assert.equal(calculateTPSLPercent({
      pnlAmount: 40,
      size: 1000,
      leverage: 20,
    }), 80);

    assert.equal(calculateTPSLPrice({
      referencePrice: 0,
      pnlPercent: 50,
      leverage: 10,
      isLong: true,
      side: 'take-profit',
    }), undefined);
    assert.equal(calculateTPSLPercent({
      referencePrice: 100,
      targetPrice: 95,
      leverage: 10,
      isLong: true,
      side: 'take-profit',
    }), undefined);
  });
});
