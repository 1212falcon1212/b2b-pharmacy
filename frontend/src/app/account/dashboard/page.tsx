'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { ordersApi, Order } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Package,
    ShoppingBag,
    MapPin,
    Settings,
    ArrowRight,
    Clock,
    CheckCircle2,
    Truck,
    XCircle,
    Sparkles,
} from 'lucide-react';

export default function AccountDashboardPage() {
    const { user } = useAuth();
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        totalOrders: 0,
        pendingOrders: 0,
        completedOrders: 0,
    });

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        setIsLoading(true);

        try {
            const ordersRes = await ordersApi.getAll({ per_page: 5 });
            if (ordersRes.data) {
                setRecentOrders(ordersRes.data.orders || []);

                // Calculate stats
                const allOrdersRes = await ordersApi.getAll({ per_page: 100 });
                if (allOrdersRes.data) {
                    const orders = allOrdersRes.data.orders || [];
                    setStats({
                        totalOrders: orders.length,
                        pendingOrders: orders.filter((o: Order) => ['pending', 'processing', 'shipped'].includes(o.status)).length,
                        completedOrders: orders.filter((o: Order) => o.status === 'delivered').length,
                    });
                }
            }
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        }

        setIsLoading(false);
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
        }).format(price);
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<
            string,
            { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: typeof CheckCircle2 }
        > = {
            pending: { label: 'Bekliyor', variant: 'secondary', icon: Clock },
            processing: { label: 'Hazirlaniyor', variant: 'default', icon: Package },
            shipped: { label: 'Kargoda', variant: 'default', icon: Truck },
            delivered: { label: 'Teslim Edildi', variant: 'outline', icon: CheckCircle2 },
            cancelled: { label: 'Iptal', variant: 'destructive', icon: XCircle },
        };
        const config = variants[status] || { label: status, variant: 'secondary' as const, icon: Clock };
        const Icon = config.icon;
        return (
            <Badge variant={config.variant} className="gap-1">
                <Icon className="w-3 h-3" />
                {config.label}
            </Badge>
        );
    };

    if (isLoading) {
        return (
            <div className="space-y-8">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-72" />
                    <Skeleton className="h-4 w-96" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-32" />
                    ))}
                </div>
                <Skeleton className="h-80" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 p-8 text-white">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-5 h-5" />
                        <span className="text-sm font-medium text-white/80">Hos Geldiniz</span>
                    </div>
                    <h1 className="text-3xl font-bold mb-2">{user?.pharmacy_name}</h1>
                    <p className="text-white/80 max-w-md">
                        Hesabinizi buradan yonetebilir, siparislerinizi takip edebilirsiniz.
                    </p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-slate-200 dark:border-slate-800">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Toplam Siparis</p>
                                <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalOrders}</p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <ShoppingBag className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 dark:border-slate-800">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Bekleyen</p>
                                <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.pendingOrders}</p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                                <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 dark:border-slate-800">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Tamamlanan</p>
                                <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.completedOrders}</p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions & Recent Orders */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Quick Actions */}
                <Card className="border-slate-200 dark:border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-lg">Hizli Islemler</CardTitle>
                        <CardDescription>Sik kullanilan sayfalar</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Link
                            href="/account/orders"
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <ShoppingBag className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-slate-900 dark:text-white">Siparislerim</p>
                                <p className="text-sm text-slate-500">Tum siparislerinizi gorun</p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-400" />
                        </Link>

                        <Link
                            href="/account/addresses"
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-slate-900 dark:text-white">Adreslerim</p>
                                <p className="text-sm text-slate-500">Teslimat adresleriniz</p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-400" />
                        </Link>

                        <Link
                            href="/account/settings"
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                <Settings className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-slate-900 dark:text-white">Hesap Ayarlari</p>
                                <p className="text-sm text-slate-500">Profil bilgileriniz</p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-400" />
                        </Link>

                        <Link
                            href="/market"
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-slate-900 dark:text-white">Alisverise Devam</p>
                                <p className="text-sm text-slate-500">Urunlere goz atin</p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-400" />
                        </Link>
                    </CardContent>
                </Card>

                {/* Recent Orders */}
                <Card className="lg:col-span-2 border-slate-200 dark:border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg">Son Siparisler</CardTitle>
                            <CardDescription>Son verdiginiz siparisler</CardDescription>
                        </div>
                        <Link href="/account/orders">
                            <Button variant="ghost" size="sm" className="gap-1">
                                Tumunu Gor
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {recentOrders.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                    <ShoppingBag className="w-8 h-8 text-slate-400" />
                                </div>
                                <p className="text-slate-500 dark:text-slate-400 mb-4">Henuz siparisiniz yok</p>
                                <Link href="/market">
                                    <Button className="bg-blue-600 hover:bg-blue-700">
                                        Alisverise Basla
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {recentOrders.map((order) => (
                                    <Link
                                        key={order.id}
                                        href={`/account/orders/${order.id}`}
                                        className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-slate-900 dark:text-white">
                                                Siparis #{order.id}
                                            </p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                                {new Date(order.created_at).toLocaleDateString('tr-TR')}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="font-bold text-slate-900 dark:text-white">
                                                {formatPrice(order.total)}
                                            </span>
                                            {getStatusBadge(order.status)}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
