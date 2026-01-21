'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ordersApi, Order } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
    ArrowLeft,
    Package,
    Truck,
    MapPin,
    Clock,
    Phone,
    Building2,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Store
} from 'lucide-react';

const STATUS_CONFIG: Record<string, { color: string; label: string; icon: any }> = {
    pending: {
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
        label: 'Beklemede',
        icon: AlertCircle
    },
    confirmed: {
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        label: 'Onaylandı',
        icon: CheckCircle2
    },
    processing: {
        color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
        label: 'Hazırlanıyor',
        icon: Package
    },
    shipped: {
        color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
        label: 'Kargoda',
        icon: Truck
    },
    delivered: {
        color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        label: 'Teslim Edildi',
        icon: CheckCircle2
    },
    cancelled: {
        color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        label: 'İptal Edildi',
        icon: XCircle
    },
};

export default function OrderDetailPage() {
    const params = useParams();
    const orderId = Number(params.id);
    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadOrder();
    }, [orderId]);

    const loadOrder = async () => {
        setIsLoading(true);
        try {
            const response = await ordersApi.get(orderId);
            if (response.data?.order) {
                setOrder(response.data.order);
            }
        } catch (error) {
            console.error('Failed to load order:', error);
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
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(new Date(date));
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-48 mb-6" />
                <div className="grid gap-6 md:grid-cols-3">
                    <div className="md:col-span-2 space-y-6">
                        <Skeleton className="h-48" />
                        <Skeleton className="h-32" />
                    </div>
                    <div className="space-y-6">
                        <Skeleton className="h-40" />
                        <Skeleton className="h-40" />
                    </div>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="py-12">
                <Card>
                    <CardContent className="py-12 text-center">
                        <Package className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                        <h2 className="text-xl font-semibold mb-2">Sipariş Bulunamadı</h2>
                        <p className="text-muted-foreground mb-4">Bu sipariş mevcut değil veya erişim izniniz yok.</p>
                        <Button asChild>
                            <Link href="/account/orders">Siparişlere Dön</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
    const StatusIcon = statusConfig.icon;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/account/orders">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">{order.order_number}</h1>
                        <p className="text-muted-foreground">{formatDate(order.created_at)}</p>
                    </div>
                </div>
                <Badge className={`${statusConfig.color} px-4 py-2 text-sm`}>
                    <StatusIcon className="w-4 h-4 mr-2" />
                    {statusConfig.label}
                </Badge>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Left Column - Order Items */}
                <div className="md:col-span-2 space-y-6">
                    {/* Order Items Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="w-5 h-5 text-primary" />
                                Sipariş Kalemleri
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {order.items?.map((item, index) => (
                                    <div key={index} className="flex items-center gap-4 py-3 border-b last:border-0">
                                        <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center shrink-0">
                                            <Package className="w-8 h-8 text-muted-foreground" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium">Ürün #{item.product_id}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {item.quantity} adet × {formatPrice(item.unit_price)}
                                            </p>
                                        </div>
                                        <p className="font-semibold">{formatPrice(item.total_price)}</p>
                                    </div>
                                ))}
                            </div>

                            <Separator className="my-4" />

                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Ara Toplam</span>
                                    <span>{formatPrice(order.subtotal)}</span>
                                </div>
                                {order.shipping_cost && order.shipping_cost > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Kargo</span>
                                        <span>{formatPrice(order.shipping_cost)}</span>
                                    </div>
                                )}
                                <Separator />
                                <div className="flex justify-between text-lg font-bold">
                                    <span>Toplam</span>
                                    <span className="text-primary">{formatPrice(order.total_amount)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tracking Info */}
                    {order.tracking_number && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Truck className="w-5 h-5 text-primary" />
                                    Kargo Takibi
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Takip Numarası</p>
                                        <p className="font-mono font-bold text-lg">{order.tracking_number}</p>
                                        {order.shipping_provider && (
                                            <p className="text-sm text-muted-foreground capitalize">{order.shipping_provider}</p>
                                        )}
                                    </div>
                                    <Button
                                        variant="outline"
                                        onClick={() => navigator.clipboard.writeText(order.tracking_number!)}
                                    >
                                        Kopyala
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Seller Info */}
                    {order.seller && (
                        <Card className="border-blue-200 dark:border-blue-800">
                            <CardHeader className="bg-blue-50/50 dark:bg-blue-900/20">
                                <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                                    <Store className="w-5 h-5" />
                                    Satıcı Bilgileri
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                                        <Store className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-lg">{order.seller.pharmacy_name || order.seller.name}</p>
                                        {order.seller.city && (
                                            <p className="text-sm text-muted-foreground">{order.seller.city}</p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Right Column - Delivery Info */}
                <div className="space-y-6">
                    {/* Delivery Address */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-primary" />
                                Teslimat Adresi
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {typeof order.shipping_address === 'object' && (
                                <>
                                    <div className="flex items-start gap-3">
                                        <Building2 className="w-4 h-4 mt-1 text-muted-foreground" />
                                        <div>
                                            <p className="font-medium">{order.shipping_address.name}</p>
                                            <p className="text-sm text-muted-foreground">{order.shipping_address.address}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {order.shipping_address.district && `${order.shipping_address.district}, `}
                                                {order.shipping_address.city}
                                            </p>
                                        </div>
                                    </div>
                                    {order.shipping_address.phone && (
                                        <div className="flex items-center gap-3">
                                            <Phone className="w-4 h-4 text-muted-foreground" />
                                            <p className="text-sm">{order.shipping_address.phone}</p>
                                        </div>
                                    )}
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Order Timeline */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="w-5 h-5 text-primary" />
                                Sipariş Geçmişi
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 bg-primary rounded-full"></div>
                                    <div>
                                        <p className="text-sm font-medium">Sipariş oluşturuldu</p>
                                        <p className="text-xs text-muted-foreground">{formatDate(order.created_at)}</p>
                                    </div>
                                </div>
                                {order.shipped_at && (
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                                        <div>
                                            <p className="text-sm font-medium">Kargoya verildi</p>
                                            <p className="text-xs text-muted-foreground">{formatDate(order.shipped_at)}</p>
                                        </div>
                                    </div>
                                )}
                                {order.delivered_at && (
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                        <div>
                                            <p className="text-sm font-medium">Teslim edildi</p>
                                            <p className="text-xs text-muted-foreground">{formatDate(order.delivered_at)}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
