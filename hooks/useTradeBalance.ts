'use client';

import { useBalance } from 'wagmi';
import { formatEther, formatUnits } from 'viem';
import { useTradeWallet } from './useTradeWallet';
import { useHoldings } from './useHoldings';

export function useTradeBalance(coinAddress?: string) {
  const { address } = useTradeWallet();

  const { data: ethBalanceData, isLoading: ethLoading } = useBalance({
    address,
    query: { enabled: !!address },
  });

  const {
    balance: coinBalance,
    totalSupply,
    isLoading: coinLoading,
  } = useHoldings(coinAddress);

  const ethBalance = ethBalanceData?.value ?? BigInt(0);

  return {
    ethBalance,
    ethFormatted: formatEther(ethBalance),
    coinBalance,
    coinFormatted: formatUnits(coinBalance, 18),
    totalSupply,
    isLoading: ethLoading || coinLoading,
  };
}
