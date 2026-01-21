'use client';

import { useEffect, useState } from 'react';
import { ordersApi, Order, Pagination } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Package, ChevronRight, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    processing: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    shipped: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
    delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

const STATUS_LABELS: Record<string, string> = {
    pending: 'Beklemede',
    confirmed: 'Onaylandı',
    processing: 'Hazırlanıyor',
    shipped: 'Kargoda',
    delivered: 'Teslim Edildi',
    cancelled: 'İptal Edildi',
};

export default function SellerOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);

    useEffect(() => {
        loadOrders();
    }, [page]);

    const loadOrders = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await ordersApi.getAll({ page, per_page: 10 });
            if (response.data) {
                setOrders(response.data.orders ?? []);
                setPagination(response.data.pagination ?? null);
            } else if (response.error) {
                setError(response.error);
                setOrders([]);
            }
        } catch (err) {
            console.error('Failed to load orders:', err);
            setError('Siparişler yüklenirken bir hata oluştu.');
            setOrders([]);
        } finally {
            setIsLoading(false);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
        }).format(price);
    };

    const formatDate = (date: string) => {
        return new Intl.DateTimeFormat('tr-TR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(new Date(date));
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Siparişlerim</h1>
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <Card key={i}>
                            <CardContent className="p-6">
                                <Skeleton className="h-6 w-32 mb-2" />
                                <Skeleton className="h-4 w-48 mb-4" />
                                <Skeleton className="h-4 w-24" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-6">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Siparişlerim</h1>
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-400">
                    {error}
                    <button
                        onClick={() => loadOrders()}
                        className="ml-2 underline hover:no-underline"
                    >
                        Yeniden dene
                    </button>
                </div>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="space-y-6">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Siparişlerim</h1>
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <ShoppingBag className="h-16 w-16 text-slate-300 mb-4" />
                        <h2 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">Henüz siparişiniz yok</h2>
                        <p className="text-slate-500 dark:text-slate-400 mb-4">
                            Satış yaptığınızda siparişleriniz burada görünecek.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Siparişlerim</h1>

            <div className="space-y-4">
                {orders.map((order) => (
                    <Link key={order.id} href={`/seller/orders/${order.id}`}>
                        <Card className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <Package className="h-5 w-5 text-slate-400" />
                                            <span className="font-semibold text-slate-900 dark:text-white">{order.order_number}</span>
                                            <Badge className={STATUS_COLORS[order.status] || STATUS_COLORS.pending}>
                                                {STATUS_LABELS[order.status] || order.status}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            {formatDate(order.created_at)}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="font-semibold text-slate-900 dark:text-white">{formatPrice(order.total_amount)}</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                                {order.items?.length || 0} ürün
                                            </p>
                                        </div>
                                        <ChevronRight className="h-5 w-5 text-slate-400" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            {pagination && pagination.last_page > 1 && (
                <div className="flex justify-center gap-2">
                    <Button
                        variant="outline"
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                    >
                        Önceki
                    </Button>
                    <span className="flex items-center px-4 text-slate-600 dark:text-slate-400">
                        {page} / {pagination.last_page}
                    </span>
                    <Button
                        variant="outline"
                        disabled={page === pagination.last_page}
                        onClick={() => setPage(page + 1)}
                    >
                        Sonraki
                    </Button>
                </div>
            )}
        </div>
    );
}
