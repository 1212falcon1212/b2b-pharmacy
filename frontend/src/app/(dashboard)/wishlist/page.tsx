'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { wishlistApi, Product } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, ShoppingBag } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function WishlistPage() {
    // wishlist item: { id, user_id, product_id, product: Product, created_at, ... }
    const [items, setItems] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadWishlist();
    }, []);

    const loadWishlist = async () => {
        setIsLoading(true);
        try {
            const res = await wishlistApi.getAll();
            if (res.data && res.data.data) {
                setItems(res.data.data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const removeFromWishlist = async (e: React.MouseEvent, productId: number) => {
        e.preventDefault();
        e.stopPropagation();

        // Optimistic update
        setItems(prev => prev.filter(item => item.product_id !== productId));

        try {
            await wishlistApi.toggle(productId);
        } catch (e) {
            console.error(e);
            // Could revert here
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
        }).format(price);
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <h1 className="text-2xl font-bold">Takip Listem</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-64 rounded-lg" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Takip Listem</h1>
                    <p className="text-gray-600 mt-1">Fiyatını takip ettiğiniz ürünler ({items.length})</p>
                </div>
            </div>

            {items.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <ShoppingBag className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">Listeniz boş</h3>
                        <p className="text-gray-500 mt-2 max-w-sm">
                            Henüz takip listesine ürün eklemediniz. Ürünler sayfasındaki kalp ikonuna tıklayarak ekleyebilirsiniz.
                        </p>
                        <Link href="/products" className="mt-6">
                            <Button>Ürünleri Keşfet</Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {items.map((item) => {
                        const product = item.product;
                        if (!product) return null;

                        return (
                            <Link key={item.id} href={`/products/${product.id}`}>
                                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group relative">
                                    <button
                                        onClick={(e) => removeFromWishlist(e, product.id)}
                                        className="absolute top-2 right-2 p-2 rounded-full bg-white/80 hover:bg-white text-red-500 hover:text-red-700 transition-colors z-10 shadow-sm"
                                        title="Listeden Çıkar"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>

                                    <CardContent className="p-4">
                                        <div className="aspect-square bg-gray-100 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                                            {product.image ? (
                                                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <ShoppingBag className="w-12 h-12 text-gray-300" />
                                            )}
                                        </div>

                                        <h3 className="font-medium text-gray-900 line-clamp-2">{product.name}</h3>
                                        {product.category && (
                                            <Badge variant="secondary" className="mt-2">{product.category.name}</Badge>
                                        )}

                                        <div className="mt-4">
                                            <p className="text-xs text-gray-500">Güncel En Düşük Fiyat</p>
                                            <p className="text-lg font-bold text-emerald-600">
                                                {formatPrice(product.lowest_price || 0)}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
