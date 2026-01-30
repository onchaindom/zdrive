'use client';

import { useState } from 'react';
import {
  CBE_LICENSE_NAMES,
  CBE_LICENSE_DESCRIPTIONS,
} from '@/lib/constants';
import type { CBELicenseType } from '@/types/zdrive';
import { Input } from '@/components/ui';
import clsx from 'clsx';

const licenseOptions: CBELicenseType[] = [
  'CBE_CC0',
  'CBE_COMMERCIAL',
  'CBE_NONCOMMERCIAL',
  'CBE_PERSONAL',
  'CBE_EXCLUSIVE',
  'CBE_NONEXCLUSIVE',
];

interface LicensePickerProps {
  selectedLicense: CBELicenseType | null;
  onLicenseChange: (license: CBELicenseType | null) => void;
  gateEnabled: boolean;
  onGateEnabledChange: (enabled: boolean) => void;
  gateMinBalance: string;
  onGateMinBalanceChange: (balance: string) => void;
}

export function LicensePicker({
  selectedLicense,
  onLicenseChange,
  gateEnabled,
  onGateEnabledChange,
  gateMinBalance,
  onGateMinBalanceChange,
}: LicensePickerProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium">
          License Type
        </label>
        <p className="mb-3 text-sm text-zdrive-text-secondary">
          Select a &quot;Can&apos;t Be Evil&quot; license for your release
        </p>

        <div className="space-y-2">
          {/* No license option */}
          <label
            className={clsx(
              'flex cursor-pointer items-start gap-3 border p-3 transition-colors',
              selectedLicense === null
                ? 'border-zdrive-text bg-zdrive-bg'
                : 'border-zdrive-border hover:border-zdrive-border-hover'
            )}
          >
            <input
              type="radio"
              name="license"
              checked={selectedLicense === null}
              onChange={() => onLicenseChange(null)}
              className="mt-0.5"
            />
            <div>
              <p className="text-sm font-medium">All Rights Reserved</p>
              <p className="text-xs text-zdrive-text-secondary">
                No license granted. Standard copyright applies.
              </p>
            </div>
          </label>

          {/* CBE license options */}
          {licenseOptions.map((license) => (
            <label
              key={license}
              className={clsx(
                'flex cursor-pointer items-start gap-3 border p-3 transition-colors',
                selectedLicense === license
                  ? 'border-zdrive-text bg-zdrive-bg'
                  : 'border-zdrive-border hover:border-zdrive-border-hover'
              )}
            >
              <input
                type="radio"
                name="license"
                checked={selectedLicense === license}
                onChange={() => onLicenseChange(license)}
                className="mt-0.5"
              />
              <div>
                <p className="text-sm font-medium">
                  {CBE_LICENSE_NAMES[license]}
                </p>
                <p className="text-xs text-zdrive-text-secondary">
                  {CBE_LICENSE_DESCRIPTIONS[license]}
                </p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Gate configuration - only show if a license is selected */}
      {selectedLicense && (
        <div className="border-t border-zdrive-border pt-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={gateEnabled}
              onChange={(e) => onGateEnabledChange(e.target.checked)}
            />
            <span className="text-sm font-medium">
              Require minimum token balance
            </span>
          </label>
          <p className="ml-5 mt-1 text-xs text-zdrive-text-secondary">
            Only show license to holders above the threshold
          </p>

          {gateEnabled && (
            <div className="ml-5 mt-3">
              <Input
                type="text"
                value={gateMinBalance}
                onChange={(e) => onGateMinBalanceChange(e.target.value)}
                placeholder="e.g., 10000"
                hint="Minimum release coin balance required"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
