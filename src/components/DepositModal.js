import React, { useState, useEffect } from 'react';
import { formatUnits } from 'ethers/lib/utils';

const DepositModal = ({ token, amount, setAmount }) => {
  const [walletBalance, setWalletBalance] = useState('');
  const [availableAmount, setAvailableAmount] = useState(0);
  const [maxDeposit, setMaxDeposit] = useState(0);
  
  useEffect(() => {
    // Get wallet balance 
    getWalletBalance().then(setWalletBalance);
    // Get available amount to withdraw
    getAvailableAmount().then(setAvailableAmount);
    // Get maximum deposit amount
    getMaxDepositAmount().then(setMaxDeposit);
  }, [token]);
  
  const handleMaxClick = () => {
    setAmount(maxDeposit);
  };

  return (
    <div>
      <h2>Deposit to Pool</h2>
      <div>
        <p>Wallet Balance: {walletBalance}</p>
        <p>Available to Deposit: {availableAmount}</p>
        <button onClick={handleMaxClick}>
          Set to max
        </button>
      </div>
    </div>
  );
};