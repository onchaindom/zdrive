'use client';

import { useState } from 'react';

interface SlippageControlProps {
  slippage: number;
  onSlippageChange: (slippage: number) => void;
}

const PRESETS = [
  { label: '0.5%', value: 0.005 },
  { label: '1%', value: 0.01 },
  { label: '2%', value: 0.02 },
];

export function SlippageControl({ slippage, onSlippageChange }: SlippageControlProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customValue, setCustomValue] = useState('');

  const handleCustomChange = (input: string) => {
    setCustomValue(input);
    const parsed = parseFloat(input);
    if (!isNaN(parsed) && parsed > 0 && parsed < 100) {
      onSlippageChange(parsed / 100);
    }
  };

  const isCustom = !PRESETS.some((p) => p.value === slippage);

  return (
    <div className="mt-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between text-xs text-zdrive-text-muted hover:text-zdrive-text-secondary"
      >
        <span>Slippage: {(slippage * 100).toFixed(1)}%</span>
        <svg
          className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="mt-2 flex items-center gap-1.5">
          {PRESETS.map((preset) => (
            <button
              key={preset.value}
              onClick={() => {
                onSlippageChange(preset.value);
                setCustomValue('');
              }}
              className={`rounded px-2 py-1 text-xs transition-colors ${
                slippage === preset.value
                  ? 'bg-zdrive-accent text-white'
                  : 'bg-zdrive-bg text-zdrive-text-secondary hover:bg-zdrive-border'
              }`}
            >
              {preset.label}
            </button>
          ))}
          <input
            type="text"
            inputMode="decimal"
            placeholder="Custom"
            value={isCustom ? (slippage * 100).toString() : customValue}
            onChange={(e) => handleCustomChange(e.target.value)}
            className="w-14 rounded border border-zdrive-border bg-zdrive-bg px-2 py-1 text-xs focus:border-zdrive-accent focus:outline-none"
          />
          <span className="text-xs text-zdrive-text-muted">%</span>
        </div>
      )}
    </div>
  );
}
