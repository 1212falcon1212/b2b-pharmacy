'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { productsApi, offersApi, Product } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Search, Package, Tag, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function NewOfferPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        price: '',
        stock: '',
        expiry_date: '',
        batch_number: '',
        notes: '',
    });

    const searchProducts = async () => {
        if (searchQuery.length < 2) return;
        setIsSearching(true);
        try {
            const response = await productsApi.search(searchQuery);
            if (response.data?.products) {
                setProducts(response.data.products);
            }
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setIsSearching(false);
        }
    };

    useEffect(() => {
        const debounce = setTimeout(() => {
            if (searchQuery.length >= 2) {
                searchProducts();
            }
        }, 300);
        return () => clearTimeout(debounce);
    }, [searchQuery]);

    const handleSelectProduct = (product: Product) => {
        setSelectedProduct(product);
        setStep(2);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProduct) return;

        setIsSubmitting(true);
        try {
            const response = await offersApi.create({
                product_id: selectedProduct.id,
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock),
                expiry_date: formData.expiry_date,
                batch_number: formData.batch_number,
                notes: formData.notes || undefined,
            });

            if (response.data) {
                toast.success('Teklif basariyla olusturuldu!');
                router.push('/seller/offers');
            } else {
                toast.error(response.error || 'Teklif olusturulamadi');
            }
        } catch (error) {
            toast.error('Bir hata olustu');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/seller/offers">
                    <Button variant="ghost" size="icon" className="rounded-xl">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Yeni Teklif Olustur</h1>
                    <p className="text-slate-500 dark:text-slate-400">Stokta olan bir urun icin satis teklifi verin</p>
                </div>
            </div>

            {/* Progress */}
            <div className="flex items-center gap-3">
                <motion.div
                    className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm ${
                        step >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500 dark:bg-slate-700'
                    }`}
                    animate={{ scale: step === 1 ? 1.1 : 1 }}
                >
                    {step > 1 ? <Check className="w-5 h-5" /> : '1'}
                </motion.div>
                <div className={`flex-1 h-1 rounded ${step > 1 ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`} />
                <motion.div
                    className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm ${
                        step >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500 dark:bg-slate-700'
                    }`}
                    animate={{ scale: step === 2 ? 1.1 : 1 }}
                >
                    2
                </motion.div>
            </div>

            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <Card className="border-slate-200 dark:border-slate-800">
                            <CardHeader>
                                <CardTitle>Urun Secin</CardTitle>
                                <CardDescription>Teklif vermek istediginiz urunu arayin ve secin</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <Input
                                        placeholder="Urun adi veya barkod ile ara..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10 h-12"
                                    />
                                </div>

                                {isSearching && (
                                    <div className="flex items-center justify-center py-8">
                                        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                                    </div>
                                )}

                                {!isSearching && products.length > 0 && (
                                    <div className="space-y-2 max-h-96 overflow-y-auto">
                                        {products.map((product) => (
                                            <motion.button
                                                key={product.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                onClick={() => handleSelectProduct(product)}
                                                className="w-full flex items-center gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all text-left"
                                            >
                                                <div className="w-14 h-14 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                                                    <Package className="w-6 h-6 text-slate-400" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-slate-900 dark:text-white truncate">{product.name}</p>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                                        {product.brand && `${product.brand} • `}
                                                        {product.barcode}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    {product.lowest_price && (
                                                        <p className="text-sm text-slate-500">
                                                            En dusuk: <span className="font-bold text-blue-600">{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(product.lowest_price)}</span>
                                                        </p>
                                                    )}
                                                </div>
                                            </motion.button>
                                        ))}
                                    </div>
                                )}

                                {!isSearching && searchQuery.length >= 2 && products.length === 0 && (
                                    <div className="text-center py-8 text-slate-500">
                                        <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                        <p>Aramanizla eslesen urun bulunamadi</p>
                                    </div>
                                )}

                                {!isSearching && searchQuery.length < 2 && (
                                    <div className="text-center py-8 text-slate-500">
                                        <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                        <p>Aramaya baslamak icin en az 2 karakter girin</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {step === 2 && selectedProduct && (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                    >
                        <Card className="border-slate-200 dark:border-slate-800">
                            <CardHeader>
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center border border-blue-100 dark:border-blue-800">
                                        <Tag className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <CardTitle>{selectedProduct.name}</CardTitle>
                                        <CardDescription>
                                            {selectedProduct.brand && `${selectedProduct.brand} • `}
                                            Barkod: {selectedProduct.barcode}
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="price">Satis Fiyati (TL) *</Label>
                                            <Input
                                                id="price"
                                                type="number"
                                                step="0.01"
                                                placeholder="0.00"
                                                value={formData.price}
                                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                                required
                                                className="h-12"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="stock">Stok Adedi *</Label>
                                            <Input
                                                id="stock"
                                                type="number"
                                                placeholder="0"
                                                value={formData.stock}
                                                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                                required
                                                className="h-12"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="expiry_date">Son Kullanma Tarihi *</Label>
                                            <Input
                                                id="expiry_date"
                                                type="date"
                                                value={formData.expiry_date}
                                                onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                                                required
                                                className="h-12"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="batch_number">Parti Numarasi *</Label>
                                            <Input
                                                id="batch_number"
                                                placeholder="ABC123"
                                                value={formData.batch_number}
                                                onChange={(e) => setFormData({ ...formData, batch_number: e.target.value })}
                                                required
                                                className="h-12"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="notes">Notlar (Istege bagli)</Label>
                                        <Textarea
                                            id="notes"
                                            placeholder="Ek bilgi veya aciklama..."
                                            value={formData.notes}
                                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                            rows={3}
                                        />
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setStep(1)}
                                            className="flex-1 h-12"
                                        >
                                            <ArrowLeft className="w-4 h-4 mr-2" />
                                            Geri
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Olusturuluyor...
                                                </>
                                            ) : (
                                                <>
                                                    <Check className="w-4 h-4 mr-2" />
                                                    Teklif Olustur
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
