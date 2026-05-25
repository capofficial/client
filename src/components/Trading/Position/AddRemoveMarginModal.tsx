import React, { useState, useEffect } from 'react';
import { Modal, Button, InputNumber, Alert } from 'antd';
import { usePosition } from '@/hooks/usePosition';
import { Position } from '@/types';

interface AddRemoveMarginProps {
  position: Position;
  isVisible: boolean;
  onClose: () => void;
  currentLiquidationPrice: number;
  newLiquidationPrice: number;
}

  const [currentLiquidationPrice, setCurrentLiquidationPrice] = useState<number>(0);
  const [newLiquidationPrice, setNewLiquidationPrice] = useState<number>(0);
  const [amount, setAmount] = useState<number>(0);
  const [isAdding, setIsAdding] = useState<boolean>(true);
  
  useEffect(() => {
    if (position) {
      setCurrentLiquidationPrice(position.liquidationPrice || 0);
      const newPrice = calculateNewLiquidationPrice(position, amount, isAdding);
      setNewLiquidationPrice(newPrice);
    }
  }, [position, amount, isAdding]);
  
  const calculateNewLiquidationPrice = (pos: any, marginChange: number, adding: boolean) => {
    // This is a simplified calculation - in a real implementation this would use
    // the exchange's specific liquidation price formula
    if (pos && pos.liquidationPrice) {
      return adding ? pos.liquidationPrice + 0.1 : 
        Math.max(0, pos.liquidationPrice - 0.1);
    }
    return pos?.liquidationPrice || 0;
  };
  
  const handleAmountChange = (value: number) => {
    setAmount(value);
  };
  
  const handleTypeChange = (isAdd: boolean) => {
    setIsAdding(isAdd);
  };
  
  return { currentLiquidationPrice, newLiquidationValue };
};
  
  return (
    <Modal title={`${isAdding ? 'Add' : 'Remove'} Margin`}>
      <div>
        <div>Current Liquidation Price: {currentLiquidationPrice.toFixed(2)}</div>
        <div>New Liquidation Price: {newLiquidationPrice.toFixed(2)}</div>
      </div>
    </Modal>
  );
};

export default AddRemoveMargin;
import React, { useState } from 'react';
import { Modal, Button } from 'antd';

interface Props {
  position: any;
  onConfirm: (amount: number, isAdding: boolean) => void;
  onCancel: () => void;
}

const AddRemoveMargin: React.FC<Props> = ({ position, onConfirm, onCancel }) => {
  const [amount, setAmount] = useState<number>(0);
  const [isAdding, setIsAdding] = useState<boolean>(true);
  
  const currentLiquidationPrice = position?.liquidationPrice || 0;
  const newLiquidationPrice = currentLiquidationPrice ? 
    (isAdding ? currentLiquidationPrice + (amount * 0.1) : 
     Math.max(0, currentLiquidationPrice - (amount * 0.1))) : 0;

  return (
    <Modal 
      title={`${isAdding ? 'Add' : 'Remove'} Margin`}
    >
      <div>
        <div>Current Liquidation Price: {currentLiquidationPrice.toFixed(2)}</div>
        <div>New Liquidation Price: {newLiquidationPrice.toFixed(2)}</div>
      </div>
    </Modal>
  );
};

export default AddRemoveMargin;