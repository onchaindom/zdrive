'use client';

import { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { Modal } from '@/components/ui';
import { ConnectButton } from '@/components/wallet/ConnectButton';
import { CoinTradeWidget } from './CoinTradeWidget';

interface CollectButtonProps {
  coinAddress: string;
  coinName: string;
  coinSymbol: string;
  variant?: 'icon' | 'full';
}

export function CollectButton({
  coinAddress,
  coinName,
  coinSymbol,
  variant = 'icon',
}: CollectButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { authenticated } = usePrivy();

  const zoraTradeUrl = `https://zora.co/collect/base:${coinAddress}`;

  return (
    <>
      {variant === 'icon' ? (
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex h-10 w-10 items-center justify-center border border-zd-border bg-zd-surface text-zd-text transition-colors hover:border-zd-text hover:bg-zd-text hover:text-white"
          title="Collect"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
      ) : (
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex h-10 w-full items-center justify-center bg-zd-text text-sm font-medium text-white transition-colors hover:bg-zd-accent-hover"
        >
          Collect ${coinSymbol}
        </button>
      )}

      {/* Trade Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Collect ${coinName}`}
        size="md"
      >
        <div className="space-y-4">
          {!authenticated ? (
            <div className="space-y-3">
              <p className="text-sm text-zd-text-secondary">
                Connect your wallet to collect this release.
              </p>
              <ConnectButton />
            </div>
          ) : (
            <div className="space-y-4">
              <CoinTradeWidget
                coinAddress={coinAddress}
                mode="compact"
              />

              <a
                href={zoraTradeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center text-xs text-zd-text-muted hover:text-zd-text-secondary"
              >
                View on Zora &rarr;
              </a>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
