'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { productsApi, Product, Offer } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { AddToCartButton } from '@/components/cart/AddToCartButton';
import { ArrowLeft, MapPin, Package, Tag, Trophy, Sparkles } from 'lucide-react';

export default function MarketProductDetailPage() {
    const params = useParams();
    const productId = Number(params.id);

    const [product, setProduct] = useState<Product | null>(null);
    const [offers, setOffers] = useState<Offer[]>([]);
    const [lowestPrice, setLowestPrice] = useState<number | null>(null);
    const [highestPrice, setHighestPrice] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadProductDetails();
    }, [productId]);

    const loadProductDetails = async () => {
        setIsLoading(true);
        const offersRes = await productsApi.getOffers(productId);
        if (offersRes.data) {
            setProduct(offersRes.data.product);
            setOffers(offersRes.data.offers);
            setLowestPrice(offersRes.data.lowest_price);
            setHighestPrice(offersRes.data.highest_price);
        }
        setIsLoading(false);
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
        }).format(price);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('tr-TR');
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-24" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <Skeleton className="h-96" />
                    <div className="lg:col-span-2 space-y-4">
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-20 w-full" />
                    </div>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <Card>
                <CardContent className="p-12 text-center">
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Ürün bulunamadı</h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-4">İstediğiniz ürün mevcut değil.</p>
                    <Link href="/market">
                        <Button>Pazaryerine Dön</Button>
                    </Link>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            {/* Back Button */}
            <Link href="/market">
                <Button variant="ghost" className="gap-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                    <ArrowLeft className="h-4 w-4" />
                    Pazaryerine Dön
                </Button>
            </Link>

            {/* Product Header */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Product Image */}
                <Card className="border-slate-200 dark:border-slate-800">
                    <CardContent className="p-6">
                        <div className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center overflow-hidden">
                            {product.image ? (
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <Package className="h-24 w-24 text-slate-300 dark:text-slate-600" />
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Product Info */}
                <div className="lg:col-span-2 space-y-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            {product.category && (
                                <Badge variant="secondary" className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                    {product.category.name}
                                </Badge>
                            )}
                            {product.brand && (
                                <Badge variant="outline" className="border-slate-300 dark:border-slate-600">{product.brand}</Badge>
                            )}
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{product.name}</h1>
                        {product.manufacturer && (
                            <p className="text-slate-500 dark:text-slate-400 mt-2">Üretici: {product.manufacturer}</p>
                        )}
                        <p className="text-sm text-slate-400 font-mono mt-1">
                            Barkod: {product.barcode}
                        </p>
                    </div>

                    {product.description && (
                        <div>
                            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Açıklama</h3>
                            <p className="text-slate-600 dark:text-slate-400">{product.description}</p>
                        </div>
                    )}

                    {/* Best Price Highlight */}
                    {offers.length > 0 && offers[0] && (
                        <Card className="relative overflow-hidden border-2 border-blue-400 dark:border-blue-600 bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50 dark:from-blue-950/50 dark:via-slate-900 dark:to-indigo-950/50 shadow-lg">
                            {/* Best Price Badge */}
                            <div className="absolute -right-12 top-4 rotate-45 bg-blue-600 px-12 py-1 text-xs font-bold text-white shadow-md">
                                EN UYGUN
                            </div>

                            <CardContent className="p-6">
                                <div className="flex items-start gap-6">
                                    {/* Trophy Icon */}
                                    <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                                        <Sparkles className="h-8 w-8 text-white" />
                                    </div>

                                    {/* Best Offer Info */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-bold rounded-full">
                                                #1 EN UYGUN FİYAT
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                            {offers[0].seller?.pharmacy_name}
                                        </h3>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2 mt-1">
                                            <MapPin className="h-4 w-4" />
                                            {offers[0].seller?.city || 'Belirtilmemiş'}
                                            <span className="text-slate-400">•</span>
                                            <span className="text-blue-600 dark:text-blue-400 font-medium">{offers[0].stock} adet stok</span>
                                        </p>
                                    </div>

                                    {/* Price */}
                                    <div className="text-right">
                                        <p className="text-sm text-blue-700 dark:text-blue-400 font-medium">Birim Fiyat</p>
                                        <p className="text-4xl font-extrabold text-blue-600 dark:text-blue-400 tracking-tight">
                                            {formatPrice(offers[0].price)}
                                        </p>
                                        {highestPrice && highestPrice > offers[0].price && (
                                            <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                                                <span className="line-through text-slate-400 mr-2">
                                                    {formatPrice(highestPrice)}
                                                </span>
                                                <span className="bg-blue-100 dark:bg-blue-900/50 px-2 py-0.5 rounded text-blue-700 dark:text-blue-300 font-medium">
                                                    %{Math.round((1 - offers[0].price / highestPrice) * 100)} ucuz
                                                </span>
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Price Summary Stats */}
                    <div className="grid grid-cols-3 gap-4">
                        <Card className="text-center border-slate-200 dark:border-slate-800">
                            <CardContent className="p-4">
                                <p className="text-xs text-slate-500 uppercase tracking-wide">En Düşük</p>
                                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                                    {lowestPrice ? formatPrice(lowestPrice) : '-'}
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="text-center border-slate-200 dark:border-slate-800">
                            <CardContent className="p-4">
                                <p className="text-xs text-slate-500 uppercase tracking-wide">En Yüksek</p>
                                <p className="text-xl font-bold text-slate-700 dark:text-slate-300">
                                    {highestPrice ? formatPrice(highestPrice) : '-'}
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="text-center border-slate-200 dark:border-slate-800">
                            <CardContent className="p-4">
                                <p className="text-xs text-slate-500 uppercase tracking-wide">Toplam Teklif</p>
                                <p className="text-xl font-bold text-slate-700 dark:text-slate-300">
                                    {offers.length}
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Offers Table */}
            <Card className="border-slate-200 dark:border-slate-800">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Tag className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        Fiyat Karşılaştırma
                    </CardTitle>
                    <CardDescription>
                        Bu ürün için mevcut teklifler (en düşük fiyattan en yükseğe)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {offers.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                                <Package className="h-8 w-8 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                                Henüz teklif yok
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400">
                                Bu ürün için henüz bir satış teklifi bulunmuyor.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                                        <TableHead className="w-[60px] text-center">#</TableHead>
                                        <TableHead>Eczane Adı</TableHead>
                                        <TableHead>Şehir</TableHead>
                                        <TableHead className="text-center">Stok</TableHead>
                                        <TableHead>S.K.T.</TableHead>
                                        <TableHead className="text-right">Fiyat</TableHead>
                                        <TableHead className="text-center w-[140px]">İşlem</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {offers.map((offer, index) => (
                                        <TableRow
                                            key={offer.id}
                                            className={cn(
                                                'transition-colors',
                                                index === 0 && 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-l-4 border-l-blue-500',
                                                index > 0 && 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                            )}
                                        >
                                            <TableCell className="text-center">
                                                {index === 0 ? (
                                                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold shadow-sm">
                                                        1
                                                    </div>
                                                ) : index === 1 ? (
                                                    <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-sm">
                                                        2
                                                    </div>
                                                ) : index === 2 ? (
                                                    <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-semibold text-sm">
                                                        3
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400 text-sm">{index + 1}</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <span className={cn('font-medium', index === 0 && 'text-blue-700 dark:text-blue-400')}>
                                                        {offer.seller?.pharmacy_name}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-slate-600 dark:text-slate-400">{offer.seller?.city || '-'}</span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge
                                                    variant="outline"
                                                    className={cn(
                                                        'font-medium',
                                                        offer.stock > 50 && 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700',
                                                        offer.stock > 10 && offer.stock <= 50 && 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700',
                                                        offer.stock > 0 && offer.stock <= 10 && 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-700',
                                                        offer.stock === 0 && 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700'
                                                    )}
                                                >
                                                    {offer.stock} adet
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-slate-600 dark:text-slate-400 text-sm">{formatDate(offer.expiry_date)}</span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex flex-col items-end">
                                                    <span className={cn(
                                                        'font-bold',
                                                        index === 0 ? 'text-blue-600 dark:text-blue-400 text-xl' : 'text-slate-900 dark:text-white text-lg'
                                                    )}>
                                                        {formatPrice(offer.price)}
                                                    </span>
                                                    {index > 0 && lowestPrice && (
                                                        <span className="text-xs text-slate-400">
                                                            +{formatPrice(offer.price - lowestPrice)}
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <AddToCartButton
                                                    offerId={offer.id}
                                                    stock={offer.stock}
                                                    className="w-full"
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
