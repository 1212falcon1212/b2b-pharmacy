'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { productsApi } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save, Package } from 'lucide-react';
import { toast } from 'sonner';

export default function NewProductPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        barcode: '',
        brand: '',
        manufacturer: '',
        description: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Simulated API call - replace with actual implementation
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success('Ürün başarıyla eklendi');
            router.push('/seller/products');
        } catch (error) {
            toast.error('Ürün eklenirken bir hata oluştu');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/seller/products">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Yeni Ürün Ekle</h1>
                    <p className="text-slate-500 dark:text-slate-400">Ürün bilgilerini girin</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <Card className="border-slate-200 dark:border-slate-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Package className="w-5 h-5 text-blue-600" />
                            Ürün Bilgileri
                        </CardTitle>
                        <CardDescription>Temel ürün bilgilerini doldurun</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <Label htmlFor="name">Ürün Adı *</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Örn: Vitamin C 1000mg 60 Tablet"
                                    required
                                    className="mt-1.5"
                                />
                            </div>
                            <div>
                                <Label htmlFor="barcode">Barkod *</Label>
                                <Input
                                    id="barcode"
                                    name="barcode"
                                    value={formData.barcode}
                                    onChange={handleChange}
                                    placeholder="8680000000000"
                                    required
                                    className="mt-1.5 font-mono"
                                />
                            </div>
                            <div>
                                <Label htmlFor="brand">Marka</Label>
                                <Input
                                    id="brand"
                                    name="brand"
                                    value={formData.brand}
                                    onChange={handleChange}
                                    placeholder="Örn: Solaray"
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
                                    placeholder="Örn: ABC İlaç San. A.Ş."
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
                                    placeholder="Ürün hakkında detaylı bilgi..."
                                    rows={4}
                                    className="mt-1.5"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-2 mt-6">
                    <Link href="/seller/products">
                        <Button type="button" variant="outline">İptal</Button>
                    </Link>
                    <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                        <Save className="w-4 h-4 mr-2" />
                        {isSubmitting ? 'Kaydediliyor...' : 'Ürünü Kaydet'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
