```diff
--- a/src/components/Chart/Chart.tsx
+++ b/src/components/Chart/Chart.tsx
@@ -45,6 +45,7 @@
   showOrders,
   showPositions,
+  showLiquidationPrice,
   height,
   onClickOrder,
   onClickPosition,
@@ -112,6 +113,12 @@
     [positions]
   );
 
+  const liquidationPriceLinesSeries = useMemo(
+    () => createLiquidationPriceLineSeries(liquidationPrices, theme),
+    [liquidationPrices, theme]
+  );
+
   useEffect(() => {
     if (!chartRef.current) return;
 
@@ -145,6 +152,10 @@
       chartRef.current.removeSeries('positions');
     }
 
+    if (showLiquidationPrice) {
+      chartRef.current.addSeries(liquidationPriceLineSeries, 'liquidationPrices');
+    } else {
+      chartRef.current.removeSeries('liquidationPrices');
+    }
+
     chartRef.current.fitContent();
   }, [
     candlestickSeries,
@@ -152,6 +163,8 @@
     showOrders,
     positionLineSeries,
     showPositions,
+    liquidationPriceLineSeries,
+    showLiquidationPrice,
   ]);
 
   return (
--- a/src/components/Chart/Chart.types.ts
+++ b/src/components/Chart/Chart.types.ts
@@ -23,6 +23,7 @@
   showOrders?: boolean;
   showPositions?: boolean;
+  showLiquidationPrice?: boolean;
   height?: number;
   onClickOrder?: (order: Order) => void;
   onClickPosition?: (position: Position) => void;
--- a/src/components/Chart/Chart.utils.ts
+++ b/src/components/Chart/Chart.utils.ts
@@ -78,6 +78,28 @@
   }));
 }
 
+export function createLiquidationPriceLineSeries(
+  liquidationPrices: LiquidationPrice[],
+  theme: Theme
+): LineSeriesData[] {
+  if (!liquidationPrices?.length) return [];
+
+  return liquidationPrices.map((lp) => ({
+    id: `liquidation-${lp.positionId}`,
+    type: 'line',
+    data: [
+      { time: lp.openTime, value: lp.price },
+      { time: lp.closeTime ?? Date.now() / 1000, value: lp.price },
+    ],
+    options: {
+      color: theme.colors.danger,
+      lineWidth: 1,
+      lineStyle: 2, // dashed
+      title: `Liq $${lp.price.toFixed(2)}`,
+    },
+  }));
+}
+
 export function createOrderLineSeries(
   orders: Order[],
   theme: Theme
--- a/src/components/Chart/index.ts
+++ b/src/components/Chart/index.ts
@@ -1,3 +1,4 @@
 export { Chart } from './Chart';
 export type { ChartProps } from './Chart.types';
+export type { LiquidationPrice } from './Chart.types';
 export { createCandlestickSeries, createOrderLineSeries, createPositionLineSeries } from './Chart.utils';
+export { createLiquidationPriceLineSeries } from './Chart.utils';
--- a/src/components/SettingsPanel/SettingsPanel.tsx
+++ b/src/components/SettingsPanel/SettingsPanel.tsx
@@ -32,6 +32,12 @@
           onChange={(e) => onSettingChange('showPositions', e.target.checked)}
         />
         <label htmlFor="show-positions">Show Positions</label>
+        <input
+          type="checkbox"
+          id="show-liquidation-price"
+          checked={settings.showLiquidationPrice}
+          onChange={(e) => onSettingChange('showLiquidationPrice', e.target.checked)}
+        />
+        <label htmlFor="show-liquidation-price">Show Liquidation Price</label>
       </div>
     </div>
   );
--- a/src/hooks/useSettings.ts
+++ b/src/hooks/useSettings.ts
@@ -6,6 +6,7 @@
   showOrders: true,
   showPositions: true,
+  showLiquidationPrice: false,
 };
 
 export function useSettings() {
--- a/src/types/settings.ts
+++ b/src/types/settings.ts
@@ -1,4 +1,5 @@
 export interface Settings {
   showOrders: boolean;
   showPositions: boolean;
+  showLiquidationPrice: boolean;
 }
--- a/src/components/Chart/Chart.tsx
+++ b/src/components/Chart/Chart.tsx
@@ -28,6 +28,7 @@
   showOrders = true,
   showPositions = true,
+  showLiquidationPrice = false,
   height = 400,
   onClickOrder,
   onClickPosition,
@@ -45,6 +46,7 @@
   const { liquidationPrices } = useLiquidationPrices(positions);
 
   const candlestickSeries = useMemo(
     () => createCandlestickSeries(candles),
     [candles]
@@ -78,6 +80,12 @@
     [positions]
   );
 
+  const liquidationPriceLineSeries = useMemo(
+    () => createLiquidationPriceLineSeries(liquidationPrices, theme),
+    [liquidationPrices, theme]
+  );
+
   useEffect(() => {
     if (!chartRef.current) return;
 
@@ -112,6 +120,12 @@
       chartRef.current.removeSeries('positions");
     }
 
+    if (showLiquidationPrice) {
+      chartRef.current.addSeries(liquidationPriceLineSeries, 'liquidationPrices');
+    } else {
+      chartRef.current.removeSeries('liquidationPrices');
+    }
+
     chartRef.current.fitContent();
   }, [
     candlestickSeries,
@@ -119,6 +133,8 @@
     showOrders,
     positionLineSeries,
     showPositions,
+    liquidationPriceLineSeries,
+    showLiquidationPrice,
   ]);
 
   return (
--- a/src/components/Chart/Chart.types.ts
+++ b/src/components/Chart/Chart.types.ts
@@ -12,6 +12,12 @@
   closeTime?: number;
 }
 
+export interface LiquidationPrice {
+  positionId: string;
+  price: number;
+  openTime: number;
+  closeTime?: number;
+}
+
 export interface ChartProps {
   candles: Candle[];
   orders?: Order[];
@@ -20,6 +26,8 @@
   showOrders?: boolean;
   showPositions?: boolean;
+  showLiquidationPrice?: boolean;
   height?: number;
   onClickOrder?: (order: Order) => void;
   onClickPosition?: (position: Position) => void;
--- a/src/components/Chart/Chart.utils.ts
+++ b/src/components/Chart/Chart.utils.ts
@@ -78,6 +78,28 @@
   }));
 }
 
+export function createLiquidationPriceLineSeries(
+  liquidationPrices: LiquidationPrice[],
+  theme: Theme
+): LineSeriesData[]