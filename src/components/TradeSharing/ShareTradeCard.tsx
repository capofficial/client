import React from 'react'
import moment from 'moment'

// Assuming a basic Trade interface exists
import { Trade } from '../../types/trade'

interface ShareTradeCardProps {
  trade: Trade;
  walletAddress: string; // To display a truncated address
}

const formatCurrency = (value: number, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

const formatPercentage = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100) // Assuming value is like 10 for 10%
}

const truncateAddress = (address: string) => {
  if (!address) return ''
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
}

const ShareTradeCard: React.FC<ShareTradeCardProps> = ({ trade, walletAddress }) => {
  const isClosed = trade.status === 'Closed'
  const pnlValue = trade.pnl || 0
  const pnlPercentageValue = trade.pnlPercentage || 0
  const isProfit = pnlValue >= 0

  return (
    <div
      id={`share-trade-card-${trade.id}`} // Unique ID for html-to-image
      style={{
        width: '400px',
        fontFamily: 'Inter, sans-serif',
        backgroundColor: '#1a1a2e', // Dark background
        color: '#e0e0e0', // Light text
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        border: '1px solid #3a3a5e',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #3a3a5e', paddingBottom: '16px', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src="/cap_logo.svg" alt="CAP Logo" style={{ height: '30px' }} /> {/* Placeholder for CAP logo */}
          <span style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff' }}>CAP Protocol</span>
        </div>
        <span style={{ fontSize: '14px', color: '#999999' }}>{moment(trade.openTimestamp * 1000).format('MMM DD, YYYY HH:mm')}</span>
      </div>

      {/* Trade Details */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '28px', fontWeight: '800', color: '#ffffff' }}>{trade.asset}</span>
          <span
            style={{
              fontSize: '18px',
              fontWeight: '700',
              padding: '6px 12px',
              borderRadius: '8px',
              backgroundColor: trade.direction === 'Long' ? '#28a745' : '#dc3545', // Green for Long, Red for Short
              color: '#ffffff',
            }}
          >
            {trade.direction}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div>
            <div style={{ fontSize: '13px', color: '#999999' }}>Entry Price</div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff' }}>{formatCurrency(trade.entryPrice, 'USD')}</div>
          </div>
          {isClosed && trade.exitPrice && (
            <div>
              <div style={{ fontSize: '13px', color: '#999999' }}>Exit Price</div>
              <div style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff' }}>{formatCurrency(trade.exitPrice, 'USD')}</div>
            </div>
          )}
          <div>
            <div style={{ fontSize: '13px', color: '#999999' }}>Leverage</div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff' }}>{trade.leverage}x</div>
          </div>
          <div>
            <div style={{ fontSize: '13px', color: '#999999' }}>Size</div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff' }}>{formatCurrency(trade.size, 'USD')}</div>
          </div>
        </div>
      </div>

      {/* PnL Section (for closed trades) */}
      {isClosed && (
        <div style={{ borderTop: '1px solid #3a3a5e', paddingTop: '16px', marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '14px', color: '#999999' }}>PnL</div>
            <div
              style={{
                fontSize: '28px',
                fontWeight: '800',
                color: isProfit ? '#28a745' : '#dc3545', // Green for profit, Red for loss
              }}
            >
              {isProfit ? '+' : ''}{formatCurrency(pnlValue, 'USD')}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '14px', color: '#999999', textAlign: 'right' }}>PnL %</div>
            <div
              style={{
                fontSize: '28px',
                fontWeight: '800',
                color: isProfit ? '#28a745' : '#dc3545',
              }}
            >
              {isProfit ? '+' : ''}{formatPercentage(pnlPercentageValue)}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ borderTop: '1px solid #3a3a5e', paddingTop: '16px', marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#999999' }}>
        <span>{truncateAddress(walletAddress)}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <img src="/cap_icon_small.svg" alt="CAP Icon" style={{ height: '16px' }} /> {/* Small icon */}
          cap.finance
        </span>
      </div>
    </div>
  )
}

export default ShareTradeCard

