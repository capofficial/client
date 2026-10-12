import React from 'react'
import { Trade } from '../types/trade'
import TradeSharingButton from '../components/TradeSharing/TradeSharingButton'

// Mock data for demonstration
const mockTrades: Trade[] = [
  {
    id: 'trade-123',
    asset: 'ETH/USD',
    direction: 'Long',
    entryPrice: 1850.75,
    exitPrice: 1920.30,
    leverage: 10,
    pnl: 700.50,
    pnlPercentage: 3.78,
    status: 'Closed',
    openTimestamp: 1678886400, // March 15, 2023 00:00:00 GMT
    closeTimestamp: 1678972800, // March 16, 2023 00:00:00 GMT
    size: 10000,
    collateral: 1000,
  },
  {
    id: 'trade-456',
    asset: 'BTC/USD',
    direction: 'Short',
    entryPrice: 28000.00,
    exitPrice: 27500.00,
    leverage: 5,
    pnl: 2500.00,
    pnlPercentage: 1.78,
    status: 'Closed',
    openTimestamp: 1678713600, // March 13, 2023 00:00:00 GMT
    closeTimestamp: 1678790400, // March 14, 2023 00:00:00 GMT
    size: 50000,
    collateral: 10000,
  },
  {
    id: 'trade-789',
    asset: 'LINK/USD',
    direction: 'Long',
    entryPrice: 7.20,
    leverage: 20,
    status: 'Open',
    openTimestamp: 1679059200, // March 17, 2023 00:00:00 GMT
    size: 500,
    collateral: 25,
  },
]

// Mock wallet address
const MOCK_WALLET_ADDRESS = '0xAbc1234567890aBc1234567890aBc1234567890a'

const TradeHistory: React.FC = () => {
  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-8">Trade History</h1>

      <div className="space-y-6">
        {mockTrades.map((trade) => (
          <div key={trade.id} className="bg-gray-800 p-6 rounded-lg shadow-lg flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-semibold mb-2">{trade.asset} - {trade.direction}</h2>
              <p>Entry Price: ${trade.entryPrice.toFixed(2)}</p>
              {trade.exitPrice && <p>Exit Price: ${trade.exitPrice.toFixed(2)}</p>}
              <p>Leverage: {trade.leverage}x</p>
              {trade.pnl && (
                <p className={trade.pnl >= 0 ? 'text-green-500' : 'text-red-500'}>
                  PnL: ${trade.pnl.toFixed(2)} ({trade.pnlPercentage?.toFixed(2)}%)
                </p>
              )}
              <p>Status: {trade.status}</p>
            </div>
            <TradeSharingButton trade={trade} walletAddress={MOCK_WALLET_ADDRESS} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default TradeHistory

