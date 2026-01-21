'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { productsApi, Product } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useDebounce } from '@/hooks/use-debounce';
import { Search, Plus, Package, LayoutGrid, List, MoreHorizontal, Pencil, Tag, Trash2 } from 'lucide-react';
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

export default function SellerProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

    const debouncedSearch = useDebounce(searchQuery, 500);

    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearch]);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await productsApi.getAll({
                    page: currentPage,
                    per_page: 12,
                });
                if (response.data) {
                    setProducts(response.data.products ?? []);
                    setTotalPages(response.data.pagination?.last_page || 1);
                } else if (response.error) {
                    setError(response.error);
                    setProducts([]);
                }
            } catch (err) {
                console.error('Failed to load products:', err);
                setError('Ürünler yüklenirken bir hata oluştu.');
                setProducts([]);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [debouncedSearch, currentPage]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Ürünlerim</h1>
                    <p className="text-slate-500 dark:text-slate-400">Stoklarınızı ve tekliflerinizi yönetin</p>
                </div>
                <div className="flex gap-2">
                    <div className="flex border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                        <Button
                            variant={viewMode === 'grid' ? 'default' : 'ghost'}
                            size="icon"
                            className={viewMode === 'grid' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                            onClick={() => setViewMode('grid')}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </Button>
                        <Button
                            variant={viewMode === 'list' ? 'default' : 'ghost'}
                            size="icon"
                            className={viewMode === 'list' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                            onClick={() => setViewMode('list')}
                        >
                            <List className="w-4 h-4" />
                        </Button>
                    </div>
                    <Link href="/seller/products/new">
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="w-4 h-4 mr-2" />
                            Yeni Ürün Ekle
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <Link href="/seller/products/new">
                    <Card className="border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 transition-colors cursor-pointer group">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                                <Plus className="w-5 h-5 text-blue-600 group-hover:text-white" />
                            </div>
                            <div>
                                <p className="font-medium text-slate-900 dark:text-white">Ürün Ekle</p>
                                <p className="text-xs text-slate-500">Yeni ürün oluştur</p>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
                <Link href="/seller/offers/new">
                    <Card className="border-slate-200 dark:border-slate-800 hover:border-green-500 dark:hover:border-green-500 transition-colors cursor-pointer group">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center group-hover:bg-green-600 transition-colors">
                                <Tag className="w-5 h-5 text-green-600 group-hover:text-white" />
                            </div>
                            <div>
                                <p className="font-medium text-slate-900 dark:text-white">Teklif Ver</p>
                                <p className="text-xs text-slate-500">Ürüne teklif ekle</p>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
                <Card className="border-slate-200 dark:border-slate-800">
                    <CardContent className="p-4">
                        <p className="text-sm text-slate-500 dark:text-slate-400">Toplam Ürün</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{products.length}</p>
                    </CardContent>
                </Card>
                <Card className="border-slate-200 dark:border-slate-800">
                    <CardContent className="p-4">
                        <p className="text-sm text-slate-500 dark:text-slate-400">Aktif Teklif</p>
                        <p className="text-2xl font-bold text-green-600">{products?.reduce((acc, p) => acc + (p?.offers_count || 0), 0) || 0}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                    placeholder="Ürün adı veya barkod ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Error State */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-400">
                    {error}
                    <button
                        onClick={() => window.location.reload()}
                        className="ml-2 underline hover:no-underline"
                    >
                        Yeniden dene
                    </button>
                </div>
            )}

            {/* Products */}
            {isLoading ? (
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                    ))}
                </div>
            ) : products.length === 0 ? (
                <Card className="border-slate-200 dark:border-slate-800">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Package className="h-16 w-16 text-slate-300 mb-4" />
                        <h2 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">Henüz ürün yok</h2>
                        <p className="text-slate-500 dark:text-slate-400 mb-4">
                            İlk ürününüzü ekleyerek başlayın
                        </p>
                        <Link href="/seller/products/new">
                            <Button className="bg-blue-600 hover:bg-blue-700">
                                <Plus className="w-4 h-4 mr-2" />
                                Ürün Ekle
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : viewMode === 'list' ? (
                <Card className="border-slate-200 dark:border-slate-800">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                                <TableHead>Ürün</TableHead>
                                <TableHead>Barkod</TableHead>
                                <TableHead>Kategori</TableHead>
                                <TableHead className="text-center">Teklifler</TableHead>
                                <TableHead className="text-right">İşlemler</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.map((product) => (
                                <TableRow key={product.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                                                <Package className="w-5 h-5 text-slate-400" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900 dark:text-white">{product.name}</p>
                                                {product.brand && <p className="text-xs text-slate-500">{product.brand}</p>}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-mono text-sm text-slate-500">{product.barcode}</span>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                            {product.category?.name || 'Kategorisiz'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                            {product.offers_count || 0} teklif
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/seller/products/${product.id}`}>
                                                        <Pencil className="w-4 h-4 mr-2" />
                                                        Düzenle
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <Tag className="w-4 h-4 mr-2" />
                                                    Teklif Ver
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
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {products.map((product) => (
                        <Link key={product.id} href={`/seller/products/${product.id}`}>
                            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-slate-200 dark:border-slate-800">
                                <CardContent className="p-4">
                                    <div className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-lg mb-3 flex items-center justify-center">
                                        <Package className="w-12 h-12 text-slate-400" />
                                    </div>
                                    <h3 className="font-medium text-slate-900 dark:text-white line-clamp-2 mb-1">
                                        {product.name}
                                    </h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{product.barcode}</p>
                                    <div className="flex items-center justify-between mt-2">
                                        <Badge variant="secondary">{product.offers_count || 0} teklif</Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2">
                    <Button
                        variant="outline"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(currentPage - 1)}
                    >
                        Önceki
                    </Button>
                    <span className="flex items-center px-4 text-slate-600 dark:text-slate-400">
                        {currentPage} / {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(currentPage + 1)}
                    >
                        Sonraki
                    </Button>
                </div>
            )}
        </div>
    );
}
