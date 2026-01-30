'use client';

import { useState, useCallback, useEffect } from 'react';
import { formatEther, formatUnits } from 'viem';

const SLIPPAGE_KEY = 'zdrive-trade-slippage';
const DEFAULT_SLIPPAGE = 0.01; // 1%

interface UseTradeFormOptions {
  ethBalance: bigint;
  coinBalance: bigint;
}

export function useTradeForm({ ethBalance, coinBalance }: UseTradeFormOptions) {
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [amountIn, setAmountIn] = useState('');
  const [slippage, setSlippageState] = useState(DEFAULT_SLIPPAGE);

  // Load slippage from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SLIPPAGE_KEY);
      if (stored) {
        const parsed = parseFloat(stored);
        if (!isNaN(parsed) && parsed > 0 && parsed < 1) {
          setSlippageState(parsed);
        }
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const setSlippage = useCallback((value: number) => {
    setSlippageState(value);
    try {
      localStorage.setItem(SLIPPAGE_KEY, value.toString());
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const setPreset = useCallback((preset: number) => {
    setAmountIn(preset.toString());
  }, []);

  const setMax = useCallback(() => {
    if (tradeType === 'buy') {
      // Leave a small buffer for gas (~0.001 ETH)
      const gasBuffer = BigInt(1_000_000_000_000_000); // 0.001 ETH
      const maxAmount = ethBalance > gasBuffer ? ethBalance - gasBuffer : BigInt(0);
      setAmountIn(formatEther(maxAmount));
    } else {
      setAmountIn(formatUnits(coinBalance, 18));
    }
  }, [tradeType, ethBalance, coinBalance]);

  const reset = useCallback(() => {
    setAmountIn('');
  }, []);

  const handleTradeTypeChange = useCallback((type: 'buy' | 'sell') => {
    setTradeType(type);
    setAmountIn('');
  }, []);

  return {
    tradeType,
    setTradeType: handleTradeTypeChange,
    amountIn,
    setAmountIn,
    slippage,
    setSlippage,
    setPreset,
    setMax,
    reset,
  };
}
