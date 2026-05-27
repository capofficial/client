import React, { useState, useEffect } from 'react';
import { format } from 'd3-format';

const PoolDepositModal = ({ pool, user, onClose, onDeposit }) => {
  const [depositAmount, setDepositAmount] = useState('');
  const [userBalance, setUserBalance] = useState(0);
  const [walletBalance, setWalletBalance] = useState(0);
  
  // Get user's wallet balance
  useEffect(() => {
    const fetchWalletBalance = async () => {
      if (user && user.address) {
        try {
          const balance = await getWalletBalance(user.address, pool.token);
          setWalletBalance(balance);
        } catch (error) {
          console.error('Error fetching wallet balance:', error);
        }
      }
    };
    
    fetchWalletBalance();
  }, [user, pool]);
  
  const handleMaxDeposit = () => {
    setDepositAmount(walletBalance.toString());
  };
  
  return (
    <div className="deposit-modal">
      <div className="modal-header">
        <h2>Deposit to Pool</h2>
      </div>
      <div className="modal-content">
        <div className="balance-info">
          <div className="balance-item">
            <label>Wallet Balance:</label>
            <span className="balance-amount">{format('.4f')(walletBalance)} {pool.token.symbol}</span>
            <button onClick={handleMaxDeposit} className="max-button">
              Max: {format('.4f')(walletBalance)} {pool.token.symbol}
            </button>
          </div>
        </div>
        <div className="form-group">
          <input 
            type="text" 
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            placeholder="Amount to deposit"
          />
        </div>
        <div className="modal-actions">
          <button onClick={() => onDeposit(depositAmount)}>Deposit</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default PoolDepositModal;