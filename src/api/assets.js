- Only output JavaScript code

The solution must be a React component with no state management beyond what was in the previous code. The solution must be a single file. The solution must not use any of the libraries except for the one provided in the previous comment.
import { useState, useEffect } from 'react';
import { useWeb3 } from '@web3-react/core';
import { useArbitrumBridge } from 'arbitrum-bridge-sdk';

const WelcomeModal = () => {
  const [showModal, setShowModal] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bridgeStatus, setBridgeStatus] = useState<string>('idle');
  const [userAccount, setUserAccount] = useState<string>(window.localStorage.getItem('userAccount') || '');
  const [walletAddress, setWalletAddress] = useState<string>(window.localStorage.getItem('walletAddress') || '');
  const [userBalance, setUserBalance] = useState<number>(0);
  const [isBridgeAvailable, setIsBridgeAvailable] = useState<boolean>(true);
  const [isBridgeLoading, setIsBridgeLoading] = useState<boolean>(false);
  const [isBridgeError, setIsBridgeError] = useState<boolean>(false);
  const [isBridgeReady, setIsBridgeReady] = useState<boolean>(false);

  useEffect(() => {
    const handleBridge = async () => {