import clsx from 'clsx';
import { ZorbWanderingLight } from './Zorb';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_MAP = { sm: 32, md: 48, lg: 80 } as const;

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  return (
    <div className={clsx('inline-flex', className)}>
      <ZorbWanderingLight size={SIZE_MAP[size]} />
    </div>
  );
}

export function LoadingPage() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );
}
