import React, { useState, useEffect } from 'react';
import { BigNumber, ethers } from 'ethers';
import { formatUnits } from 'ethers/lib/utils'; // Assuming this utility is available or can be imported
import { useAccount, useBalance } from 'wagmi'; // Assuming wagmi hooks for wallet balance

// Placeholder for a generic Position type, adjust according to actual project types
interface Position {
  id: string;
  collateralToken: {
    address: string;
    symbol: string;
    decimals: number;
  };
  margin: BigNumber;
  // ... other position properties
}

interface AddRemoveMarginModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAddingMargin: boolean; // true for Add, false for Remove
  position: Position;
  onConfirm: (amount: BigNumber) => void;
}

const AddRemoveMarginModal: React.FC<AddRemoveMarginModalProps> = ({
  isOpen,
  onClose,
  isAddingMargin,
  position,
  onConfirm,
}) => {
  const [amount, setAmount] = useState<string>('');
  const { address: userAddress } = useAccount();

  // Fetch wallet balance for the collateral token
  const { data: walletBalanceData } = useBalance({
    address: userAddress,
    token: position.collateralToken.address as `0x${string}`,
    watch: isOpen, // Only watch when modal is open
    enabled: isOpen && isAddingMargin, // Only fetch if adding margin and modal is open
  });

  const walletBalance = walletBalanceData?.value || BigNumber.from(0);
  const walletBalanceFormatted = formatUnits(walletBalance, position.collateralToken.decimals);

  const availableMarginToRemove = position.margin;
  const availableMarginToRemoveFormatted = formatUnits(availableMarginToRemove, position.collateralToken.decimals);

  useEffect(() => {
    if (!isOpen) {
      setAmount(''); // Reset amount when modal closes
    }
  }, [isOpen]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
  };

  const handleSubmit = () => {
    try {
      const parsedAmount = ethers.utils.parseUnits(amount, position.collateralToken.decimals);
      onConfirm(parsedAmount);
      onClose();
    } catch (error) {
      console.error('Error parsing amount:', error);
      // Optionally show an error message to the user
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">
          {isAddingMargin ? 'Add Margin' : 'Remove Margin'}
        </h2>

        <p className="text-sm text-gray-600 mb-4">
          Position ID: {position.id}
        </p>

        {isAddingMargin ? (
          <p className="text-sm text-gray-700 mb-4">
            Available in Wallet: {walletBalanceFormatted} {position.collateralToken.symbol}
          </p>
        ) : (
          <p className="text-sm text-gray-700 mb-4">
            Available to Remove: {availableMarginToRemoveFormatted} {position.collateralToken.symbol}
          </p>
        )}

        <div className="mb-4">
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Amount ({position.collateralToken.symbol})
          </label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={handleAmountChange}
            placeholder="0.00"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            disabled={!amount || parseFloat(amount) <= 0}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddRemoveMarginModal;
