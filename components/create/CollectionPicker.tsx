'use client';

import { useState } from 'react';
import { Input } from '@/components/ui';
import { slugify } from '@/lib/utils/slugify';
import {
  useCreatorCollections,
  type ExistingCollection,
} from '@/hooks/useCreatorCollections';

interface CollectionPickerProps {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  collectionTitle: string;
  onCollectionTitleChange: (title: string) => void;
  orderingIndex?: number;
  onOrderingIndexChange: (index: number | undefined) => void;
  creatorAddress?: string;
}

export function CollectionPicker({
  enabled,
  onEnabledChange,
  collectionTitle,
  onCollectionTitleChange,
  orderingIndex,
  onOrderingIndexChange,
  creatorAddress,
}: CollectionPickerProps) {
  const [mode, setMode] = useState<'select' | 'create'>('select');
  const [selectedCollection, setSelectedCollection] =
    useState<ExistingCollection | null>(null);

  const { data: existingCollections, isLoading } =
    useCreatorCollections(creatorAddress);

  const hasExisting = existingCollections && existingCollections.length > 0;
  const generatedSlug = collectionTitle ? slugify(collectionTitle) : '';

  // When selecting an existing collection, auto-populate fields
  const handleSelectExisting = (collection: ExistingCollection) => {
    setSelectedCollection(collection);
    onCollectionTitleChange(collection.title);
  };

  // When switching to create mode, clear selection
  const handleSwitchToCreate = () => {
    setMode('create');
    setSelectedCollection(null);
    onCollectionTitleChange('');
    onOrderingIndexChange(undefined);
  };

  // When switching to select mode
  const handleSwitchToSelect = () => {
    setMode('select');
    setSelectedCollection(null);
    onCollectionTitleChange('');
    onOrderingIndexChange(undefined);
  };

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
          {/* Mode toggle: Existing vs Create New */}
          {hasExisting && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSwitchToSelect}
                className={`px-3 py-1.5 text-sm transition-colors ${
                  mode === 'select'
                    ? 'bg-zdrive-text text-white'
                    : 'border border-zdrive-border hover:border-zdrive-border-hover'
                }`}
              >
                Existing
              </button>
              <button
                type="button"
                onClick={handleSwitchToCreate}
                className={`px-3 py-1.5 text-sm transition-colors ${
                  mode === 'create'
                    ? 'bg-zdrive-text text-white'
                    : 'border border-zdrive-border hover:border-zdrive-border-hover'
                }`}
              >
                Create New
              </button>
            </div>
          )}

          {/* Existing collection dropdown */}
          {mode === 'select' && hasExisting && (
            <div className="space-y-3">
              <label className="block text-sm font-medium">
                Select Collection
              </label>
              <div className="space-y-1">
                {existingCollections.map((collection) => (
                  <button
                    key={collection.id}
                    type="button"
                    onClick={() => handleSelectExisting(collection)}
                    className={`flex w-full items-center justify-between border px-3 py-2 text-sm transition-colors ${
                      selectedCollection?.id === collection.id
                        ? 'border-zdrive-text bg-zdrive-bg'
                        : 'border-zdrive-border hover:border-zdrive-border-hover'
                    }`}
                  >
                    <span>{collection.title}</span>
                    <span className="text-xs text-zdrive-text-muted">
                      {collection.releaseCount} release
                      {collection.releaseCount !== 1 ? 's' : ''}
                    </span>
                  </button>
                ))}
              </div>

              {selectedCollection && (
                <p className="text-xs text-zdrive-text-muted">
                  {selectedCollection.releaseCount} release{selectedCollection.releaseCount !== 1 ? 's' : ''} in this collection
                </p>
              )}
            </div>
          )}

          {/* Create new collection */}
          {(mode === 'create' || !hasExisting) && (
            <>
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
            </>
          )}

          {isLoading && (
            <p className="text-xs text-zdrive-text-muted">
              Loading collections...
            </p>
          )}
        </div>
      )}
    </div>
  );
}
