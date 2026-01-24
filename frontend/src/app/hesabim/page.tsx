'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ordersApi, Order, SellerOrder, api, integrationsApi, UserIntegration, sellerApi, SellerOrderDetail } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
    BarChart3,
    Package,
    ShoppingBag,
    Heart,
    Wallet,
    FileText,
    Settings,
    Store,
    Plus,
    ArrowRight,
    TrendingUp,
    TrendingDown,
    Clock,
    CheckCircle2,
    Truck,
    XCircle,
    Eye,
    Edit,
    MoreVertical,
    Search,
    Filter,
    Calendar,
    CreditCard,
    Building2,
    MapPin,
    Phone,
    Mail,
    LogOut,
    ChevronRight,
    AlertCircle,
    Info,
    Star,
    Tag,
    Percent,
    Home,
    User,
    Link2,
    Loader2
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { MarketHeader } from '@/components/market/MarketHeader';
import { IntegrationCard } from '@/components/integrations/IntegrationCard';

// Tab definitions
const TABS = [
    { id: 'satis-panelim', label: 'Satis Panelim', icon: BarChart3 },
    { id: 'ilanlarim', label: 'Ilanlarim', icon: Tag },
    { id: 'siparislerim', label: 'Siparislerim', icon: ShoppingBag },
    { id: 'begendiklerim', label: 'Begendiklerim', icon: Heart },
    { id: 'cuzdanim', label: 'Cuzdanim', icon: Wallet },
    { id: 'hesap-hareketlerim', label: 'Hesap Hareketlerim', icon: FileText },
    { id: 'ayarlarim', label: 'Ayarlarim & Bilgilerim', icon: Settings },
];

// Sub-navigation for each tab
const TAB_SUBNAV: Record<string, { id: string; label: string; count?: number }[]> = {
    'satis-panelim': [
        { id: 'kampanya-paneli', label: 'Kampanya Paneli' },
        { id: 'satis-performansim', label: 'Satis Performansim' },
        { id: 'puanim', label: 'Puanim' },
        { id: 'yorumlarim', label: 'Yorumlarim', count: 8 },
    ],
    'ilanlarim': [
        { id: 'aktif-ilanlar', label: 'Aktif Ilanlar' },
        { id: 'bekleyen-ilanlar', label: 'Bekleyen Ilanlar' },
        { id: 'pasif-ilanlar', label: 'Pasif Ilanlar' },
        { id: 'reddedilen-ilanlar', label: 'Reddedilen Ilanlar' },
    ],
    'siparislerim': [
        { id: 'satin-aldiklarim', label: 'Satin Aldiklarim' },
        { id: 'sattiklarim', label: 'Sattiklarim' },
        { id: 'iptal-iade', label: 'Iptal & Iade' },
    ],
    'begendiklerim': [
        { id: 'favoriler', label: 'Favori Urunler' },
        { id: 'takip-ettiklerim', label: 'Takip Ettiklerim' },
    ],
    'cuzdanim': [
        { id: 'bakiye', label: 'Bakiyem' },
        { id: 'hakedisler', label: 'Hakedislerim' },
        { id: 'odemeler', label: 'Odemelerim' },
    ],
    'hesap-hareketlerim': [
        { id: 'tum-hareketler', label: 'Tum Hareketler' },
        { id: 'bildirimler', label: 'Bildirimler' },
    ],
    'ayarlarim': [
        { id: 'profil', label: 'Profil Bilgilerim' },
        { id: 'adresler', label: 'Adreslerim' },
        { id: 'erp-entegrasyonlari', label: 'ERP Entegrasyonlari' },
        { id: 'guvenlik', label: 'Guvenlik' },
        { id: 'bildirim-tercihleri', label: 'Bildirim Tercihleri' },
    ],
};

// Promo Banner Component
function PromoBanner({ salesTarget = 70000, currentSales = 4499 }: { salesTarget?: number; currentSales?: number }) {
    const percentage = Math.min((currentSales / salesTarget) * 100, 100);
    const formatPrice = (price: number) => new Intl.NumberFormat('tr-TR').format(price);

    return (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 p-6 mb-6">
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                    backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)`,
                    backgroundSize: '20px 20px'
                }} />
            </div>
            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h3 className="text-xl font-bold text-white mb-1">
                        %0,5 + KDV Komisyon Indirimi Kazan!
                    </h3>
                    <p className="text-emerald-100 text-sm mb-2">
                        {formatPrice(salesTarget)} TL'lik urun sat, gelecek ay komisyon indirimi kazan!
                    </p>
                    <Link href="#" className="text-amber-300 text-sm font-medium hover:text-amber-200 transition-colors">
                        Detayli Bilgi Al →
                    </Link>
                </div>
                <div className="w-full md:w-80">
                    <div className="flex items-center justify-between text-white text-sm mb-2">
                        <span className="font-bold">{formatPrice(currentSales)} TL</span>
                    </div>
                    <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                        />
                    </div>
                    <div className="flex items-center justify-between text-white/70 text-xs mt-1">
                        <span>0 TL</span>
                        <span>{formatPrice(salesTarget)} TL</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Sales Panel Content
function SalesPanelContent({ subNav }: { subNav: string }) {
    return (
        <div className="space-y-6">
            {subNav === 'kampanya-paneli' && (
                <>
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-amber-800">
                            Puaniniz 7'nin altinda oldugu icin yeni kampanya olusturmaniz ve kampanyaya katilmaniz mumkun degildir.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Yeni Kampanya Olustur</h3>
                        <div className="flex flex-wrap gap-3">
                            <Button variant="outline" className="h-auto py-3 px-4 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50">
                                <Percent className="w-4 h-4 mr-2 text-emerald-600" />
                                <span><strong className="text-emerald-600">Urune</strong> % indirim yap</span>
                            </Button>
                            <Button variant="outline" className="h-auto py-3 px-4 border-slate-200 hover:border-blue-300 hover:bg-blue-50">
                                <Store className="w-4 h-4 mr-2 text-blue-600" />
                                <span><strong className="text-blue-600">Magazaya</strong> % indirim yap</span>
                            </Button>
                            <Button variant="outline" className="h-auto py-3 px-4 border-slate-200 hover:border-purple-300 hover:bg-purple-50">
                                <Tag className="w-4 h-4 mr-2 text-purple-600" />
                                <span><strong className="text-purple-600">Markaya</strong> % indirim yap</span>
                            </Button>
                            <Button variant="outline" className="h-auto py-3 px-4 border-slate-200 hover:border-orange-300 hover:bg-orange-50">
                                <Package className="w-4 h-4 mr-2 text-orange-600" />
                                <span><strong className="text-orange-600">Hediye urun</strong> kampanyasi yap</span>
                            </Button>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Aktif Kampanyalarim</h3>
                        <div className="text-center py-12 bg-slate-50 rounded-xl">
                            <div className="w-24 h-24 mx-auto mb-4">
                                <img src="/images/empty-campaign.svg" alt="" className="w-full h-full object-contain opacity-50" onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                }} />
                                <Tag className="w-16 h-16 mx-auto text-slate-300" />
                            </div>
                            <p className="text-slate-500">Aktif kampanyaniz bulunmamaktadir</p>
                        </div>
                    </div>
                </>
            )}

            {subNav === 'satis-performansim' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl border border-slate-200 p-5">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm text-slate-500">Bu Ay Satis</span>
                            <TrendingUp className="w-5 h-5 text-emerald-500" />
                        </div>
                        <p className="text-2xl font-bold text-slate-900">₺4,499.00</p>
                        <p className="text-sm text-emerald-600 mt-1">+12% gecen aya gore</p>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 p-5">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm text-slate-500">Toplam Siparis</span>
                            <ShoppingBag className="w-5 h-5 text-blue-500" />
                        </div>
                        <p className="text-2xl font-bold text-slate-900">24</p>
                        <p className="text-sm text-slate-500 mt-1">Bu ay</p>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 p-5">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm text-slate-500">Ortalama Siparis</span>
                            <BarChart3 className="w-5 h-5 text-purple-500" />
                        </div>
                        <p className="text-2xl font-bold text-slate-900">₺187.46</p>
                        <p className="text-sm text-slate-500 mt-1">Siparis basina</p>
                    </div>
                </div>
            )}

            {subNav === 'puanim' && (
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                            <Star className="w-10 h-10 text-white" />
                        </div>
                        <div>
                            <p className="text-4xl font-bold text-slate-900">6.8</p>
                            <p className="text-slate-500">Satici Puani</p>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600">Teslimat Hizi</span>
                            <div className="flex items-center gap-2">
                                <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                                    <div className="w-4/5 h-full bg-emerald-500 rounded-full" />
                                </div>
                                <span className="text-sm font-medium">8.0</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600">Urun Kalitesi</span>
                            <div className="flex items-center gap-2">
                                <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                                    <div className="w-3/4 h-full bg-blue-500 rounded-full" />
                                </div>
                                <span className="text-sm font-medium">7.5</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600">Iletisim</span>
                            <div className="flex items-center gap-2">
                                <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                                    <div className="w-1/2 h-full bg-amber-500 rounded-full" />
                                </div>
                                <span className="text-sm font-medium">5.0</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {subNav === 'yorumlarim' && (
                <div className="text-center py-12 bg-slate-50 rounded-xl">
                    <FileText className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500">Henuz yorum bulunmuyor</p>
                </div>
            )}
        </div>
    );
}

// Listings Content
function ListingsContent({ subNav }: { subNav: string }) {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-none">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <Input placeholder="Ilan ara..." className="pl-9 w-full sm:w-64" />
                    </div>
                    <Button variant="outline" size="icon" className="shrink-0">
                        <Filter className="w-4 h-4" />
                    </Button>
                </div>
                <Link href="/seller/products/new" className="w-full sm:w-auto">
                    <Button className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto">
                        <Plus className="w-4 h-4 mr-2" />
                        Yeni Ilan Ekle
                    </Button>
                </Link>
            </div>

            <div className="text-center py-12 bg-slate-50 rounded-xl">
                <Package className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                <p className="text-slate-500 mb-4">
                    {subNav === 'aktif-ilanlar' && 'Aktif ilaniniz bulunmuyor'}
                    {subNav === 'bekleyen-ilanlar' && 'Bekleyen ilaniniz bulunmuyor'}
                    {subNav === 'pasif-ilanlar' && 'Pasif ilaniniz bulunmuyor'}
                    {subNav === 'reddedilen-ilanlar' && 'Reddedilen ilaniniz bulunmuyor'}
                </p>
                <Link href="/seller/products/new">
                    <Button variant="outline">Ilk Ilaninizi Olusturun</Button>
                </Link>
            </div>
        </div>
    );
}

// Status icon component
function StatusIcon({ status }: { status: string }) {
    const icons: Record<string, { icon: React.ReactNode; color: string }> = {
        pending: { icon: <Clock className="w-4 h-4" />, color: 'text-amber-500' },
        confirmed: { icon: <CheckCircle2 className="w-4 h-4" />, color: 'text-blue-500' },
        processing: { icon: <Package className="w-4 h-4" />, color: 'text-purple-500' },
        shipped: { icon: <Truck className="w-4 h-4" />, color: 'text-orange-500' },
        delivered: { icon: <CheckCircle2 className="w-4 h-4" />, color: 'text-green-500' },
        cancelled: { icon: <XCircle className="w-4 h-4" />, color: 'text-red-500' },
    };
    const config = icons[status] || icons.pending;
    return <span className={config.color}>{config.icon}</span>;
}

// Copy button component
function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <button onClick={handleCopy} className="text-slate-400 hover:text-slate-600 transition-colors">
            {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> : <Link2 className="w-3.5 h-3.5" />}
        </button>
    );
}

// Orders Content - Referans tasarima uygun
function OrdersContent({
    subNav,
    buyerOrders,
    sellerOrders,
    loadingOrders,
    onViewOrderDetail,
    statusFilter,
    onStatusFilterChange
}: {
    subNav: string;
    buyerOrders: Order[];
    sellerOrders: SellerOrder[];
    loadingOrders: boolean;
    onViewOrderDetail: (orderId: number, isSeller: boolean) => void;
    statusFilter: string;
    onStatusFilterChange: (filter: string) => void;
}) {
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

    const formatPrice = (price: number) => new Intl.NumberFormat('tr-TR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(price);

    const formatDate = (date: string) => {
        const d = new Date(date);
        return `${d.toLocaleDateString('tr-TR')} — ${d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`;
    };

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            pending: 'Beklemede',
            confirmed: 'Onaylandi',
            processing: 'Hazirlaniyor',
            shipped: 'Kargoda',
            delivered: 'Tamamlandi',
            cancelled: 'Iptal Edildi',
        };
        return labels[status] || status;
    };

    // Filter orders by status
    const filterOrders = (orders: any[]) => {
        if (statusFilter === 'all') return orders;
        if (statusFilter === 'active') return orders.filter(o => ['pending', 'confirmed', 'processing'].includes(o.status));
        return orders.filter(o => o.status === statusFilter);
    };

    // Show loading state
    if (loadingOrders) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    const isSeller = subNav === 'sattiklarim';
    const isIptalIade = subNav === 'iptal-iade';

    // Get base orders based on section
    let orders: any[] = [];
    if (isIptalIade) {
        // For İptal & İade section, show cancelled orders from both buyer and seller
        const cancelledBuyerOrders = buyerOrders.filter(o => o.status === 'cancelled');
        const cancelledSellerOrders = sellerOrders.filter(o => o.status === 'cancelled');
        orders = [...cancelledBuyerOrders, ...cancelledSellerOrders];
    } else {
        orders = isSeller ? sellerOrders : buyerOrders;
    }

    // Apply additional status filter (only for non-iptal-iade sections)
    const filteredOrders = isIptalIade ? orders : filterOrders(orders);

    // Empty state
    if (orders.length === 0) {
        return (
            <div className="text-center py-12 bg-slate-50 rounded-xl">
                {isSeller ? (
                    <>
                        <Store className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                        <p className="text-slate-500 mb-4">Henuz satis yapmadiniz</p>
                        <Link href="/seller/products/new">
                            <Button variant="outline">Urun Ekle</Button>
                        </Link>
                    </>
                ) : subNav === 'iptal-iade' ? (
                    <>
                        <XCircle className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                        <p className="text-slate-500 mb-4">Iptal veya iade talebi bulunmuyor</p>
                    </>
                ) : (
                    <>
                        <ShoppingBag className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                        <p className="text-slate-500 mb-4">Henuz siparisiniz bulunmuyor</p>
                        <Link href="/market">
                            <Button variant="outline">Alisverise Basla</Button>
                        </Link>
                    </>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-4">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <h2 className="text-lg font-bold text-slate-900">
                        {isIptalIade ? 'Iptal & Iade Taleplerim' : isSeller ? 'Tum Sattiklarim' : 'Tum Aldiklarim'}
                    </h2>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="h-9">
                            <Filter className="w-4 h-4 mr-2" />
                            Sirala
                        </Button>
                        <div className="flex border border-slate-200 rounded-lg overflow-hidden">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={cn(
                                    "p-2 transition-colors",
                                    viewMode === 'grid' ? "bg-slate-100" : "hover:bg-slate-50"
                                )}
                            >
                                <BarChart3 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={cn(
                                    "p-2 transition-colors",
                                    viewMode === 'list' ? "bg-slate-100" : "hover:bg-slate-50"
                                )}
                            >
                                <FileText className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <Input
                                placeholder="Urun, kullanici, siparis ara"
                                className="pl-9 w-full sm:w-64 h-9"
                            />
                        </div>
                    </div>
                </div>

                {/* Orders List */}
                <div className="space-y-3">
                    {filteredOrders.map((order: any) => (
                        <div
                            key={order.id}
                            className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow"
                        >
                            <div className="flex flex-col md:flex-row gap-4">
                                {/* Sol - Urun Gorseli */}
                                <div className="flex items-start gap-4 md:w-1/3">
                                    <div className="text-xs text-slate-500 whitespace-nowrap pt-1">
                                        {order.items?.length || 1} farkli urun
                                    </div>
                                    <div className="w-20 h-20 bg-slate-100 rounded-lg flex items-center justify-center shrink-0 border border-slate-200">
                                        <Package className="w-10 h-10 text-slate-300" />
                                    </div>
                                </div>

                                {/* Sag - Siparis Detaylari */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                        {/* Siparis Bilgileri */}
                                        <div className="space-y-1.5">
                                            {/* Durum */}
                                            <div className="flex items-center gap-2">
                                                <span className={cn(
                                                    "font-semibold",
                                                    order.status === 'shipped' && "text-orange-600",
                                                    order.status === 'delivered' && "text-green-600",
                                                    order.status === 'cancelled' && "text-red-600",
                                                    order.status === 'pending' && "text-amber-600",
                                                    order.status === 'processing' && "text-purple-600"
                                                )}>
                                                    {getStatusLabel(order.status)}
                                                </span>
                                                <StatusIcon status={order.status} />
                                            </div>

                                            {/* Teslimat */}
                                            {order.shipping_provider && (
                                                <p className="text-sm text-slate-600">
                                                    Teslimat: <span className="font-medium uppercase">{order.shipping_provider}</span>
                                                    {order.tracking_number && (
                                                        <Link href="#" className="text-purple-600 hover:underline ml-2">
                                                            Kargo Detay
                                                        </Link>
                                                    )}
                                                </p>
                                            )}

                                            {/* Siparis No */}
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="text-slate-500">Siparis:</span>
                                                <span className="font-medium text-slate-700">{order.order_number}</span>
                                                <CopyButton text={order.order_number} />
                                            </div>

                                            {/* Alici/Satici */}
                                            <p className="text-sm text-slate-500">
                                                {/* For İptal & İade section, detect if it's a seller or buyer order by checking for seller_total */}
                                                {isIptalIade ? (
                                                    order.seller_total !== undefined ? (
                                                        <>
                                                            <Badge variant="outline" className="mr-2 text-xs bg-purple-50 text-purple-700 border-purple-200">Satici</Badge>
                                                            Alici: <span className="text-slate-700">{order.buyer?.pharmacy_name || '-'}</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Badge variant="outline" className="mr-2 text-xs bg-blue-50 text-blue-700 border-blue-200">Alici</Badge>
                                                            Satici: <span className="text-slate-700">{order.seller?.pharmacy_name || '-'}</span>
                                                        </>
                                                    )
                                                ) : (
                                                    <>
                                                        {isSeller ? 'Alici: ' : 'Satici: '}
                                                        <span className="text-slate-700">
                                                            {isSeller ? order.buyer?.pharmacy_name : order.seller?.pharmacy_name || '-'}
                                                        </span>
                                                    </>
                                                )}
                                            </p>

                                            {/* Tarih */}
                                            <p className="text-sm text-slate-500">
                                                Tarih: {formatDate(order.created_at)}
                                            </p>
                                        </div>

                                        {/* Fiyat ve Butonlar */}
                                        <div className="flex flex-col items-end gap-3">
                                            <p className="text-xl font-bold text-slate-900">
                                                {formatPrice(
                                                    isIptalIade
                                                        ? (order.seller_total !== undefined ? order.seller_total : order.total_amount)
                                                        : (isSeller ? order.seller_total : order.total_amount)
                                                )}
                                                <span className="text-sm font-normal ml-1">TL</span>
                                            </p>
                                            <div className="flex flex-wrap gap-2 justify-end">
                                                {order.tracking_number && (
                                                    <Button variant="outline" size="sm" className="text-purple-600 border-purple-200 hover:bg-purple-50">
                                                        Kargom Nerede?
                                                    </Button>
                                                )}
                                                <Button
                                                    size="sm"
                                                    className="bg-orange-500 hover:bg-orange-600 text-white"
                                                    onClick={() => onViewOrderDetail(
                                                        order.id,
                                                        isIptalIade ? order.seller_total !== undefined : isSeller
                                                    )}
                                                >
                                                    Siparise Git
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredOrders.length === 0 && (
                    <div className="text-center py-12 bg-slate-50 rounded-xl">
                        <Package className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                        <p className="text-slate-500">Bu filtreye uygun siparis bulunamadi</p>
                        <Button variant="link" onClick={() => onStatusFilterChange('all')} className="text-purple-600">
                            Tum siparisleri goster
                        </Button>
                    </div>
                )}
        </div>
    );
}

// Order Detail View - Referans tasarima uygun
function OrderDetailView({
    orderId,
    isSeller,
    onBack
}: {
    orderId: number;
    isSeller: boolean;
    onBack: () => void;
}) {
    const [order, setOrder] = useState<Order | null>(null);
    const [sellerOrderDetail, setSellerOrderDetail] = useState<SellerOrderDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadOrderDetail();
    }, [orderId, isSeller]);

    const loadOrderDetail = async () => {
        setIsLoading(true);
        try {
            if (isSeller) {
                const response = await sellerApi.getOrderDetail(orderId);
                if (response.data?.data) {
                    setSellerOrderDetail(response.data.data);
                }
            } else {
                const response = await ordersApi.get(orderId);
                if (response.data?.order) {
                    setOrder(response.data.order);
                }
            }
        } catch (error) {
            console.error('Failed to load order:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatPrice = (price: number) => new Intl.NumberFormat('tr-TR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(price);

    const formatDate = (date: string) => {
        const d = new Date(date);
        return `${d.toLocaleDateString('tr-TR')} — ${d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`;
    };

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            pending: 'Beklemede',
            confirmed: 'Onaylandi',
            processing: 'Hazirlaniyor',
            shipped: 'Kargoda',
            delivered: 'Tamamlandi',
            cancelled: 'Iptal Edildi',
        };
        return labels[status] || status;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    // Seller order detail view
    if (isSeller && sellerOrderDetail) {
        const autoCompleteDate = new Date(sellerOrderDetail.created_at);
        autoCompleteDate.setDate(autoCompleteDate.getDate() + 14);

        return (
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Sol Sidebar - Siparis Ozeti */}
                <div className="lg:w-64 shrink-0">
                    <div className="lg:sticky lg:top-4 space-y-4">
                        {/* Geri Butonu */}
                        <button
                            onClick={onBack}
                            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
                        >
                            <ChevronRight className="w-4 h-4 rotate-180" />
                            <span className="text-sm font-medium">Geri</span>
                        </button>

                        {/* Alici Adi */}
                        <div>
                            <p className="font-bold text-lg text-slate-900">{sellerOrderDetail.buyer.name}</p>
                        </div>

                        {/* Durum */}
                        <div className="flex items-center gap-2">
                            <Truck className="w-5 h-5 text-orange-500" />
                            <span className={cn(
                                "font-semibold",
                                sellerOrderDetail.status === 'shipped' && "text-orange-600",
                                sellerOrderDetail.status === 'delivered' && "text-green-600",
                                sellerOrderDetail.status === 'cancelled' && "text-red-600"
                            )}>
                                {getStatusLabel(sellerOrderDetail.status)}
                            </span>
                        </div>

                        {/* Referans Numarasi */}
                        <div>
                            <p className="text-xs text-slate-500">Referans Numarasi</p>
                            <div className="flex items-center gap-2">
                                <span className="font-mono font-medium text-slate-900">{sellerOrderDetail.order_number}</span>
                                <CopyButton text={sellerOrderDetail.order_number} />
                            </div>
                        </div>

                        {/* Siparis Tarihi */}
                        <div>
                            <p className="text-xs text-slate-500">Siparis Tarihi</p>
                            <p className="font-medium text-slate-900">{formatDate(sellerOrderDetail.created_at)}</p>
                        </div>

                        {/* Otomatik Tamamlanma Notu */}
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                            <p className="text-sm text-purple-800">
                                Siparis {autoCompleteDate.toLocaleDateString('tr-TR')} tarihinde otomatik olarak tamamlanacaktir.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Sag Ana Icerik */}
                <div className="flex-1 min-w-0 space-y-6">
                    {/* Urunler */}
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 mb-4">Urunler</h2>
                        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                            {/* Urun Listesi */}
                            <div className="divide-y divide-slate-100">
                                {sellerOrderDetail.items?.map((item) => (
                                    <div key={item.id} className="flex items-center gap-4 p-4">
                                        {/* Miktar */}
                                        <div className="flex items-center gap-2 text-slate-600 shrink-0">
                                            <span className="text-lg font-semibold">{item.quantity}</span>
                                            <span className="text-slate-400">x</span>
                                        </div>

                                        {/* Urun Gorseli */}
                                        <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center shrink-0 border border-slate-200">
                                            <Package className="w-8 h-8 text-slate-300" />
                                        </div>

                                        {/* Urun Bilgileri */}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-slate-900 line-clamp-2">{item.product_name}</p>
                                            <p className="text-sm text-slate-500">Miat: Miatsiz Urun</p>
                                            <p className="text-sm text-slate-500">Fiyat: {formatPrice(item.unit_price)} TL</p>
                                        </div>

                                        {/* Toplam */}
                                        <div className="text-right shrink-0">
                                            <p className="font-bold text-slate-900">{formatPrice(item.total_price)}<span className="text-sm font-normal ml-1">TL</span></p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Toplam */}
                            <div className="border-t border-slate-200 p-4 bg-slate-50">
                                <div className="flex items-center justify-between mb-2">
                                    <button className="text-purple-600 text-sm font-medium hover:underline">
                                        Urun Listesini Yazdir
                                    </button>
                                    <div className="text-right">
                                        <p className="text-sm text-slate-500">Urunler</p>
                                        <p className="font-medium">{formatPrice(sellerOrderDetail.financials.subtotal.value)} TL</p>
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <div className="text-right">
                                        <p className="text-sm text-slate-500">Siparis Toplami</p>
                                        <p className="text-xl font-bold text-slate-900">{formatPrice(sellerOrderDetail.financials.subtotal.value)} TL</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Fatura ve Kargo Bilgileri */}
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Fatura Bilgileri */}
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 mb-4">Fatura Bilgileri</h2>
                            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-slate-500">Eczaci Adi</p>
                                        <p className="font-medium text-slate-900">{sellerOrderDetail.buyer.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">Eczane Adresi</p>
                                        <p className="text-sm text-slate-700">{sellerOrderDetail.buyer.address || '-'}</p>
                                        <p className="text-sm text-slate-700">{sellerOrderDetail.buyer.district}, {sellerOrderDetail.buyer.city}</p>
                                    </div>
                                </div>

                                {sellerOrderDetail.buyer.phone && (
                                    <div>
                                        <p className="text-xs text-slate-500">Telefon</p>
                                        <p className="font-medium text-slate-900">{sellerOrderDetail.buyer.phone}</p>
                                    </div>
                                )}

                                {/* E-fatura uyarisi */}
                                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                                    <p className="text-sm text-orange-700">
                                        Lutfen e-fatura ciktinizi kargo paketi icine koymay unutmayin.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Kargo Bilgileri */}
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 mb-4">Kargo Bilgileri</h2>
                            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
                                {/* Kargo Sirketi */}
                                {sellerOrderDetail.shipping_provider && (
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Truck className="w-8 h-8 text-slate-400" />
                                            <span className="font-medium uppercase text-slate-700">{sellerOrderDetail.shipping_provider}</span>
                                        </div>
                                    </div>
                                )}

                                {/* Kargo Takip Kodu */}
                                {sellerOrderDetail.tracking_number && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-slate-500">Kargo Takip Kodu</p>
                                            <p className="font-mono font-medium text-slate-900">{sellerOrderDetail.tracking_number}</p>
                                        </div>
                                        {sellerOrderDetail.shipped_at && (
                                            <div>
                                                <p className="text-xs text-slate-500">Kargoya Verildi</p>
                                                <p className="font-medium text-slate-900">
                                                    {new Date(sellerOrderDetail.shipped_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Kargo Takip Butonu */}
                                <Button variant="outline" className="w-full bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100">
                                    <Truck className="w-4 h-4 mr-2" />
                                    Kargo Takip Bilgisi
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Hakedis Ozeti */}
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                        <h3 className="font-bold text-emerald-800 mb-4 flex items-center gap-2">
                            <Wallet className="w-5 h-5" />
                            Hakedis Ozeti
                        </h3>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-slate-600">{sellerOrderDetail.financials.subtotal.label}</span>
                                <span className="font-medium">{sellerOrderDetail.financials.subtotal.formatted}</span>
                            </div>
                            {sellerOrderDetail.financials.deductions
                                .filter(d => d.visible !== false && d.value > 0)
                                .map((d, i) => (
                                    <div key={i} className="flex justify-between text-sm">
                                        <span className="text-slate-500">{d.label} {d.rate && `(%${d.rate})`}</span>
                                        <span className="text-red-600">-{d.formatted}</span>
                                    </div>
                                ))
                            }
                            <div className="border-t border-emerald-200 pt-2 mt-2">
                                <div className="flex justify-between text-lg font-bold">
                                    <span className="text-emerald-700">{sellerOrderDetail.financials.net_amount.label}</span>
                                    <span className="text-emerald-600">{sellerOrderDetail.financials.net_amount.formatted}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Buyer order detail view
    if (!isSeller && order) {
        return (
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Sol Sidebar - Siparis Ozeti */}
                <div className="lg:w-64 shrink-0">
                    <div className="lg:sticky lg:top-4 space-y-4">
                        {/* Geri Butonu */}
                        <button
                            onClick={onBack}
                            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
                        >
                            <ChevronRight className="w-4 h-4 rotate-180" />
                            <span className="text-sm font-medium">Geri</span>
                        </button>

                        {/* Satici Adi */}
                        {order.seller && (
                            <div>
                                <p className="font-bold text-lg text-slate-900">{order.seller.pharmacy_name}</p>
                            </div>
                        )}

                        {/* Durum */}
                        <div className="flex items-center gap-2">
                            <StatusIcon status={order.status} />
                            <span className={cn(
                                "font-semibold",
                                order.status === 'shipped' && "text-orange-600",
                                order.status === 'delivered' && "text-green-600",
                                order.status === 'cancelled' && "text-red-600",
                                order.status === 'pending' && "text-amber-600"
                            )}>
                                {getStatusLabel(order.status)}
                            </span>
                        </div>

                        {/* Referans Numarasi */}
                        <div>
                            <p className="text-xs text-slate-500">Referans Numarasi</p>
                            <div className="flex items-center gap-2">
                                <span className="font-mono font-medium text-slate-900">{order.order_number}</span>
                                <CopyButton text={order.order_number} />
                            </div>
                        </div>

                        {/* Siparis Tarihi */}
                        <div>
                            <p className="text-xs text-slate-500">Siparis Tarihi</p>
                            <p className="font-medium text-slate-900">{formatDate(order.created_at)}</p>
                        </div>

                        {/* Teslimat Adresi */}
                        {typeof order.shipping_address === 'object' && (
                            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                                <p className="text-xs text-slate-500 mb-1">Teslimat Adresi</p>
                                <p className="text-sm font-medium text-slate-900">{order.shipping_address.name}</p>
                                <p className="text-sm text-slate-600">{order.shipping_address.address}</p>
                                <p className="text-sm text-slate-600">{order.shipping_address.district}, {order.shipping_address.city}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sag Ana Icerik */}
                <div className="flex-1 min-w-0 space-y-6">
                    {/* Urunler */}
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 mb-4">Urunler</h2>
                        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                            {/* Urun Listesi */}
                            <div className="divide-y divide-slate-100">
                                {order.items?.map((item, index) => (
                                    <div key={index} className="flex items-center gap-4 p-4">
                                        {/* Miktar */}
                                        <div className="flex items-center gap-2 text-slate-600 shrink-0">
                                            <span className="text-lg font-semibold">{item.quantity}</span>
                                            <span className="text-slate-400">x</span>
                                        </div>

                                        {/* Urun Gorseli */}
                                        <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center shrink-0 border border-slate-200">
                                            <Package className="w-8 h-8 text-slate-300" />
                                        </div>

                                        {/* Urun Bilgileri */}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-slate-900">Urun #{item.product_id}</p>
                                            <p className="text-sm text-slate-500">Fiyat: {formatPrice(item.unit_price)} TL</p>
                                        </div>

                                        {/* Toplam */}
                                        <div className="text-right shrink-0">
                                            <p className="font-bold text-slate-900">{formatPrice(item.total_price)}<span className="text-sm font-normal ml-1">TL</span></p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Toplam */}
                            <div className="border-t border-slate-200 p-4 bg-slate-50">
                                <div className="flex justify-end">
                                    <div className="text-right space-y-1">
                                        <div className="flex justify-between gap-8">
                                            <span className="text-sm text-slate-500">Urunler</span>
                                            <span className="font-medium">{formatPrice(order.subtotal)} TL</span>
                                        </div>
                                        {order.shipping_cost && order.shipping_cost > 0 && (
                                            <div className="flex justify-between gap-8">
                                                <span className="text-sm text-slate-500">Kargo</span>
                                                <span className="font-medium">{formatPrice(order.shipping_cost)} TL</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between gap-8 pt-2 border-t border-slate-200">
                                            <span className="font-medium text-slate-700">Siparis Toplami</span>
                                            <span className="text-xl font-bold text-slate-900">{formatPrice(order.total_amount)} TL</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Kargo Bilgileri */}
                    {(order.tracking_number || order.shipping_provider) && (
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 mb-4">Kargo Bilgileri</h2>
                            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
                                {/* Kargo Sirketi */}
                                {order.shipping_provider && (
                                    <div className="flex items-center gap-3">
                                        <Truck className="w-8 h-8 text-slate-400" />
                                        <span className="font-medium uppercase text-slate-700">{order.shipping_provider}</span>
                                    </div>
                                )}

                                {/* Kargo Takip Kodu */}
                                {order.tracking_number && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-slate-500">Kargo Takip Kodu</p>
                                            <div className="flex items-center gap-2">
                                                <p className="font-mono font-medium text-slate-900">{order.tracking_number}</p>
                                                <CopyButton text={order.tracking_number} />
                                            </div>
                                        </div>
                                        {order.shipped_at && (
                                            <div>
                                                <p className="text-xs text-slate-500">Kargoya Verildi</p>
                                                <p className="font-medium text-slate-900">
                                                    {new Date(order.shipped_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Kargo Takip Butonu */}
                                <Button variant="outline" className="w-full bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100">
                                    <Truck className="w-4 h-4 mr-2" />
                                    Kargo Takip Bilgisi
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Not found
    return (
        <div className="text-center py-12 bg-slate-50 rounded-xl">
            <Package className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 mb-4">Siparis bulunamadi</p>
            <Button variant="outline" onClick={onBack}>Geri Don</Button>
        </div>
    );
}

// Favorites Content
function FavoritesContent({ subNav }: { subNav: string }) {
    return (
        <div className="text-center py-12 bg-slate-50 rounded-xl">
            <Heart className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 mb-4">
                {subNav === 'favoriler' && 'Favori urun listeniz bos'}
                {subNav === 'takip-ettiklerim' && 'Takip ettiginiz satici bulunmuyor'}
            </p>
            <Link href="/market">
                <Button variant="outline">Urunleri Kesfet</Button>
            </Link>
        </div>
    );
}

// Wallet Content
function WalletContent({ subNav }: { subNav: string }) {
    return (
        <div className="space-y-6">
            {subNav === 'bakiye' && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white">
                            <p className="text-emerald-100 text-sm mb-2">Kullanilabilir Bakiye</p>
                            <p className="text-3xl font-bold">₺0,00</p>
                        </div>
                        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white">
                            <p className="text-blue-100 text-sm mb-2">Bekleyen Hakedis</p>
                            <p className="text-3xl font-bold">₺0,00</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button className="bg-emerald-600 hover:bg-emerald-700">
                            <CreditCard className="w-4 h-4 mr-2" />
                            Para Cek
                        </Button>
                        <Button variant="outline">
                            Hesap Ekle
                        </Button>
                    </div>
                </>
            )}

            {(subNav === 'hakedisler' || subNav === 'odemeler') && (
                <div className="text-center py-12 bg-slate-50 rounded-xl">
                    <Wallet className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500">
                        {subNav === 'hakedisler' && 'Henuz hakedis bulunmuyor'}
                        {subNav === 'odemeler' && 'Henuz odeme bulunmuyor'}
                    </p>
                </div>
            )}
        </div>
    );
}

// Activity Content
function ActivityContent({ subNav }: { subNav: string }) {
    return (
        <div className="text-center py-12 bg-slate-50 rounded-xl">
            <FileText className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500">
                {subNav === 'tum-hareketler' && 'Henuz hesap hareketi bulunmuyor'}
                {subNav === 'bildirimler' && 'Bildirim bulunmuyor'}
            </p>
        </div>
    );
}

// ERP Integration Data - Test edilmis entegrasyonlar
const AVAILABLE_INTEGRATIONS = [
    {
        id: 'bizimhesap',
        name: 'BizimHesap',
        description: 'BizimHesap muhasebe ve fatura entegrasyonu',
        logo: '/erp-logos/bizimhesap.png',
    },
    {
        id: 'parasut',
        name: 'Parasut',
        description: 'Parasut bulut muhasebe entegrasyonu',
        logo: '/erp-logos/parasut.png',
    },
    {
        id: 'entegra',
        name: 'Entegra',
        description: 'Entegra ERP entegrasyonu',
        logo: '/erp-logos/entegra.png',
    },
    {
        id: 'sentos',
        name: 'Sentos',
        description: 'Sentos ERP entegrasyonu (Basic Auth)',
        logo: '/erp-logos/sentos.png',
    },
    {
        id: 'stockmount',
        name: 'StockMount',
        description: 'StockMount siparis ve urun yonetimi',
        logo: '/erp-logos/stockmount.png',
    },
    {
        id: 'dopigo',
        name: 'Dopigo',
        description: 'Dopigo siparis ve urun yonetimi',
        logo: '/erp-logos/dopigo.png',
    },
    {
        id: 'kolaysoft',
        name: 'KolaySoft',
        description: 'KolaySoft E-Fatura ve E-Arsiv entegrasyonu',
        logo: '/erp-logos/kolaysoft.png',
    },
];

// Settings Content
function SettingsContent({ subNav, user }: { subNav: string; user: any }) {
    const [integrations, setIntegrations] = useState<UserIntegration[]>([]);
    const [loadingIntegrations, setLoadingIntegrations] = useState(false);

    useEffect(() => {
        if (subNav === 'erp-entegrasyonlari') {
            fetchIntegrations();
        }
    }, [subNav]);

    const fetchIntegrations = async () => {
        setLoadingIntegrations(true);
        try {
            const response = await integrationsApi.getAll();
            const payload = response.data as any;
            if (payload?.data) {
                setIntegrations(payload.data);
            }
        } catch (error) {
            console.error('Entegrasyonlar yuklenirken hata:', error);
        } finally {
            setLoadingIntegrations(false);
        }
    };

    return (
        <div className="space-y-6">
            {subNav === 'profil' && (
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-6">Profil Bilgilerim</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Eczane Adi</label>
                            <Input value={user?.pharmacy_name || ''} readOnly className="bg-slate-50" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">GLN Kodu</label>
                            <Input value={user?.gln_code || ''} readOnly className="bg-slate-50 font-mono" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">E-posta</label>
                            <Input value={user?.email || ''} readOnly className="bg-slate-50" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Telefon</label>
                            <Input defaultValue={user?.phone || ''} placeholder="Telefon girilmemis" className="bg-slate-50" />
                        </div>
                    </div>
                    <div className="mt-6 pt-6 border-t border-slate-200">
                        <Button>Bilgileri Guncelle</Button>
                    </div>
                </div>
            )}

            {subNav === 'adresler' && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-slate-900">Adreslerim</h3>
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Yeni Adres Ekle
                        </Button>
                    </div>
                    <div className="text-center py-12 bg-slate-50 rounded-xl">
                        <MapPin className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                        <p className="text-slate-500">Kayitli adres bulunmuyor</p>
                    </div>
                </div>
            )}

            {subNav === 'erp-entegrasyonlari' && (
                <div className="space-y-6">
                    {/* Info Banner */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-blue-800">
                            Bu sayfadan ERP sistemlerinizin API bilgilerini girebilir ve yonetebilirsiniz.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">ERP Entegrasyonlari</h3>
                        <p className="text-sm text-slate-500">
                            ERP ve muhasebe sistemleri ile entegre olun, urunlerinizi otomatik senkronize edin.
                        </p>
                    </div>

                    {loadingIntegrations ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {AVAILABLE_INTEGRATIONS.map((erp) => {
                                const integration = integrations.find((i) => i.erp_type === erp.id);
                                return (
                                    <IntegrationCard
                                        key={erp.id}
                                        id={erp.id}
                                        name={erp.name}
                                        description={erp.description}
                                        logo={erp.logo}
                                        integration={integration}
                                        onUpdate={fetchIntegrations}
                                    />
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {subNav === 'guvenlik' && (
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-6">Guvenlik Ayarlari</h3>
                    <div className="space-y-4">
                        <Button variant="outline" className="w-full justify-start">
                            Sifre Degistir
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                            Iki Faktorlu Dogrulama
                        </Button>
                        <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50">
                            Hesabi Kapat
                        </Button>
                    </div>
                </div>
            )}

            {subNav === 'bildirim-tercihleri' && (
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-6">Bildirim Tercihleri</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b border-slate-100">
                            <div>
                                <p className="font-medium text-slate-900">E-posta Bildirimleri</p>
                                <p className="text-sm text-slate-500">Siparis ve kampanya bildirimleri</p>
                            </div>
                            <input type="checkbox" className="toggle" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-slate-100">
                            <div>
                                <p className="font-medium text-slate-900">SMS Bildirimleri</p>
                                <p className="text-sm text-slate-500">Siparis durumu bildirimleri</p>
                            </div>
                            <input type="checkbox" className="toggle" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Loading Fallback for Suspense
function HesabimLoading() {
    return (
        <div className="min-h-screen bg-slate-50">
            <MarketHeader />
            <div className="p-8">
                <Skeleton className="h-12 w-64 mb-8" />
                <Skeleton className="h-64 w-full" />
            </div>
        </div>
    );
}

// Main Content Component
function HesabimContent() {
    const { user, isAuthenticated, isLoading, logout } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [activeTab, setActiveTab] = useState('satis-panelim');
    const [activeSubNav, setActiveSubNav] = useState('kampanya-paneli');
    const [buyerOrders, setBuyerOrders] = useState<Order[]>([]);
    const [sellerOrders, setSellerOrders] = useState<SellerOrder[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [viewingOrderId, setViewingOrderId] = useState<number | null>(null);
    const [viewingOrderIsSeller, setViewingOrderIsSeller] = useState(false);
    const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');

    // Get tab from URL or default
    useEffect(() => {
        const tab = searchParams.get('tab');
        const sub = searchParams.get('sub');
        if (tab && TABS.some(t => t.id === tab)) {
            setActiveTab(tab);
            const subNavItems = TAB_SUBNAV[tab];
            if (sub && subNavItems?.some(s => s.id === sub)) {
                setActiveSubNav(sub);
            } else if (subNavItems?.[0]) {
                setActiveSubNav(subNavItems[0].id);
            }
        }
    }, [searchParams]);

    // Load orders when on orders tab
    useEffect(() => {
        if (activeTab === 'siparislerim' && isAuthenticated) {
            loadOrders(activeSubNav);
        }
    }, [activeTab, activeSubNav, isAuthenticated]);

    const loadOrders = async (subNav: string) => {
        setLoadingOrders(true);
        try {
            if (subNav === 'satin-aldiklarim') {
                const res = await ordersApi.getAll({ per_page: 20 });
                if (res.data?.orders) {
                    setBuyerOrders(res.data.orders);
                }
            } else if (subNav === 'sattiklarim') {
                const res = await ordersApi.getSellerOrders({ per_page: 20 });
                if (res.data?.orders) {
                    setSellerOrders(res.data.orders);
                }
            }
        } catch (error) {
            console.error('Failed to load orders:', error);
        }
        setLoadingOrders(false);
    };

    const handleViewOrderDetail = (orderId: number, isSeller: boolean) => {
        setViewingOrderId(orderId);
        setViewingOrderIsSeller(isSeller);
    };

    const handleBackFromOrderDetail = () => {
        setViewingOrderId(null);
    };

    // Redirect if not authenticated
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isLoading, isAuthenticated, router]);

    const handleTabChange = (tabId: string) => {
        setActiveTab(tabId);
        setViewingOrderId(null); // Reset order detail view when changing tabs
        const subNavItems = TAB_SUBNAV[tabId];
        if (subNavItems?.[0]) {
            setActiveSubNav(subNavItems[0].id);
        }
        router.push(`/hesabim?tab=${tabId}&sub=${subNavItems?.[0]?.id || ''}`, { scroll: false });
    };

    const handleSubNavChange = (subId: string) => {
        setActiveSubNav(subId);
        setViewingOrderId(null); // Reset order detail view when changing sub-nav
        setOrderStatusFilter('all'); // Reset status filter when changing sub-nav
        router.push(`/hesabim?tab=${activeTab}&sub=${subId}`, { scroll: false });
    };

    // Get status counts for orders
    const getOrderStatusCounts = (orders: any[]) => {
        const counts = { shipped: 0, delivered: 0, cancelled: 0, pending: 0, all: 0 };
        counts.all = orders.length;
        orders.forEach(order => {
            if (order.status === 'shipped') counts.shipped++;
            else if (order.status === 'delivered') counts.delivered++;
            else if (order.status === 'cancelled') counts.cancelled++;
            else counts.pending++;
        });
        return counts;
    };

    // Current orders based on activeSubNav
    const currentOrders = activeSubNav === 'sattiklarim' ? sellerOrders : buyerOrders;
    const statusCounts = getOrderStatusCounts(currentOrders);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50">
                <MarketHeader />
                <div className="p-8">
                    <Skeleton className="h-12 w-64 mb-8" />
                    <Skeleton className="h-64 w-full" />
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    const currentSubNavItems = TAB_SUBNAV[activeTab] || [];
    const ActiveTabIcon = TABS.find(t => t.id === activeTab)?.icon || BarChart3;

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Market Header */}
            <MarketHeader />

            {/* Breadcrumb */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <div className="flex items-center gap-2 text-sm">
                        <Link href="/" className="text-slate-500 hover:text-slate-700">Anasayfa</Link>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                        <Link href="/hesabim" className="text-slate-500 hover:text-slate-700">Profilim</Link>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-900 font-medium">{TABS.find(t => t.id === activeTab)?.label}</span>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Promo Banner */}
                <PromoBanner />

                {/* Main Tabs */}
                <div className="bg-white rounded-t-2xl border border-b-0 border-slate-200">
                    <div className="flex overflow-x-auto scrollbar-hide no-scrollbar">
                        {TABS.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => handleTabChange(tab.id)}
                                    className={cn(
                                        "flex items-center gap-2 px-4 sm:px-6 py-4 text-xs sm:text-sm font-medium whitespace-nowrap border-b-2 transition-colors shrink-0",
                                        isActive
                                            ? "border-emerald-600 text-emerald-600"
                                            : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
                                    )}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span className="hidden sm:inline">{tab.label}</span>
                                    <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Content Area */}
                <div className="bg-white rounded-b-2xl border border-t-0 border-slate-200">
                    <div className="flex">
                        {/* Side Navigation */}
                        {currentSubNavItems.length > 0 && (
                            <div className="w-64 border-r border-slate-200 p-4 hidden md:block">
                                <nav className="space-y-1">
                                    {currentSubNavItems.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => handleSubNavChange(item.id)}
                                            className={cn(
                                                "w-full flex items-center justify-between px-4 py-2.5 text-sm rounded-lg transition-colors text-left",
                                                activeSubNav === item.id
                                                    ? "bg-emerald-50 text-emerald-700 font-medium border-l-4 border-emerald-600"
                                                    : "text-slate-600 hover:bg-slate-50"
                                            )}
                                        >
                                            <span>{item.label}</span>
                                            {item.count !== undefined && (
                                                <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
                                                    {item.count}
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </nav>

                                {/* Status Filters for Orders */}
                                {activeTab === 'siparislerim' && (activeSubNav === 'sattiklarim' || activeSubNav === 'satin-aldiklarim') && !viewingOrderId && (
                                    <div className="mt-6 pt-6 border-t border-slate-200">
                                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 px-2">
                                            Durum Filtresi
                                        </h4>
                                        <div className="space-y-1">
                                            <button
                                                onClick={() => setOrderStatusFilter('all')}
                                                className={cn(
                                                    "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
                                                    orderStatusFilter === 'all' ? "bg-purple-50 text-purple-700" : "hover:bg-slate-50"
                                                )}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Package className="w-4 h-4 text-purple-500" />
                                                    <span>Tum Siparisler</span>
                                                </div>
                                                <span className="font-semibold text-xs">{statusCounts.all}</span>
                                            </button>
                                            <button
                                                onClick={() => setOrderStatusFilter('shipped')}
                                                className={cn(
                                                    "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
                                                    orderStatusFilter === 'shipped' ? "bg-orange-50 text-orange-700" : "hover:bg-slate-50"
                                                )}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Truck className="w-4 h-4 text-orange-500" />
                                                    <span>Kargodakiler</span>
                                                </div>
                                                <span className="font-semibold text-xs">{statusCounts.shipped}</span>
                                            </button>
                                            <button
                                                onClick={() => setOrderStatusFilter('delivered')}
                                                className={cn(
                                                    "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
                                                    orderStatusFilter === 'delivered' ? "bg-green-50 text-green-700" : "hover:bg-slate-50"
                                                )}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                    <span>Tamamlananlar</span>
                                                </div>
                                                <span className="font-semibold text-xs">{statusCounts.delivered}</span>
                                            </button>
                                            <button
                                                onClick={() => setOrderStatusFilter('cancelled')}
                                                className={cn(
                                                    "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
                                                    orderStatusFilter === 'cancelled' ? "bg-red-50 text-red-700" : "hover:bg-slate-50"
                                                )}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <XCircle className="w-4 h-4 text-red-500" />
                                                    <span>Iptal Edilenler</span>
                                                </div>
                                                <span className="font-semibold text-xs">{statusCounts.cancelled}</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Main Content */}
                        <div className="flex-1 p-6">
                            {/* Mobile Sub Navigation */}
                            {currentSubNavItems.length > 0 && (
                                <div className="mb-6 md:hidden">
                                    <select
                                        value={activeSubNav}
                                        onChange={(e) => handleSubNavChange(e.target.value)}
                                        className="w-full p-3 border border-slate-200 rounded-lg"
                                    >
                                        {currentSubNavItems.map((item) => (
                                            <option key={item.id} value={item.id}>
                                                {item.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Tab Content */}
                            {activeTab === 'satis-panelim' && <SalesPanelContent subNav={activeSubNav} />}
                            {activeTab === 'ilanlarim' && <ListingsContent subNav={activeSubNav} />}
                            {activeTab === 'siparislerim' && (
                                viewingOrderId ? (
                                    <OrderDetailView
                                        orderId={viewingOrderId}
                                        isSeller={viewingOrderIsSeller}
                                        onBack={handleBackFromOrderDetail}
                                    />
                                ) : (
                                    <OrdersContent
                                        subNav={activeSubNav}
                                        buyerOrders={buyerOrders}
                                        sellerOrders={sellerOrders}
                                        loadingOrders={loadingOrders}
                                        onViewOrderDetail={handleViewOrderDetail}
                                        statusFilter={orderStatusFilter}
                                        onStatusFilterChange={setOrderStatusFilter}
                                    />
                                )
                            )}
                            {activeTab === 'begendiklerim' && <FavoritesContent subNav={activeSubNav} />}
                            {activeTab === 'cuzdanim' && <WalletContent subNav={activeSubNav} />}
                            {activeTab === 'hesap-hareketlerim' && <ActivityContent subNav={activeSubNav} />}
                            {activeTab === 'ayarlarim' && <SettingsContent subNav={activeSubNav} user={user} />}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Export with Suspense wrapper
export default function HesabimPage() {
    return (
        <Suspense fallback={<HesabimLoading />}>
            <HesabimContent />
        </Suspense>
    );
}
