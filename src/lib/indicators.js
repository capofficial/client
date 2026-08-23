// src/lib/indicators.js
// Simple technical indicators for the lightweight-charts candle chart (issue #16).
// All functions are pure: they take the candle buffer held by chart.js
// ([{ time, open, high, low, close, volume }], oldest -> newest) and return
// point arrays ready for series.setData()/series.update().

export const INDICATOR_META = {
  ma20:  { label: "MA 20",  color: "#f5b942" },
  ma50:  { label: "MA 50",  color: "#4f9cf9" },
  ema12: { label: "EMA 12", color: "#2dd4bf" },
  bb:    { label: "BB 20",  color: "#94a3b8" },
  rsi:   { label: "RSI 14", color: "#f97316" },
  macd:  { label: "MACD",   color: "#16a34a" }
}

export const DEFAULT_PREFS = {
  ma20: true, ma50: false, ema12: false, bb: false, rsi: false, macd: false
}

export function sma (candles, period) {
  const out = []
  let sum = 0
  for (let i = 0; i < candles.length; i++) {
    sum += candles[i].close
    if (i >= period) sum -= candles[i - period].close
    if (i >= period - 1) out.push({ time: candles[i].time, value: sum / period })
  }
  return out
}

export function ema (candles, period) {
  const vals = emaValues(candles.map(c => c.close), period)
  const out = []
  for (let i = 0; i < candles.length; i++) {
    if (vals[i] != null) out.push({ time: candles[i].time, value: vals[i] })
  }
  return out
}

// Wilder-smoothed RSI.
export function rsi (candles, period = 14) {
  const out = []
  if (candles.length <= period) return out
  let gain = 0
  let loss = 0
  for (let i = 1; i <= period; i++) {
    const d = candles[i].close - candles[i - 1].close
    if (d >= 0) gain += d
    else loss -= d
  }
  let avgGain = gain / period
  let avgLoss = loss / period
  const value = () => avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss)
  out.push({ time: candles[period].time, value: value() })
  for (let i = period + 1; i < candles.length; i++) {
    const d = candles[i].close - candles[i - 1].close
    avgGain = (avgGain * (period - 1) + Math.max(d, 0)) / period
    avgLoss = (avgLoss * (period - 1) + Math.max(-d, 0)) / period
    out.push({ time: candles[i].time, value: value() })
  }
  return out
}

// Returns { time, macd, signal, histogram } rows; signal/histogram are null
// until enough data exists.
export function macd (candles, fast = 12, slow = 26, signal = 9) {
  const closes = candles.map(c => c.close)
  const f = emaValues(closes, fast)
  const s = emaValues(closes, slow)
  const line = closes.map((_, i) => (f[i] != null && s[i] != null) ? f[i] - s[i] : null)
  const first = line.findIndex(v => v != null)
  const sig = new Array(closes.length).fill(null)
  if (first !== -1) {
    emaValues(line.slice(first), signal).forEach((v, i) => { sig[first + i] = v })
  }
  const out = []
  for (let i = 0; i < candles.length; i++) {
    if (line[i] == null) continue
    out.push({
      time: candles[i].time,
      macd: line[i],
      signal: sig[i],
      histogram: sig[i] == null ? null : line[i] - sig[i]
    })
  }
  return out
}

export function bollinger (candles, period = 20, mult = 2) {
  const mid = []
  const upper = []
  const lower = []
  for (let i = period - 1; i < candles.length; i++) {
    let sum = 0
    for (let j = i - period + 1; j <= i; j++) sum += candles[j].close
    const m = sum / period
    let variance = 0
    for (let j = i - period + 1; j <= i; j++) {
      const d = candles[j].close - m
      variance += d * d
    }
    const sd = Math.sqrt(variance / period)
    const time = candles[i].time
    mid.push({ time, value: m })
    upper.push({ time, value: m + mult * sd })
    lower.push({ time, value: m - mult * sd })
  }
  return { mid, upper, lower }
}

// Standard EMA seeded with an SMA; entries before the seed are null.
function emaValues (values, period) {
  const out = new Array(values.length).fill(null)
  if (values.length < period) return out
  const k = 2 / (period + 1)
  let prev = 0
  for (let i = 0; i < period; i++) prev += values[i]
  prev /= period
  out[period - 1] = prev
  for (let i = period; i < values.length; i++) {
    prev = values[i] * k + prev * (1 - k)
    out[i] = prev
  }
  return out
}
