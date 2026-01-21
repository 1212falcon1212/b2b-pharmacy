'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { sellerApi, SellerOrderDetail, api, invoiceApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
    ArrowLeft,
    Package,
    Truck,
    CheckCircle,
    Clock,
    Printer,
    Loader2,
    ExternalLink,
    Receipt,
    Wallet,
    User,
    FileText
} from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    processing: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    shipped: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
    delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

export default function SellerOrderDetailPage() {
    const params = useParams();
    const orderId = Number(params.id);
    const [order, setOrder] = useState<SellerOrderDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isGeneratingLabel, setIsGeneratingLabel] = useState(false);
    const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);
    const [createdInvoice, setCreatedInvoice] = useState<{ id: number; invoice_number: string } | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        loadOrder();
    }, [orderId]);

    const loadOrder = async () => {
        setIsLoading(true);
        try {
            const response = await sellerApi.getOrderDetail(orderId);
            if (response.data?.data) {
                setOrder(response.data.data);
            }
        } catch (error) {
            console.error('Failed to load order:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const generateShippingLabel = async () => {
        setIsGeneratingLabel(true);
        setMessage(null);

        try {
            const response = await api.post<{ success: boolean; label_url?: string; tracking_number?: string; message?: string; error?: string }>(
                `/shipping/orders/${orderId}/test-label`
            );

            if (response.data?.success) {
                setMessage({ type: 'success', text: response.data.message || 'Kargo etiketi oluşturuldu!' });
                loadOrder();
            } else {
                setMessage({ type: 'error', text: response.data?.error || 'Etiket oluşturulamadı.' });
            }
        } catch (error) {
            console.error('Failed to generate label:', error);
            setMessage({ type: 'error', text: 'Etiket oluşturulurken bir hata oluştu.' });
        } finally {
            setIsGeneratingLabel(false);
        }
    };

    const openLabel = () => {
        if (order?.shipping_label_url) {
            const fullUrl = order.shipping_label_url.startsWith('http')
                ? order.shipping_label_url
                : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${order.shipping_label_url}`;
            window.open(fullUrl, '_blank');
        }
    };

    const createInvoice = async () => {
        setIsCreatingInvoice(true);
        setMessage(null);

        try {
            // Step 1: Create invoice
            const response = await invoiceApi.createForOrder(orderId);

            if (response.data?.success && response.data.invoice) {
                const invoice = response.data.invoice;
                setCreatedInvoice(invoice);

                // Step 2: Try to sync to BizimHesap ERP
                try {
                    const syncResponse = await invoiceApi.syncToErp(invoice.id);
                    if (syncResponse.data?.success) {
                        setMessage({
                            type: 'success',
                            text: `Fatura ${invoice.invoice_number} oluşturuldu ve BizimHesap'a senkronize edildi!`
                        });
                    } else {
                        setMessage({
                            type: 'success',
                            text: `Fatura ${invoice.invoice_number} oluşturuldu. (ERP senkronizasyonu beklemede)`
                        });
                    }
                } catch (syncError) {
                    // Invoice created but ERP sync failed - still show success
                    setMessage({
                        type: 'success',
                        text: `Fatura ${invoice.invoice_number} oluşturuldu. ERP senkronizasyonu daha sonra yapılabilir.`
                    });
                }
            } else {
                setMessage({ type: 'error', text: response.data?.message || 'Fatura oluşturulamadı.' });
            }
        } catch (error) {
            console.error('Failed to create invoice:', error);
            setMessage({ type: 'error', text: 'Fatura oluşturulurken bir hata oluştu.' });
        } finally {
            setIsCreatingInvoice(false);
        }
    };

    const formatDate = (date: string) => {
        return new Intl.DateTimeFormat('tr-TR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(new Date(date));
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-48" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Skeleton className="h-64" />
                        <Skeleton className="h-48" />
                    </div>
                    <div className="space-y-6">
                        <Skeleton className="h-48" />
                        <Skeleton className="h-64" />
                    </div>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <Card>
                <CardContent className="py-12 text-center">
                    <Package className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Sipariş Bulunamadı</h2>
                    <Link href="/seller/orders">
                        <Button>Siparişlere Dön</Button>
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
                    <Link href="/seller/orders">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{order.order_number}</h1>
                        <p className="text-slate-500 dark:text-slate-400">{formatDate(order.created_at)}</p>
                    </div>
                </div>
                <Badge className={STATUS_COLORS[order.status]}>
                    {order.status_label}
                </Badge>
            </div>

            {/* Message */}
            {message && (
                <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'}`}>
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Order Items & Financial Breakdown */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Order Items */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="w-5 h-5 text-blue-600" />
                                Sipariş Kalemleri
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {order.items?.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                                                <Package className="w-6 h-6 text-slate-400" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900 dark:text-white">{item.product_name}</p>
                                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                                    <span>{item.quantity} adet × ₺{item.unit_price.toFixed(2)}</span>
                                                    {item.desi && <span className="text-xs">({item.desi} desi)</span>}
                                                </div>
                                            </div>
                                        </div>
                                        <p className="font-bold text-slate-900 dark:text-white">₺{item.total_price.toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Financial Breakdown - FEE DISPLAY */}
                    <Card className="border-2 border-blue-200 dark:border-blue-800">
                        <CardHeader className="bg-blue-50/50 dark:bg-blue-900/20">
                            <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                                <Wallet className="w-5 h-5" />
                                Kesinti ve Hakediş Detayı
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="space-y-3">
                                {/* Subtotal */}
                                <div className="flex justify-between text-lg">
                                    <span className="text-slate-700 dark:text-slate-300">{order.financials.subtotal.label}</span>
                                    <span className="font-semibold text-slate-900 dark:text-white">{order.financials.subtotal.formatted}</span>
                                </div>

                                <Separator />

                                {/* Deductions */}
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Kesintiler</p>
                                    {order.financials.deductions
                                        .filter(d => d.visible !== false && d.value > 0)
                                        .map((deduction, index) => (
                                            <div key={index} className="flex justify-between text-sm">
                                                <span className="text-slate-600 dark:text-slate-400">
                                                    {deduction.label}
                                                    {deduction.rate && <span className="text-xs ml-1">(%{deduction.rate})</span>}
                                                </span>
                                                <span className="text-red-600 dark:text-red-400">{deduction.formatted}</span>
                                            </div>
                                        ))
                                    }
                                </div>

                                <Separator />

                                {/* Total Deductions */}
                                <div className="flex justify-between text-sm font-medium">
                                    <span className="text-slate-700 dark:text-slate-300">{order.financials.total_deductions.label}</span>
                                    <span className="text-red-600 dark:text-red-400">{order.financials.total_deductions.formatted}</span>
                                </div>

                                <Separator className="border-2" />

                                {/* Net Amount */}
                                <div className="flex justify-between text-xl font-bold bg-green-50 dark:bg-green-900/20 -mx-4 px-4 py-3 rounded-lg">
                                    <span className="text-green-700 dark:text-green-400">{order.financials.net_amount.label}</span>
                                    <span className="text-green-600 dark:text-green-400">{order.financials.net_amount.formatted}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Order Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Sipariş İşlemleri</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-3">
                                {order.status === 'pending' && (
                                    <Button className="bg-green-600 hover:bg-green-700">
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Onayla
                                    </Button>
                                )}
                                {order.can_create_label && (
                                    <Button
                                        onClick={generateShippingLabel}
                                        disabled={isGeneratingLabel}
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        {isGeneratingLabel ? (
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        ) : (
                                            <Printer className="w-4 h-4 mr-2" />
                                        )}
                                        Kargo Barkodu Oluştur
                                    </Button>
                                )}
                                {order.shipping_label_url && (
                                    <>
                                        <Button
                                            onClick={openLabel}
                                            className="bg-indigo-600 hover:bg-indigo-700"
                                        >
                                            <ExternalLink className="w-4 h-4 mr-2" />
                                            Kargo Etiketini Aç
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => window.print()}
                                        >
                                            <Printer className="w-4 h-4 mr-2" />
                                            Yazdır
                                        </Button>
                                    </>
                                )}
                                {order.can_create_invoice && !createdInvoice && (
                                    <Button
                                        variant="outline"
                                        onClick={createInvoice}
                                        disabled={isCreatingInvoice}
                                    >
                                        {isCreatingInvoice ? (
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        ) : (
                                            <FileText className="w-4 h-4 mr-2" />
                                        )}
                                        Fatura Oluştur (BizimHesap)
                                    </Button>
                                )}
                                {createdInvoice && (
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                            ✓ Fatura Oluşturuldu: {createdInvoice.invoice_number}
                                        </Badge>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => window.open(`/seller/invoices/${createdInvoice.id}`, '_blank')}
                                        >
                                            Görüntüle
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* Tracking Info */}
                            {order.tracking_number && (
                                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Takip Numarası</p>
                                            <p className="text-lg font-mono font-bold text-blue-700 dark:text-blue-300">{order.tracking_number}</p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => navigator.clipboard.writeText(order.tracking_number!)}
                                        >
                                            Kopyala
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Buyer & Shipping Info */}
                <div className="space-y-6">
                    {/* Buyer Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="w-5 h-5 text-blue-600" />
                                Alıcı Bilgileri
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <p className="text-sm text-slate-500">İsim</p>
                                <p className="font-medium text-slate-900 dark:text-white">{order.buyer.name}</p>
                            </div>
                            {order.buyer.phone && (
                                <div>
                                    <p className="text-sm text-slate-500">Telefon</p>
                                    <p className="font-medium text-slate-900 dark:text-white">{order.buyer.phone}</p>
                                </div>
                            )}
                            {order.buyer.city && (
                                <div>
                                    <p className="text-sm text-slate-500">Şehir</p>
                                    <p className="font-medium text-slate-900 dark:text-white">{order.buyer.city} {order.buyer.district}</p>
                                </div>
                            )}
                            {order.buyer.address && (
                                <div>
                                    <p className="text-sm text-slate-500">Adres</p>
                                    <p className="text-slate-700 dark:text-slate-300 text-sm">{order.buyer.address}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Shipping Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Truck className="w-5 h-5 text-blue-600" />
                                Kargo Bilgileri
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {order.shipping_provider && (
                                <div>
                                    <p className="text-sm text-slate-500">Kargo Şirketi</p>
                                    <p className="font-medium text-slate-900 dark:text-white uppercase">{order.shipping_provider}</p>
                                </div>
                            )}
                            <div>
                                <p className="text-sm text-slate-500">Durum</p>
                                <Badge className={STATUS_COLORS[order.status]}>{order.status_label}</Badge>
                            </div>
                            {order.shipped_at && (
                                <div>
                                    <p className="text-sm text-slate-500">Kargoya Verildi</p>
                                    <p className="font-medium text-slate-900 dark:text-white">{formatDate(order.shipped_at)}</p>
                                </div>
                            )}
                            {order.delivered_at && (
                                <div>
                                    <p className="text-sm text-slate-500">Teslim Edildi</p>
                                    <p className="font-medium text-slate-900 dark:text-white">{formatDate(order.delivered_at)}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Order Timeline */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="w-5 h-5 text-blue-600" />
                                Sipariş Geçmişi
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-900 dark:text-white">Sipariş oluşturuldu</p>
                                        <p className="text-xs text-slate-500">{formatDate(order.created_at)}</p>
                                    </div>
                                </div>
                                {order.tracking_number && (
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-900 dark:text-white">Kargo etiketi oluşturuldu</p>
                                            <p className="text-xs text-slate-500">{order.tracking_number}</p>
                                        </div>
                                    </div>
                                )}
                                {order.shipped_at && (
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-900 dark:text-white">Kargoya verildi</p>
                                            <p className="text-xs text-slate-500">{formatDate(order.shipped_at)}</p>
                                        </div>
                                    </div>
                                )}
                                {order.delivered_at && (
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-900 dark:text-white">Teslim edildi</p>
                                            <p className="text-xs text-slate-500">{formatDate(order.delivered_at)}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
