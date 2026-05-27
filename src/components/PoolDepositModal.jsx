import React, { useState, useEffect } from 'react';

const PoolDepositModal = ({ pool, userBalance, onDeposit, onClose }) => {
  const [depositAmount, setDepositAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState(0);

  useEffect(() => {
    // Initialize with user's available balance
    if (userBalance) {
      setMaxAmount(userBalance);
    }
  }, [userBalance]);

  const handleMaxDeposit = () => {
    setDepositAmount(maxAmount.toString());
  };

  return (
    <div className="pool-deposit-modal">
      <div className="modal-header">
        <h2>Deposit to {pool.name}</h2>
      </div>
      <div className="modal-body">
        <div className="balance-info">
          <p>Wallet Balance: {userBalance} tokens available</p>
          <button className="max-button" onClick={handleMaxDeposit}>
            Use Max: {userBalance} tokens
          </button>
        </div>
        <input
          type="number"
          value={depositAmount}
          onChange={(e) => setDepositAmount(e.target.value)}
          placeholder="Enter amount"
        />
        <button onClick={() => onDeposit(depositAmount)}>Deposit</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default PoolDepositModal;