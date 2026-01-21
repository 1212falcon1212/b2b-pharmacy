'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles,
    Package,
    ArrowLeft,
    Filter,
    ChevronDown,
    X,
    SlidersHorizontal,
    Calendar,
    Star,
    ArrowRight,
    Clock
} from 'lucide-react';
import { productsApi, categoriesApi, Product, Category } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

// Extended product type for new products
interface NewProduct extends Product {
    added_at?: string;
    days_since_added?: number;
}

// Helper function to format date
function formatRelativeDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Bugun';
    if (diffDays === 1) return 'Dun';
    if (diffDays < 7) return `${diffDays} gun once`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} hafta once`;
    return `${Math.floor(diffDays / 30)} ay once`;
}

// New Product Card Component
function NewProductCard({ product, index }: { product: NewProduct; index: number }) {
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
        }).format(price);
    };

    // Mock added date if not present (within last 30 days)
    const addedAt = product.added_at || new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString();
    const daysSinceAdded = product.days_since_added ?? Math.floor((Date.now() - new Date(addedAt).getTime()) / (1000 * 60 * 60 * 24));
    const isVeryNew = daysSinceAdded <= 3;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
        >
            <Link href={`/market/product/${product.id}`}>
                <Card className="group relative border-slate-200 dark:border-slate-800 hover:shadow-xl hover:shadow-teal-500/10 dark:hover:shadow-teal-500/5 transition-all duration-300 cursor-pointer overflow-hidden h-full">
                    {/* New Badge */}
                    <div className="absolute top-3 left-3 z-10">
                        <Badge className={`border-0 shadow-lg font-bold text-sm px-2.5 py-1 ${
                            isVeryNew
                                ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-teal-500/30'
                                : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-blue-500/30'
                        }`}>
                            <Sparkles className="w-3 h-3 mr-1" />
                            {isVeryNew ? 'Yeni!' : 'Yeni Urun'}
                        </Badge>
                    </div>

                    {/* Star indicator for very new items */}
                    {isVeryNew && (
                        <motion.div
                            className="absolute top-3 right-3 z-10"
                            animate={{ rotate: [0, 15, -15, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <div className="bg-gradient-to-r from-amber-400 to-yellow-500 text-white rounded-full p-1.5 shadow-lg shadow-amber-500/30">
                                <Star className="w-4 h-4 fill-current" />
                            </div>
                        </motion.div>
                    )}

                    <CardContent className="p-0">
                        {/* Image */}
                        <div className="relative aspect-square bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center overflow-hidden">
                            {product.image ? (
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500"
                                />
                            ) : (
                                <Package className="w-20 h-20 text-slate-300 dark:text-slate-600" />
                            )}

                            {/* Gradient overlay on hover */}
                            <div className="absolute inset-0 bg-gradient-to-t from-teal-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>

                        {/* Content */}
                        <div className="p-4 space-y-3">
                            {/* Date Added */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                                    <Calendar className="w-3 h-3" />
                                    <span>{formatRelativeDate(addedAt)}</span>
                                </div>
                                {product.offers_count && product.offers_count > 0 && (
                                    <span className="text-xs text-slate-500 dark:text-slate-400">
                                        {product.offers_count} satici
                                    </span>
                                )}
                            </div>

                            {/* Brand */}
                            {product.brand && (
                                <p className="text-xs font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                                    {product.brand}
                                </p>
                            )}

                            {/* Name */}
                            <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 line-clamp-2 min-h-[2.5rem] transition-colors">
                                {product.name}
                            </h3>

                            {/* Barcode */}
                            {product.barcode && (
                                <p className="text-xs text-slate-400 font-mono">
                                    {product.barcode}
                                </p>
                            )}

                            {/* Price Section */}
                            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <div>
                                    {product.lowest_price ? (
                                        <>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                En dusuk fiyat
                                            </p>
                                            <p className="text-xl font-bold text-teal-600 dark:text-teal-400">
                                                {formatPrice(product.lowest_price)}
                                            </p>
                                        </>
                                    ) : (
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            Fiyat icin tiklayin
                                        </p>
                                    )}
                                </div>

                                {/* Action Button */}
                                <Button
                                    size="icon"
                                    className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 hover:bg-teal-600 hover:text-white dark:hover:bg-teal-600 transition-all shadow-sm hover:shadow-teal-500/25"
                                >
                                    <ArrowRight className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </Link>
        </motion.div>
    );
}

// Loading Skeleton
function LoadingSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
                <Card key={i} className="border-slate-200 dark:border-slate-800 overflow-hidden">
                    <CardContent className="p-0">
                        <Skeleton className="aspect-square w-full" />
                        <div className="p-4 space-y-3">
                            <div className="flex justify-between">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-4 w-16" />
                            </div>
                            <Skeleton className="h-3 w-16" />
                            <Skeleton className="h-5 w-full" />
                            <Skeleton className="h-5 w-3/4" />
                            <Skeleton className="h-3 w-24" />
                            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                <div>
                                    <Skeleton className="h-3 w-16 mb-1" />
                                    <Skeleton className="h-6 w-24" />
                                </div>
                                <Skeleton className="h-10 w-10 rounded-xl" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

// Time Period Options
const TIME_PERIODS = [
    { value: 'all', label: 'Tum Yeni Urunler' },
    { value: '7', label: 'Son 7 gun' },
    { value: '14', label: 'Son 14 gun' },
    { value: '30', label: 'Son 30 gun' },
];

export default function YeniUrunlerPage() {
    const [products, setProducts] = useState<NewProduct[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Filters
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
    const [showFilters, setShowFilters] = useState(false);

    // Load categories
    useEffect(() => {
        const loadCategories = async () => {
            try {
                const response = await categoriesApi.getAll();
                if (response.data?.categories) {
                    setCategories(response.data.categories);
                }
            } catch (error) {
                console.error('Failed to load categories:', error);
            }
        };
        loadCategories();
    }, []);

    // Load products
    const loadProducts = useCallback(async () => {
        setIsLoading(true);
        try {
            const params: { page?: number; per_page?: number; category?: string } = {
                page: currentPage,
                per_page: 12,
            };

            if (selectedCategory !== 'all') {
                params.category = selectedCategory;
            }

            const response = await productsApi.getAll(params);

            if (response.data) {
                // Add mock added_at dates and sort by newest
                const newProducts: NewProduct[] = response.data.products.map((product) => {
                    const daysAgo = Math.floor(Math.random() * 30);
                    return {
                        ...product,
                        added_at: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
                        days_since_added: daysAgo,
                    };
                });

                // Sort by newest first
                newProducts.sort((a, b) => (a.days_since_added || 0) - (b.days_since_added || 0));

                // Filter by time period if selected
                let filteredProducts = newProducts;
                if (selectedPeriod !== 'all') {
                    const maxDays = parseInt(selectedPeriod);
                    filteredProducts = newProducts.filter(p => (p.days_since_added || 0) <= maxDays);
                }

                setProducts(filteredProducts);
                setTotalPages(response.data.pagination?.last_page || 1);
            }
        } catch (error) {
            console.error('Failed to load new products:', error);
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, selectedCategory, selectedPeriod]);

    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    const clearFilters = () => {
        setSelectedCategory('all');
        setSelectedPeriod('all');
        setCurrentPage(1);
    };

    const hasActiveFilters = selectedCategory !== 'all' || selectedPeriod !== 'all';

    // Stats
    const veryNewCount = products.filter(p => (p.days_since_added || 0) <= 3).length;
    const thisWeekCount = products.filter(p => (p.days_since_added || 0) <= 7).length;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            {/* Hero Banner */}
            <div className="relative bg-gradient-to-br from-teal-600 via-cyan-600 to-blue-700 dark:from-teal-800 dark:via-cyan-800 dark:to-blue-900 overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                        backgroundSize: '32px 32px'
                    }} />
                </div>

                {/* Floating Elements */}
                <motion.div
                    className="absolute top-10 left-10 text-white/20"
                    animate={{ y: [0, -20, 0], rotate: [0, 360] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                >
                    <Sparkles className="w-16 h-16" />
                </motion.div>
                <motion.div
                    className="absolute bottom-10 right-20 text-white/20"
                    animate={{ y: [0, 20, 0], scale: [1, 1.1, 1] }}
                    transition={{ duration: 5, repeat: Infinity }}
                >
                    <Package className="w-20 h-20" />
                </motion.div>
                <motion.div
                    className="absolute top-20 right-40 text-white/10"
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                    <Star className="w-12 h-12" />
                </motion.div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-center"
                    >
                        <Badge className="bg-white/20 text-white border-white/30 mb-4">
                            <Clock className="w-3 h-3 mr-1" />
                            Surekli Guncelleniyor
                        </Badge>
                        <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
                            Yeni Eklenen Urunler
                        </h1>
                        <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-6">
                            Pazaryerimize yeni eklenen urunleri kesfein.
                            En guncel stoklar ve yeni markalar burada!
                        </p>

                        {/* Quick Stats */}
                        <div className="flex flex-wrap justify-center gap-4 mt-6">
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20">
                                <span className="text-2xl font-bold text-white">{veryNewCount}</span>
                                <span className="text-white/80 ml-2 text-sm">Son 3 gunde</span>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20">
                                <span className="text-2xl font-bold text-white">{thisWeekCount}</span>
                                <span className="text-white/80 ml-2 text-sm">Bu hafta</span>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20">
                                <span className="text-2xl font-bold text-white">{products.length}</span>
                                <span className="text-white/80 ml-2 text-sm">Toplam yeni</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-6">
                    <Link href="/market" className="hover:text-teal-600 transition-colors">Pazaryeri</Link>
                    <span>/</span>
                    <span className="text-slate-900 dark:text-white font-medium">Yeni Urunler</span>
                </div>

                {/* Filters Bar */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 mb-6 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2 md:hidden"
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                <SlidersHorizontal className="w-4 h-4" />
                                Filtrele
                                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                            </Button>

                            <div className={`flex flex-col md:flex-row gap-3 ${showFilters ? 'flex' : 'hidden md:flex'} w-full md:w-auto`}>
                                {/* Category Filter */}
                                <Select value={selectedCategory} onValueChange={(value) => { setSelectedCategory(value); setCurrentPage(1); }}>
                                    <SelectTrigger className="w-full md:w-[180px]">
                                        <SelectValue placeholder="Kategori" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tum Kategoriler</SelectItem>
                                        {categories.map((category) => (
                                            <SelectItem key={category.id} value={category.slug}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {/* Time Period Filter */}
                                <Select value={selectedPeriod} onValueChange={(value) => { setSelectedPeriod(value); setCurrentPage(1); }}>
                                    <SelectTrigger className="w-full md:w-[180px]">
                                        <SelectValue placeholder="Zaman Araligi" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {TIME_PERIODS.map((period) => (
                                            <SelectItem key={period.value} value={period.value}>
                                                {period.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Active Filters & Results Count */}
                        <div className="flex items-center gap-3">
                            {hasActiveFilters && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearFilters}
                                    className="text-slate-500 hover:text-red-500"
                                >
                                    <X className="w-4 h-4 mr-1" />
                                    Filtreleri Temizle
                                </Button>
                            )}
                            <span className="text-sm text-slate-500 dark:text-slate-400">
                                {products.length} yeni urun
                            </span>
                        </div>
                    </div>
                </div>

                {/* Products Grid */}
                <AnimatePresence mode="wait">
                    {isLoading ? (
                        <LoadingSkeleton />
                    ) : products.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <Card className="border-slate-200 dark:border-slate-800">
                                <CardContent className="flex flex-col items-center justify-center py-16">
                                    <div className="w-20 h-20 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center mb-4">
                                        <Sparkles className="h-10 w-10 text-teal-600 dark:text-teal-400" />
                                    </div>
                                    <h2 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">
                                        Yeni urun bulunamadi
                                    </h2>
                                    <p className="text-slate-500 dark:text-slate-400 mb-4 text-center max-w-md">
                                        Sectiginiz filtrelere uygun yeni urun bulunmuyor.
                                        Filtreleri degistirmeyi veya daha sonra tekrar kontrol etmeyi deneyin.
                                    </p>
                                    <div className="flex gap-3">
                                        {hasActiveFilters && (
                                            <Button variant="outline" onClick={clearFilters}>
                                                <X className="w-4 h-4 mr-2" />
                                                Filtreleri Temizle
                                            </Button>
                                        )}
                                        <Link href="/market">
                                            <Button className="bg-teal-600 hover:bg-teal-700">
                                                <ArrowLeft className="w-4 h-4 mr-2" />
                                                Pazaryerine Don
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                        >
                            {products.map((product, index) => (
                                <NewProductCard key={product.id} product={product} index={index} />
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Pagination */}
                {totalPages > 1 && !isLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-center gap-2 pt-8"
                    >
                        <Button
                            variant="outline"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(currentPage - 1)}
                            className="border-slate-300 dark:border-slate-700"
                        >
                            Onceki
                        </Button>
                        <span className="flex items-center px-4 text-slate-600 dark:text-slate-400 font-medium">
                            {currentPage} / {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(currentPage + 1)}
                            className="border-slate-300 dark:border-slate-700"
                        >
                            Sonraki
                        </Button>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
