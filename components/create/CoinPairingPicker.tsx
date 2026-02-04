'use client';

import type { ContentCoinCurrency } from '@zoralabs/coins-sdk';

interface CoinPairingPickerProps {
  currency: ContentCoinCurrency;
  onCurrencyChange: (currency: ContentCoinCurrency) => void;
  hasCreatorCoin: boolean;
  creatorCoinSymbol?: string;
}

export function CoinPairingPicker({
  currency,
  onCurrencyChange,
  hasCreatorCoin,
  creatorCoinSymbol,
}: CoinPairingPickerProps) {
  return (
    <div>
      <h3 className="text-sm font-medium">Coin Pairing</h3>
      <p className="mt-1 text-xs text-zdrive-text-muted">
        Choose what your release coin is paired with for trading.
      </p>

      <div className="mt-3 space-y-2">
        {hasCreatorCoin && (
          <label className="flex cursor-pointer items-start gap-3 rounded border border-zdrive-border p-3 transition-colors hover:bg-zdrive-bg">
            <input
              type="radio"
              name="currency"
              value="CREATOR_COIN_OR_ZORA"
              checked={currency === 'CREATOR_COIN_OR_ZORA'}
              onChange={() => onCurrencyChange('CREATOR_COIN_OR_ZORA')}
              className="mt-0.5"
            />
            <div>
              <span className="text-sm font-medium">
                Pair with Creator Coin
                {creatorCoinSymbol && (
                  <span className="ml-1 text-zdrive-text-secondary">
                    (${creatorCoinSymbol})
                  </span>
                )}
              </span>
              <span className="ml-2 rounded bg-green-100 px-1.5 py-0.5 text-xs text-green-700">
                Recommended
              </span>
              <p className="mt-0.5 text-xs text-zdrive-text-muted">
                Trading your release coin will flow through your creator coin,
                building your creator economy.
              </p>
            </div>
          </label>
        )}

        <label className="flex cursor-pointer items-start gap-3 rounded border border-zdrive-border p-3 transition-colors hover:bg-zdrive-bg">
          <input
            type="radio"
            name="currency"
            value="ZORA"
            checked={currency === 'ZORA'}
            onChange={() => onCurrencyChange('ZORA')}
            className="mt-0.5"
          />
          <div>
            <span className="text-sm font-medium">Pair with ZORA</span>
            <p className="mt-0.5 text-xs text-zdrive-text-muted">
              Pair with the ZORA token. Trading flows through ZORA.
            </p>
          </div>
        </label>

        <label className="flex cursor-pointer items-start gap-3 rounded border border-zdrive-border p-3 transition-colors hover:bg-zdrive-bg">
          <input
            type="radio"
            name="currency"
            value="ETH"
            checked={currency === 'ETH'}
            onChange={() => onCurrencyChange('ETH')}
            className="mt-0.5"
          />
          <div>
            <span className="text-sm font-medium">Pair with ETH</span>
            <p className="mt-0.5 text-xs text-zdrive-text-muted">
              Standalone release coin paired directly with ETH.
            </p>
          </div>
        </label>
      </div>

      {!hasCreatorCoin && (
        <p className="mt-3 text-xs text-zdrive-text-muted">
          Create a creator coin on{' '}
          <a
            href="https://zora.co"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zdrive-text-secondary underline hover:text-zdrive-text"
          >
            zora.co
          </a>{' '}
          to enable creator coin pairing.
        </p>
      )}
    </div>
  );
}
