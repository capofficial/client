# TradingView Full Charting Library Setup

This document describes how to set up the TradingView Charting Library for the full charting feature.

## Obtaining the TradingView Charting Library

The TradingView Charting Library is a proprietary library that requires a license from TradingView.

### Steps to obtain the library:

1. **Apply for a TradingView license** (free for non-commercial and some commercial uses):
   - Visit: https://www.tradingview.com/ chart/
   - Click "Get Library" or contact TradingView for licensing

2. **Download the library files** after license approval:
   - You'll receive a download link or GitHub access
   - The library package includes:
     - `charting_library.min.js` - Main charting library
     - `charting_library.min.css` - Styles (if separate)
     - `datafeed/` - Data feed adapters

3. **Place files in public directory**:
   ```
   public/charting_library/
   ├── charting_library.min.js
   └── datafeed/
       └── ...
   ```

## Features Implemented

### 1. Simple/Full Chart Toggle
- Users can switch between the lightweight-charts (simple) and TradingView full chart
- Selection is persisted in localStorage under `userSettings.chartMode`
- Toggle buttons in the top-right of the chart area

### 2. TradingView Full Chart Features
- All TA indicators: MA, RSI, MACD, Bollinger Bands, Stochastic, ATR, CCI, OBV, Volume
- Drawing tools: Trend lines, Fibonacci retracement, Horizontal ray, Arrow marks, etc.
- Dark theme matching CAP design
- Real-time price updates
- Resolution/interval support (1m, 5m, 15m, 1h, 4h, 1D)

### 3. Server-Side Drawings Persistence
Drawings are persisted server-side per-market via API endpoints:

#### GET /api/drawings?market={market}
Returns saved drawings for a market.

#### POST /api/drawings
Body: `{ market: string, drawings: array }`
Saves drawings for a market.

#### DELETE /api/drawings?market={market}
Deletes all drawings for a market.

### 4. localStorage Persistence
User preferences saved:
- `userSettings.chartMode` - 'simple' or 'full'
- `userSettings.chartResolution` - Chart timeframe
- `userSettings.chartHeight` - Chart height preference

## API Implementation

The frontend API client is in `src/api/drawings.js`. The backend needs to implement:

```javascript
// Example backend implementation (Express.js)
app.get('/api/drawings', async (req, res) => {
  const { market } = req.query;
  const drawings = await db.getDrawings(req.user.id, market);
  res.json(drawings);
});

app.post('/api/drawings', async (req, res) => {
  const { market, drawings } = req.body;
  await db.saveDrawings(req.user.id, market, drawings);
  res.json({ success: true });
});

app.delete('/api/drawings', async (req, res) => {
  const { market } = req.query;
  await db.deleteDrawings(req.user.id, market);
  res.json({ success: true });
});
```

## Fallback Behavior

If the TradingView library fails to load:
1. An error message is displayed in the chart area
2. Users can still use the simple chart
3. The app continues to work normally

## Troubleshooting

### Library not loading
- Verify files are in `public/charting_library/`
- Check browser console for 404 errors
- Ensure the server is serving static files correctly

### Drawings not saving
- Check network tab for API errors
- Verify backend API is implemented and running
- Check if user is authenticated for API calls

### Chart not displaying data
- The TradingView library requires a data feed
- For live data, implement a custom data feed adapter
- See TradingView documentation for data feed implementation
