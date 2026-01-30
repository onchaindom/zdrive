'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useState } from 'react';
import { getAddress, isAddress } from 'viem';
import { Button } from '@/components/ui';
import { truncateAddress } from '@/lib/constants';

export function ConnectButton() {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const [showMenu, setShowMenu] = useState(false);

  // Get the user's wallet address (either embedded or external)
  const rawAddress = user?.wallet?.address;
  const address = rawAddress && isAddress(rawAddress) ? getAddress(rawAddress) : undefined;

  if (!ready) {
    return (
      <Button variant="secondary" size="sm" disabled>
        Loading...
      </Button>
    );
  }

  if (authenticated && address) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="flex items-center gap-2 border border-zdrive-border px-3 py-1.5 text-sm hover:border-zdrive-border-hover"
        >
          <span className="h-2 w-2 rounded-full bg-green-500" />
          {truncateAddress(address)}
        </button>

        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowMenu(false)}
            />
            <div className="absolute right-0 top-full z-50 mt-1 w-48 border border-zdrive-border bg-zdrive-surface py-1 shadow-sm">
              <a
                href={`/${address}`}
                className="block px-4 py-2 text-sm hover:bg-zdrive-bg"
              >
                My Studio
              </a>
              <button
                onClick={() => {
                  logout();
                  setShowMenu(false);
                }}
                className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-zdrive-bg"
              >
                Disconnect
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <Button variant="secondary" size="sm" onClick={login}>
      Connect
    </Button>
  );
}
