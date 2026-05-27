import { useState } from 'react';

const PoolWithdrawModal = ({ pool, availableAmount, userPoolBalance, onWithdraw, onClose }) => {
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState(0);

  const handleMaxWithdraw = () => {
    setWithdrawAmount(userPoolBalance.toString());
    setMaxAmount(userPoolBalance);
  };

  return (
    <div className="pool-withdraw-modal">
      <div className="modal-header">
        <h2>Withdraw from {pool.name}</h2>
      </div>
      <div className="modal-body">
        <div className="balance-info">
          <p>Available to Withdraw: {userPoolBalance} tokens</p>
          <button className="max-button" onClick={handleMaxWithdraw}>
            Withdraw Max: {userPoolBalance} tokens
          </button>
        </div>
        <input
          type="number"
          value={withdrawAmount}
          onChange={(e) => setWithdrawAmount(e.target/1000)}
        />
        <button onClick={() => onWithdraw(withdrawAmount)}>Withdraw</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default PoolWithdrawModal;