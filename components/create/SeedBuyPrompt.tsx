'use client';

import { useState } from 'react';
import { type Address, parseEther } from 'viem';
import { tradeCoin } from '@zoralabs/coins-sdk';
import { Button } from '@/components/ui';
import { useTradeWallet } from '@/hooks/useTradeWallet';
import { ZDRIVE_PLATFORM_REFERRER } from '@/lib/constants';

const SEED_BUY_AMOUNT = '0.0001'; // ETH

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

  const handleSeedBuy = async () => {
    if (!address) return;

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
        referrer: ZDRIVE_PLATFORM_REFERRER as Address,
      };

      const receipt = await tradeCoin({
        tradeParameters,
        walletClient,
        publicClient,
        account: address,
      });

      if (receipt.status === 'success') {
        setBuySuccess(true);
        // Short delay to show success message before redirect
        setTimeout(onComplete, 1500);
      } else {
        setBuyError('Transaction reverted. You can skip and buy later from the release page.');
      }
    } catch (err) {
      console.error('Seed buy error:', err);
      const msg = err instanceof Error ? err.message : 'Unknown error';
      if (msg.toLowerCase().includes('user rejected') || msg.toLowerCase().includes('user denied')) {
        setBuyError('Transaction cancelled. You can try again or skip.');
      } else {
        setBuyError(`Seed buy failed: ${msg.length > 80 ? msg.slice(0, 80) + '...' : msg}`);
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
            disabled={isBuying || buySuccess}
            isLoading={isBuying}
          >
            {isBuying ? 'Buying...' : `Buy ${SEED_BUY_AMOUNT} ETH`}
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
