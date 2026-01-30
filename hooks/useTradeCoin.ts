'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { type Address, type Hash, parseEther, parseUnits } from 'viem';
import { tradeCoin } from '@zoralabs/coins-sdk';
import { useTradeWallet } from './useTradeWallet';
import { SUPPORTED_CHAIN_ID, ZDRIVE_PLATFORM_REFERRER } from '@/lib/constants';

export type TradeStatus = 'idle' | 'confirming' | 'submitted' | 'confirmed' | 'failed';

interface TradeExecuteParams {
  coinAddress: string;
  tradeType: 'buy' | 'sell';
  amountIn: string;
  slippage: number;
}

interface TradeResult {
  txHash?: Hash;
  error?: string;
}

export function useTradeCoin() {
  const { getWalletClient, getPublicClient, address, walletChainId, refreshProviderChainId } = useTradeWallet();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<TradeStatus>('idle');
  const [txHash, setTxHash] = useState<Hash | undefined>();

  const mutation = useMutation<TradeResult, Error, TradeExecuteParams>({
    mutationFn: async (params) => {
      if (!address) throw new Error('Wallet not connected');
      if (walletChainId === undefined || walletChainId !== SUPPORTED_CHAIN_ID) {
        throw new Error('Please switch to Base network');
      }
      const confirmedChainId = await refreshProviderChainId();
      if (confirmedChainId === undefined || confirmedChainId !== SUPPORTED_CHAIN_ID) {
        throw new Error('Please switch to Base network');
      }

      setStatus('confirming');
      setTxHash(undefined);

      const parsedAmount = params.tradeType === 'buy'
        ? parseEther(params.amountIn)
        : parseUnits(params.amountIn, 18);

      const tradeParameters = {
        sell: params.tradeType === 'buy'
          ? { type: 'eth' as const }
          : { type: 'erc20' as const, address: params.coinAddress as Address },
        buy: params.tradeType === 'buy'
          ? { type: 'erc20' as const, address: params.coinAddress as Address }
          : { type: 'eth' as const },
        amountIn: parsedAmount,
        slippage: params.slippage,
        sender: address,
        referrer: ZDRIVE_PLATFORM_REFERRER as Address,
      };

      const walletClient = await getWalletClient();
      const publicClient = getPublicClient();

      try {
        setStatus('submitted');

        const receipt = await tradeCoin({
          tradeParameters,
          walletClient,
          publicClient,
          account: address,
        });

        if (receipt.status === 'success') {
          setStatus('confirmed');
          setTxHash(receipt.transactionHash);
          return { txHash: receipt.transactionHash };
        } else {
          setStatus('failed');
          return { error: 'Transaction reverted' };
        }
      } catch (error) {
        setStatus('failed');
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coin-stats'] });
      queryClient.invalidateQueries({ queryKey: ['coin-swaps'] });
      queryClient.invalidateQueries({ queryKey: ['coin-holders'] });
    },
    onError: () => {
      setStatus('failed');
    },
  });

  const execute = async (params: TradeExecuteParams) => {
    try {
      await mutation.mutateAsync(params);
    } catch {
      // Error handled via mutation state
    }
  };

  const reset = () => {
    setStatus('idle');
    setTxHash(undefined);
    mutation.reset();
  };

  return {
    execute,
    reset,
    status,
    txHash,
    isLoading: mutation.isPending,
    error: getTradeErrorMessage(mutation.error),
  };
}

function getTradeErrorMessage(error: Error | null): string | undefined {
  if (!error) return undefined;

  const msg = error.message.toLowerCase();

  if (msg.includes('user rejected') || msg.includes('user denied')) {
    return 'Transaction rejected';
  }
  if (msg.includes('insufficient funds') || msg.includes('insufficient balance')) {
    return 'Insufficient balance';
  }
  if (msg.includes('gas')) {
    return 'Gas estimation failed. Try increasing slippage.';
  }
  if (msg.includes('chain') || msg.includes('network')) {
    return 'Please switch to Base network';
  }

  return error.message.length > 100
    ? error.message.slice(0, 100) + '...'
    : error.message;
}
