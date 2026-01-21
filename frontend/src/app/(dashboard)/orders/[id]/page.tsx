'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ordersApi, Order, OrderItem } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Package,
    ArrowLeft,
    MapPin,
    CheckCircle,
    XCircle,
    Truck
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

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

export default function OrderDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [order, setOrder] = useState<Order | null>(null);
    const [items, setItems] = useState<OrderItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCancelling, setIsCancelling] = useState(false);

    const orderId = Number(params.id);

    useEffect(() => {
        loadOrder();
    }, [orderId]);

    const loadOrder = async () => {
        setIsLoading(true);
        try {
            const response = await ordersApi.get(orderId);
            if (response.data) {
                setOrder(response.data.order);
                setItems(response.data.items);
            }
        } catch (error) {
            console.error('Failed to load order:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = async () => {
        if (!confirm('Siparişi iptal etmek istediğinizden emin misiniz?')) return;

        setIsCancelling(true);
        try {
            const response = await ordersApi.cancel(orderId);
            if (response.data) {
                setOrder(response.data.order);
                toast.success('Sipariş iptal edildi.');
            } else if (response.error) {
                toast.error(response.error);
            }
        } catch (error) {
            toast.error('Sipariş iptal edilemedi.');
        } finally {
            setIsCancelling(false);
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
                <Skeleton className="h-8 w-48 mb-6" />
                <div className="space-y-4">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-32 w-full" />
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="container max-w-4xl py-8">
                <Alert variant="destructive">
                    <AlertDescription>Sipariş bulunamadı.</AlertDescription>
                </Alert>
                <Button asChild className="mt-4">
                    <Link href="/orders">Siparişlere Dön</Link>
                </Button>
            </div>
        );
    }

    const canCancel = order.status === 'pending' || order.status === 'confirmed';

    return (
        <div className="container max-w-4xl py-8">
            <div className="mb-6">
                <Button variant="ghost" asChild className="gap-2">
                    <Link href="/orders">
                        <ArrowLeft className="h-4 w-4" />
                        Siparişlerime Dön
                    </Link>
                </Button>
            </div>

            {/* Order Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-3">
                        <Package className="h-6 w-6" />
                        {order.order_number}
                    </h1>
                    <p className="text-muted-foreground">{formatDate(order.created_at)}</p>
                </div>
                <Badge className={`text-sm ${STATUS_COLORS[order.status]}`}>
                    {STATUS_LABELS[order.status]}
                </Badge>
            </div>

            {order.status === 'pending' && (
                <Alert className="mb-6 bg-green-50 border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                        Siparişiniz başarıyla alındı! En kısa sürede işleme alınacaktır.
                    </AlertDescription>
                </Alert>
            )}

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Order Items */}
                <Card>
                    <CardHeader>
                        <CardTitle>Sipariş Detayları</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {items.map((item) => (
                            <div key={item.id} className="flex justify-between items-start">
                                <div>
                                    <p className="font-medium">{item.product?.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {item.seller?.pharmacy_name}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {item.quantity} adet x {formatPrice(item.unit_price)}
                                    </p>
                                </div>
                                <p className="font-medium">{formatPrice(item.total_price)}</p>
                            </div>
                        ))}

                        <Separator />

                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Ara Toplam</span>
                                <span>{formatPrice(order.subtotal)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg">
                                <span>Toplam</span>
                                <span>{formatPrice(order.total_amount)}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Shipping Address */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5" />
                                Teslimat Adresi
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="font-medium">{order.shipping_address.name}</p>
                            <p className="text-muted-foreground">{order.shipping_address.phone}</p>
                            <p className="text-muted-foreground mt-2">
                                {order.shipping_address.address}
                            </p>
                            <p className="text-muted-foreground">
                                {order.shipping_address.district && `${order.shipping_address.district}, `}
                                {order.shipping_address.city}
                            </p>
                        </CardContent>
                    </Card>

                    {order.notes && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Sipariş Notu</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">{order.notes}</p>
                            </CardContent>
                        </Card>
                    )}

                    {canCancel && (
                        <Button
                            variant="destructive"
                            className="w-full gap-2"
                            onClick={handleCancel}
                            disabled={isCancelling}
                        >
                            <XCircle className="h-4 w-4" />
                            Siparişi İptal Et
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
