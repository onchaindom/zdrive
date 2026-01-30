'use client';

import { useQuery } from '@tanstack/react-query';
import { type Address, parseEther, parseUnits } from 'viem';
import { createTradeCall } from '@zoralabs/coins-sdk';
import { ZDRIVE_PLATFORM_REFERRER } from '@/lib/constants';

interface TradeQuoteParams {
  coinAddress?: string;
  tradeType: 'buy' | 'sell';
  amountIn: string;
  slippage: number;
  sender?: string;
}

interface TradeQuote {
  estimatedOut: string;
  minOut: string;
  callData: {
    data: string;
    value: string;
    target: string;
  };
}

export function useTradeQuote({
  coinAddress,
  tradeType,
  amountIn,
  slippage,
  sender,
}: TradeQuoteParams) {
  const hasAmount = !!amountIn && parseFloat(amountIn) > 0;
  const isValid = !!coinAddress && !!sender && hasAmount;

  return useQuery<TradeQuote | null>({
    queryKey: ['trade-quote', coinAddress, tradeType, amountIn, slippage, sender],
    queryFn: async () => {
      if (!coinAddress || !sender || !hasAmount) return null;

      const parsedAmount = tradeType === 'buy'
        ? parseEther(amountIn)
        : parseUnits(amountIn, 18);

      const tradeParameters = {
        sell: tradeType === 'buy'
          ? { type: 'eth' as const }
          : { type: 'erc20' as const, address: coinAddress as Address },
        buy: tradeType === 'buy'
          ? { type: 'erc20' as const, address: coinAddress as Address }
          : { type: 'eth' as const },
        amountIn: parsedAmount,
        slippage,
        sender: sender as Address,
        referrer: ZDRIVE_PLATFORM_REFERRER as Address,
      };

      const response = await createTradeCall(tradeParameters);

      const amountOut = response.quote.amountOut || '0';
      const appliedSlippage = response.quote.slippage || slippage;
      const minAmount = calculateMinOut(amountOut, appliedSlippage);

      return {
        estimatedOut: amountOut,
        minOut: minAmount,
        callData: response.call,
      };
    },
    enabled: isValid,
    staleTime: 10 * 1000,
    retry: false,
  });
}

function calculateMinOut(amountOut: string, slippage: number): string {
  const out = parseFloat(amountOut);
  if (isNaN(out) || out <= 0) return '0';
  const min = out * (1 - slippage);
  return min.toString();
}
