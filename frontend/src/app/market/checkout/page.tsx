'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/stores/useCartStore';
import { useAuth } from '@/contexts/AuthContext';
import { ordersApi, CreateOrderData, ShippingAddress, shippingApi, ShippingOption } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, ShoppingCart, MapPin, AlertCircle, Check, Truck, Gift, Shield, CreditCard, Package } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function CheckoutPage() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const {
        items,
        itemsBySeller,
        total,
        itemCount,
        fetchCart,
        validateCart,
        validationIssues,
    } = useCartStore();

    const [isLoading, setIsLoading] = useState(false);
    const [address, setAddress] = useState<ShippingAddress>({
        name: '',
        phone: '',
        address: '',
        city: '',
        district: '',
        postal_code: '',
    });
    const [notes, setNotes] = useState('');

    // Shipping state
    const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
    const [selectedShipping, setSelectedShipping] = useState<string>('');
    const [shippingCost, setShippingCost] = useState<number>(0);
    const [loadingShipping, setLoadingShipping] = useState(false);

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login?redirect=/market/checkout');
        }
    }, [authLoading, isAuthenticated, router]);

    useEffect(() => {
        fetchCart();
        validateCart();
    }, [fetchCart, validateCart]);

    useEffect(() => {
        if (user) {
            setAddress({
                name: user.pharmacy_name || '',
                phone: user.phone || '',
                address: user.address || '',
                city: user.city || '',
                district: '',
                postal_code: '',
            });
        }
    }, [user]);

    // Fetch shipping options when cart changes
    useEffect(() => {
        const fetchShippingOptions = async () => {
            if (total <= 0 || items.length === 0) return;

            setLoadingShipping(true);
            try {
                // Calculate total desi from cart items (default to 1 if not available)
                const totalDesi = items.reduce((sum, item) => {
                    const desi = (item.product as any).desi || 0.5;
                    return sum + (desi * item.quantity);
                }, 0) || 1;

                const response = await shippingApi.getOptions(totalDesi, total);
                if (response.data?.options && response.data.options.length > 0) {
                    setShippingOptions(response.data.options);
                    // Auto-select first option (cheapest)
                    setSelectedShipping(response.data.options[0].provider);
                    setShippingCost(response.data.options[0].price);
                }
            } catch (error) {
                console.error('Failed to fetch shipping options:', error);
            } finally {
                setLoadingShipping(false);
            }
        };

        fetchShippingOptions();
    }, [total, items]);

    const handleShippingChange = (provider: string) => {
        setSelectedShipping(provider);
        const option = shippingOptions.find(o => o.provider === provider);
        if (option) {
            setShippingCost(option.price);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
        }).format(price);
    };

    const hasCriticalIssues = validationIssues.some(
        (i) => i.type === 'unavailable' || i.type === 'stock'
    );

    const grandTotal = total + shippingCost;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (hasCriticalIssues) {
            toast.error('Sepetinizdeki sorunları çözmeniz gerekiyor.');
            return;
        }

        if (!address.name || !address.phone || !address.address || !address.city) {
            toast.error('Lütfen tüm zorunlu alanları doldurun.');
            return;
        }

        if (!selectedShipping) {
            toast.error('Lütfen bir kargo firması seçin.');
            return;
        }

        setIsLoading(true);
        try {
            const data: CreateOrderData = {
                shipping_address: address,
                notes: notes || undefined,
                shipping_provider: selectedShipping,
                shipping_cost: shippingCost,
            };

            const response = await ordersApi.create(data);

            if (response.data) {
                toast.success('Siparişiniz başarıyla oluşturuldu!');
                router.push(`/account/orders/${response.data.order.id}`);
            } else if (response.error) {
                toast.error(response.error);
            }
        } catch (error) {
            toast.error('Sipariş oluşturulurken bir hata oluştu.');
        } finally {
            setIsLoading(false);
        }
    };

    // Loading state
    if (authLoading) {
        return (
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-64"></div>
                    <div className="grid gap-6 lg:grid-cols-3">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-2xl"></div>
                            <div className="h-48 bg-slate-200 dark:bg-slate-700 rounded-2xl"></div>
                        </div>
                        <div className="h-96 bg-slate-200 dark:bg-slate-700 rounded-2xl"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (itemCount === 0) {
        return (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-12 text-center">
                    <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShoppingCart className="h-10 w-10 text-slate-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Sepetiniz Bos</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
                        Siparis vermek icin once sepetinize urun ekleyin.
                    </p>
                    <Button asChild size="lg" className="bg-gradient-to-r from-[#059669] to-[#047857] hover:from-[#047857] hover:to-[#065f46]">
                        <Link href="/market">Urunlere Goz At</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Breadcrumb */}
            <div className="mb-6">
                <Button variant="ghost" asChild className="gap-2 text-slate-600 dark:text-slate-400 hover:text-[#059669] -ml-4">
                    <Link href="/market">
                        <ArrowLeft className="h-4 w-4" />
                        Alisverise Devam Et
                    </Link>
                </Button>
            </div>

            {/* Page Title */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Siparisi Tamamla</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Teslimat bilgilerinizi girin ve siparisinizi onaylayin.</p>
            </div>

            {hasCriticalIssues && (
                <Alert variant="destructive" className="mb-6 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Sepetinizde stok sorunlari var. Lutfen sepetinizi kontrol edin.
                    </AlertDescription>
                </Alert>
            )}

            <form onSubmit={handleSubmit}>
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left Column - Address & Shipping */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Shipping Address */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-[#059669]" />
                                    Teslimat Adresi
                                </h2>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="text-slate-700 dark:text-slate-300">Eczane / Firma Adi *</Label>
                                        <Input
                                            id="name"
                                            value={address.name}
                                            onChange={(e) => setAddress({ ...address, name: e.target.value })}
                                            required
                                            className="h-11 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="phone" className="text-slate-700 dark:text-slate-300">Telefon *</Label>
                                        <Input
                                            id="phone"
                                            value={address.phone}
                                            onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                                            required
                                            className="h-11 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="address" className="text-slate-700 dark:text-slate-300">Adres *</Label>
                                    <Input
                                        id="address"
                                        value={address.address}
                                        onChange={(e) => setAddress({ ...address, address: e.target.value })}
                                        required
                                        className="h-11 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="city" className="text-slate-700 dark:text-slate-300">Il *</Label>
                                        <Input
                                            id="city"
                                            value={address.city}
                                            onChange={(e) => setAddress({ ...address, city: e.target.value })}
                                            required
                                            className="h-11 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="district" className="text-slate-700 dark:text-slate-300">Ilce</Label>
                                        <Input
                                            id="district"
                                            value={address.district || ''}
                                            onChange={(e) => setAddress({ ...address, district: e.target.value })}
                                            className="h-11 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="notes" className="text-slate-700 dark:text-slate-300">Siparis Notu</Label>
                                    <Input
                                        id="notes"
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Istege bagli"
                                        className="h-11 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Shipping Options */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Truck className="h-5 w-5 text-[#059669]" />
                                    Kargo Secimi
                                </h2>
                            </div>
                            <div className="p-6">
                                {loadingShipping ? (
                                    <div className="flex items-center justify-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#059669]"></div>
                                    </div>
                                ) : shippingOptions.length > 0 ? (
                                    <RadioGroup
                                        value={selectedShipping}
                                        onValueChange={handleShippingChange}
                                        className="space-y-3"
                                    >
                                        {shippingOptions.map((option) => (
                                            <div
                                                key={option.provider}
                                                className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedShipping === option.provider
                                                    ? 'border-[#059669] bg-[#059669]/5 dark:bg-[#059669]/10'
                                                    : 'border-slate-200 dark:border-slate-600 hover:border-[#059669]/50'
                                                    }`}
                                                onClick={() => handleShippingChange(option.provider)}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <RadioGroupItem value={option.provider} id={option.provider} className="text-[#059669]" />
                                                    <div>
                                                        <Label htmlFor={option.provider} className="text-base font-medium cursor-pointer text-slate-900 dark:text-white">
                                                            {option.name}
                                                        </Label>
                                                        {option.remaining_for_free_formatted && !option.is_free && (
                                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                                {option.remaining_for_free_formatted}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    {option.is_free ? (
                                                        <Badge variant="secondary" className="bg-[#059669]/10 text-[#059669] dark:bg-[#059669]/20">
                                                            <Gift className="h-3 w-3 mr-1" />
                                                            Ucretsiz
                                                        </Badge>
                                                    ) : (
                                                        <span className="font-semibold text-lg text-slate-900 dark:text-white">{option.formatted_price}</span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                ) : (
                                    <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                                        <Truck className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                        <p>Kargo secenekleri hesaplaniyor...</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Trust Badges */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                <Shield className="h-6 w-6 text-[#059669]" />
                                <div>
                                    <p className="text-sm font-medium text-slate-900 dark:text-white">Guvenli Alisveris</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">256-bit SSL</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                <CreditCard className="h-6 w-6 text-[#0284c7]" />
                                <div>
                                    <p className="text-sm font-medium text-slate-900 dark:text-white">Guvenli Odeme</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Tum kartlar</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                <Package className="h-6 w-6 text-[#059669]" />
                                <div>
                                    <p className="text-sm font-medium text-slate-900 dark:text-white">Hizli Teslimat</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">1-3 is gunu</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Order Summary */}
                    <div>
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden sticky top-24">
                            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                    <ShoppingCart className="h-5 w-5 text-[#059669]" />
                                    Siparis Ozeti
                                </h2>
                            </div>
                            <div className="p-6 space-y-4">
                                {itemsBySeller.map((group) => (
                                    <div key={group.seller.id} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium text-sm text-slate-900 dark:text-white">{group.seller.pharmacy_name}</span>
                                            {group.seller.city && (
                                                <Badge variant="outline" className="text-xs border-slate-200 dark:border-slate-600">{group.seller.city}</Badge>
                                            )}
                                        </div>

                                        {group.items.map((item) => (
                                            <div key={item.id} className="flex justify-between text-sm text-slate-500 dark:text-slate-400">
                                                <span className="truncate max-w-[160px]">
                                                    {item.product.name} x {item.quantity}
                                                </span>
                                                <span>{formatPrice(item.price_at_addition * item.quantity)}</span>
                                            </div>
                                        ))}

                                        <Separator className="bg-slate-200 dark:bg-slate-700" />
                                    </div>
                                ))}

                                <div className="space-y-2 pt-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600 dark:text-slate-400">Ara Toplam:</span>
                                        <span className="text-slate-900 dark:text-white">{formatPrice(total)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600 dark:text-slate-400">Kargo:</span>
                                        <span className={shippingCost === 0 ? 'text-[#059669] font-medium' : 'text-slate-900 dark:text-white'}>
                                            {shippingCost === 0 ? 'Ucretsiz' : formatPrice(shippingCost)}
                                        </span>
                                    </div>
                                    <Separator className="bg-slate-200 dark:bg-slate-700" />
                                    <div className="flex justify-between text-lg font-bold">
                                        <span className="text-slate-900 dark:text-white">Toplam:</span>
                                        <span className="text-[#059669]">{formatPrice(grandTotal)}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 pt-0">
                                <Button
                                    type="submit"
                                    className="w-full h-12 bg-gradient-to-r from-[#059669] to-[#047857] hover:from-[#047857] hover:to-[#065f46] text-white font-semibold rounded-xl shadow-lg shadow-[#059669]/20"
                                    size="lg"
                                    disabled={isLoading || hasCriticalIssues || !selectedShipping}
                                >
                                    {isLoading ? (
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                                    ) : (
                                        <Check className="h-4 w-4 mr-2" />
                                    )}
                                    Siparisi Onayla
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
