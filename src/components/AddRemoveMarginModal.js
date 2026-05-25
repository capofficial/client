import React, { useState, useEffect } from 'react';
import { BigNumber, ethers } from 'ethers';

const AddRemoveMargin = ({ positionManager, userAddress, token }) => {
  // Your solution would go here
  return (
    <div>
      <h3>Add/Remove Margin</h3>
      <div>
        {positionManager && (
          <div>
            <h4>Position: {positionManager.id}</h4>
            <p>Wallet Balance: {positionManager.margin}</p>
            <p>Available for removal: {positionManager.margin}</p>
          </div>
        )}
      </div>
    </div>
  );
};
export default AddRemoveMargin;