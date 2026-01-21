'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, XCircle, AlertTriangle, ShoppingBag, ArrowRight } from 'lucide-react';
import { Suspense } from 'react';

function PaymentResultContent() {
    const searchParams = useSearchParams();
    const status = searchParams.get('status');
    const orderId = searchParams.get('order');

    if (status === 'success') {
        return (
            <div className="container max-w-2xl py-12">
                <Card className="border-green-200 bg-green-50">
                    <CardHeader className="text-center pb-2">
                        <div className="flex justify-center mb-4">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="h-12 w-12 text-green-600" />
                            </div>
                        </div>
                        <CardTitle className="text-2xl text-green-800">Ödeme Başarılı!</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center space-y-6">
                        <p className="text-green-700">
                            Siparişiniz başarıyla oluşturuldu ve ödemeniz alındı.
                        </p>

                        <Alert className="bg-green-100 border-green-300 text-left">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <AlertTitle className="text-green-800">Sipariş Onaylandı</AlertTitle>
                            <AlertDescription className="text-green-700">
                                Siparişiniz satıcıya iletildi. En kısa sürede hazırlanacaktır.
                            </AlertDescription>
                        </Alert>

                        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                            {orderId && (
                                <Button asChild className="bg-green-600 hover:bg-green-700">
                                    <Link href={`/orders/${orderId}`}>
                                        <ShoppingBag className="h-4 w-4 mr-2" />
                                        Sipariş Detayı
                                    </Link>
                                </Button>
                            )}
                            <Button asChild variant="outline">
                                <Link href="/products">
                                    Alışverişe Devam Et
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (status === 'failed') {
        return (
            <div className="container max-w-2xl py-12">
                <Card className="border-red-200 bg-red-50">
                    <CardHeader className="text-center pb-2">
                        <div className="flex justify-center mb-4">
                            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                                <XCircle className="h-12 w-12 text-red-600" />
                            </div>
                        </div>
                        <CardTitle className="text-2xl text-red-800">Ödeme Başarısız</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center space-y-6">
                        <p className="text-red-700">
                            Ödemeniz işlenirken bir sorun oluştu. Lütfen tekrar deneyin.
                        </p>

                        <Alert variant="destructive" className="text-left">
                            <XCircle className="h-4 w-4" />
                            <AlertTitle>Ödeme Reddedildi</AlertTitle>
                            <AlertDescription>
                                Kart bilgilerinizi kontrol edin veya farklı bir kart ile tekrar deneyin.
                            </AlertDescription>
                        </Alert>

                        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                            {orderId && (
                                <Button asChild variant="destructive">
                                    <Link href={`/orders/${orderId}`}>
                                        Tekrar Dene
                                    </Link>
                                </Button>
                            )}
                            <Button asChild variant="outline">
                                <Link href="/checkout">
                                    Sepete Dön
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Error or unknown status
    return (
        <div className="container max-w-2xl py-12">
            <Card className="border-yellow-200 bg-yellow-50">
                <CardHeader className="text-center pb-2">
                    <div className="flex justify-center mb-4">
                        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center">
                            <AlertTriangle className="h-12 w-12 text-yellow-600" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl text-yellow-800">Bir Sorun Oluştu</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-6">
                    <p className="text-yellow-700">
                        İşleminizin durumu belirlenemedi. Lütfen siparişlerinizi kontrol edin.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                        <Button asChild>
                            <Link href="/orders">
                                <ShoppingBag className="h-4 w-4 mr-2" />
                                Siparişlerim
                            </Link>
                        </Button>
                        <Button asChild variant="outline">
                            <Link href="/products">
                                Ana Sayfa
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default function PaymentResultPage() {
    return (
        <Suspense fallback={
            <div className="container max-w-2xl py-12">
                <Card>
                    <CardContent className="p-12 text-center">
                        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                        <p className="text-muted-foreground">İşlem sonucu yükleniyor...</p>
                    </CardContent>
                </Card>
            </div>
        }>
            <PaymentResultContent />
        </Suspense>
    );
}
