'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { productsApi, Product, Offer } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { AddToCartButton } from '@/components/cart/AddToCartButton';
import {
    Heart,
    Package,
    ChevronRight,
    MapPin,
    Calendar,
    Box,
    Truck,
    Star,
    AlertCircle,
    ChevronDown
} from 'lucide-react';

export default function MarketProductDetailPage() {
    const params = useParams();
    const productId = Number(params.id);

    const [product, setProduct] = useState<Product | null>(null);
    const [offers, setOffers] = useState<Offer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFavorite, setIsFavorite] = useState(false);
    const [sortBy, setSortBy] = useState<'price' | 'stock'>('price');
    const [minStock, setMinStock] = useState<number>(0);

    useEffect(() => {
        loadProductDetails();
    }, [productId]);

    const loadProductDetails = async () => {
        setIsLoading(true);
        const offersRes = await productsApi.getOffers(productId);
        if (offersRes.data) {
            setProduct(offersRes.data.product);
            setOffers(offersRes.data.offers || []);
        }
        setIsLoading(false);
    };

    // Filtered and sorted offers
    const filteredOffers = useMemo(() => {
        let result = [...offers];

        // Filter by minimum stock
        if (minStock > 0) {
            result = result.filter(o => o.stock >= minStock);
        }

        // Sort
        if (sortBy === 'price') {
            result.sort((a, b) => a.price - b.price);
        } else if (sortBy === 'stock') {
            result.sort((a, b) => b.stock - a.stock);
        }

        return result;
    }, [offers, sortBy, minStock]);

    const formatPrice = (price: number | string | undefined | null) => {
        const numPrice = Number(price) || 0;
        const [whole, decimal] = numPrice.toFixed(2).split('.');
        return { whole, decimal };
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('tr-TR', { weekday: 'long' });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <Skeleton className="h-6 w-96 mb-6" />
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        <div className="lg:col-span-4">
                            <Skeleton className="h-[500px] rounded-xl" />
                        </div>
                        <div className="lg:col-span-8 space-y-4">
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-32 w-full" />
                            <Skeleton className="h-32 w-full" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
                        <Package className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Urun bulunamadi</h3>
                        <p className="text-slate-500 mb-6">Istediginiz urun mevcut degil.</p>
                        <Link href="/market">
                            <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                                Pazaryerine Don
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm mb-4 overflow-x-auto whitespace-nowrap pb-2">
                    <Link href="/market" className="text-slate-500 hover:text-orange-600">Anasayfa</Link>
                    <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    {product.category && (
                        <>
                            <Link href={`/market/category/${product.category.slug}`} className="text-slate-500 hover:text-orange-600">
                                {product.category.name}
                            </Link>
                            <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        </>
                    )}
                    <span className="text-slate-700 font-medium truncate">{product.name}</span>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Side - Product Info */}
                    <div className="lg:col-span-4">
                        <div className="bg-white rounded-xl border border-slate-200 p-5 sticky top-4">
                            {/* Product Name */}
                            <h1 className="text-xl font-bold text-slate-900 leading-tight mb-2">
                                {product.name}
                            </h1>

                            {/* Brand */}
                            {product.brand && (
                                <Link href={`/market/marka/${product.brand.toLowerCase().replace(/\s+/g, '-')}`} className="text-purple-600 hover:text-purple-700 font-medium text-sm">
                                    {product.brand}
                                </Link>
                            )}

                            {/* Product Image */}
                            <div className="relative mt-4">
                                <button
                                    onClick={() => setIsFavorite(!isFavorite)}
                                    className="absolute top-2 left-2 z-10 w-9 h-9 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-slate-50 transition-colors"
                                >
                                    <Heart className={cn(
                                        "w-5 h-5 transition-colors",
                                        isFavorite ? "fill-red-500 text-red-500" : "text-slate-400"
                                    )} />
                                </button>
                                <div className="aspect-square bg-white rounded-lg flex items-center justify-center overflow-hidden border border-slate-100">
                                    {product.image ? (
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="w-full h-full object-contain p-6"
                                        />
                                    ) : (
                                        <Package className="h-24 w-24 text-slate-300" />
                                    )}
                                </div>
                            </div>

                            {/* PSF Price */}
                            <div className="mt-4 pt-4 border-t border-slate-100">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-500">PSF:</span>
                                    <span className="text-lg font-semibold text-slate-700">
                                        {formatPrice(offers[0]?.price).whole},{formatPrice(offers[0]?.price).decimal} TL
                                    </span>
                                </div>
                            </div>

                            {/* Report Error */}
                            <button className="mt-3 text-sm text-orange-600 hover:text-orange-700 flex items-center gap-1">
                                <AlertCircle className="w-4 h-4" />
                                Hata Bildir
                            </button>
                        </div>
                    </div>

                    {/* Right Side - Offers */}
                    <div className="lg:col-span-8">
                        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                            {/* Header */}
                            <div className="p-4 border-b border-slate-200">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <h2 className="text-lg font-bold text-slate-900">
                                        Urunun Tum Ilanlari
                                    </h2>
                                    <div className="flex items-center gap-3">
                                        {/* Min Stock Filter */}
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-slate-500">Minimum Stok:</span>
                                            <select
                                                value={minStock}
                                                onChange={(e) => setMinStock(Number(e.target.value))}
                                                className="h-9 px-3 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                                            >
                                                <option value={0}>--</option>
                                                <option value={5}>5+</option>
                                                <option value={10}>10+</option>
                                                <option value={50}>50+</option>
                                                <option value={100}>100+</option>
                                            </select>
                                        </div>

                                        {/* Sort */}
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-slate-500">Sirala:</span>
                                            <select
                                                value={sortBy}
                                                onChange={(e) => setSortBy(e.target.value as 'price' | 'stock')}
                                                className="h-9 px-3 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                                            >
                                                <option value="price">Fiyata gore</option>
                                                <option value="stock">Stoka gore</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Results count tab */}
                                <div className="mt-4">
                                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg text-sm font-medium text-slate-700">
                                        Tum Ilanlar
                                        <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-md text-xs font-bold">
                                            {filteredOffers.length}
                                        </span>
                                    </span>
                                </div>
                            </div>

                            {/* Offers List */}
                            <div className="divide-y divide-slate-100">
                                {filteredOffers.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Package className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                                        <p className="text-slate-500">Ilan bulunamadi</p>
                                    </div>
                                ) : (
                                    filteredOffers.map((offer, index) => (
                                        <div key={offer.id} className="p-4 hover:bg-slate-50/50 transition-colors">
                                            <div className="flex flex-col xl:flex-row xl:items-start gap-4">
                                                {/* Seller Info */}
                                                <div className="flex items-start gap-3 min-w-0 flex-1 lg:flex-none lg:w-auto">
                                                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                        <span className="text-lg font-bold text-slate-400">
                                                            {offer.seller?.pharmacy_name?.[0] || 'E'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <span className="inline-flex items-center px-1.5 py-0.5 bg-emerald-500 text-white text-xs font-bold rounded flex-shrink-0">
                                                                {(8 + Math.random() * 2).toFixed(1)}
                                                            </span>
                                                            <span className="font-semibold text-slate-900">
                                                                {offer.seller?.pharmacy_name}
                                                            </span>
                                                        </div>
                                                        <span className="text-xs text-slate-400">
                                                            ({Math.floor(Math.random() * 500 + 100)} ilan)
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Delivery & Stock Info */}
                                                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                                                    <div>
                                                        <span className="text-slate-500">Tahmini Teslimat: </span>
                                                        <span className="text-slate-700 font-medium">{formatDate(offer.expiry_date)}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-500">Miat: </span>
                                                        <span className="text-slate-700 font-medium">Miatsiz Urun</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-500">Stok: </span>
                                                        <span className={cn(
                                                            "font-medium",
                                                            offer.stock < 10 ? "text-red-600" : offer.stock < 50 ? "text-amber-600" : "text-emerald-600"
                                                        )}>
                                                            {offer.stock}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Price & Action */}
                                                <div className="flex items-center gap-4 flex-shrink-0 justify-end">
                                                    <div className="text-right">
                                                        {index === 0 && offers.length > 1 && (
                                                            <div className="text-xs text-emerald-600 font-medium mb-1">
                                                                En uygun fiyat
                                                            </div>
                                                        )}
                                                        <div className="flex items-baseline justify-end gap-0.5">
                                                            <span className="text-2xl font-bold text-slate-900">
                                                                {formatPrice(offer.price).whole}
                                                            </span>
                                                            <span className="text-sm font-medium text-slate-600">
                                                                ,{formatPrice(offer.price).decimal} TL
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <AddToCartButton
                                                        offerId={offer.id}
                                                        stock={offer.stock}
                                                        className="bg-white border-2 border-orange-500 text-orange-500 hover:bg-orange-50 font-semibold px-6"
                                                    />
                                                </div>
                                            </div>

                                            {/* Campaign Tags */}
                                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                                <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-lg border border-emerald-200">
                                                    <Truck className="w-3.5 h-3.5" />
                                                    3000 TL ve uzeri kargo bedava
                                                </span>
                                                {index < 3 && (
                                                    <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-50 text-purple-700 text-xs font-medium rounded-lg border border-purple-200">
                                                        <Star className="w-3.5 h-3.5" />
                                                        Tum magazada %{3 + index} indirim
                                                    </span>
                                                )}
                                                <button className="text-xs text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1">
                                                    +1 Kampanya Daha
                                                    <ChevronDown className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
