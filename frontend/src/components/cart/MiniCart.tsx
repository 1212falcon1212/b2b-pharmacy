'use client';

import { useEffect, useState } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, ArrowRight, Package, X } from 'lucide-react';
import { useCartStore } from '@/stores/useCartStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export function MiniCart() {
    const {
        items,
        itemsBySeller,
        itemCount,
        total,
        isLoading,
        isOpen,
        isShaking,
        lastAddedItemId,
        removingItemId,
        setOpen,
        fetchCart,
        updateQuantity,
        removeItem,
    } = useCartStore();

    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    // Auto-open on hover (desktop) or click (mobile)
    useEffect(() => {
        if (isHovered && itemCount > 0) {
            const timer = setTimeout(() => setOpen(true), 150);
            return () => clearTimeout(timer);
        }
    }, [isHovered, itemCount, setOpen]);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
        }).format(price);
    };

    const handleQuantityChange = async (itemId: number, newQuantity: number, maxStock: number) => {
        if (newQuantity < 1) {
            await removeItem(itemId);
        } else if (newQuantity <= maxStock) {
            await updateQuantity(itemId, newQuantity);
        }
    };

    // Get last 3 items for mini preview
    const recentItems = items.slice(-3).reverse();

    return (
        <div
            className="relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => {
                setIsHovered(false);
                // Delay close to allow mouse to move to dropdown
                setTimeout(() => {
                    if (!isHovered) setOpen(false);
                }, 300);
            }}
        >
            {/* Cart Button with Badge */}
            <Button
                variant="ghost"
                size="icon"
                className={cn(
                    "relative transition-transform duration-300",
                    isShaking && "animate-shake"
                )}
                onClick={() => setOpen(!isOpen)}
            >
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                    <span className={cn(
                        "absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium transition-transform",
                        isShaking && "scale-125"
                    )}>
                        {itemCount > 99 ? '99+' : itemCount}
                    </span>
                )}
                <span className="sr-only">Sepeti ac</span>
            </Button>

            {/* Mini Cart Dropdown */}
            {isOpen && (
                <div
                    className="absolute right-0 top-full mt-2 w-96 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-2">
                            <ShoppingCart className="h-5 w-5 text-primary" />
                            <span className="font-semibold text-slate-900 dark:text-white">Sepetim</span>
                            <Badge variant="secondary" className="text-xs">
                                {itemCount} urun
                            </Badge>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setOpen(false)}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Content */}
                    {itemCount === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                            <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                                <ShoppingCart className="h-10 w-10 text-slate-400" />
                            </div>
                            <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                                Sepetiniz bos
                            </h3>
                            <p className="text-sm text-slate-500 mb-4">
                                Alisverise baslamak icin urun ekleyin
                            </p>
                            <Button asChild variant="default" size="sm" onClick={() => setOpen(false)}>
                                <Link href="/market">
                                    <Package className="h-4 w-4 mr-2" />
                                    Urunlere Goz At
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <>
                            <ScrollArea className="max-h-80">
                                <div className="p-4 space-y-3">
                                    {/* Show by seller groups */}
                                    {itemsBySeller.slice(0, 2).map((group) => (
                                        <div key={group.seller.id} className="space-y-2">
                                            {/* Seller header */}
                                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                                <span className="font-medium text-slate-700 dark:text-slate-300">
                                                    {group.seller.pharmacy_name}
                                                </span>
                                                {group.seller.city && (
                                                    <span className="text-slate-400">({group.seller.city})</span>
                                                )}
                                            </div>

                                            {/* Items */}
                                            {group.items.slice(0, 2).map((item) => (
                                                <div
                                                    key={item.id}
                                                    className={cn(
                                                        "flex gap-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 transition-all duration-300",
                                                        lastAddedItemId === item.id && "ring-2 ring-primary ring-offset-2 bg-primary/5",
                                                        removingItemId === item.id && "opacity-0 translate-x-4"
                                                    )}
                                                >
                                                    {/* Product Image */}
                                                    {item.product.image ? (
                                                        <Image
                                                            src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/storage/${item.product.image}`}
                                                            alt={item.product.name}
                                                            width={48}
                                                            height={48}
                                                            className="rounded-md object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-md flex items-center justify-center flex-shrink-0">
                                                            <Package className="h-5 w-5 text-slate-400" />
                                                        </div>
                                                    )}

                                                    {/* Product Info */}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-slate-900 dark:text-white line-clamp-1">
                                                            {item.product.name}
                                                        </p>
                                                        <p className="text-xs text-slate-500">
                                                            {formatPrice(item.price_at_addition)}
                                                        </p>

                                                        {/* Quantity Controls */}
                                                        <div className="flex items-center justify-between mt-1">
                                                            <div className="flex items-center gap-1">
                                                                <Button
                                                                    size="icon"
                                                                    variant="ghost"
                                                                    className="h-6 w-6"
                                                                    onClick={() => handleQuantityChange(item.id, item.quantity - 1, item.offer.stock)}
                                                                    disabled={isLoading}
                                                                >
                                                                    <Minus className="h-3 w-3" />
                                                                </Button>
                                                                <span className="w-6 text-center text-sm font-medium">
                                                                    {item.quantity}
                                                                </span>
                                                                <Button
                                                                    size="icon"
                                                                    variant="ghost"
                                                                    className="h-6 w-6"
                                                                    onClick={() => handleQuantityChange(item.id, item.quantity + 1, item.offer.stock)}
                                                                    disabled={isLoading || item.quantity >= item.offer.stock}
                                                                >
                                                                    <Plus className="h-3 w-3" />
                                                                </Button>
                                                            </div>
                                                            <span className="text-sm font-semibold text-slate-900 dark:text-white">
                                                                {formatPrice(item.price_at_addition * item.quantity)}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Remove Button */}
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-6 w-6 text-slate-400 hover:text-red-500 self-start"
                                                        onClick={() => removeItem(item.id)}
                                                        disabled={isLoading}
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            ))}

                                            {/* Show more items indicator */}
                                            {group.items.length > 2 && (
                                                <p className="text-xs text-slate-500 pl-2">
                                                    +{group.items.length - 2} daha fazla urun
                                                </p>
                                            )}
                                        </div>
                                    ))}

                                    {/* Show more sellers indicator */}
                                    {itemsBySeller.length > 2 && (
                                        <p className="text-xs text-slate-500 text-center py-2">
                                            +{itemsBySeller.length - 2} daha fazla satici
                                        </p>
                                    )}
                                </div>
                            </ScrollArea>

                            <Separator />

                            {/* Footer */}
                            <div className="p-4 space-y-3 bg-slate-50 dark:bg-slate-800/50">
                                {/* Total */}
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-600 dark:text-slate-400">Ara Toplam:</span>
                                    <span className="text-lg font-bold text-slate-900 dark:text-white">
                                        {formatPrice(total)}
                                    </span>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        className="flex-1"
                                        asChild
                                        onClick={() => setOpen(false)}
                                    >
                                        <Link href="/cart">
                                            Sepete Git
                                        </Link>
                                    </Button>
                                    <Button
                                        className="flex-1"
                                        asChild
                                        onClick={() => setOpen(false)}
                                    >
                                        <Link href="/checkout">
                                            Satin Al
                                            <ArrowRight className="h-4 w-4 ml-2" />
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Styles for shake animation */}
            <style jsx global>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
                    20%, 40%, 60%, 80% { transform: translateX(2px); }
                }
                .animate-shake {
                    animation: shake 0.5s ease-in-out;
                }
            `}</style>
        </div>
    );
}
