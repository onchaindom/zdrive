'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import clsx from 'clsx';
import { MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_DISPLAY } from '@/lib/constants';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  accept?: Record<string, string[]>;
  maxSize?: number;
  label?: string;
  hint?: string;
  currentFile?: File | null;
  error?: string;
  className?: string;
}

export function FileUploader({
  onFileSelect,
  accept,
  maxSize = MAX_FILE_SIZE_BYTES,
  label,
  hint,
  currentFile,
  error,
  className,
}: FileUploaderProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0]);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      accept,
      maxSize,
      multiple: false,
    });

  const hasError = error || fileRejections.length > 0;
  const rejectionError = fileRejections[0]?.errors[0]?.message;

  return (
    <div className={className}>
      {label && (
        <label className="mb-1.5 block text-sm font-medium">{label}</label>
      )}

      <div
        {...getRootProps()}
        className={clsx(
          'flex min-h-[120px] cursor-pointer flex-col items-center justify-center border-2 border-dashed p-6 transition-colors',
          isDragActive
            ? 'border-zdrive-text bg-zdrive-bg'
            : hasError
              ? 'border-red-300 bg-red-50'
              : 'border-zdrive-border hover:border-zdrive-border-hover hover:bg-zdrive-bg'
        )}
      >
        <input {...getInputProps()} />

        {currentFile ? (
          <div className="text-center">
            <p className="text-sm font-medium">{currentFile.name}</p>
            <p className="mt-1 text-xs text-zdrive-text-secondary">
              {(currentFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
            <p className="mt-2 text-xs text-zdrive-text-muted">
              Drop a new file to replace
            </p>
          </div>
        ) : (
          <div className="text-center">
            <svg
              className="mx-auto h-8 w-8 text-zdrive-text-muted"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="mt-2 text-sm text-zdrive-text-secondary">
              {isDragActive
                ? 'Drop the file here'
                : 'Drag and drop or click to select'}
            </p>
            <p className="mt-1 text-xs text-zdrive-text-muted">
              Max size: {MAX_FILE_SIZE_DISPLAY}
            </p>
          </div>
        )}
      </div>

      {(error || rejectionError) && (
        <p className="mt-1.5 text-sm text-red-500">{error || rejectionError}</p>
      )}
      {hint && !error && !rejectionError && (
        <p className="mt-1.5 text-sm text-zdrive-text-muted">{hint}</p>
      )}
    </div>
  );
}

// Multi-file uploader for attachments
interface MultiFileUploaderProps {
  onFilesChange: (files: File[]) => void;
  files: File[];
  maxSize?: number;
  label?: string;
  hint?: string;
  className?: string;
}

export function MultiFileUploader({
  onFilesChange,
  files,
  maxSize = MAX_FILE_SIZE_BYTES,
  label,
  hint,
  className,
}: MultiFileUploaderProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onFilesChange([...files, ...acceptedFiles]);
    },
    [files, onFilesChange]
  );

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onFilesChange(newFiles);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize,
    multiple: true,
  });

  return (
    <div className={className}>
      {label && (
        <label className="mb-1.5 block text-sm font-medium">{label}</label>
      )}

      {/* File list */}
      {files.length > 0 && (
        <ul className="mb-3 space-y-2">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${index}`}
              className="flex items-center justify-between border border-zdrive-border bg-zdrive-surface px-3 py-2"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm">{file.name}</p>
                <p className="text-xs text-zdrive-text-muted">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="ml-3 text-zdrive-text-secondary hover:text-red-500"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={clsx(
          'flex min-h-[80px] cursor-pointer flex-col items-center justify-center border-2 border-dashed p-4 transition-colors',
          isDragActive
            ? 'border-zdrive-text bg-zdrive-bg'
            : 'border-zdrive-border hover:border-zdrive-border-hover hover:bg-zdrive-bg'
        )}
      >
        <input {...getInputProps()} />
        <p className="text-sm text-zdrive-text-secondary">
          {isDragActive ? 'Drop files here' : 'Add more files'}
        </p>
      </div>

      {hint && <p className="mt-1.5 text-sm text-zdrive-text-muted">{hint}</p>}
    </div>
  );
}
