import type { ConnectedWallet, EIP1193Provider } from '@privy-io/react-auth';
import type { Chain } from 'viem';

const CHAIN_NOT_ADDED_ERROR_CODES = new Set([4902]);
const USER_REJECTED_ERROR_CODES = new Set([4001]);

function getErrorCode(error: unknown): number | undefined {
  if (typeof error !== 'object' || error === null) return undefined;
  const maybeCode = (error as { code?: unknown }).code;
  return typeof maybeCode === 'number' ? maybeCode : undefined;
}

function getErrorMessage(error: unknown): string {
  if (typeof error !== 'object' || error === null) return '';
  const maybeMessage = (error as { message?: unknown }).message;
  return typeof maybeMessage === 'string' ? maybeMessage.toLowerCase() : '';
}

export function isUserRejectedError(error: unknown): boolean {
  const code = getErrorCode(error);
  if (code !== undefined && USER_REJECTED_ERROR_CODES.has(code)) return true;
  const message = getErrorMessage(error);
  return message.includes('user rejected') || message.includes('user denied');
}

function isChainNotAdded(error: unknown): boolean {
  const code = getErrorCode(error);
  if (code !== undefined && CHAIN_NOT_ADDED_ERROR_CODES.has(code)) return true;
  const message = getErrorMessage(error);
  return message.includes('chain') && (message.includes('not added') || message.includes('unrecognized') || message.includes('unknown'));
}

function toHexChainId(chainId: number): string {
  return `0x${chainId.toString(16)}`;
}

function parseHexChainId(chainId: string): number | undefined {
  if (!chainId) return undefined;
  const normalized = chainId.startsWith('0x') ? chainId : `0x${chainId}`;
  const parsed = parseInt(normalized, 16);
  return Number.isNaN(parsed) ? undefined : parsed;
}

export async function getProviderChainId(
  provider: EIP1193Provider
): Promise<number | undefined> {
  try {
    const result = await provider.request({ method: 'eth_chainId' });
    if (typeof result === 'string') {
      return parseHexChainId(result);
    }
    if (typeof result === 'number') return result;
    return parseInt(String(result), 10);
  } catch {
    return undefined;
  }
}

export function getWalletChainId(wallet?: ConnectedWallet | null): number | undefined {
  if (!wallet?.chainId) return undefined;
  const chainIdValue = wallet.chainId;

  if (typeof chainIdValue === 'string') {
    if (chainIdValue.startsWith('eip155:')) {
      const parsed = parseInt(chainIdValue.split(':')[1], 10);
      return Number.isNaN(parsed) ? undefined : parsed;
    }
    const parsed = parseInt(chainIdValue, 10);
    return Number.isNaN(parsed) ? undefined : parsed;
  }

  if (typeof chainIdValue === 'number') return chainIdValue;

  const parsed = parseInt(String(chainIdValue), 10);
  return Number.isNaN(parsed) ? undefined : parsed;
}

export async function waitForProviderChain(
  provider: EIP1193Provider,
  chainId: number,
  { timeoutMs = 8000, intervalMs = 500 }: { timeoutMs?: number; intervalMs?: number } = {}
): Promise<boolean> {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    const current = await getProviderChainId(provider);
    if (current === chainId) return true;
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  return false;
}

export async function waitForWalletChain(
  wallet: ConnectedWallet,
  chainId: number,
  { timeoutMs = 8000, intervalMs = 500 }: { timeoutMs?: number; intervalMs?: number } = {}
): Promise<boolean> {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    if (getWalletChainId(wallet) === chainId) return true;
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  return false;
}

async function requestChainSwitch(provider: EIP1193Provider, chain: Chain) {
  const chainIdHex = toHexChainId(chain.id);

  try {
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: chainIdHex }],
    });
  } catch (error) {
    if (!isChainNotAdded(error)) {
      throw error;
    }

    const addParams: {
      chainId: string;
      chainName: string;
      nativeCurrency: Chain['nativeCurrency'];
      rpcUrls: string[];
      blockExplorerUrls?: string[];
    } = {
      chainId: chainIdHex,
      chainName: chain.name,
      nativeCurrency: chain.nativeCurrency,
      rpcUrls: [...chain.rpcUrls.default.http],
    };

    if (chain.blockExplorers?.default?.url) {
      addParams.blockExplorerUrls = [chain.blockExplorers.default.url];
    }

    await provider.request({
      method: 'wallet_addEthereumChain',
      params: [addParams],
    });

    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: chainIdHex }],
    });
  }
}

export async function ensureWalletOnChain(
  wallet: ConnectedWallet,
  chain: Chain,
  { timeoutMs = 8000, intervalMs = 500 }: { timeoutMs?: number; intervalMs?: number } = {}
): Promise<void> {
  const provider = await wallet.getEthereumProvider();
  const providerChainId = await getProviderChainId(provider);

  if (providerChainId !== undefined && providerChainId === chain.id) return;
  if (providerChainId === undefined && getWalletChainId(wallet) === chain.id) return;

  try {
    if (typeof wallet.switchChain === 'function') {
      await wallet.switchChain(chain.id);
    } else {
      await requestChainSwitch(provider, chain);
    }
  } catch (error) {
    if (isUserRejectedError(error)) {
      throw error;
    }

    await requestChainSwitch(provider, chain);
  }

  const providerSwitched = await waitForProviderChain(provider, chain.id, {
    timeoutMs,
    intervalMs,
  });
  if (!providerSwitched) {
    throw new Error(`Unable to switch to ${chain.name}`);
  }
}

/**
 * Force chain switch using Privy's wallet.switchChain() method.
 * Per Privy docs: "For external wallets, switchChain will prompt the user
 * to switch to the target network within the external wallet's client"
 *
 * Returns a fresh provider after the switch is verified.
 */
export async function forceChainSwitch(
  wallet: ConnectedWallet,
  chain: Chain
): Promise<EIP1193Provider> {
  // Use Privy's wallet.switchChain() - this is the recommended approach
  // For external wallets, this will prompt the user in their wallet
  try {
    await wallet.switchChain(chain.id);
  } catch (err) {
    throw err;
  }

  // Get a fresh provider after switching
  const provider = await wallet.getEthereumProvider();

  // Verify the switch actually worked by querying the provider directly
  const actualChainId = await getProviderChainId(provider);

  if (actualChainId !== chain.id) {
    throw new Error(`Failed to switch to ${chain.name}. Please switch manually in your wallet.`);
  }

  return provider;
}
