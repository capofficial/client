// Utility functions for pool metric calculations
const calculatePoolMetrics = (poolData) => {
  // Validate inputs to prevent incorrect calculations
  if (!poolData.totalLiquidity || poolData.totalLiquidity <= 0) {
    return {
      apr: 0,
      apy: 0,
      dailyApr: 0
    };
  }
  
  const metrics = {
    apr: (poolData.dailyReward * 365) / poolData.totalLiquidity * 100,
    apy: calculateAPY(poolData.dailyReward, poolData.totalLiquidity),
    dailyApr: (poolData.dailyReward / poolData.totalLiquidity) * 100
  };
  
  return metrics;
};

const calculateAPY = (dailyReward, totalLiquidity) => {
  if (!dailyReward || !totalLiquidity) return 0;
  // APY = (1 + (dailyReward/totalLiquidity))^365 - 1
  const dailyRate = dailyReward / totalLiquidity;
  return Math.pow(1 + dailyRate, 365) - 1;
};

export { calculatePoolMetrics };

import { formatUnits } from './format';

export const getPoolData = async (poolId) => {
  try {
    // Mock implementation - real implementation would fetch from API
    const poolData = {
      totalLiquidity: 1000000,
      dailyReward: 2500,
    };
    
    // Validate that we have proper numbers
    if (poolData.totalLiquidity <= 0) {
      throw new Error('Invalid pool data values');
    }
    
    // Calculate APR correctly
    poolData.apr = (poolData.dailyReward / poolData.totalLiquidity) * 365 * 100;
    
    return poolData;
  } catch (error) {
    console.error('Error fetching pool data:', error);
    return null;
  }
};

export const calculateCorrectAPR = (dailyReward, totalLiquidity) => {
  // Defensive check for valid numbers
  if (!totalLiquidity || totalLiquidity <= 0) {
    return 0;
  }
  const aprValue = (dailyReward / totalLiquidity) * 365 * 100;
  return aprValue;
};

export const validatePoolMetrics = (metrics) => {
  return metrics && metrics.totalLiquidity > 0 && metrics.dailyReward > 0;
};