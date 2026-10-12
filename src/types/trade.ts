// This file defines the basic structure for a trade.
// Adjust according to the actual data structure in capofficial/client.

export interface Trade {
  id: string;
  asset: string; // e.g., "ETH/USD"
  direction: 'Long' | 'Short';
  entryPrice: number;
  exitPrice?: number; // For historical trades
  leverage: number;
  pnl?: number; // For historical trades
  pnlPercentage?: number; // For historical trades
  status: 'Open' | 'Closed';
  openTimestamp: number; // Unix timestamp
  closeTimestamp?: number; // Unix timestamp
  size: number; // Position size
  collateral: number; // Collateral used
  // Add any other relevant fields like fees, liquidation price, etc.
}
