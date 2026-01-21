'use client';

import { useEffect, useState } from 'react';
import { Package, TrendingUp, Wallet, ShoppingBag, ArrowUpRight, ArrowDownRight, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { sellerApi, SellerStatsResponse, SellerRecentOrder } from "@/lib/api";

interface StatItem {
    title: string;
    value: string;
    change: string;
    trend: 'up' | 'down';
    icon: React.ComponentType<{ className?: string }>;
}

export default function SellerDashboardPage() {
    const [stats, setStats] = useState<StatItem[]>([]);
    const [recentOrders, setRecentOrders] = useState<SellerRecentOrder[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Fetch stats and recent orders in parallel
            const [statsRes, ordersRes] = await Promise.all([
                sellerApi.getStats(),
                sellerApi.getRecentOrders(5),
            ]);

            if (statsRes.data?.success && statsRes.data.data) {
                const data = statsRes.data.data;
                setStats([
                    {
                        title: "Toplam Satış",
                        value: data.total_sales?.formatted ?? "₺0",
                        change: data.total_sales?.change || "+0%",
                        trend: data.total_sales?.trend || 'up',
                        icon: TrendingUp,
                    },
                    {
                        title: "Aktif Teklifler",
                        value: data.active_offers?.formatted ?? "0",
                        change: "",
                        trend: 'up',
                        icon: Package,
                    },
                    {
                        title: "Bekleyen Siparişler",
                        value: data.pending_orders?.formatted ?? "0",
                        change: "",
                        trend: 'up',
                        icon: ShoppingBag,
                    },
                    {
                        title: "Cüzdan Bakiyesi",
                        value: data.wallet_balance?.formatted ?? "₺0",
                        change: data.wallet_balance?.pending ? `Bekleyen: ${data.wallet_balance.pending}` : "",
                        trend: 'up',
                        icon: Wallet,
                    },
                ]);
            } else if (statsRes.error) {
                console.error('Stats API error:', statsRes.error);
            }

            if (ordersRes.data?.success && ordersRes.data.data) {
                setRecentOrders(ordersRes.data.data);
            } else if (ordersRes.error) {
                console.error('Orders API error:', ordersRes.error);
            }
        } catch (err) {
            console.error('Dashboard load error:', err);
            setError('Veriler yüklenirken bir hata oluştu.');
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'delivered':
                return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'shipped':
                return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            case 'cancelled':
                return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            default:
                return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-8">
                <div>
                    <Skeleton className="h-8 w-48 mb-2" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Card key={i} className="border-slate-200 dark:border-slate-800">
                            <CardHeader className="pb-2">
                                <Skeleton className="h-4 w-24" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-8 w-32 mb-2" />
                                <Skeleton className="h-3 w-16" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
                <Card className="border-slate-200 dark:border-slate-800">
                    <CardHeader>
                        <Skeleton className="h-6 w-32" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex justify-between py-3">
                                <div>
                                    <Skeleton className="h-4 w-40 mb-2" />
                                    <Skeleton className="h-3 w-24" />
                                </div>
                                <div className="text-right">
                                    <Skeleton className="h-4 w-20 mb-2" />
                                    <Skeleton className="h-5 w-16" />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Satıcı Paneli</h1>
                <p className="text-slate-500 dark:text-slate-400">Satışlarınızı ve tekliflerinizi yönetin.</p>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-400">
                    {error}
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.length > 0 ? stats.map((stat) => (
                    <Card key={stat.title} className="border-slate-200 dark:border-slate-800">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.title}</CardTitle>
                            <stat.icon className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value || '-'}</div>
                            {stat.change && (
                                <div className={`flex items-center text-xs ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                                    {stat.trend === 'up' ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                                    {stat.change}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )) : (
                    <div className="col-span-4 text-center py-8 text-slate-500 dark:text-slate-400">
                        İstatistikler yükleniyor...
                    </div>
                )}
            </div>

            {/* Recent Orders */}
            <Card className="border-slate-200 dark:border-slate-800">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Son Siparişler</CardTitle>
                    <Link href="/seller/orders" className="text-sm text-blue-600 hover:underline">
                        Tümünü Gör
                    </Link>
                </CardHeader>
                <CardContent>
                    {recentOrders.length === 0 ? (
                        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                            Henüz sipariş bulunmuyor.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {recentOrders.map((order) => (
                                <Link
                                    key={order.id}
                                    href={`/seller/orders/${order.id}`}
                                    className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 -mx-2 px-2 rounded-lg transition-colors"
                                >
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-white">{order.product}</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">{order.buyer}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-slate-900 dark:text-white">{order.amount}</p>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(order.status)}`}>
                                            {order.status_label}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Link href="/seller/products/new" className="p-4 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 rounded-xl border border-blue-200 dark:border-blue-800 transition-colors">
                    <Package className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-2" />
                    <p className="font-semibold text-slate-900 dark:text-white">Yeni Ürün Ekle</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Stoklarınıza ürün ekleyin</p>
                </Link>
                <Link href="/seller/offers" className="p-4 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30 rounded-xl border border-green-200 dark:border-green-800 transition-colors">
                    <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400 mb-2" />
                    <p className="font-semibold text-slate-900 dark:text-white">Tekliflerim</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Tekliflerinizi yönetin</p>
                </Link>
                <Link href="/seller/wallet" className="p-4 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/30 rounded-xl border border-purple-200 dark:border-purple-800 transition-colors">
                    <Wallet className="w-6 h-6 text-purple-600 dark:text-purple-400 mb-2" />
                    <p className="font-semibold text-slate-900 dark:text-white">Para Çek</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Hakedişinizi çekin</p>
                </Link>
            </div>
        </div>
    );
}
