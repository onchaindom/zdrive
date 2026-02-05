'use client';

import { useState, useEffect } from 'react';
import { type Address, parseEther } from 'viem';
import { tradeCoin } from '@zoralabs/coins-sdk';
import { Button } from '@/components/ui';
import { useTradeWallet } from '@/hooks/useTradeWallet';

const SEED_BUY_AMOUNT = '0.0001'; // ETH
const POOL_WARMUP_SECONDS = 15; // Wait for Zora to index the new coin

interface SeedBuyPromptProps {
  coinAddress: string;
  onComplete: () => void;
  onSkip: () => void;
}

export function SeedBuyPrompt({ coinAddress, onComplete, onSkip }: SeedBuyPromptProps) {
  const { address, getWalletClient, getPublicClient } = useTradeWallet();
  const [isBuying, setIsBuying] = useState(false);
  const [buyError, setBuyError] = useState<string | null>(null);
  const [buySuccess, setBuySuccess] = useState(false);
  const [countdown, setCountdown] = useState(POOL_WARMUP_SECONDS);

  // Countdown timer — pool needs time to initialize after coin creation
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((c) => c - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const isReady = countdown <= 0;

  const handleSeedBuy = async () => {
    if (!address || !isReady) return;

    setIsBuying(true);
    setBuyError(null);

    try {
      const walletClient = await getWalletClient();
      const publicClient = getPublicClient();

      const tradeParameters = {
        sell: { type: 'eth' as const },
        buy: { type: 'erc20' as const, address: coinAddress as Address },
        amountIn: parseEther(SEED_BUY_AMOUNT),
        slippage: 0.05, // 5% slippage for small initial buy
        sender: address,
      };

      console.debug('[SeedBuy] Attempting trade with params:', {
        coinAddress,
        amount: SEED_BUY_AMOUNT,
        sender: address,
      });

      const receipt = await tradeCoin({
        tradeParameters,
        walletClient,
        publicClient,
        account: address,
      });

      console.debug('[SeedBuy] Transaction receipt:', receipt);

      if (receipt.status === 'success') {
        setBuySuccess(true);
        setTimeout(onComplete, 1500);
      } else {
        setBuyError(`Transaction reverted (status: ${receipt.status}). You can skip and buy later from the release page.`);
      }
    } catch (err) {
      console.error('[SeedBuy] Full error:', err);

      // Extract the most useful error info
      const errorObj = err as Record<string, unknown>;
      let msg = '';

      if (err instanceof Error) {
        msg = err.message;
        // Check for nested cause
        if ('cause' in err && err.cause) {
          console.error('[SeedBuy] Error cause:', err.cause);
          msg += ` (cause: ${err.cause instanceof Error ? err.cause.message : String(err.cause)})`;
        }
      } else {
        msg = String(err);
      }

      // Log any additional properties
      if (errorObj.data) console.error('[SeedBuy] Error data:', errorObj.data);
      if (errorObj.code) console.error('[SeedBuy] Error code:', errorObj.code);

      if (msg.toLowerCase().includes('user rejected') || msg.toLowerCase().includes('user denied')) {
        setBuyError('Transaction cancelled. You can try again or skip.');
      } else if (msg.toLowerCase().includes('quote failed')) {
        setBuyError('Quote failed — the trading pool may still be initializing. Try again in a moment, or skip and buy from the release page.');
      } else {
        setBuyError(msg.length > 200 ? msg.slice(0, 200) + '...' : msg);
      }
    } finally {
      setIsBuying(false);
    }
  };

  return (
    <div className="mt-8 space-y-6">
      <div className="border border-green-200 bg-green-50 p-6 text-center">
        <h3 className="text-lg font-medium text-green-800">
          Release created successfully!
        </h3>
        <p className="mt-1 text-sm text-green-700">
          Your content coin is live on Base.
        </p>
      </div>

      <div className="border border-zdrive-border bg-zdrive-surface p-6">
        <h3 className="font-medium">Seed your coin</h3>
        <p className="mt-2 text-sm text-zdrive-text-secondary">
          Buy a small amount ({SEED_BUY_AMOUNT} ETH) to activate trading.
          This is optional but recommended.
        </p>

        {!isReady && (
          <div className="mt-3 flex items-center gap-2 text-sm text-zdrive-text-muted">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-zdrive-border border-t-zdrive-text" />
            Pool initializing... {countdown}s
          </div>
        )}

        {buyError && (
          <div className="mt-3 border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {buyError}
          </div>
        )}

        {buySuccess && (
          <div className="mt-3 border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            Seed buy confirmed! Redirecting to your release...
          </div>
        )}

        <div className="mt-4 flex gap-3">
          <Button
            onClick={handleSeedBuy}
            disabled={isBuying || buySuccess || !isReady}
            isLoading={isBuying}
          >
            {isBuying ? 'Buying...' : !isReady ? `Wait ${countdown}s...` : `Buy ${SEED_BUY_AMOUNT} ETH`}
          </Button>
          <Button
            variant="secondary"
            onClick={onSkip}
            disabled={isBuying || buySuccess}
          >
            Skip
          </Button>
        </div>
      </div>
    </div>
  );
}
