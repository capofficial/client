import React from 'react'
import { Trade } from '../types/trade'
import TradeSharingButton from '../components/TradeSharing/TradeSharingButton'

// Mock data for demonstration
const mockActivePositions: Trade[] = [
  {
    id: 'active-1',
    asset: 'ETH/USD',
    direction: 'Long',
    entryPrice: 1900.50,
    leverage: 15,
    status: 'Open',
    openTimestamp: 1679145600, // March 18, 2023 00:00:00 GMT
    size: 15000,
    collateral: 1000,
  },
  {
    id: 'active-2',
    asset: 'SOL/USD',
    direction: 'Short',
    entryPrice: 22.10,
    leverage: 8,
    status: 'Open',
    openTimestamp: 1679232000, // March 19, 2023 00:00:00 GMT
    size: 2000,
    collateral: 250,
  },
]

// Mock wallet address
const MOCK_WALLET_ADDRESS = '0xAbc1234567890aBc1234567890aBc1234567890a'

const ActivePositions: React.FC = () => {
  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-8">Active Positions</h1>

      <div className="space-y-6">
        {mockActivePositions.map((position) => (
          <div key={position.id} className="bg-gray-800 p-6 rounded-lg shadow-lg flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-semibold mb-2">{position.asset} - {position.direction}</h2>
              <p>Entry Price: ${position.entryPrice.toFixed(2)}</p>
              <p>Leverage: {position.leverage}x</p>
              <p>Status: {position.status}</p>
              {/* In a real app, you'd show current PnL for active positions */}
              <p className="text-yellow-400">Current PnL: (Not implemented in mock)</p>
            </div>
            <TradeSharingButton trade={position} walletAddress={MOCK_WALLET_ADDRESS} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default ActivePositions

