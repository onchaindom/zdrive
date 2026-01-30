'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import { createPublicClient, http, type PublicClient } from 'viem';
import { base } from 'viem/chains';
import { forceChainSwitch, isUserRejectedError } from '@/lib/utils/wallets';
import { Header, Footer } from '@/components/layout';
import { Button, Input, Textarea } from '@/components/ui';
import { useTradeWallet } from '@/hooks/useTradeWallet';
import {
  FileUploader,
  MultiFileUploader,
  LicensePicker,
  CollectionPicker,
} from '@/components/create';
import { ConnectButton } from '@/components/wallet/ConnectButton';
import { createRelease } from '@/lib/zora/createRelease';
import type { CBELicenseType, ZDriveExternalLink } from '@/types/zdrive';

type CreateStep = 'details' | 'files' | 'options' | 'confirm';

// Cast needed: Base chain includes OP Stack 'deposit' transaction type which
// is more specific than viem's default PublicClient generic. The Zora SDK
// accepts PublicClient<any, any, any, any> internally, so this is safe.
const publicClient = createPublicClient({
  chain: base,
  transport: http(),
}) as unknown as PublicClient;

export default function CreatePage() {
  const router = useRouter();
  const { ready, authenticated } = usePrivy();
  const { activeWallet, address, isWrongChain, refreshProviderChainId } = useTradeWallet();

  const isWalletReady = authenticated && !!address;

  // Form state
  const [step, setStep] = useState<CreateStep>('details');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Release details
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [description, setDescription] = useState('');

  // Files
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [attachments, setAttachments] = useState<File[]>([]);

  // External links
  const [githubUrl, setGithubUrl] = useState('');
  const [githubRef, setGithubRef] = useState('');

  // Collection
  const [collectionEnabled, setCollectionEnabled] = useState(false);
  const [collectionTitle, setCollectionTitle] = useState('');
  const [orderingIndex, setOrderingIndex] = useState<number | undefined>();

  // License
  const [selectedLicense, setSelectedLicense] = useState<CBELicenseType | null>(
    null
  );
  const [gateEnabled, setGateEnabled] = useState(false);
  const [gateMinBalance, setGateMinBalance] = useState('');

  // Validation
  const canProceedFromDetails = name.trim() && symbol.trim() && description.trim();
  const canProceedFromFiles = coverImage !== null;
  const canSubmit = canProceedFromDetails && canProceedFromFiles;

  const handleSubmit = async () => {
    if (!address || !coverImage) {
      setError('Please connect your wallet and fill in all required fields');
      return;
    }

    const wallet = activeWallet;
    if (!wallet) {
      setError('Wallet not found');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // ALWAYS force chain switch - don't trust wallet.chainId from Privy
      let provider;
      try {
        provider = await forceChainSwitch(wallet, base);
      } catch (switchErr) {
        if (isUserRejectedError(switchErr)) {
          setError('Please approve the network switch to continue');
        } else {
          setError(switchErr instanceof Error ? switchErr.message : 'Failed to switch network');
        }
        setIsSubmitting(false);
        return;
      }

      // Refresh the provider chain state after switch
      const confirmedChainId = await refreshProviderChainId();
      if (confirmedChainId === undefined || confirmedChainId !== base.id) {
        setError('Please switch to Base network');
        setIsSubmitting(false);
        return;
      }

      // Create viem wallet client from the verified provider
      const { createWalletClient, custom } = await import('viem');
      const walletClient = createWalletClient({
        chain: base,
        transport: custom(provider),
        account: address,
      });

      // Build external links
      const external: ZDriveExternalLink[] = [];
      if (githubUrl.trim()) {
        external.push({
          type: 'github',
          url: githubUrl.trim(),
          ref: githubRef.trim() || undefined,
        });
      }

      const result = await createRelease(
        {
          name,
          symbol: symbol.toUpperCase(),
          description,
          coverImage,
          previewFile: previewFile || undefined,
          attachments: attachments.length > 0 ? attachments : undefined,
          external: external.length > 0 ? external : undefined,
          collection: collectionEnabled && collectionTitle
            ? {
                title: collectionTitle,
                orderingIndex,
              }
            : undefined,
          license: selectedLicense
            ? {
                cbeType: selectedLicense,
                gate: gateEnabled && gateMinBalance
                  ? { minBalance: gateMinBalance }
                  : undefined,
              }
            : undefined,
          creatorAddress: address,
        },
        walletClient,
        publicClient
      );

      if (result.success && result.coinAddress) {
        router.push(`/${address}/${result.coinAddress}`);
      } else {
        setError(result.error || 'Failed to create release');
      }
    } catch (err) {
      console.error('Error creating release:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If not connected, show connect prompt
  if (!ready || !isWalletReady) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-light">Create a Release</h1>
            <p className="mt-2 text-zdrive-text-secondary">
              Connect your wallet to get started
            </p>
            <div className="mt-6">
              <ConnectButton />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-4 py-8">
          <h1 className="text-2xl font-light">Create a Release</h1>
          <p className="mt-1 text-sm text-zdrive-text-secondary">
            Publish your work as a content coin on Zora
          </p>

          {/* Progress indicator */}
          <div className="mt-8 flex gap-2">
            {(['details', 'files', 'options', 'confirm'] as CreateStep[]).map(
              (s, i) => (
                <div
                  key={s}
                  className={`h-1 flex-1 ${
                    i <=
                    ['details', 'files', 'options', 'confirm'].indexOf(step)
                      ? 'bg-zdrive-text'
                      : 'bg-zdrive-border'
                  }`}
                />
              )
            )}
          </div>

          {/* Error display */}
          {error && (
            <div className="mt-6 border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Step: Details */}
          {step === 'details' && (
            <div className="mt-8 space-y-6">
              <Input
                label="Release Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Tyrolean Chair Studies #12"
              />

              <Input
                label="Symbol"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                placeholder="e.g., TCS12"
                hint="3-10 characters, will be used as the coin ticker"
                maxLength={10}
              />

              <Textarea
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your release..."
                rows={4}
              />

              <div className="flex justify-end">
                <Button
                  onClick={() => setStep('files')}
                  disabled={!canProceedFromDetails}
                >
                  Next: Files
                </Button>
              </div>
            </div>
          )}

          {/* Step: Files */}
          {step === 'files' && (
            <div className="mt-8 space-y-6">
              <FileUploader
                label="Cover Image"
                onFileSelect={setCoverImage}
                currentFile={coverImage}
                accept={{
                  'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
                }}
                hint="Required. This will be the thumbnail for your release."
              />

              <FileUploader
                label="Preview File (Optional)"
                onFileSelect={setPreviewFile}
                currentFile={previewFile}
                accept={{
                  'application/pdf': ['.pdf'],
                  'model/gltf-binary': ['.glb'],
                  'model/gltf+json': ['.gltf'],
                  'model/stl': ['.stl'],
                  'image/jpeg': ['.jpg', '.jpeg'],
                  'image/png': ['.png'],
                  'image/gif': ['.gif'],
                  'image/webp': ['.webp'],
                  'video/mp4': ['.mp4'],
                  'video/webm': ['.webm'],
                }}
                hint="PDF, 3D file, image, or video that will be rendered in the viewer"
              />

              <div className="border-t border-zdrive-border pt-6">
                <h3 className="mb-4 text-sm font-medium">
                  GitHub Link (Optional)
                </h3>
                <div className="space-y-4">
                  <Input
                    label="Repository URL"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/org/repo"
                  />
                  <Input
                    label="Tag/Branch (Optional)"
                    value={githubRef}
                    onChange={(e) => setGithubRef(e.target.value)}
                    placeholder="e.g., v1.0.0 or main"
                  />
                </div>
              </div>

              <MultiFileUploader
                label="Additional Attachments (Optional)"
                onFilesChange={setAttachments}
                files={attachments}
                hint="ZIP files, source code, additional assets, etc."
              />

              <div className="flex justify-between">
                <Button variant="secondary" onClick={() => setStep('details')}>
                  Back
                </Button>
                <Button
                  onClick={() => setStep('options')}
                  disabled={!canProceedFromFiles}
                >
                  Next: Options
                </Button>
              </div>
            </div>
          )}

          {/* Step: Options */}
          {step === 'options' && (
            <div className="mt-8 space-y-8">
              <CollectionPicker
                enabled={collectionEnabled}
                onEnabledChange={setCollectionEnabled}
                collectionTitle={collectionTitle}
                onCollectionTitleChange={setCollectionTitle}
                orderingIndex={orderingIndex}
                onOrderingIndexChange={setOrderingIndex}
              />

              <div className="border-t border-zdrive-border pt-6">
                <LicensePicker
                  selectedLicense={selectedLicense}
                  onLicenseChange={setSelectedLicense}
                  gateEnabled={gateEnabled}
                  onGateEnabledChange={setGateEnabled}
                  gateMinBalance={gateMinBalance}
                  onGateMinBalanceChange={setGateMinBalance}
                />
              </div>

              <div className="flex justify-between">
                <Button variant="secondary" onClick={() => setStep('files')}>
                  Back
                </Button>
                <Button onClick={() => setStep('confirm')}>
                  Review & Create
                </Button>
              </div>
            </div>
          )}

          {/* Step: Confirm */}
          {step === 'confirm' && (
            <div className="mt-8 space-y-6">
              {isWrongChain && (
                <div className="border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
                  Your wallet is on the wrong network. You'll be prompted to switch to Base when creating.
                </div>
              )}

              <div className="border border-zdrive-border bg-zdrive-surface p-6">
                <h3 className="font-medium">Release Summary</h3>

                <dl className="mt-4 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-zdrive-text-secondary">Name</dt>
                    <dd>{name}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-zdrive-text-secondary">Symbol</dt>
                    <dd>${symbol}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-zdrive-text-secondary">Cover Image</dt>
                    <dd>{coverImage?.name}</dd>
                  </div>
                  {previewFile && (
                    <div className="flex justify-between">
                      <dt className="text-zdrive-text-secondary">Preview</dt>
                      <dd>{previewFile.name}</dd>
                    </div>
                  )}
                  {attachments.length > 0 && (
                    <div className="flex justify-between">
                      <dt className="text-zdrive-text-secondary">Attachments</dt>
                      <dd>{attachments.length} file(s)</dd>
                    </div>
                  )}
                  {githubUrl && (
                    <div className="flex justify-between">
                      <dt className="text-zdrive-text-secondary">GitHub</dt>
                      <dd className="truncate max-w-[200px]">{githubUrl}</dd>
                    </div>
                  )}
                  {collectionEnabled && collectionTitle && (
                    <div className="flex justify-between">
                      <dt className="text-zdrive-text-secondary">Collection</dt>
                      <dd>{collectionTitle}</dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-zdrive-text-secondary">License</dt>
                    <dd>
                      {selectedLicense
                        ? selectedLicense.replace('CBE_', '').replace('_', ' ')
                        : 'All Rights Reserved'}
                    </dd>
                  </div>
                </dl>
              </div>

              <p className="text-sm text-zdrive-text-secondary">
                Creating a release will mint a new content coin on Base. This
                requires a transaction and gas fees.
              </p>

              <div className="flex justify-between">
                <Button variant="secondary" onClick={() => setStep('options')}>
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!canSubmit || isSubmitting}
                  isLoading={isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : isWrongChain ? 'Switch to Base & Create' : 'Create Release'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
