'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useReadContract } from 'wagmi';
import { formatHoldingPercentage } from '@/lib/constants';

// Minimal ERC20 ABI
const erc20Abi = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'totalSupply',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;

interface HoldingsResult {
  balance: bigint;
  totalSupply: bigint;
  holdingPercentage: string;
  isHolder: boolean;
  isLoading: boolean;
}

export function useHoldings(tokenAddress?: string): HoldingsResult {
  const { user } = usePrivy();
  const viewerAddress = user?.wallet?.address as `0x${string}` | undefined;

  const { data: balance, isLoading: balanceLoading } = useReadContract({
    address: tokenAddress as `0x${string}` | undefined,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: viewerAddress ? [viewerAddress] : undefined,
    query: {
      enabled: !!viewerAddress && !!tokenAddress,
    },
  });

  const { data: totalSupply, isLoading: supplyLoading } = useReadContract({
    address: tokenAddress as `0x${string}` | undefined,
    abi: erc20Abi,
    functionName: 'totalSupply',
    query: {
      enabled: !!tokenAddress,
    },
  });

  const balanceValue = balance ?? BigInt(0);
  const totalSupplyValue = totalSupply ?? BigInt(0);
  const isLoading = balanceLoading || supplyLoading;

  return {
    balance: balanceValue,
    totalSupply: totalSupplyValue,
    holdingPercentage: formatHoldingPercentage(balanceValue, totalSupplyValue),
    isHolder: balanceValue > BigInt(0),
    isLoading,
  };
}
