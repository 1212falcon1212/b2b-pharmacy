'use client';

import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

type TrendDirection = 'up' | 'down' | 'neutral';

interface TrendBadgeProps {
  value: string | number;
  direction?: TrendDirection;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'text-xs px-1.5 py-0.5 gap-0.5',
  md: 'text-sm px-2 py-1 gap-1',
  lg: 'text-base px-3 py-1.5 gap-1.5',
};

const iconSizes = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

export function TrendBadge({
  value,
  direction = 'neutral',
  showIcon = true,
  size = 'sm',
  className,
}: TrendBadgeProps) {
  const getColors = () => {
    switch (direction) {
      case 'up':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'down':
        return 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
      default:
        return 'bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
    }
  };

  const getIcon = () => {
    switch (direction) {
      case 'up':
        return <ArrowUpRight className={iconSizes[size]} />;
      case 'down':
        return <ArrowDownRight className={iconSizes[size]} />;
      default:
        return <Minus className={iconSizes[size]} />;
    }
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full border transition-all duration-200',
        sizeClasses[size],
        getColors(),
        className
      )}
    >
      {showIcon && getIcon()}
      <span>{value}</span>
    </span>
  );
}

export default TrendBadge;
