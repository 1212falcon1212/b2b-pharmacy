'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ordersApi, Order } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Eye, ChevronRight } from "lucide-react";
import { toast } from "sonner";

const STATUS_OPTIONS = [
    { value: "all", label: "Tümü" },
    { value: "pending", label: "Beklemede" },
    { value: "confirmed", label: "Onaylandı" },
    { value: "processing", label: "Hazırlanıyor" },
    { value: "shipped", label: "Kargoda" },
    { value: "delivered", label: "Teslim Edildi" },
    { value: "cancelled", label: "İptal Edildi" },
];

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
    pending: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', label: 'Beklemede' },
    confirmed: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', label: 'Onaylandı' },
    processing: { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400', label: 'Hazırlanıyor' },
    shipped: { color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400', label: 'Kargoda' },
    delivered: { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', label: 'Teslim Edildi' },
    cancelled: { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', label: 'İptal Edildi' },
};

export default function MyOrdersPage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/login");
            return;
        }

        if (user) {
            loadOrders();
        }
    }, [user, authLoading, currentPage]); // Removing statusFilter from deps to filter client-side if needed or handle properly

    const loadOrders = async () => {
        try {
            setLoading(true);
            // Using getAll which fetches buyer orders
            const response = await ordersApi.getAll({
                page: currentPage,
                per_page: 10,
            });
            if (response.data) {
                setOrders(response.data.orders);
                setTotalPages(response.data.pagination.last_page);
            }
        } catch (error) {
            console.error("Failed to load orders:", error);
            toast.error("Siparişler yüklenirken hata oluştu");
        } finally {
            setLoading(false);
        }
    };

    const filteredOrders = statusFilter === 'all'
        ? orders
        : orders.filter(o => o.status === statusFilter);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
        }).format(price);
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

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Siparişlerim</h1>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Durum Filtrele" />
                    </SelectTrigger>
                    <SelectContent>
                        {STATUS_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Sipariş Geçmişi</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-16 bg-slate-100 rounded animate-pulse" />
                            ))}
                        </div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-slate-500">
                                {statusFilter !== 'all' ? 'Bu durumda siparişiniz bulunmuyor.' : 'Henüz siparişiniz bulunmuyor.'}
                            </p>
                            {statusFilter === 'all' && (
                                <Button asChild variant="link" className="mt-2 text-blue-600">
                                    <Link href="/market">Alışverişe Başla</Link>
                                </Button>
                            )}
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Sipariş No</TableHead>
                                    <TableHead>Tarih</TableHead>
                                    <TableHead>Satıcı</TableHead>
                                    <TableHead>Tutar</TableHead>
                                    <TableHead>Durum</TableHead>
                                    <TableHead className="text-right">Detay</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredOrders.map((order) => {
                                    const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                                    return (
                                        <TableRow key={order.id}>
                                            <TableCell className="font-medium">{order.order_number}</TableCell>
                                            <TableCell className="text-slate-500">{formatDate(order.created_at)}</TableCell>
                                            <TableCell>
                                                {order.seller?.pharmacy_name || order.seller?.name || '-'}
                                            </TableCell>
                                            <TableCell className="font-medium">{formatPrice(order.total_amount)}</TableCell>
                                            <TableCell>
                                                <Badge className={status.color} variant="secondary">
                                                    {status.label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/account/orders/${order.id}`}>
                                                        <Eye className="w-4 h-4 mr-2" />
                                                        İncele
                                                    </Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center space-x-2 mt-6">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                            >
                                Önceki
                            </Button>
                            <span className="text-sm text-slate-600">
                                Sayfa {currentPage} / {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                            >
                                Sonraki
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
