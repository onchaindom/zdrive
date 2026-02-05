'use client';

import { useQuery } from '@tanstack/react-query';
import { type Address, parseEther, parseUnits } from 'viem';
import { createTradeCall } from '@zoralabs/coins-sdk';
import { categorizeQuoteError, type CategorizedQuoteError } from '@/lib/trade/quoteErrors';

interface TradeQuoteParams {
  coinAddress?: string;
  tradeType: 'buy' | 'sell';
  amountIn: string;
  slippage: number;
  sender?: string;
}

export interface TradeQuote {
  estimatedOut: string;
  minOut: string;
  callData: {
    data: string;
    value: string;
    target: string;
  };
}

export interface TradeQuoteResult {
  quote: TradeQuote | null;
  isLoading: boolean;
  isFetching: boolean;
  isRetrying: boolean;
  error: CategorizedQuoteError | null;
  refetch: () => void;
}

export function useTradeQuote({
  coinAddress,
  tradeType,
  amountIn,
  slippage,
  sender,
}: TradeQuoteParams): TradeQuoteResult {
  const hasAmount = !!amountIn && parseFloat(amountIn) > 0;
  const isValid = !!coinAddress && !!sender && hasAmount;

  const query = useQuery<TradeQuote | null>({
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
      };

      console.debug('[useTradeQuote] request:', {
        coinAddress,
        tradeType,
        amountIn,
        slippage,
        parsedAmount: parsedAmount.toString(),
      });

      const response = await createTradeCall(tradeParameters);

      console.debug('[useTradeQuote] response:', {
        amountOut: response.quote.amountOut,
        slippage: response.quote.slippage,
      });

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
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
  });

  const categorizedError = query.error
    ? categorizeQuoteError(query.error)
    : null;

  if (query.error) {
    console.debug('[useTradeQuote] error:', categorizedError);
  }

  return {
    quote: query.data ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isRetrying: query.isFetching && query.failureCount > 0,
    error: categorizedError,
    refetch: () => { void query.refetch(); },
  };
}

function calculateMinOut(amountOut: string, slippage: number): string {
  const out = parseFloat(amountOut);
  if (isNaN(out) || out <= 0) return '0';
  const min = out * (1 - slippage);
  return min.toString();
}
