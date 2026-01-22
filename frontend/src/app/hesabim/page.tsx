'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ordersApi, Order, api, integrationsApi, UserIntegration } from '@/lib/api';
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

// Orders Content
function OrdersContent({ subNav, orders }: { subNav: string; orders: Order[] }) {
    const formatPrice = (price: number) => new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
    }).format(price);

    const getStatusBadge = (status: string) => {
        const configs: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
            pending: { label: 'Bekliyor', variant: 'secondary' },
            processing: { label: 'Hazirlaniyor', variant: 'default' },
            shipped: { label: 'Kargoda', variant: 'default' },
            delivered: { label: 'Teslim Edildi', variant: 'outline' },
            cancelled: { label: 'Iptal', variant: 'destructive' },
        };
        const config = configs[status] || { label: status, variant: 'secondary' as const };
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    const filteredOrders = orders; // In real app, filter based on subNav

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input placeholder="Siparis no veya urun ara..." className="pl-9 w-full" />
                </div>
                <Button variant="outline" className="w-full sm:w-auto shrink-0">
                    <Calendar className="w-4 h-4 mr-2" />
                    Tarih Filtrele
                </Button>
            </div>

            {filteredOrders.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-xl">
                    <ShoppingBag className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500 mb-4">
                        {subNav === 'satin-aldiklarim' && 'Henuz siparisiniz bulunmuyor'}
                        {subNav === 'sattiklarim' && 'Henuz satis yapmadiniz'}
                        {subNav === 'iptal-iade' && 'Iptal veya iade talebi bulunmuyor'}
                    </p>
                    <Link href="/market">
                        <Button variant="outline">Alisverise Basla</Button>
                    </Link>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredOrders.map((order) => (
                        <div key={order.id} className="bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-300 transition-colors">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                                        <Package className="w-6 h-6 text-slate-400" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-semibold text-slate-900">Siparis #{order.id}</p>
                                        <p className="text-sm text-slate-500">
                                            {new Date(order.created_at).toLocaleDateString('tr-TR')}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 pl-16 sm:pl-0">
                                    {getStatusBadge(order.status)}
                                    <span className="font-bold text-slate-900 whitespace-nowrap">{formatPrice(order.total_amount)}</span>
                                    <Link href={`/account/orders/${order.id}`}>
                                        <Button variant="ghost" size="sm" className="shrink-0">
                                            <Eye className="w-4 h-4 sm:mr-1" />
                                            <span className="hidden sm:inline">Detay</span>
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
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

// ERP Integration Data
const AVAILABLE_INTEGRATIONS = [
    {
        id: 'entegra',
        name: 'Entegra',
        description: 'Entegra.com entegrasyonu ile tum pazar yerlerindeki urunlerinizi ve stoklarinizi tek panelden yonetin.',
    },
    {
        id: 'parasut',
        name: 'Parasut',
        description: 'Parasut on muhasebe programi entegrasyonu ile fatura ve muhasebe islemlerinizi otomatiklestirin.',
    },
    {
        id: 'sentos',
        name: 'Sentos',
        description: 'Sentos cok yonlu e-ticaret entegrasyonu ile stok ve siparis yonetimi.',
    },
    {
        id: 'bizimhesap',
        name: 'BizimHesap',
        description: 'BizimHesap ERP ve on muhasebe entegrasyonu ile finansal sureclerinizi yonetin.',
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
                        <div className="space-y-4">
                            {AVAILABLE_INTEGRATIONS.map((erp) => {
                                const integration = integrations.find((i) => i.erp_type === erp.id);
                                return (
                                    <IntegrationCard
                                        key={erp.id}
                                        id={erp.id}
                                        name={erp.name}
                                        description={erp.description}
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
    const [orders, setOrders] = useState<Order[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(false);

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
            loadOrders();
        }
    }, [activeTab, isAuthenticated]);

    const loadOrders = async () => {
        setLoadingOrders(true);
        try {
            const res = await ordersApi.getAll({ per_page: 20 });
            if (res.data?.orders) {
                setOrders(res.data.orders);
            }
        } catch (error) {
            console.error('Failed to load orders:', error);
        }
        setLoadingOrders(false);
    };

    // Redirect if not authenticated
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isLoading, isAuthenticated, router]);

    const handleTabChange = (tabId: string) => {
        setActiveTab(tabId);
        const subNavItems = TAB_SUBNAV[tabId];
        if (subNavItems?.[0]) {
            setActiveSubNav(subNavItems[0].id);
        }
        router.push(`/hesabim?tab=${tabId}&sub=${subNavItems?.[0]?.id || ''}`, { scroll: false });
    };

    const handleSubNavChange = (subId: string) => {
        setActiveSubNav(subId);
        router.push(`/hesabim?tab=${activeTab}&sub=${subId}`, { scroll: false });
    };

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
                            {activeTab === 'siparislerim' && <OrdersContent subNav={activeSubNav} orders={orders} />}
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
