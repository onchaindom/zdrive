'use client';

import { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { Modal } from '@/components/ui';
import { ConnectButton } from '@/components/wallet/ConnectButton';

interface CollectButtonProps {
  coinAddress: string;
  coinName: string;
  coinSymbol: string;
}

export function CollectButton({
  coinAddress,
  coinName,
  coinSymbol,
}: CollectButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { authenticated } = usePrivy();

  // For MVP, we link to Zora directly since the tradeCoin function was removed
  // In production, this would integrate with Uniswap V4
  const zoraTradeUrl = `https://zora.co/collect/base:${coinAddress}`;

  return (
    <>
      {/* Minimal collect button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex h-10 w-10 items-center justify-center border border-zdrive-border bg-zdrive-surface text-zdrive-text transition-colors hover:border-zdrive-text hover:bg-zdrive-text hover:text-white"
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

      {/* Trade Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Collect ${coinName}`}
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-zdrive-text-secondary">
            Collect this release to support the creator and gain license rights
            (if gated).
          </p>

          {!authenticated ? (
            <div className="space-y-3">
              <p className="text-sm">Connect your wallet to collect.</p>
              <ConnectButton />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="border border-zdrive-border bg-zdrive-bg p-3">
                <p className="text-sm font-medium">${coinSymbol}</p>
                <p className="text-xs text-zdrive-text-muted">
                  Base Network · Zora Content Coin
                </p>
              </div>

              <a
                href={zoraTradeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-full items-center justify-center bg-zdrive-text text-sm font-medium text-white hover:bg-zdrive-accent-hover"
              >
                Trade on Zora
              </a>

              <p className="text-center text-xs text-zdrive-text-muted">
                Opens in a new tab
              </p>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
