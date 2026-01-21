import { Package, ShoppingCart, Search, FileText, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface EmptyStateProps {
    type: 'products' | 'orders' | 'search' | 'invoices' | 'offers' | 'general';
    title?: string;
    description?: string;
    actionLabel?: string;
    actionHref?: string;
    onAction?: () => void;
}

const EMPTY_STATE_CONFIG = {
    products: {
        icon: Package,
        title: 'Ürün Bulunamadı',
        description: 'Henüz ürün eklenmemiş veya arama kriterlerinize uygun ürün yok.',
        actionLabel: 'Ürün Ekle',
        actionHref: '/seller/products/new',
    },
    orders: {
        icon: ShoppingCart,
        title: 'Sipariş Bulunamadı',
        description: 'Henüz sipariş almadınız veya filtrelere uygun sipariş yok.',
        actionLabel: 'Market\'e Git',
        actionHref: '/market',
    },
    search: {
        icon: Search,
        title: 'Sonuç Bulunamadı',
        description: 'Arama kriterlerinize uygun sonuç bulunamadı. Farklı anahtar kelimeler deneyin.',
        actionLabel: 'Tüm Ürünleri Gör',
        actionHref: '/products',
    },
    invoices: {
        icon: FileText,
        title: 'Fatura Bulunamadı',
        description: 'Henüz fatura oluşturulmamış. Siparişleriniz tamamlandığında faturalarınız burada görünecek.',
        actionLabel: 'Siparişlere Git',
        actionHref: '/seller/orders',
    },
    offers: {
        icon: Package,
        title: 'Teklif Bulunamadı',
        description: 'Henüz teklif vermediniz. Ürünleriniz için fiyat teklifi oluşturun.',
        actionLabel: 'Teklif Oluştur',
        actionHref: '/seller/products/new',
    },
    general: {
        icon: Inbox,
        title: 'İçerik Bulunamadı',
        description: 'Görüntülenecek içerik bulunamadı.',
        actionLabel: 'Ana Sayfa',
        actionHref: '/',
    },
};

export function EmptyState({
    type,
    title,
    description,
    actionLabel,
    actionHref,
    onAction,
}: EmptyStateProps) {
    const config = EMPTY_STATE_CONFIG[type];
    const Icon = config.icon;

    const displayTitle = title || config.title;
    const displayDescription = description || config.description;
    const displayActionLabel = actionLabel || config.actionLabel;
    const displayActionHref = actionHref || config.actionHref;

    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            {/* Gradient background circle */}
            <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-b from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-900/10 rounded-full blur-2xl scale-150"></div>
                <div className="relative w-24 h-24 bg-gradient-to-br from-blue-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-full flex items-center justify-center border border-slate-200 dark:border-slate-700">
                    <Icon className="w-12 h-12 text-blue-500 dark:text-blue-400" strokeWidth={1.5} />
                </div>
            </div>

            {/* Text content */}
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                {displayTitle}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mb-6">
                {displayDescription}
            </p>

            {/* Action button */}
            {(displayActionHref || onAction) && (
                onAction ? (
                    <Button onClick={onAction} className="bg-blue-600 hover:bg-blue-700">
                        {displayActionLabel}
                    </Button>
                ) : (
                    <Link href={displayActionHref}>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            {displayActionLabel}
                        </Button>
                    </Link>
                )
            )}
        </div>
    );
}

export default EmptyState;
