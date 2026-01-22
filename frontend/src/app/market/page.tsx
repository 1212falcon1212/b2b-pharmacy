'use client';

import { useEffect, useState } from 'react';
import {
    Sparkles,
    TrendingUp,
    Clock,
    Star,
    Gift,
    Tag,
    Package,
    ArrowRight,
    Award,
    Flame,
    Heart,
    Shield,
    Truck,
    BadgeCheck,
    Zap,
    Building2,
    Pill,
    Percent,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { cmsApi, Banner, HomepageSection, api } from '@/lib/api';
import { HeroSlider } from '@/components/market/HeroSlider';
import { ProductGrid } from '@/components/market/ProductCarousel';
import { ProductCard } from '@/components/market/ProductCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// Fallback data - 12 unique products for 6x2 grid
const FALLBACK_PRODUCTS = [
    { id: 1, name: 'Vitamin C 1000mg', brand: 'Solaray', lowest_price: 89.90, offers_count: 12 },
    { id: 2, name: 'Omega 3 Balik Yagi', brand: 'Nordic Naturals', lowest_price: 245.00, offers_count: 8 },
    { id: 3, name: 'Probiyotik 20 Milyar', brand: 'Garden of Life', lowest_price: 189.50, offers_count: 15 },
    { id: 4, name: 'Magnezyum Citrate', brand: 'NOW Foods', lowest_price: 125.00, offers_count: 6 },
    { id: 5, name: 'D3 Vitamini Drops', brand: 'Ocean', lowest_price: 45.00, offers_count: 22 },
    { id: 6, name: 'Cinko Picolinate', brand: 'Solgar', lowest_price: 150.00, offers_count: 4 },
    { id: 7, name: 'B12 Vitamini', brand: 'Jamieson', lowest_price: 78.00, offers_count: 9 },
    { id: 8, name: 'Demir Takviyesi', brand: 'Solgar', lowest_price: 95.00, offers_count: 7 },
    { id: 9, name: 'Kolajen Peptit', brand: 'Vital Proteins', lowest_price: 320.00, offers_count: 11 },
    { id: 10, name: 'Multivitamin', brand: 'Centrum', lowest_price: 175.00, offers_count: 18 },
    { id: 11, name: 'Kalsiyum D3', brand: 'Nature Made', lowest_price: 85.00, offers_count: 14 },
    { id: 12, name: 'CoQ10 100mg', brand: 'Solgar', lowest_price: 280.00, offers_count: 5 },
];

const FALLBACK_BRANDS = [
    { id: 1, name: 'Abdi Ibrahim', slug: 'abdi-ibrahim', logo: null },
    { id: 2, name: 'Sanofi', slug: 'sanofi', logo: null },
    { id: 3, name: 'Bayer', slug: 'bayer', logo: null },
    { id: 4, name: 'Pfizer', slug: 'pfizer', logo: null },
    { id: 5, name: 'Novartis', slug: 'novartis', logo: null },
    { id: 6, name: 'GSK', slug: 'gsk', logo: null },
    { id: 7, name: 'AstraZeneca', slug: 'astrazeneca', logo: null },
    { id: 8, name: 'Roche', slug: 'roche', logo: null },
    { id: 9, name: 'Merck', slug: 'merck', logo: null },
    { id: 10, name: 'Johnson & Johnson', slug: 'johnson-johnson', logo: null },
];

interface Brand {
    id: number;
    name: string;
    slug: string;
    logo?: string | null;
}

// Skeleton Components
function HeroSkeleton() {
    return (
        <div className="w-full h-[400px] bg-slate-200 animate-pulse" />
    );
}

function SmallBannersSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
        </div>
    );
}

function ProductSectionSkeleton() {
    return (
        <section className="py-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Skeleton className="w-11 h-11 rounded-xl" />
                    <Skeleton className="h-7 w-48" />
                </div>
                <Skeleton className="h-5 w-24" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="space-y-3">
                        <Skeleton className="aspect-square rounded-2xl" />
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-6 w-20" />
                    </div>
                ))}
            </div>
        </section>
    );
}

function BrandsSkeleton() {
    return (
        <section className="py-8">
            <div className="flex items-center justify-between mb-6">
                <Skeleton className="h-7 w-40" />
                <Skeleton className="h-5 w-24" />
            </div>
            <div className="flex gap-4 overflow-hidden">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                    <Skeleton key={i} className="flex-shrink-0 w-32 h-20 rounded-xl" />
                ))}
            </div>
        </section>
    );
}

// Brand Carousel Component
function BrandCarousel({ brands }: { brands: Brand[] }) {
    const [scrollPosition, setScrollPosition] = useState(0);
    const scrollRef = useState<HTMLDivElement | null>(null);

    const scroll = (direction: 'left' | 'right') => {
        const container = document.getElementById('brand-scroll-container');
        if (container) {
            const scrollAmount = 200;
            if (direction === 'left') {
                container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            } else {
                container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            }
        }
    };

    return (
        <section className="py-8">
            <div className="flex items-center justify-between mb-6 px-1">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl text-white shadow-lg shadow-indigo-500/25">
                        <Building2 className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
                        Populer Markalar
                    </h2>
                </div>
                <Link
                    href="/market/markalar"
                    className="group flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors"
                >
                    Tum Markalar
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
            </div>

            <div className="relative group">
                {/* Scroll Buttons */}
                <button
                    onClick={() => scroll('left')}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-slate-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                >
                    <ChevronLeft className="w-5 h-5 text-slate-600" />
                </button>
                <button
                    onClick={() => scroll('right')}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-slate-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                >
                    <ChevronRight className="w-5 h-5 text-slate-600" />
                </button>

                {/* Brand List */}
                <div
                    id="brand-scroll-container"
                    className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide scroll-smooth"
                >
                    {brands.map((brand) => (
                        <Link
                            key={brand.id}
                            href={`/market/marka/${brand.slug}`}
                            className="flex-shrink-0 w-36 h-24 bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/10 transition-all flex items-center justify-center p-4 group"
                        >
                            {brand.logo ? (
                                <img
                                    src={brand.logo}
                                    alt={brand.name}
                                    className="max-w-full max-h-full object-contain grayscale group-hover:grayscale-0 transition-all"
                                />
                            ) : (
                                <span className="text-sm font-bold text-slate-600 group-hover:text-blue-600 text-center transition-colors">
                                    {brand.name}
                                </span>
                            )}
                        </Link>
                    ))}
                </div>
            </div>

            {/* Brand Promotion Banner */}
            <div className="mt-6">
                <Link
                    href="/market/markalar"
                    className="block relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 md:p-8 group"
                >
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />
                    <div className="relative flex items-center justify-between">
                        <div>
                            <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
                                Orijinal Markalar, Guvenceli Alisveris
                            </h3>
                            <p className="text-white/80 text-sm md:text-base mb-4">
                                TITCK onayli, guvenilir tedarikten tedarikcilerden satin alin
                            </p>
                            <span className="inline-flex items-center gap-2 text-white font-semibold text-sm group-hover:gap-3 transition-all">
                                Markalari Kesfet
                                <ArrowRight className="w-4 h-4" />
                            </span>
                        </div>
                        <div className="hidden md:flex items-center gap-4">
                            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                                <BadgeCheck className="w-8 h-8 text-white" />
                            </div>
                            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                                <Shield className="w-8 h-8 text-white" />
                            </div>
                        </div>
                    </div>
                </Link>
            </div>
        </section>
    );
}

// 4-Banner Grid Component
function BannerGrid() {
    const banners = [
        {
            title: 'Vitaminler',
            subtitle: 'Saglikli yasam icin',
            icon: <Pill className="w-6 h-6" />,
            gradient: 'from-orange-500 to-amber-500',
            shadowColor: 'shadow-orange-500/20',
            href: '/market/category/vitaminler'
        },
        {
            title: 'Cilt Bakimi',
            subtitle: 'Cildinize ozen gosterin',
            icon: <Heart className="w-6 h-6" />,
            gradient: 'from-pink-500 to-rose-500',
            shadowColor: 'shadow-pink-500/20',
            href: '/market/category/cilt-bakimi'
        },
        {
            title: 'Anne Bebek',
            subtitle: 'Bebeginiz icin en iyisi',
            icon: <Gift className="w-6 h-6" />,
            gradient: 'from-blue-500 to-cyan-500',
            shadowColor: 'shadow-blue-500/20',
            href: '/market/category/anne-bebek'
        },
        {
            title: 'Sac Bakimi',
            subtitle: 'Guclu ve parlak saclar',
            icon: <Sparkles className="w-6 h-6" />,
            gradient: 'from-violet-500 to-purple-500',
            shadowColor: 'shadow-violet-500/20',
            href: '/market/category/sac-bakimi'
        }
    ];

    return (
        <section className="py-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {banners.map((banner, index) => (
                    <Link
                        key={index}
                        href={banner.href}
                        className={cn(
                            "group relative overflow-hidden rounded-2xl p-6 md:p-8",
                            `bg-gradient-to-br ${banner.gradient}`,
                            `shadow-lg ${banner.shadowColor} hover:shadow-xl transition-all duration-300`
                        )}
                    >
                        {/* Background Pattern */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

                        <div className="relative flex items-center justify-between">
                            <div>
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    {banner.icon}
                                </div>
                                <h3 className="text-lg md:text-xl font-bold text-white mb-1">
                                    {banner.title}
                                </h3>
                                <p className="text-white/80 text-sm">
                                    {banner.subtitle}
                                </p>
                            </div>
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                                <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-0.5 transition-transform" />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}

// About/Trust Section Component
function TrustSection() {
    return (
        <section className="py-12 mt-4">
            {/* Header */}
            <div className="text-center mb-10">
                <span className="inline-block px-4 py-1.5 bg-emerald-100 text-emerald-700 text-sm font-semibold rounded-full mb-4">
                    Guvenilir Tedarik Platformu
                </span>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
                    Neden i-Depo?
                </h2>
                <p className="text-slate-600 max-w-2xl mx-auto">
                    Turkiyenin en buyuk B2B eczane tedarik platformu olarak,
                    binlerce eczaneye guvenli ve hizli hizmet sunuyoruz.
                </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
                <div className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-500/5 transition-all group">
                    <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Shield className="w-7 h-7 text-emerald-600" />
                    </div>
                    <h3 className="text-slate-900 font-bold text-lg mb-2">TITCK Onayli</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">
                        Tum urunler resmi kayitli ve onayli tedariklerden saglanmaktadir.
                    </p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 transition-all group">
                    <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Truck className="w-7 h-7 text-blue-600" />
                    </div>
                    <h3 className="text-slate-900 font-bold text-lg mb-2">Hizli Teslimat</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">
                        Siparisleriniz ayni gun kargoya verilir, 24-48 saat icinde teslim edilir.
                    </p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-amber-200 hover:shadow-lg hover:shadow-amber-500/5 transition-all group">
                    <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Award className="w-7 h-7 text-amber-600" />
                    </div>
                    <h3 className="text-slate-900 font-bold text-lg mb-2">En Iyi Fiyatlar</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">
                        Yuzlerce tedarikci arasinda karsilastirma yapin, en iyi fiyati bulun.
                    </p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-purple-200 hover:shadow-lg hover:shadow-purple-500/5 transition-all group">
                    <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <BadgeCheck className="w-7 h-7 text-purple-600" />
                    </div>
                    <h3 className="text-slate-900 font-bold text-lg mb-2">Guvenli Odeme</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">
                        256-bit SSL sertifikasi ile guvenli odeme altyapisi.
                    </p>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div className="text-center">
                        <div className="text-3xl md:text-4xl font-bold text-emerald-600 mb-1">5000+</div>
                        <div className="text-slate-500 text-sm">Kayitli Eczane</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl md:text-4xl font-bold text-emerald-600 mb-1">50K+</div>
                        <div className="text-slate-500 text-sm">Urun Cesidi</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl md:text-4xl font-bold text-emerald-600 mb-1">500+</div>
                        <div className="text-slate-500 text-sm">Aktif Tedarikci</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl md:text-4xl font-bold text-emerald-600 mb-1">%99</div>
                        <div className="text-slate-500 text-sm">Musteri Memnuniyeti</div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default function MarketHomePage() {
    const [heroBanners, setHeroBanners] = useState<Banner[]>([]);
    const [sections, setSections] = useState<HomepageSection[]>([]);
    const [brands, setBrands] = useState<Brand[]>(FALLBACK_BRANDS);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const response = await cmsApi.getHomepage();
                if (response.data) {
                    if (response.data.banners?.hero?.length > 0) {
                        setHeroBanners(response.data.banners.hero);
                    }
                    if (response.data.sections?.length > 0) {
                        setSections(response.data.sections);
                    }
                }

                // Try to load brands (if endpoint exists)
                try {
                    const brandsResponse = await api.get<{ brands: Brand[] }>('/brands');
                    if (brandsResponse.data?.brands) {
                        setBrands(brandsResponse.data.brands);
                    }
                } catch {
                    // Use fallback brands
                }
            } catch (error) {
                console.error("Failed to load homepage data", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    // Find sections by type
    const getSection = (type: string) => sections.find(s => s.type === type);
    const regionalSection = getSection('regional_bestsellers') || sections[0];
    const bestSellersSection = getSection('best_sellers');
    const recommendedSection = getSection('recommended') || getSection('featured_products');

    // Skeleton Loading
    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
                <HeroSkeleton />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 mt-8">
                    <SmallBannersSkeleton />
                    <ProductSectionSkeleton />
                    <ProductSectionSkeleton />
                    <BrandsSkeleton />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
            {/* 1. Hero Section */}
            <div className="w-full pb-8">
                <HeroSlider banners={heroBanners} />
            </div>

            {/* 2. 3'lu Hero Banner */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-2xl border border-blue-500/20 flex items-center justify-between group cursor-pointer hover:shadow-lg transition-all shadow-md shadow-blue-900/10">
                        <div>
                            <h3 className="text-white font-bold text-lg mb-1">Yeni Uyelik</h3>
                            <p className="text-blue-100 text-sm">Ilk siparise ozel %10 indirim</p>
                        </div>
                        <Gift className="w-8 h-8 text-white/80 group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 rounded-2xl border border-purple-500/20 flex items-center justify-between group cursor-pointer hover:shadow-lg transition-all shadow-md shadow-purple-900/10">
                        <div>
                            <h3 className="text-white font-bold text-lg mb-1">Kargo Bedava</h3>
                            <p className="text-purple-100 text-sm">2500TL uzeri siparislerde</p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-white/80 group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-6 rounded-2xl border border-amber-500/20 flex items-center justify-between group cursor-pointer hover:shadow-lg transition-all shadow-md shadow-amber-900/10">
                        <div>
                            <h3 className="text-white font-bold text-lg mb-1">Yildizli Ilanlar</h3>
                            <p className="text-amber-100 text-sm">En yuksek puanli saticilar</p>
                        </div>
                        <Star className="w-8 h-8 text-white/80 group-hover:scale-110 transition-transform" />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                {/* 3. Bolgenizde Cok Satanlar - 6 columns x 2 rows = 12 products */}
                {regionalSection ? (
                    <ProductGrid
                        title={regionalSection.title || "Bolgenizde Cok Satanlar"}
                        products={regionalSection.products}
                        linkUrl="/market/products"
                        icon={<Flame className="w-5 h-5" />}
                        columns={6}
                        rows={2}
                    />
                ) : (
                    <ProductGrid
                        title="Bolgenizde Cok Satanlar"
                        products={FALLBACK_PRODUCTS}
                        linkUrl="/market/products"
                        icon={<Flame className="w-5 h-5" />}
                        columns={6}
                        rows={2}
                    />
                )}

                {/* 4. 2'li Kampanya ve Urun Bannerlari */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Kampanyalar Banner */}
                    <Link
                        href="/market/kampanyalar"
                        className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-orange-600 p-6 md:p-8 shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/30 transition-all duration-300"
                    >
                        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
                        <div className="relative z-10 flex items-center justify-between">
                            <div className="flex-1">
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                                    <Tag className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-xl md:text-2xl font-bold text-white mb-2">Kampanyalar</h3>
                                <p className="text-white/80 text-sm md:text-base mb-4">Ozel firsatlar ve indirimlerden yararlanin</p>
                                <span className="inline-flex items-center gap-2 text-white font-semibold text-sm group-hover:gap-3 transition-all">
                                    Kampanyalara Git
                                    <ArrowRight className="w-4 h-4" />
                                </span>
                            </div>
                            <div className="hidden md:block">
                                <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <Sparkles className="w-10 h-10 text-white" />
                                </div>
                            </div>
                        </div>
                    </Link>

                    {/* Yeni Urunler Banner */}
                    <Link
                        href="/market/yeni-urunler"
                        className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 p-6 md:p-8 shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300"
                    >
                        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
                        <div className="relative z-10 flex items-center justify-between">
                            <div className="flex-1">
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                                    <Package className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-xl md:text-2xl font-bold text-white mb-2">Yeni Urunler</h3>
                                <p className="text-white/80 text-sm md:text-base mb-4">En yeni urunleri kesfedin</p>
                                <span className="inline-flex items-center gap-2 text-white font-semibold text-sm group-hover:gap-3 transition-all">
                                    Yeni Urunlere Git
                                    <ArrowRight className="w-4 h-4" />
                                </span>
                            </div>
                            <div className="hidden md:block">
                                <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <Gift className="w-10 h-10 text-white" />
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* 5. Cok Satanlar (Best Sellers) - 6 columns x 2 rows = 12 products */}
                {bestSellersSection ? (
                    <ProductGrid
                        title="Cok Satanlar"
                        products={bestSellersSection.products}
                        linkUrl="/market/cok-satanlar"
                        icon={<Award className="w-5 h-5" />}
                        columns={6}
                        rows={2}
                        showRanking={true}
                    />
                ) : (
                    <ProductGrid
                        title="Cok Satanlar"
                        products={FALLBACK_PRODUCTS}
                        linkUrl="/market/cok-satanlar"
                        icon={<Award className="w-5 h-5" />}
                        columns={6}
                        rows={2}
                        showRanking={true}
                    />
                )}

                {/* 6. Marka Alani ve Bannerlari */}
                <BrandCarousel brands={brands} />

                {/* 7. Sizin Icin Ozel (Recommended) - 6 columns x 2 rows = 12 products */}
                {recommendedSection ? (
                    <ProductGrid
                        title={recommendedSection.title || "Sizin Icin Ozel"}
                        products={recommendedSection.products}
                        linkUrl="/market/onerilen"
                        icon={<Heart className="w-5 h-5" />}
                        columns={6}
                        rows={2}
                    />
                ) : (
                    <ProductGrid
                        title="Sizin Icin Ozel"
                        products={[...FALLBACK_PRODUCTS].reverse()}
                        linkUrl="/market/onerilen"
                        icon={<Heart className="w-5 h-5" />}
                        columns={6}
                        rows={2}
                    />
                )}

                {/* 8. 4'lu Banner Grid (2x2) */}
                <BannerGrid />

                {/* 9. Tanitim Yazisi */}
                <TrustSection />
            </div>
        </div>
    );
}
