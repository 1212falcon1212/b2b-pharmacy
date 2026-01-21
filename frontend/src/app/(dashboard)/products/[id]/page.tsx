'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { productsApi, Product, Offer } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
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

export default function ProductDetailPage() {
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

    // Load product and offers
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">Ürün bulunamadı</h3>
          <p className="text-gray-500 mb-4">İstediğiniz ürün mevcut değil.</p>
          <Link href="/products">
            <Button>Ürünlere Dön</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/products">
        <Button variant="ghost" className="gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Geri
        </Button>
      </Link>

      {/* Product Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Product Image */}
        <Card>
          <CardContent className="p-6">
            <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-24 w-24 text-gray-300"
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
          </CardContent>
        </Card>

        {/* Product Info */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {product.category && (
                <Badge variant="secondary">{product.category.name}</Badge>
              )}
              {product.brand && (
                <Badge variant="outline">{product.brand}</Badge>
              )}
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            {product.manufacturer && (
              <p className="text-gray-500 mt-2">Üretici: {product.manufacturer}</p>
            )}
            <p className="text-sm text-gray-400 font-mono mt-1">
              Barkod: {product.barcode}
            </p>
          </div>

          {product.description && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Açıklama</h3>
              <p className="text-gray-600">{product.description}</p>
            </div>
          )}

          {/* Best Price Highlight */}
          {offers.length > 0 && offers[0] && (
            <Card className="relative overflow-hidden border-2 border-emerald-400 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 shadow-lg">
              {/* Best Price Badge */}
              <div className="absolute -right-12 top-4 rotate-45 bg-emerald-500 px-12 py-1 text-xs font-bold text-white shadow-md">
                EN UYGUN
              </div>

              <CardContent className="p-6">
                <div className="flex items-start gap-6">
                  {/* Trophy Icon */}
                  <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                      />
                    </svg>
                  </div>

                  {/* Best Offer Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 bg-emerald-500 text-white text-xs font-bold rounded-full animate-pulse">
                        #1 EN UYGUN FİYAT
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {offers[0].seller?.pharmacy_name}
                    </h3>
                    <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {offers[0].seller?.city || 'Belirtilmemiş'}
                      <span className="text-gray-400">•</span>
                      <span className="text-emerald-600 font-medium">{offers[0].stock} adet stok</span>
                    </p>
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    <p className="text-sm text-emerald-700 font-medium">Birim Fiyat</p>
                    <p className="text-4xl font-extrabold text-emerald-600 tracking-tight">
                      {formatPrice(offers[0].price)}
                    </p>
                    {highestPrice && highestPrice > offers[0].price && (
                      <p className="text-sm text-emerald-600 mt-1">
                        <span className="line-through text-gray-400 mr-2">
                          {formatPrice(highestPrice)}
                        </span>
                        <span className="bg-emerald-100 px-2 py-0.5 rounded text-emerald-700 font-medium">
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
            <Card className="text-center">
              <CardContent className="p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wide">En Düşük</p>
                <p className="text-xl font-bold text-emerald-600">
                  {lowestPrice ? formatPrice(lowestPrice) : '-'}
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wide">En Yüksek</p>
                <p className="text-xl font-bold text-gray-700">
                  {highestPrice ? formatPrice(highestPrice) : '-'}
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Toplam Teklif</p>
                <p className="text-xl font-bold text-gray-700">
                  {offers.length}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Offers Table - Cimri Model */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-emerald-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
              />
            </svg>
            Fiyat Karşılaştırma
          </CardTitle>
          <CardDescription>
            Bu ürün için mevcut teklifler (en düşük fiyattan en yükseğe)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {offers.length === 0 ? (
            <div className="text-center py-12">
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
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Henüz teklif yok
              </h3>
              <p className="text-gray-500">
                Bu ürün için henüz bir satış teklifi bulunmuyor.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/80">
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
                        index === 0 && 'bg-gradient-to-r from-emerald-50 to-teal-50 border-l-4 border-l-emerald-500',
                        index > 0 && 'hover:bg-gray-50'
                      )}
                    >
                      <TableCell className="text-center">
                        {index === 0 ? (
                          <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-white font-bold shadow-sm">
                            1
                          </div>
                        ) : index === 1 ? (
                          <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-200 text-gray-600 font-semibold text-sm">
                            2
                          </div>
                        ) : index === 2 ? (
                          <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-100 text-amber-700 font-semibold text-sm">
                            3
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">{index + 1}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {index === 0 && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          )}
                          <span className={cn('font-medium', index === 0 && 'text-emerald-700')}>
                            {offer.seller?.pharmacy_name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-gray-600">{offer.seller?.city || '-'}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant="outline"
                          className={cn(
                            'font-medium',
                            offer.stock > 50 && 'bg-emerald-50 text-emerald-700 border-emerald-200',
                            offer.stock > 10 && offer.stock <= 50 && 'bg-blue-50 text-blue-700 border-blue-200',
                            offer.stock > 0 && offer.stock <= 10 && 'bg-amber-50 text-amber-700 border-amber-200',
                            offer.stock === 0 && 'bg-red-50 text-red-700 border-red-200'
                          )}
                        >
                          {offer.stock} adet
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-gray-600 text-sm">{formatDate(offer.expiry_date)}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-col items-end">
                          <span className={cn(
                            'font-bold',
                            index === 0 ? 'text-emerald-600 text-xl' : 'text-gray-900 text-lg'
                          )}>
                            {formatPrice(offer.price)}
                          </span>
                          {index > 0 && lowestPrice && (
                            <span className="text-xs text-gray-400">
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

