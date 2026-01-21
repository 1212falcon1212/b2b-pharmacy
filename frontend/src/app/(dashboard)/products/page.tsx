'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { productsApi, Product, wishlistApi } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useDebounce } from '@/hooks/use-debounce';
import { ScanBarcode, Heart } from 'lucide-react';
import { BarcodeScanner } from '@/components/mobile/BarcodeScanner';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [wishlistIds, setWishlistIds] = useState<Set<number>>(new Set());

  // Debounce search query to prevent excessive API calls
  const debouncedSearch = useDebounce(searchQuery, 500);

  // Reset to first page when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  // Load wishlist IDs
  useEffect(() => {
    const loadWishlist = async () => {
      try {
        const res = await wishlistApi.getAll();
        if (res.data && res.data.data) {
          const ids = new Set<number>(res.data.data.map((item: any) => item.product_id));
          setWishlistIds(ids);
        }
      } catch (e) {
        console.error('Wishlist load failed', e);
      }
    };
    loadWishlist();
  }, []);

  // Load products when page or search query changes
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        let response;

        if (debouncedSearch) {
          // Use search API when there is a query
          response = await productsApi.search(debouncedSearch, currentPage);
        } else {
          // Use standard getAll API when search is empty
          response = await productsApi.getAll({ page: currentPage, per_page: 12 });
        }

        if (response.data) {
          setProducts(response.data.products);
          setTotalPages(response.data.pagination.last_page);
        }
      } catch (error) {
        console.error('Failed to load products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [currentPage, debouncedSearch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleScan = (decodedText: string) => {
    setSearchQuery(decodedText);
    setIsScannerOpen(false);
  };

  const toggleWishlist = async (e: React.MouseEvent, productId: number) => {
    e.preventDefault();
    e.stopPropagation();

    const newSet = new Set(wishlistIds);
    if (newSet.has(productId)) {
      newSet.delete(productId);
    } else {
      newSet.add(productId);
    }
    setWishlistIds(newSet);

    try {
      await wishlistApi.toggle(productId);
    } catch (error) {
      console.error('Toggle wishlist failed', error);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(price);
  };

  return (
    <div className="space-y-6">
      {isScannerOpen && (
        <BarcodeScanner
          onScan={handleScan}
          onClose={() => setIsScannerOpen(false)}
        />
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ürünler</h1>
          <p className="text-gray-600 mt-1">Pazaryerindeki ürünleri keşfedin ve fiyatları karşılaştırın</p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative w-full md:w-80">
            <Input
              type="search"
              placeholder="Ürün adı veya barkod ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full text-gray-500 hover:text-gray-900"
              onClick={() => setIsScannerOpen(true)}
              title="Barkod Tara"
            >
              <ScanBarcode className="w-5 h-5" />
            </Button>
          </div>
          <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 hidden sm:flex">
            Ara
          </Button>
        </form>
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-40 w-full mb-4" />
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <Skeleton className="h-6 w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : products.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Ürün bulunamadı</h3>
            <p className="text-gray-500">
              "{searchQuery}" araması için sonuç bulunamadı.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Link key={product.id} href={`/products/${product.id}`}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group relative">
                  <button
                    onClick={(e) => toggleWishlist(e, product.id)}
                    className="absolute top-2 right-2 p-2 rounded-full bg-white/80 hover:bg-white text-gray-400 hover:text-red-500 transition-colors z-10"
                    title="Takip Listesine Ekle/Çıkar"
                  >
                    <Heart
                      className={`w-5 h-5 ${wishlistIds.has(product.id) ? 'fill-red-500 text-red-500' : ''}`}
                    />
                  </button>
                  <CardContent className="p-4">
                    {/* Product Image */}
                    <div className="aspect-square bg-gray-100 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-16 w-16 text-gray-300"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                          />
                        </svg>
                      )}
                    </div>

                    {/* Product Info */}
                    <div>
                      <h3 className="font-medium text-gray-900 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                        {product.name}
                      </h3>
                      {product.brand && (
                        <p className="text-sm text-gray-500 mt-1">{product.brand}</p>
                      )}

                      {/* Category Badge */}
                      {product.category && (
                        <Badge variant="secondary" className="mt-2">
                          {product.category.name}
                        </Badge>
                      )}

                      {/* Price & Offers */}
                      <div className="mt-4 flex items-center justify-between">
                        {product.lowest_price ? (
                          <div>
                            <p className="text-xs text-gray-500">En düşük fiyat</p>
                            <p className="text-lg font-bold text-emerald-600">
                              {formatPrice(product.lowest_price)}
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-400">Teklif yok</p>
                        )}
                        <Badge variant="outline">
                          {product.offers_count || 0} teklif
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <Button
                variant="outline"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Önceki
              </Button>
              <div className="flex items-center gap-2 hidden sm:flex">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let page = i + 1;
                  if (totalPages > 5) {
                    if (currentPage > 3) {
                      page = currentPage - 2 + i;
                    }
                    if (page > totalPages) page = -1;
                  }

                  if (page === -1 || page > totalPages) return null;

                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'default' : 'outline'}
                      onClick={() => setCurrentPage(page)}
                      className={currentPage === page ? 'bg-emerald-600' : ''}
                    >
                      {page}
                    </Button>
                  );
                })}
              </div>
              {/* Mobile pagination simple info */}
              <span className="flex items-center text-sm text-gray-600 sm:hidden">
                {currentPage} / {totalPages}
              </span>

              <Button
                variant="outline"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Sonraki
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
