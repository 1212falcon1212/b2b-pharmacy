'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { productsApi, Product, offersApi } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Save, Package, Tag, Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

export default function ProductDetailPage() {
    const params = useParams();
    const router = useRouter();
    const productId = Number(params.id);

    const [product, setProduct] = useState<Product | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        barcode: '',
        brand: '',
        manufacturer: '',
        description: '',
    });

    useEffect(() => {
        loadProduct();
    }, [productId]);

    const loadProduct = async () => {
        setIsLoading(true);
        try {
            const response = await productsApi.getOffers(productId);
            if (response.data?.product) {
                const p = response.data.product;
                setProduct(p);
                setFormData({
                    name: p.name || '',
                    barcode: p.barcode || '',
                    brand: p.brand || '',
                    manufacturer: p.manufacturer || '',
                    description: p.description || '',
                });
            }
        } catch (error) {
            console.error('Failed to load product:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success('Ürün başarıyla güncellendi');
        } catch (error) {
            toast.error('Ürün güncellenirken bir hata oluştu');
        } finally {
            setIsSubmitting(false);
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
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-64" />
            </div>
        );
    }

    if (!product) {
        return (
            <Card>
                <CardContent className="py-12 text-center">
                    <Package className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Ürün Bulunamadı</h2>
                    <Link href="/seller/products">
                        <Button>Ürünlere Dön</Button>
                    </Link>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/seller/products">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{product.name}</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-mono text-sm">{product.barcode}</p>
                    </div>
                </div>
                <Button className="bg-green-600 hover:bg-green-700">
                    <Tag className="w-4 h-4 mr-2" />
                    Teklif Ver
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Product Form */}
                <div className="lg:col-span-2">
                    <form onSubmit={handleSubmit}>
                        <Card className="border-slate-200 dark:border-slate-800">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="w-5 h-5 text-blue-600" />
                                    Ürün Bilgileri
                                </CardTitle>
                                <CardDescription>Ürün detaylarını düzenleyin</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <Label htmlFor="name">Ürün Adı</Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="mt-1.5"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="barcode">Barkod</Label>
                                        <Input
                                            id="barcode"
                                            name="barcode"
                                            value={formData.barcode}
                                            onChange={handleChange}
                                            className="mt-1.5 font-mono"
                                            disabled
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="brand">Marka</Label>
                                        <Input
                                            id="brand"
                                            name="brand"
                                            value={formData.brand}
                                            onChange={handleChange}
                                            className="mt-1.5"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <Label htmlFor="manufacturer">Üretici</Label>
                                        <Input
                                            id="manufacturer"
                                            name="manufacturer"
                                            value={formData.manufacturer}
                                            onChange={handleChange}
                                            className="mt-1.5"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <Label htmlFor="description">Açıklama</Label>
                                        <Textarea
                                            id="description"
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            rows={4}
                                            className="mt-1.5"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4">
                                    <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                                        <Save className="w-4 h-4 mr-2" />
                                        {isSubmitting ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </form>
                </div>

                {/* Product Stats */}
                <div className="space-y-6">
                    <Card className="border-slate-200 dark:border-slate-800">
                        <CardHeader>
                            <CardTitle>Ürün İstatistikleri</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-slate-500 dark:text-slate-400">Toplam Teklif</span>
                                <span className="font-bold text-slate-900 dark:text-white">{product.offers_count || 0}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between">
                                <span className="text-slate-500 dark:text-slate-400">Kategori</span>
                                <Badge variant="secondary">{product.category?.name || 'Belirtilmemiş'}</Badge>
                            </div>
                            <Separator />
                            <div className="flex justify-between">
                                <span className="text-slate-500 dark:text-slate-400">En Düşük Fiyat</span>
                                <span className="font-bold text-blue-600">{product.lowest_price ? formatPrice(product.lowest_price) : '-'}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 dark:border-slate-800">
                        <CardHeader>
                            <CardTitle>Hızlı İşlemler</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button variant="outline" className="w-full justify-start">
                                <Tag className="w-4 h-4 mr-2" />
                                Teklif Ver
                            </Button>
                            <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Ürünü Sil
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
