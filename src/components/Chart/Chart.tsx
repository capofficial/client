import { useEffect, useRef, useState } from 'react';
import { useChartData } from '../../hooks/useChartData';
import { useUserSettings } from '../../hooks/useUserSettings';
import { useLiquidationPrice } from '../../hooks/useLiquidationPrice';
import { ChartControls } from './ChartControls';
import { PriceLine } from './PriceLine';
import { OrderLine } from './OrderLine';
import { PositionLine } from './PositionLine';
import { CrosshairLine } from './CrosshairLine';
import { TimeScale } from './TimeScale';
import { LiquidationPriceLine } from './LiquidationPriceLine';
import './Chart.css';

export function Chart() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const { data, loading, error } = useChartData();
  const { settings } = useUserSettings();
  const liquidationPrice = useLiquidationPrice();
  
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [hoverPrice, setHoverPrice] = useState<number | null>(null);
          {settings.showPositions && positions.map(pos => (
            <PositionLine key={pos.id} position={pos} xScale={xScale} yScale={yScale} />
          ))}
          {settings.showLiquidationPrice && liquidationPrice !== null && (
            <LiquidationPriceLine price={liquidationPrice} xScale={xScale} yScale={yScale} />
          )}
          <CrosshairLine mousePosition={mousePosition} xScale={xScale} yScale={yScale} />
          <TimeScale xScale={xScale} height={dimensions.height} />
        </svg>
import { useMemo } from 'react';
import { ScaleLinear } from 'd3-scale';

interface LiquidationPriceLineProps {
  price: number;
  xScale: ScaleLinear<number, number>;
  yScale: ScaleLinear<number, number>;
}

export function LiquidationPriceLine({ price, xScale, yScale }: LiquidationPriceLineProps) {
  const y = yScale(price);
  const xRange = xScale.range();
  
  const label = useMemo(() => {
    return price.toFixed(2);
  }, [price]);

  if (!isFinite(y) || y < 0) {
    return null;
  }

  return (
    <g className="liquidation-price-line">
      <line
        x1={xRange[0]}
        y1={y}
        x2={xRange[1]}
        y2={y}
        stroke="#ef4444"
        strokeDasharray="4,4"
        strokeWidth={1.5}
      />
      <text x={xRange[1] - 5} y={y - 5} textAnchor="end" fill="#ef4444" fontSize={12}>
        Liq. {label}
      </text>
    </g>
  );
}
  showOrders: boolean;
  showPositions: boolean;
  showCrosshair: boolean;
  showLiquidationPrice: boolean;
  theme: 'light' | 'dark';
}

  showOrders: true,
  showPositions: true,
  showCrosshair: true,
  showLiquidationPrice: false,
  theme: 'dark',
};

        >
          Positions
        </ToggleButton>
        <ToggleButton
          active={settings.showLiquidationPrice}
          onClick={() => updateSetting('showLiquidationPrice', !settings.showLiquidationPrice)}
          icon="skull"
          title="Toggle liquidation price"
        >
          Liq. Price
        </ToggleButton>
        <ToggleButton
          active={settings.showCrosshair}
          onClick={() => updateSetting('showCrosshair', !settings.showCrosshair)}
import { useMemo } from 'react';
import { useActivePositions } from './useActivePositions';

export function useLiquidationPrice(): number | null {
  const { positions } = useActivePositions();

  return useMemo(() => {
    if (!positions || positions.length === 0) {
      return null;
    }

    // Use the first active position's liquidation price
    // In a multi-position scenario, this could be extended to show multiple
    const position = positions[0];
    
    if (position.liquidationPrice == null || !isFinite(position.liquidationPrice)) {
      return null;
    }

    return position.liquidationPrice;
  }, [positions]);
}
  pointer-events: none;
}

.liquidation-price-line {
  pointer-events: none;
  opacity: 0.9;
}

.time-scale {
  border-top: 1px solid var(--border-color);
}