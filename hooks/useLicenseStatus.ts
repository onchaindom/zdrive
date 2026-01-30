'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useReadContract } from 'wagmi';
import type { ZDriveLicense } from '@/types/zdrive';
import { CBE_LICENSE_NAMES } from '@/lib/constants';

// Minimal ERC20 ABI for balance check
const erc20Abi = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'totalSupply',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;

interface LicenseStatus {
  licenseName: string;
  isLicensed: boolean;
  requiresGate: boolean;
  meetsGateRequirement: boolean;
  balance: bigint;
  minRequired: bigint;
  holdingPercentage: string;
}

export function useLicenseStatus(
  coinAddress: string,
  license?: ZDriveLicense
): LicenseStatus & { isLoading: boolean } {
  const { user } = usePrivy();
  const viewerAddress = user?.wallet?.address as `0x${string}` | undefined;

  // Fetch viewer's balance
  const { data: balance, isLoading: balanceLoading } = useReadContract({
    address: coinAddress as `0x${string}`,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: viewerAddress ? [viewerAddress] : undefined,
    query: {
      enabled: !!viewerAddress && !!coinAddress,
    },
  });

  // Fetch total supply for percentage calculation
  const { data: totalSupply, isLoading: supplyLoading } = useReadContract({
    address: coinAddress as `0x${string}`,
    abi: erc20Abi,
    functionName: 'totalSupply',
    query: {
      enabled: !!coinAddress,
    },
  });

  const isLoading = balanceLoading || supplyLoading;
  const balanceValue = balance ?? BigInt(0);
  const totalSupplyValue = totalSupply ?? BigInt(0);

  // Calculate holding percentage
  let holdingPercentage = '0%';
  if (totalSupplyValue > BigInt(0) && balanceValue > BigInt(0)) {
    const pct = (Number(balanceValue) / Number(totalSupplyValue)) * 100;
    if (pct < 0.01) {
      holdingPercentage = '<0.01%';
    } else if (pct < 1) {
      holdingPercentage = pct.toFixed(2) + '%';
    } else {
      holdingPercentage = pct.toFixed(1) + '%';
    }
  }

  // No license configured
  if (!license || !license.cbe) {
    return {
      licenseName: 'All Rights Reserved',
      isLicensed: false,
      requiresGate: false,
      meetsGateRequirement: false,
      balance: balanceValue,
      minRequired: BigInt(0),
      holdingPercentage,
      isLoading,
    };
  }

  const licenseName = CBE_LICENSE_NAMES[license.cbe.type];
  const requiresGate = license.gate?.enabled ?? false;

  if (!requiresGate) {
    // License applies to everyone
    return {
      licenseName,
      isLicensed: true,
      requiresGate: false,
      meetsGateRequirement: true,
      balance: balanceValue,
      minRequired: BigInt(0),
      holdingPercentage,
      isLoading,
    };
  }

  // Gate is enabled - check if viewer meets requirement
  const minRequired = BigInt(license.gate?.minBalance || '0');
  const meetsGateRequirement = balanceValue >= minRequired;

  return {
    licenseName: meetsGateRequirement ? licenseName : 'All Rights Reserved',
    isLicensed: meetsGateRequirement,
    requiresGate: true,
    meetsGateRequirement,
    balance: balanceValue,
    minRequired,
    holdingPercentage,
    isLoading,
  };
}
