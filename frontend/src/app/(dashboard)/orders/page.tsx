'use client';

import { useEffect, useState } from 'react';
import { ordersApi, Order, Pagination } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Package, ChevronRight, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    processing: 'bg-purple-100 text-purple-800',
    shipped: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
};

const STATUS_LABELS: Record<string, string> = {
    pending: 'Beklemede',
    confirmed: 'Onaylandı',
    processing: 'Hazırlanıyor',
    shipped: 'Kargoda',
    delivered: 'Teslim Edildi',
    cancelled: 'İptal Edildi',
};

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);

    useEffect(() => {
        loadOrders();
    }, [page]);

    const loadOrders = async () => {
        setIsLoading(true);
        try {
            const response = await ordersApi.getAll({ page, per_page: 10 });
            if (response.data) {
                setOrders(response.data.orders);
                setPagination(response.data.pagination);
            }
        } catch (error) {
            console.error('Failed to load orders:', error);
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
            <div className="container max-w-4xl py-8">
                <h1 className="text-2xl font-bold mb-6">Siparişlerim</h1>
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

    if (orders.length === 0) {
        return (
            <div className="container max-w-4xl py-8">
                <h1 className="text-2xl font-bold mb-6">Siparişlerim</h1>
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
                        <h2 className="text-xl font-semibold mb-2">Henüz siparişiniz yok</h2>
                        <p className="text-muted-foreground mb-4">
                            Alışverişe başlayarak ilk siparişinizi verin.
                        </p>
                        <Button asChild>
                            <Link href="/products">Ürünlere Göz At</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container max-w-4xl py-8">
            <h1 className="text-2xl font-bold mb-6">Siparişlerim</h1>

            <div className="space-y-4">
                {orders.map((order) => (
                    <Link key={order.id} href={`/orders/${order.id}`}>
                        <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <Package className="h-5 w-5 text-muted-foreground" />
                                            <span className="font-semibold">{order.order_number}</span>
                                            <Badge className={STATUS_COLORS[order.status]}>
                                                {STATUS_LABELS[order.status]}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {formatDate(order.created_at)}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="font-semibold">{formatPrice(order.total_amount)}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {order.items?.length || 0} ürün
                                            </p>
                                        </div>
                                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            {pagination && pagination.last_page > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                    <Button
                        variant="outline"
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                    >
                        Önceki
                    </Button>
                    <span className="flex items-center px-4">
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
