'use client';

import { usePrivy, useWallets, type EIP1193Provider } from '@privy-io/react-auth';
import { useMemo, useState, useEffect, useCallback } from 'react';
import {
  createWalletClient,
  createPublicClient,
  custom,
  http,
  getAddress,
  isAddress,
  type Address,
} from 'viem';
import { base } from 'viem/chains';
import { SUPPORTED_CHAIN_ID } from '@/lib/constants';
import { forceChainSwitch, getProviderChainId, isUserRejectedError } from '@/lib/utils/wallets';

type ProviderEventHandlers = {
  on?: (event: string, listener: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, listener: (...args: unknown[]) => void) => void;
  off?: (event: string, listener: (...args: unknown[]) => void) => void;
};

function normalizeChainId(chainId: unknown): number | undefined {
  if (typeof chainId === 'number') return chainId;
  if (typeof chainId !== 'string') return undefined;
  const normalized = chainId.startsWith('0x') ? chainId : `0x${chainId}`;
  const parsed = parseInt(normalized, 16);
  return Number.isNaN(parsed) ? undefined : parsed;
}

export function useTradeWallet() {
  const { authenticated, login, user } = usePrivy();
  const { wallets } = useWallets();

  const rawAddress = user?.wallet?.address;
  const address = rawAddress && isAddress(rawAddress) ? (getAddress(rawAddress) as Address) : undefined;
  const activeWallet = useMemo(
    () => wallets.find((wallet) => wallet.address === address),
    [wallets, address]
  );

  // Poll the provider's actual chain ID - don't trust wallet.chainId from Privy
  const [providerChainId, setProviderChainId] = useState<number | undefined>();

  const refreshProviderChainId = useCallback(async () => {
    if (!activeWallet) {
      setProviderChainId(undefined);
      return undefined;
    }

    try {
      const provider = await activeWallet.getEthereumProvider();
      const chainId = await getProviderChainId(provider);
      setProviderChainId(chainId);
      return chainId;
    } catch (error) {
      console.warn('[useTradeWallet] Failed to read provider chain ID', error);
      return undefined;
    }
  }, [activeWallet]);

  useEffect(() => {
    if (!activeWallet) {
      setProviderChainId(undefined);
      return;
    }

    let isMounted = true;
    let interval: ReturnType<typeof setInterval> | undefined;
    let providerRef: (EIP1193Provider & ProviderEventHandlers) | undefined;

    const handleChainChanged = (chainId: unknown) => {
      if (!isMounted) return;
      setProviderChainId(normalizeChainId(chainId));
    };

    const handleAccountsChanged = async () => {
      if (!isMounted || !providerRef) return;
      const chainId = await getProviderChainId(providerRef);
      if (!isMounted) return;
      setProviderChainId(chainId);
    };

    const setup = async () => {
      const provider = await activeWallet.getEthereumProvider();
      providerRef = provider as EIP1193Provider & ProviderEventHandlers;

      const initialChainId = await getProviderChainId(provider);
      if (isMounted) {
        setProviderChainId(initialChainId);
      }

      if (providerRef.on) {
        providerRef.on('chainChanged', handleChainChanged);
        providerRef.on('accountsChanged', handleAccountsChanged);
      } else {
        interval = setInterval(() => {
          void refreshProviderChainId();
        }, 2000);
      }
    };

    void setup();

    return () => {
      isMounted = false;
      if (providerRef?.removeListener) {
        providerRef.removeListener('chainChanged', handleChainChanged);
        providerRef.removeListener('accountsChanged', handleAccountsChanged);
      } else if (providerRef?.off) {
        providerRef.off('chainChanged', handleChainChanged);
        providerRef.off('accountsChanged', handleAccountsChanged);
      }
      if (interval) clearInterval(interval);
    };
  }, [activeWallet, refreshProviderChainId]);

  const isWrongChain =
    authenticated && providerChainId !== undefined && providerChainId !== SUPPORTED_CHAIN_ID;

  const getWalletClient = async () => {
    if (!address) throw new Error('Wallet not connected');

    const wallet = activeWallet ?? wallets.find((w) => w.address === address);
    if (!wallet) throw new Error('Wallet not found');

    const provider = await wallet.getEthereumProvider();
    return createWalletClient({
      chain: base,
      transport: custom(provider),
      account: address,
    });
  };

  const getPublicClient = () => {
    return createPublicClient({
      chain: base,
      transport: http(),
    });
  };

  const switchToBase = async () => {
    if (!activeWallet) {
      login();
      return;
    }

    try {
      await forceChainSwitch(activeWallet, base);
      // Refresh chain state after switch
      void refreshProviderChainId();
    } catch (error) {
      if (isUserRejectedError(error)) return;
      throw error;
    }
  };

  return {
    isConnected: authenticated && !!address,
    isWrongChain,
    address,
    connect: login,
    switchToBase,
    getWalletClient,
    getPublicClient,
    walletChainId: providerChainId,
    refreshProviderChainId,
    activeWallet,
  };
}
