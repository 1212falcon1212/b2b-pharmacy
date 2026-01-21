'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Package, ArrowRight, TrendingUp, Star } from 'lucide-react';

interface Product {
  id: number | string;
  name: string;
  brand?: string;
  lowest_price?: number;
  offers_count?: number;
  image_url?: string;
  sales_count?: number;
}

interface PopularProductsListProps {
  products: Product[];
  title?: string;
  viewAllHref?: string;
  emptyMessage?: string;
  loading?: boolean;
  showRanking?: boolean;
  className?: string;
}

export function PopularProductsList({
  products,
  title = 'Populer Urunler',
  viewAllHref,
  emptyMessage = 'Henuz urun bulunmuyor.',
  loading = false,
  showRanking = true,
  className,
}: PopularProductsListProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(price);
  };

  if (loading) {
    return (
      <div className={cn('rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden', className)}>
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        </div>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 animate-pulse">
              <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
              <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded mb-3" />
              <div className="flex justify-between">
                <div className="h-5 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-5 w-12 bg-slate-200 dark:bg-slate-700 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h3 className="font-semibold text-slate-900 dark:text-white">{title}</h3>
        </div>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            Tumunu Gor
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="p-12 text-center">
          <Package className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <p className="text-slate-500 dark:text-slate-400">{emptyMessage}</p>
        </div>
      ) : (
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product, index) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className={cn(
                'group relative p-4 rounded-xl transition-all duration-300',
                'bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900',
                'border border-slate-200 dark:border-slate-700',
                'hover:border-emerald-300 dark:hover:border-emerald-700',
                'hover:shadow-lg hover:shadow-emerald-100/50 dark:hover:shadow-emerald-900/20',
                'hover:-translate-y-0.5'
              )}
            >
              {/* Ranking badge */}
              {showRanking && index < 3 && (
                <div
                  className={cn(
                    'absolute -top-2 -left-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg',
                    index === 0 && 'bg-gradient-to-br from-amber-400 to-amber-600',
                    index === 1 && 'bg-gradient-to-br from-slate-400 to-slate-600',
                    index === 2 && 'bg-gradient-to-br from-amber-600 to-amber-800'
                  )}
                >
                  {index + 1}
                </div>
              )}

              {/* Product info */}
              <div className="space-y-2">
                <h4 className="font-medium text-slate-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {product.name}
                </h4>
                {product.brand && (
                  <p className="text-sm text-slate-500 dark:text-slate-400">{product.brand}</p>
                )}
              </div>

              {/* Price and offers */}
              <div className="mt-4 flex items-center justify-between">
                {product.lowest_price ? (
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {formatPrice(product.lowest_price)}
                  </span>
                ) : (
                  <span className="text-sm text-slate-400 dark:text-slate-500">Teklif yok</span>
                )}
                <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  <Star className="w-3 h-3" />
                  {product.offers_count || 0} teklif
                </span>
              </div>

              {/* Sales indicator */}
              {product.sales_count !== undefined && product.sales_count > 0 && (
                <div className="mt-2 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                  <TrendingUp className="w-3 h-3 text-emerald-500" />
                  {product.sales_count} satis
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default PopularProductsList;
