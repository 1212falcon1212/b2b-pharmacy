'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { offersApi, Offer, productsApi, Product } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { StatCard, PopularProductsList } from '@/components/dashboard';
import {
  Package,
  TrendingUp,
  Boxes,
  ShoppingCart,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [myOffers, setMyOffers] = useState<Offer[]>([]);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOffers: 0,
    activeOffers: 0,
    totalStock: 0,
  });
  // Mock chart data for sparklines (son 7 gun)
  const [chartData] = useState({
    offers: [3, 5, 4, 8, 6, 9, 12],
    active: [2, 4, 3, 5, 4, 6, 8],
    stock: [120, 135, 128, 150, 142, 165, 180],
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);

    // Load my offers
    const offersRes = await offersApi.getMyOffers({ per_page: 5 });
    if (offersRes.data) {
      setMyOffers(offersRes.data.offers);

      // Calculate stats
      const allOffersRes = await offersApi.getMyOffers({ per_page: 100 });
      if (allOffersRes.data) {
        const offers = allOffersRes.data.offers;
        setStats({
          totalOffers: offers.length,
          activeOffers: offers.filter((o) => o.status === 'active').length,
          totalStock: offers.reduce((acc, o) => acc + o.stock, 0),
        });
      }
    }

    // Load recent products
    const productsRes = await productsApi.getAll({ per_page: 6 });
    if (productsRes.data) {
      setRecentProducts(productsRes.data.products);
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
      { label: string; variant: 'default' | 'secondary' | 'destructive'; icon: typeof CheckCircle2 }
    > = {
      active: { label: 'Aktif', variant: 'default', icon: CheckCircle2 },
      inactive: { label: 'Pasif', variant: 'secondary', icon: Clock },
      sold_out: { label: 'Tukendi', variant: 'destructive', icon: Package },
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
        {/* Header skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-8 w-72" />
          <Skeleton className="h-4 w-96" />
        </div>

        {/* Stats skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
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
          ))}
        </div>

        {/* Content skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section with gradient background */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 p-8 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5" />
              <span className="text-sm font-medium text-white/80">Hos Geldiniz</span>
            </div>
            <h1 className="text-3xl font-bold mb-2">{user?.pharmacy_name}</h1>
            <p className="text-white/80 max-w-md">
              Eczane pazaryerindeki son durumunuza goz atin. Bugun icin {stats.activeOffers} aktif teklifiniz var.
            </p>
          </div>
          <div className="hidden md:block">
            <Link href="/products">
              <Button
                size="lg"
                className="bg-white text-emerald-600 hover:bg-white/90 shadow-xl"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Urunlere Goz At
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Modern Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Toplam Tekliflerim"
          value={stats.totalOffers}
          icon={<TrendingUp className="w-6 h-6" />}
          variant="green"
          trend={{
            value: `${stats.activeOffers} aktif`,
            direction: 'up',
          }}
          chartData={chartData.offers}
        />

        <StatCard
          title="Aktif Teklifler"
          value={stats.activeOffers}
          icon={<Package className="w-6 h-6" />}
          variant="blue"
          trend={{
            value: 'Satista',
            direction: 'neutral',
          }}
          chartData={chartData.active}
        />

        <StatCard
          title="Toplam Stok"
          value={stats.totalStock}
          suffix=" adet"
          icon={<Boxes className="w-6 h-6" />}
          variant="purple"
          trend={{
            value: '+12%',
            direction: 'up',
          }}
          chartData={chartData.stock}
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Offers */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800">
            <div>
              <CardTitle className="text-lg">Son Tekliflerim</CardTitle>
              <CardDescription>Son eklediginiz satis teklifleri</CardDescription>
            </div>
            <Link href="/my-offers">
              <Button variant="ghost" size="sm" className="gap-1">
                Tumunu Gor
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-6">
            {myOffers.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center">
                  <Package className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <p className="text-slate-500 dark:text-slate-400 mb-4">Henuz teklif olusturmadiniz</p>
                <Link href="/products">
                  <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700">
                    Urunlere Goz At
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {myOffers.map((offer, index) => (
                  <div
                    key={offer.id}
                    className="group flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 hover:shadow-sm"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {offer.product?.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-sm text-slate-500 dark:text-slate-400">
                        <Boxes className="w-3 h-3" />
                        <span>Stok: {offer.stock}</span>
                        <span className="text-slate-300 dark:text-slate-600">|</span>
                        <Clock className="w-3 h-3" />
                        <span>SKT: {new Date(offer.expiry_date).toLocaleDateString('tr-TR')}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 ml-4">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                        {formatPrice(offer.price)}
                      </span>
                      {getStatusBadge(offer.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="space-y-6">
          {/* Quick Actions Card */}
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Hizli Islemler</CardTitle>
              <CardDescription>Sik kullanilan islemlere hizli erisim</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Link
                  href="/products"
                  className="group p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all hover:shadow-md"
                >
                  <div className="w-10 h-10 mb-3 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                    <ShoppingCart className="w-5 h-5" />
                  </div>
                  <p className="font-semibold text-slate-900 dark:text-white">Urunler</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Urunlere goz atin</p>
                </Link>

                <Link
                  href="/orders"
                  className="group p-4 rounded-xl bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-900/20 dark:to-sky-900/20 border border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all hover:shadow-md"
                >
                  <div className="w-10 h-10 mb-3 rounded-lg bg-gradient-to-br from-blue-500 to-sky-600 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                    <Package className="w-5 h-5" />
                  </div>
                  <p className="font-semibold text-slate-900 dark:text-white">Siparislerim</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Siparislerinizi takip edin</p>
                </Link>

                <Link
                  href="/wallet"
                  className="group p-4 rounded-xl bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 border border-purple-200 dark:border-purple-800 hover:border-purple-300 dark:hover:border-purple-700 transition-all hover:shadow-md"
                >
                  <div className="w-10 h-10 mb-3 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <p className="font-semibold text-slate-900 dark:text-white">Cuzdan</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Bakiyenizi gorun</p>
                </Link>

                <Link
                  href="/wishlist"
                  className="group p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 hover:border-amber-300 dark:hover:border-amber-700 transition-all hover:shadow-md"
                >
                  <div className="w-10 h-10 mb-3 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <p className="font-semibold text-slate-900 dark:text-white">Favorilerim</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Favori urunleriniz</p>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Popular Products */}
      <PopularProductsList
        products={recentProducts.map((p) => ({
          id: p.id,
          name: p.name,
          brand: p.brand,
          lowest_price: p.lowest_price,
          offers_count: p.offers_count,
        }))}
        title="Populer Urunler"
        viewAllHref="/products"
        emptyMessage="Henuz urun bulunmuyor."
        showRanking={true}
      />
    </div>
  );
}
