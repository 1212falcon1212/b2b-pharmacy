'use client';

import { ShoppingCart, Plus, Minus, Trash2, AlertCircle, X, Sparkles, Store, ArrowRight, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/stores/useCartStore';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect } from 'react';

const itemVariants = {
    hidden: { opacity: 0, x: 20, scale: 0.95 },
    visible: { opacity: 1, x: 0, scale: 1 },
    exit: { opacity: 0, x: -20, scale: 0.95 }
};

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.08 }
    }
};

export function CartSheet() {
    const {
        items,
        itemsBySeller,
        itemCount,
        total,
        isLoading,
        isOpen,
        validationIssues,
        setOpen,
        fetchCart,
        updateQuantity,
        removeItem,
        validateCart,
    } = useCartStore();

    useEffect(() => {
        if (isOpen) {
            fetchCart();
            validateCart();
        }
    }, [isOpen, fetchCart, validateCart]);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
        }).format(price);
    };

    const handleQuantityChange = async (itemId: number, newQuantity: number) => {
        if (newQuantity < 1) {
            await removeItem(itemId);
        } else {
            await updateQuantity(itemId, newQuantity);
        }
    };

    return (
        <Sheet open={isOpen} onOpenChange={setOpen}>
            <SheetContent className="flex flex-col w-full sm:max-w-lg p-0 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950">
                {/* Header */}
                <SheetHeader className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10">
                    <SheetTitle className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                            <ShoppingCart className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <span className="text-lg font-bold text-slate-900 dark:text-white">Sepetim</span>
                            <p className="text-sm font-normal text-slate-500">
                                {itemCount > 0 ? `${itemCount} ürün` : 'Boş'}
                            </p>
                        </div>
                    </SheetTitle>
                </SheetHeader>

                <AnimatePresence mode="wait">
                    {validationIssues.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="px-6"
                        >
                            <Alert variant="destructive" className="mt-4 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/50">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    Sepetinizde düzeltilmesi gereken sorunlar var.
                                </AlertDescription>
                            </Alert>
                        </motion.div>
                    )}
                </AnimatePresence>

                <ScrollArea className="flex-1 px-6">
                    <AnimatePresence mode="wait">
                        {itemsBySeller.length === 0 ? (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="flex flex-col items-center justify-center py-16 text-center"
                            >
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center mb-6">
                                    <Package className="h-12 w-12 text-slate-400" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                                    Sepetiniz boş
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-xs">
                                    Harika ürünlerimize göz atın ve sepetinizi doldurun!
                                </p>
                                <Button
                                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25"
                                    onClick={() => setOpen(false)}
                                >
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    Alışverişe Başla
                                </Button>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="items"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="space-y-6 py-4"
                            >
                                {itemsBySeller.map((group, groupIndex) => (
                                    <motion.div
                                        key={group.seller.id}
                                        variants={itemVariants}
                                        className="space-y-3"
                                    >
                                        {/* Seller Header */}
                                        <div className="flex items-center gap-3 py-2">
                                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center border border-emerald-100 dark:border-emerald-800">
                                                <Store className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
                                                    {group.seller.pharmacy_name}
                                                </h3>
                                            </div>
                                            {group.seller.city && (
                                                <Badge variant="outline" className="text-xs bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                                    {group.seller.city}
                                                </Badge>
                                            )}
                                        </div>

                                        {/* Items */}
                                        <AnimatePresence>
                                            {group.items.map((item, itemIndex) => {
                                                const issue = validationIssues.find((i) => i.item_id === item.id);

                                                return (
                                                    <motion.div
                                                        key={item.id}
                                                        layout
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, x: -100, height: 0 }}
                                                        transition={{ duration: 0.2, delay: itemIndex * 0.05 }}
                                                        className={`flex gap-3 p-3 rounded-xl bg-white dark:bg-slate-800 border shadow-sm hover:shadow-md transition-all ${
                                                            issue
                                                                ? 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/30'
                                                                : 'border-slate-100 dark:border-slate-700'
                                                        }`}
                                                    >
                                                        {/* Product Image */}
                                                        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700 flex-shrink-0">
                                                            {item.product.image ? (
                                                                <Image
                                                                    src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/storage/${item.product.image}`}
                                                                    alt={item.product.name}
                                                                    fill
                                                                    className="object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center">
                                                                    <Package className="h-6 w-6 text-slate-400" />
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Product Info */}
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-medium text-sm text-slate-900 dark:text-white line-clamp-2 leading-tight">
                                                                {item.product.name}
                                                            </p>
                                                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                                                                {formatPrice(item.price_at_addition)} / adet
                                                            </p>

                                                            {issue && (
                                                                <motion.p
                                                                    initial={{ opacity: 0 }}
                                                                    animate={{ opacity: 1 }}
                                                                    className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center gap-1"
                                                                >
                                                                    <AlertCircle className="w-3 h-3" />
                                                                    {issue.message}
                                                                </motion.p>
                                                            )}

                                                            {/* Quantity Controls */}
                                                            <div className="flex items-center justify-between mt-2">
                                                                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 rounded-lg p-0.5">
                                                                    <Button
                                                                        size="icon"
                                                                        variant="ghost"
                                                                        className="h-7 w-7 rounded-md hover:bg-white dark:hover:bg-slate-600"
                                                                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                                                        disabled={isLoading}
                                                                    >
                                                                        <Minus className="h-3 w-3" />
                                                                    </Button>
                                                                    <motion.span
                                                                        key={item.quantity}
                                                                        initial={{ scale: 0.8 }}
                                                                        animate={{ scale: 1 }}
                                                                        className="w-8 text-center text-sm font-semibold text-slate-900 dark:text-white"
                                                                    >
                                                                        {item.quantity}
                                                                    </motion.span>
                                                                    <Button
                                                                        size="icon"
                                                                        variant="ghost"
                                                                        className="h-7 w-7 rounded-md hover:bg-white dark:hover:bg-slate-600"
                                                                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                                                        disabled={isLoading}
                                                                    >
                                                                        <Plus className="h-3 w-3" />
                                                                    </Button>
                                                                </div>

                                                                <div className="flex items-center gap-2">
                                                                    <motion.span
                                                                        key={item.price_at_addition * item.quantity}
                                                                        initial={{ scale: 0.9, opacity: 0 }}
                                                                        animate={{ scale: 1, opacity: 1 }}
                                                                        className="font-bold text-sm text-blue-600 dark:text-blue-400"
                                                                    >
                                                                        {formatPrice(item.price_at_addition * item.quantity)}
                                                                    </motion.span>
                                                                    <Button
                                                                        size="icon"
                                                                        variant="ghost"
                                                                        className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
                                                                        onClick={() => removeItem(item.id)}
                                                                        disabled={isLoading}
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                );
                                            })}
                                        </AnimatePresence>

                                        {/* Seller Subtotal */}
                                        <div className="flex justify-between items-center text-sm px-1 pt-1">
                                            <span className="text-slate-500 dark:text-slate-400">Satıcı Ara Toplam:</span>
                                            <span className="font-semibold text-slate-900 dark:text-white">{formatPrice(group.subtotal)}</span>
                                        </div>

                                        {groupIndex < itemsBySeller.length - 1 && (
                                            <Separator className="my-2" />
                                        )}
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </ScrollArea>

                {/* Footer */}
                <AnimatePresence>
                    {itemsBySeller.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="p-6 pt-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4"
                        >
                            {/* Total */}
                            <div className="flex justify-between items-center">
                                <span className="text-slate-600 dark:text-slate-400">Toplam:</span>
                                <motion.span
                                    key={total}
                                    initial={{ scale: 0.9 }}
                                    animate={{ scale: 1 }}
                                    className="text-2xl font-bold text-slate-900 dark:text-white"
                                >
                                    {formatPrice(total)}
                                </motion.span>
                            </div>

                            {/* Checkout Button */}
                            <Button
                                asChild
                                className="w-full h-12 bg-gradient-to-r from-[#059669] to-[#047857] hover:from-[#047857] hover:to-[#065f46] text-white font-semibold rounded-xl shadow-lg shadow-[#059669]/25 group"
                                size="lg"
                                disabled={isLoading || validationIssues.some((i) => i.type === 'unavailable' || i.type === 'stock')}
                                onClick={() => setOpen(false)}
                            >
                                <Link href="/market/checkout" className="flex items-center justify-center gap-2">
                                    Siparisi Tamamla
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </Button>

                            {/* Continue Shopping Link */}
                            <Button
                                variant="ghost"
                                className="w-full text-slate-500 hover:text-slate-900 dark:hover:text-white"
                                onClick={() => setOpen(false)}
                            >
                                Alışverişe Devam Et
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </SheetContent>
        </Sheet>
    );
}
