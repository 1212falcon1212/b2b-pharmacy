'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { offersApi, Offer } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Tag, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

export default function SellerOffersPage() {
    const [offers, setOffers] = useState<Offer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadOffers();
    }, []);

    const loadOffers = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await offersApi.getMyOffers();
            if (response.data?.offers) {
                setOffers(response.data.offers);
            } else if (response.error) {
                setError(response.error);
                setOffers([]);
            }
        } catch (err) {
            console.error('Failed to load offers:', err);
            setError('Teklifler yüklenirken bir hata oluştu.');
            setOffers([]);
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

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('tr-TR');
    };

    const getStatusBadge = (status: string) => {
        const colors: Record<string, string> = {
            active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
            inactive: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
            sold_out: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        };
        const labels: Record<string, string> = {
            active: 'Aktif',
            inactive: 'Pasif',
            sold_out: 'Tükendi',
        };
        return <Badge className={colors[status] || colors.inactive}>{labels[status] || status}</Badge>;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Tekliflerim</h1>
                    <p className="text-slate-500 dark:text-slate-400">Ürünleriniz için verdiğiniz satış teklifleri</p>
                </div>
                <Link href="/seller/offers/new">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Yeni Teklif
                    </Button>
                </Link>
            </div>

            {/* Error State */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-400">
                    {error}
                    <button
                        onClick={() => loadOffers()}
                        className="ml-2 underline hover:no-underline"
                    >
                        Yeniden dene
                    </button>
                </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <Card className="border-slate-200 dark:border-slate-800">
                    <CardContent className="p-4">
                        <p className="text-sm text-slate-500 dark:text-slate-400">Toplam Teklif</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{offers?.length ?? 0}</p>
                    </CardContent>
                </Card>
                <Card className="border-slate-200 dark:border-slate-800">
                    <CardContent className="p-4">
                        <p className="text-sm text-slate-500 dark:text-slate-400">Aktif</p>
                        <p className="text-2xl font-bold text-green-600">{offers?.filter(o => o?.status === 'active').length ?? 0}</p>
                    </CardContent>
                </Card>
                <Card className="border-slate-200 dark:border-slate-800">
                    <CardContent className="p-4">
                        <p className="text-sm text-slate-500 dark:text-slate-400">Toplam Stok</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{offers?.reduce((acc, o) => acc + (o?.stock ?? 0), 0) ?? 0}</p>
                    </CardContent>
                </Card>
                <Card className="border-slate-200 dark:border-slate-800">
                    <CardContent className="p-4">
                        <p className="text-sm text-slate-500 dark:text-slate-400">Ortalama Fiyat</p>
                        <p className="text-2xl font-bold text-blue-600">
                            {offers && offers.length > 0 ? formatPrice(offers.reduce((acc, o) => acc + (o?.price ?? 0), 0) / offers.length) : '₺0'}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Offers Table */}
            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                    ))}
                </div>
            ) : offers.length === 0 ? (
                <Card className="border-slate-200 dark:border-slate-800">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Tag className="h-16 w-16 text-slate-300 dark:text-slate-600 mb-4" />
                        <h2 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">Henüz teklifiniz yok</h2>
                        <p className="text-slate-500 dark:text-slate-400 mb-4">
                            İlk teklifinizi oluşturarak satışa başlayın.
                        </p>
                        <Link href="/seller/offers/new">
                            <Button className="bg-blue-600 hover:bg-blue-700">
                                <Plus className="w-4 h-4 mr-2" />
                                Teklif Oluştur
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <Card className="border-slate-200 dark:border-slate-800">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                                <TableHead>Ürün</TableHead>
                                <TableHead>Fiyat</TableHead>
                                <TableHead>Stok</TableHead>
                                <TableHead>S.K.T.</TableHead>
                                <TableHead>Durum</TableHead>
                                <TableHead className="text-right">İşlemler</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {offers.map((offer) => (
                                <TableRow key={offer.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <TableCell>
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-white">Ürün #{offer.product_id}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-bold text-blue-600 dark:text-blue-400">
                                        {formatPrice(offer.price)}
                                    </TableCell>
                                    <TableCell>{offer.stock} adet</TableCell>
                                    <TableCell>{formatDate(offer.expiry_date)}</TableCell>
                                    <TableCell>{getStatusBadge(offer.status)}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem>
                                                    <Pencil className="w-4 h-4 mr-2" />
                                                    Düzenle
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-red-600">
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                    Sil
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            )}
        </div>
    );
}
