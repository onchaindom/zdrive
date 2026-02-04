'use client';

import { useTradeWallet } from '@/hooks/useTradeWallet';
import { useTradeBalance } from '@/hooks/useTradeBalance';
import { useTradeQuote } from '@/hooks/useTradeQuote';
import { useTradeForm } from '@/hooks/useTradeForm';
import { useTradeCoin, type TradeStatus } from '@/hooks/useTradeCoin';
import { SlippageControl } from './SlippageControl';
import type { CoinHeaderStats } from '@/types/coin-trade';

interface TradePanelProps {
  coinAddress: string;
  stats: CoinHeaderStats | null;
}

const BUY_PRESETS = [0.001, 0.01, 0.1];

export function TradePanel({ coinAddress, stats }: TradePanelProps) {
  const { isConnected, isWrongChain, connect, switchToBase, address } = useTradeWallet();
  const { ethBalance, ethFormatted, coinBalance, coinFormatted } = useTradeBalance(coinAddress);

  const {
    tradeType,
    setTradeType,
    amountIn,
    setAmountIn,
    slippage,
    setSlippage,
    setPreset,
    setMax,
  } = useTradeForm({ ethBalance, coinBalance });

  const {
    quote,
    isLoading: quoteLoading,
    isFetching: quoteFetching,
    isRetrying: quoteRetrying,
    error: quoteError,
    refetch: refetchQuote,
  } = useTradeQuote({
    coinAddress,
    tradeType,
    amountIn,
    slippage,
    sender: address,
  });

  const { execute, reset, status, txHash, isLoading: tradeLoading, error } = useTradeCoin();

  const isBlocked = stats?.platformBlocked;
  const hasAmount = parseFloat(amountIn) > 0;
  const hasSufficientBalance = tradeType === 'buy'
    ? parseFloat(amountIn || '0') <= parseFloat(ethFormatted)
    : parseFloat(amountIn || '0') <= parseFloat(coinFormatted);

  const handleTrade = () => {
    execute({
      coinAddress,
      tradeType,
      amountIn,
      slippage,
    });
  };

  if (isBlocked) {
    return (
      <div className="border border-zdrive-border bg-zdrive-surface p-4 text-center text-sm text-zdrive-text-muted">
        Trading is not available for this coin.
      </div>
    );
  }

  return (
    <div className="border border-zdrive-border bg-zdrive-surface p-4">
      {/* Buy/Sell Toggle */}
      <div className="flex rounded bg-zdrive-bg p-0.5">
        <button
          onClick={() => { setTradeType('buy'); reset(); }}
          className={`flex-1 rounded py-1.5 text-sm font-medium transition-colors ${
            tradeType === 'buy'
              ? 'bg-zdrive-surface text-zdrive-text shadow-sm'
              : 'text-zdrive-text-muted hover:text-zdrive-text-secondary'
          }`}
        >
          Buy
        </button>
        <button
          onClick={() => { setTradeType('sell'); reset(); }}
          className={`flex-1 rounded py-1.5 text-sm font-medium transition-colors ${
            tradeType === 'sell'
              ? 'bg-zdrive-surface text-zdrive-text shadow-sm'
              : 'text-zdrive-text-muted hover:text-zdrive-text-secondary'
          }`}
        >
          Sell
        </button>
      </div>

      {/* Amount Input */}
      <div className="mt-3">
        <div className="flex items-center justify-between text-xs text-zdrive-text-muted">
          <span>Amount</span>
          <span>
            Balance: {tradeType === 'buy'
              ? `${parseFloat(ethFormatted).toFixed(4)} ETH`
              : `${parseFloat(coinFormatted).toFixed(2)} ${stats?.symbol || 'tokens'}`}
          </span>
        </div>
        <div className="relative mt-1">
          <input
            type="text"
            inputMode="decimal"
            placeholder="0.0"
            value={amountIn}
            onChange={(e) => setAmountIn(e.target.value)}
            disabled={tradeLoading}
            className="w-full rounded border border-zdrive-border bg-zdrive-bg px-3 py-2 pr-14 text-sm focus:border-zdrive-accent focus:outline-none disabled:opacity-50"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zdrive-text-muted">
            {tradeType === 'buy' ? 'ETH' : stats?.symbol || ''}
          </span>
        </div>
      </div>

      {/* Preset Chips */}
      <div className="mt-2 flex gap-1.5">
        {BUY_PRESETS.map((preset) => (
          <button
            key={preset}
            onClick={() => setPreset(preset)}
            disabled={tradeLoading}
            className="rounded bg-zdrive-bg px-2 py-1 text-xs text-zdrive-text-secondary hover:bg-zdrive-border disabled:opacity-50"
          >
            {preset}
          </button>
        ))}
        <button
          onClick={setMax}
          disabled={tradeLoading}
          className="rounded bg-zdrive-bg px-2 py-1 text-xs text-zdrive-text-secondary hover:bg-zdrive-border disabled:opacity-50"
        >
          Max
        </button>
      </div>

      {/* Quote Display */}
      {hasAmount && (
        <div className="mt-3 space-y-1 rounded bg-zdrive-bg p-2 text-xs">
          {quoteLoading || quoteRetrying ? (
            <p className="text-zdrive-text-muted">
              {quoteRetrying ? 'Quote service temporarily unavailable \u2014 retrying...' : 'Fetching quote...'}
            </p>
          ) : quote ? (
            <>
              <div className="flex justify-between">
                <span className="text-zdrive-text-muted">Est. receive</span>
                <span>{formatQuoteAmount(quote.estimatedOut)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zdrive-text-muted">Min. receive</span>
                <span>{formatQuoteAmount(quote.minOut)}</span>
              </div>
            </>
          ) : quoteError ? (
            <div className="space-y-1.5">
              <p className="text-red-500">{quoteError.userMessage}</p>
              <button
                onClick={refetchQuote}
                disabled={quoteFetching}
                className="rounded bg-zdrive-border px-2 py-1 text-xs text-zdrive-text-secondary hover:bg-zdrive-text-muted hover:text-white disabled:opacity-50"
              >
                {quoteFetching ? 'Retrying...' : 'Retry'}
              </button>
            </div>
          ) : (
            <p className="text-zdrive-text-muted">Unable to quote</p>
          )}
        </div>
      )}

      {/* Slippage Control */}
      <SlippageControl slippage={slippage} onSlippageChange={setSlippage} />

      {/* CTA Button */}
      <button
        onClick={getCTAAction({ isConnected, isWrongChain, connect, switchToBase, handleTrade })}
        disabled={getCTADisabled({ isConnected, isWrongChain, hasAmount, hasSufficientBalance, tradeLoading, quoteLoading, hasQuote: !!quote })}
        className="mt-3 w-full rounded bg-zdrive-accent py-2.5 text-sm font-medium text-white transition-colors hover:bg-zdrive-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
      >
        {getCTALabel({ isConnected, isWrongChain, hasAmount, hasSufficientBalance, tradeLoading, tradeType, symbol: stats?.symbol, status })}
      </button>

      {/* Status Messages */}
      {status === 'submitted' && txHash && (
        <div className="mt-2 text-center text-xs">
          <a
            href={`https://basescan.org/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-zdrive-text-secondary hover:underline"
          >
            View transaction →
          </a>
        </div>
      )}

      {status === 'confirmed' && (
        <p className="mt-2 text-center text-xs text-green-600">
          Trade confirmed
        </p>
      )}

      {error && (
        <p className="mt-2 text-center text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}

function getCTALabel({
  isConnected,
  isWrongChain,
  hasAmount,
  hasSufficientBalance,
  tradeLoading,
  tradeType,
  symbol,
  status,
}: {
  isConnected: boolean;
  isWrongChain: boolean;
  hasAmount: boolean;
  hasSufficientBalance: boolean;
  tradeLoading: boolean;
  tradeType: 'buy' | 'sell';
  symbol?: string;
  status: TradeStatus;
}): string {
  if (!isConnected) return 'Connect Wallet';
  if (isWrongChain) return 'Switch to Base';
  if (tradeLoading) {
    if (status === 'confirming') return 'Confirm in wallet...';
    if (status === 'submitted') return 'Processing...';
    return 'Processing...';
  }
  if (!hasAmount) return 'Enter amount';
  if (!hasSufficientBalance) return 'Insufficient balance';
  return tradeType === 'buy' ? `Buy $${symbol || 'tokens'}` : `Sell $${symbol || 'tokens'}`;
}

function getCTAAction({
  isConnected,
  isWrongChain,
  connect,
  switchToBase,
  handleTrade,
}: {
  isConnected: boolean;
  isWrongChain: boolean;
  connect: () => void;
  switchToBase: () => void;
  handleTrade: () => void;
}): () => void {
  if (!isConnected) return connect;
  if (isWrongChain) return switchToBase;
  return handleTrade;
}

function getCTADisabled({
  isConnected,
  isWrongChain,
  hasAmount,
  hasSufficientBalance,
  tradeLoading,
  quoteLoading,
  hasQuote,
}: {
  isConnected: boolean;
  isWrongChain: boolean;
  hasAmount: boolean;
  hasSufficientBalance: boolean;
  tradeLoading: boolean;
  quoteLoading: boolean;
  hasQuote: boolean;
}): boolean {
  if (!isConnected || isWrongChain) return false;
  if (tradeLoading) return true;
  if (!hasAmount) return true;
  if (!hasSufficientBalance) return true;
  if (quoteLoading) return true;
  if (hasAmount && !hasQuote) return true;
  return false;
}

function formatQuoteAmount(amount: string): string {
  const num = parseFloat(amount);
  if (isNaN(num) || num === 0) return '0';
  if (num < 0.0001) return '<0.0001';
  if (num < 1) return num.toFixed(6);
  if (num < 1000) return num.toFixed(4);
  return num.toFixed(2);
}
