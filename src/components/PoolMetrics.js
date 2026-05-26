import { calculatePoolMetrics } from '../utils/poolCalculations';

export const getPoolMetrics = (poolData) => {
  return calculatePoolMetrics(poolData);
};

export const calculatePoolMetrics = (data) => {
  // Placeholder for actual pool metrics calculation
  return {};
};

export const formatPoolMetrics = (rawMetrics) => {
  // Ensure proper formatting and validation of pool metrics
  if (!rawMetrics || typeof rawMetrics !== 'object') {
    return { error: 'Invalid pool data provided' };
  }
  
  const formattedMetrics = {
    tvl: rawMetrics.tvl || 0,
    volume24h: rawMetrics.volume24h || 0,
    fees24h: rawMetrics.fees24h || 0,
    apr: rawMetrics.apr || 0
  };
  
  // Validate numeric values are reasonable
  if (formattedMetrics.tvl < 0) formattedMetrics.tvl = 0;
  if (formattedMetrics.volume24h < 0) formattedMetrics.volume24h = 0;
  if (formattedMetrics.fees24h < 0) formattedMetrics.fees24h = 0;
  if (formattedMetrics.apr < 0 || formattedMetrics.apr > 1000) formattedMetrics.apr = 0;
  
  return formattedMetrics;
};
export const calculatePoolMetrics = (poolData) => {
  if (!poolData) {
    return null;
  }
  
  // Validate input data
  const validatedData = validatePoolData(poolData);
  
  // Calculate TVL (Total Value Locked)
  const tvl = calculateTVL(validatedData);
  
  // Calculate 24h volume
  const volume24h = validatedData.volume24h || 0;
  
  // Calculate fees
  const fees24h = calculateFees24h(validatedData);
  
  // Calculate APR
  const apr = calculateAPR(validatedData);
  
  return {
    tvl,
    volume24h,
    fees24h,
    apr
  };
};

const validatePoolData = (data) => {
  if (!data) return {};
  return data;
};

const calculateTVL = (data) => {
  return data.tvl || 0;
};

const calculateFees24h = (data) => {
  if (!data || !data.fees24h) return 0;
  return data.fees24h;
};

const calculateAPR = (data) => {
  if (!data) return 0;
  return data.apr || 0;
};