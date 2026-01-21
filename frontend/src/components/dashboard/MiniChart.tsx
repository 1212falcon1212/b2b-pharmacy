'use client';

import { useMemo, useId } from 'react';
import { cn } from '@/lib/utils';

interface MiniChartProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  gradientFrom?: string;
  gradientTo?: string;
  showDots?: boolean;
  showArea?: boolean;
  strokeWidth?: number;
  className?: string;
  animate?: boolean;
}

export function MiniChart({
  data,
  width = 120,
  height = 40,
  color = '#059669',
  gradientFrom,
  gradientTo,
  showDots = false,
  showArea = true,
  strokeWidth = 2,
  className,
  animate = true,
}: MiniChartProps) {
  const chartId = useId();

  const { path, areaPath, points, normalizedData } = useMemo(() => {
    if (!data || data.length < 2) {
      return { path: '', areaPath: '', points: [], normalizedData: [] };
    }

    const padding = 4;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const minValue = Math.min(...data);
    const maxValue = Math.max(...data);
    const range = maxValue - minValue || 1;

    const normalized = data.map((value) => ({
      value,
      normalized: (value - minValue) / range,
    }));

    const pointsArr = normalized.map((item, index) => ({
      x: padding + (index / (data.length - 1)) * chartWidth,
      y: padding + (1 - item.normalized) * chartHeight,
      value: item.value,
    }));

    // Create smooth curve using cubic bezier
    let pathD = `M ${pointsArr[0].x} ${pointsArr[0].y}`;

    for (let i = 0; i < pointsArr.length - 1; i++) {
      const current = pointsArr[i];
      const next = pointsArr[i + 1];
      const controlPointX = (current.x + next.x) / 2;

      pathD += ` C ${controlPointX} ${current.y}, ${controlPointX} ${next.y}, ${next.x} ${next.y}`;
    }

    // Area path (for gradient fill)
    const areaD = `${pathD} L ${pointsArr[pointsArr.length - 1].x} ${height - padding} L ${pointsArr[0].x} ${height - padding} Z`;

    return {
      path: pathD,
      areaPath: areaD,
      points: pointsArr,
      normalizedData: normalized,
    };
  }, [data, width, height]);

  if (!data || data.length < 2) {
    return (
      <div
        className={cn('flex items-center justify-center text-slate-400', className)}
        style={{ width, height }}
      >
        <span className="text-xs">Veri yok</span>
      </div>
    );
  }

  const fromColor = gradientFrom || color;
  const toColor = gradientTo || `${color}00`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn('overflow-visible', className)}
    >
      <defs>
        <linearGradient id={`${chartId}-gradient`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={fromColor} stopOpacity="0.3" />
          <stop offset="100%" stopColor={toColor} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Area fill */}
      {showArea && (
        <path
          d={areaPath}
          fill={`url(#${chartId}-gradient)`}
          className={animate ? 'animate-fadeIn' : ''}
        />
      )}

      {/* Line */}
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={animate ? 'animate-drawLine' : ''}
        style={
          animate
            ? {
                strokeDasharray: 1000,
                strokeDashoffset: 1000,
                animation: 'drawLine 1.5s ease-out forwards',
              }
            : {}
        }
      />

      {/* Dots */}
      {showDots &&
        points.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r={3}
            fill="white"
            stroke={color}
            strokeWidth={2}
            className={animate ? 'opacity-0 animate-fadeIn' : ''}
            style={animate ? { animationDelay: `${0.1 * index}s`, animationFillMode: 'forwards' } : {}}
          />
        ))}

      {/* End dot (always visible) */}
      <circle
        cx={points[points.length - 1]?.x}
        cy={points[points.length - 1]?.y}
        r={4}
        fill={color}
        className={animate ? 'opacity-0 animate-fadeIn' : ''}
        style={animate ? { animationDelay: '1s', animationFillMode: 'forwards' } : {}}
      />

      <style jsx>{`
        @keyframes drawLine {
          to {
            stroke-dashoffset: 0;
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
        .animate-drawLine {
          animation: drawLine 1.5s ease-out forwards;
        }
      `}</style>
    </svg>
  );
}

export default MiniChart;
