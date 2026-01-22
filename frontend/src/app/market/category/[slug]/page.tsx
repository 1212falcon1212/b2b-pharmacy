'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { productsApi, Product, Category } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Package, Filter, SlidersHorizontal } from 'lucide-react';

// Slug'ı okunabilir isme dönüştür
const formatSlugToName = (slug: string): string => {
    // Özel karakterleri ve tire'leri boşluğa çevir
    const words = slug.replace(/-/g, ' ').split(' ');

    // Her kelimenin ilk harfini büyük yap
    return words.map(word => {
        if (!word) return '';
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }).join(' ');
};

export default function MarketCategoryPage() {
    const params = useParams();
    const slug = params.slug as string;

    const [categoryInfo, setCategoryInfo] = useState<Category | null>(null);

    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Kategori adını belirle: API'den gelen bilgi veya slug'dan dönüştür
    const categoryName = categoryInfo?.name || formatSlugToName(slug);

    useEffect(() => {
        loadProducts();
    }, [slug, currentPage]);

    const loadProducts = async () => {
        setIsLoading(true);
        try {
            const response = await productsApi.getAll({
                category: slug,
                page: currentPage,
                per_page: 12,
            });
            if (response.data) {
                setProducts(response.data.products);
                setTotalPages(response.data.pagination?.last_page || 1);

                // İlk üründen kategori bilgisini al
                if (response.data.products.length > 0 && response.data.products[0].category) {
                    setCategoryInfo(response.data.products[0].category);
                }
            }
        } catch (error) {
            console.error('Failed to load products:', error);
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

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Link href="/market" className="hover:text-blue-600">Pazaryeri</Link>
                <span>/</span>
                <Link href="/market/categories" className="hover:text-blue-600">Kategoriler</Link>
                <span>/</span>
                <span className="text-slate-900 dark:text-white font-medium">{categoryName}</span>
            </div>

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{categoryName}</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        {products.length} ürün bulundu
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                        <Filter className="w-4 h-4" />
                        Filtrele
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                        <SlidersHorizontal className="w-4 h-4" />
                        Sırala
                    </Button>
                </div>
            </div>

            {/* Products Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {[...Array(8)].map((_, i) => (
                        <Card key={i} className="border-slate-200 dark:border-slate-800">
                            <CardContent className="p-4">
                                <Skeleton className="aspect-square w-full mb-4" />
                                <Skeleton className="h-4 w-3/4 mb-2" />
                                <Skeleton className="h-4 w-1/2" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : products.length === 0 ? (
                <Card className="border-slate-200 dark:border-slate-800">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <Package className="h-16 w-16 text-slate-300 dark:text-slate-600 mb-4" />
                        <h2 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">Bu kategoride ürün yok</h2>
                        <p className="text-slate-500 dark:text-slate-400 mb-4">
                            Başka kategorilere göz atabilirsiniz.
                        </p>
                        <Link href="/market">
                            <Button>
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Pazaryerine Dön
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {products.map((product) => (
                        <Link key={product.id} href={`/market/product/${product.id}`}>
                            <Card className="group border-slate-200 dark:border-slate-800 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 transition-all cursor-pointer overflow-hidden">
                                <CardContent className="p-0">
                                    {/* Image */}
                                    <div className="relative aspect-square bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                        {product.image ? (
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                            />
                                        ) : (
                                            <Package className="w-16 h-16 text-slate-300 dark:text-slate-600" />
                                        )}
                                        {product.offers_count && product.offers_count > 0 && (
                                            <span className="absolute top-2 right-2 px-2 py-0.5 bg-blue-600 text-white text-xs font-bold rounded-lg">
                                                {product.offers_count} teklif
                                            </span>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="p-4">
                                        {product.brand && (
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{product.brand}</p>
                                        )}
                                        <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-2 min-h-[2.5rem]">
                                            {product.name}
                                        </h3>
                                        <p className="text-xs text-slate-400 font-mono mt-1">{product.barcode}</p>

                                        {product.lowest_price && (
                                            <div className="mt-3 flex items-end justify-between">
                                                <div>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">En düşük fiyat</p>
                                                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                                        {formatPrice(product.lowest_price)}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2 pt-4">
                    <Button
                        variant="outline"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(currentPage - 1)}
                    >
                        Önceki
                    </Button>
                    <span className="flex items-center px-4 text-slate-600 dark:text-slate-400">
                        {currentPage} / {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(currentPage + 1)}
                    >
                        Sonraki
                    </Button>
                </div>
            )}
        </div>
    );
}
