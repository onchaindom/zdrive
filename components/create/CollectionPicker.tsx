'use client';

import { useState } from 'react';
import { Input } from '@/components/ui';
import { slugify } from '@/lib/utils/slugify';
import clsx from 'clsx';

// For MVP, we'll use a simple text input for collection
// In a full implementation, this would fetch existing collections

interface CollectionPickerProps {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  collectionTitle: string;
  onCollectionTitleChange: (title: string) => void;
  orderingIndex?: number;
  onOrderingIndexChange: (index: number | undefined) => void;
}

export function CollectionPicker({
  enabled,
  onEnabledChange,
  collectionTitle,
  onCollectionTitleChange,
  orderingIndex,
  onOrderingIndexChange,
}: CollectionPickerProps) {
  const generatedSlug = collectionTitle ? slugify(collectionTitle) : '';

  return (
    <div className="space-y-4">
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => onEnabledChange(e.target.checked)}
        />
        <span className="text-sm font-medium">Add to collection</span>
      </label>
      <p className="ml-5 text-xs text-zdrive-text-secondary">
        Group related releases together
      </p>

      {enabled && (
        <div className="ml-5 space-y-4 border-l-2 border-zdrive-border pl-4">
          <Input
            label="Collection Title"
            value={collectionTitle}
            onChange={(e) => onCollectionTitleChange(e.target.value)}
            placeholder="e.g., Tyrolean Chair Studies"
          />

          {generatedSlug && (
            <p className="text-xs text-zdrive-text-muted">
              Slug: <code className="bg-zdrive-bg px-1">{generatedSlug}</code>
            </p>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Position in Collection (optional)
            </label>
            <input
              type="number"
              min="1"
              value={orderingIndex ?? ''}
              onChange={(e) => {
                const val = e.target.value;
                onOrderingIndexChange(val ? parseInt(val, 10) : undefined);
              }}
              placeholder="e.g., 1"
              className="w-24 border border-zdrive-border bg-zdrive-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zdrive-text focus:ring-offset-1"
            />
            <p className="mt-1 text-xs text-zdrive-text-muted">
              Leave empty to append at the end
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
