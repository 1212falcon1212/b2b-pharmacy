'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { CountUp } from './CountUp';
import { TrendBadge } from './TrendBadge';
import { MiniChart } from './MiniChart';

type GradientVariant = 'green' | 'blue' | 'purple' | 'orange' | 'rose' | 'cyan';
type TrendDirection = 'up' | 'down' | 'neutral';

interface StatCardProps {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  icon?: ReactNode;
  trend?: {
    value: string;
    direction: TrendDirection;
  };
  chartData?: number[];
  variant?: GradientVariant;
  loading?: boolean;
  className?: string;
  description?: string;
}

const gradients: Record<GradientVariant, { bg: string; icon: string; chart: string }> = {
  green: {
    bg: 'from-emerald-500/10 via-teal-500/5 to-transparent dark:from-emerald-500/20 dark:via-teal-500/10',
    icon: 'from-emerald-500 to-teal-600',
    chart: '#059669',
  },
  blue: {
    bg: 'from-sky-500/10 via-blue-500/5 to-transparent dark:from-sky-500/20 dark:via-blue-500/10',
    icon: 'from-sky-500 to-blue-600',
    chart: '#0284c7',
  },
  purple: {
    bg: 'from-violet-500/10 via-purple-500/5 to-transparent dark:from-violet-500/20 dark:via-purple-500/10',
    icon: 'from-violet-500 to-purple-600',
    chart: '#7c3aed',
  },
  orange: {
    bg: 'from-amber-500/10 via-orange-500/5 to-transparent dark:from-amber-500/20 dark:via-orange-500/10',
    icon: 'from-amber-500 to-orange-600',
    chart: '#f59e0b',
  },
  rose: {
    bg: 'from-rose-500/10 via-pink-500/5 to-transparent dark:from-rose-500/20 dark:via-pink-500/10',
    icon: 'from-rose-500 to-pink-600',
    chart: '#f43f5e',
  },
  cyan: {
    bg: 'from-cyan-500/10 via-teal-500/5 to-transparent dark:from-cyan-500/20 dark:via-teal-500/10',
    icon: 'from-cyan-500 to-teal-600',
    chart: '#06b6d4',
  },
};

export function StatCard({
  title,
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  icon,
  trend,
  chartData,
  variant = 'green',
  loading = false,
  className,
  description,
}: StatCardProps) {
  const gradient = gradients[variant];

  if (loading) {
    return (
      <div
        className={cn(
          'relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6',
          className
        )}
      >
        <div className="animate-pulse space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-12 w-12 bg-slate-200 dark:bg-slate-700 rounded-xl" />
          </div>
          <div className="h-10 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="flex items-center justify-between">
            <div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded-full" />
            <div className="h-10 w-28 bg-slate-200 dark:bg-slate-700 rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800',
        'bg-white dark:bg-slate-900 p-6',
        'transition-all duration-300 ease-out',
        'hover:border-slate-300 dark:hover:border-slate-700',
        'hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50',
        'hover:-translate-y-1',
        className
      )}
    >
      {/* Gradient background */}
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-br opacity-60 transition-opacity duration-300 group-hover:opacity-100',
          gradient.bg
        )}
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {title}
            </h3>
            {description && (
              <p className="text-xs text-slate-400 dark:text-slate-500">{description}</p>
            )}
          </div>
          {icon && (
            <div
              className={cn(
                'flex items-center justify-center w-12 h-12 rounded-xl',
                'bg-gradient-to-br shadow-lg',
                'transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3',
                gradient.icon
              )}
            >
              <div className="text-white">{icon}</div>
            </div>
          )}
        </div>

        {/* Value */}
        <div className="mb-4">
          <span className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            <CountUp
              end={value}
              prefix={prefix}
              suffix={suffix}
              decimals={decimals}
              duration={1500}
              separator="."
            />
          </span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          {trend && (
            <TrendBadge
              value={trend.value}
              direction={trend.direction}
              size="sm"
            />
          )}
          {chartData && chartData.length > 0 && (
            <MiniChart
              data={chartData}
              color={gradient.chart}
              width={100}
              height={36}
              showArea={true}
              animate={true}
            />
          )}
          {!trend && !chartData && <div />}
        </div>
      </div>
    </div>
  );
}

export default StatCard;
