"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Heart, ShoppingCart, Check, AlertCircle, Package, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/useCartStore";
import { cn } from "@/lib/utils";

interface ProductCardProps {
    product: {
        id: number;
        name: string;
        image?: string;
        brand?: string;
        lowest_price?: number;
        offers_count?: number;
        stock_status?: 'in_stock' | 'low_stock' | 'out_of_stock';
        default_offer_id?: number;
    };
    badge?: string;
}

export function ProductCard({ product, badge }: ProductCardProps) {
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [showAddedFeedback, setShowAddedFeedback] = useState(false);
    const { addItem, setOpen } = useCartStore();

    const formatPrice = (price?: number) => {
        if (!price) return '---';
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
        }).format(price);
    };

    // Determine stock status
    const getStockStatus = () => {
        if (product.stock_status === 'out_of_stock' || product.offers_count === 0) {
            return { status: 'out_of_stock', label: 'Stokta Yok', color: 'text-red-500 bg-red-50' };
        }
        if (product.stock_status === 'low_stock' || (product.offers_count && product.offers_count <= 2)) {
            return { status: 'low_stock', label: 'Son Birimler', color: 'text-amber-600 bg-amber-50' };
        }
        return { status: 'in_stock', label: `${product.offers_count} satıcıdan`, color: 'text-emerald-600 bg-emerald-50' };
    };

    const stockInfo = getStockStatus();

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!product.default_offer_id || stockInfo.status === 'out_of_stock') {
            // If no default offer, open product page
            return;
        }

        setIsAddingToCart(true);
        try {
            await addItem(product.default_offer_id, 1);
            setShowAddedFeedback(true);
            setTimeout(() => {
                setShowAddedFeedback(false);
            }, 2000);
        } catch (error) {
            console.error('Failed to add to cart:', error);
        } finally {
            setIsAddingToCart(false);
        }
    };

    const handleWishlist = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsWishlisted(!isWishlisted);
    };

    return (
        <div className="group relative bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-blue-500/50 dark:hover:border-blue-400/50 transition-all duration-300 flex flex-col h-full overflow-hidden hover:-translate-y-2 hover:shadow-xl hover:shadow-blue-900/10 dark:hover:shadow-blue-500/10">
            {/* Image Area */}
            <div className="relative aspect-square bg-slate-50 dark:bg-slate-700/50 p-6 flex items-center justify-center overflow-hidden border-b border-slate-100 dark:border-slate-700">
                <Link href={`/market/product/${product.id}`} className="absolute inset-0 z-10" />

                {product.image ? (
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal opacity-90 group-hover:scale-110 group-hover:opacity-100 transition-all duration-500"
                    />
                ) : (
                    <div className="text-4xl grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-70 transition-all duration-300">💊</div>
                )}

                {/* Badge */}
                {badge && (
                    <span className="absolute top-3 left-3 px-2 py-1 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-[10px] uppercase font-bold tracking-wider rounded-md shadow-lg animate-pulse">
                        {badge}
                    </span>
                )}

                {/* Wishlist Button */}
                <button
                    onClick={handleWishlist}
                    className={cn(
                        "absolute top-3 right-3 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-sm",
                        isWishlisted
                            ? "bg-red-500 text-white scale-110"
                            : "bg-white/80 dark:bg-slate-800/80 text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-500"
                    )}
                >
                    <Heart className={cn("w-4 h-4 transition-transform", isWishlisted && "fill-current scale-110")} />
                </button>

                {/* Quick Add to Cart Button - Shows on hover */}
                {product.default_offer_id && stockInfo.status !== 'out_of_stock' && (
                    <button
                        onClick={handleAddToCart}
                        disabled={isAddingToCart}
                        className={cn(
                            "absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-all duration-300 backdrop-blur-sm",
                            showAddedFeedback
                                ? "bg-emerald-500 text-white scale-105"
                                : "bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 hover:bg-blue-600 hover:text-white shadow-lg"
                        )}
                    >
                        {isAddingToCart ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Ekleniyor...</span>
                            </>
                        ) : showAddedFeedback ? (
                            <>
                                <Check className="w-4 h-4" />
                                <span>Eklendi!</span>
                            </>
                        ) : (
                            <>
                                <ShoppingCart className="w-4 h-4" />
                                <span>Sepete Ekle</span>
                            </>
                        )}
                    </button>
                )}
            </div>

            {/* Content Area */}
            <div className="p-4 flex flex-col flex-1">
                {/* Brand */}
                {product.brand && (
                    <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mb-1 uppercase tracking-wide">
                        {product.brand}
                    </p>
                )}

                {/* Title */}
                <Link
                    href={`/market/product/${product.id}`}
                    className="text-sm font-bold text-slate-800 dark:text-slate-100 line-clamp-2 h-10 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                    title={product.name}
                >
                    {product.name}
                </Link>

                {/* Stock Status Indicator */}
                <div className={cn(
                    "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold w-fit mb-2",
                    stockInfo.color
                )}>
                    {stockInfo.status === 'out_of_stock' ? (
                        <AlertCircle className="w-3 h-3" />
                    ) : stockInfo.status === 'low_stock' ? (
                        <Package className="w-3 h-3" />
                    ) : (
                        <Check className="w-3 h-3" />
                    )}
                    {stockInfo.label}
                </div>

                {/* Price Section */}
                <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-700">
                    <div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-lg font-bold text-slate-900 dark:text-white">
                                {formatPrice(product.lowest_price)}
                            </span>
                        </div>
                    </div>

                    {/* Action Button */}
                    <Button
                        size="icon"
                        className={cn(
                            "w-8 h-8 rounded-lg transition-all shadow-sm",
                            stockInfo.status === 'out_of_stock'
                                ? "bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-not-allowed"
                                : "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white hover:shadow-blue-500/25 hover:scale-110"
                        )}
                        asChild={stockInfo.status !== 'out_of_stock'}
                        disabled={stockInfo.status === 'out_of_stock'}
                    >
                        {stockInfo.status !== 'out_of_stock' ? (
                            <Link href={`/market/product/${product.id}`}>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        ) : (
                            <span><ArrowRight className="w-4 h-4" /></span>
                        )}
                    </Button>
                </div>
            </div>

            {/* Hover Glow Effect */}
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-blue-500/5 via-transparent to-transparent" />
            </div>
        </div>
    );
}
