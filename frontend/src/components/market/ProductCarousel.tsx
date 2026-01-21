"use client";

import Link from "next/link";
import { ArrowRight, Flame, TrendingUp, Sparkles, Clock, Star, Gift, Percent } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ProductCard } from "./ProductCard";
import { cn } from "@/lib/utils";

interface ProductCarouselProps {
    title: string;
    products: any[];
    linkUrl?: string;
    icon?: React.ReactNode;
    variant?: "default" | "trending" | "new" | "deals" | "featured";
    showBadges?: boolean;
}

const VARIANT_STYLES = {
    default: {
        iconBg: "bg-blue-50 text-blue-600 border-blue-100",
        titleColor: "text-slate-900",
        badge: null,
    },
    trending: {
        iconBg: "bg-orange-50 text-orange-600 border-orange-100",
        titleColor: "text-slate-900",
        badge: "En Cok Satan",
    },
    new: {
        iconBg: "bg-emerald-50 text-emerald-600 border-emerald-100",
        titleColor: "text-slate-900",
        badge: "Yeni",
    },
    deals: {
        iconBg: "bg-red-50 text-red-600 border-red-100",
        titleColor: "text-slate-900",
        badge: "Firsat",
    },
    featured: {
        iconBg: "bg-purple-50 text-purple-600 border-purple-100",
        titleColor: "text-slate-900",
        badge: "Secili",
    },
};

const VARIANT_ICONS = {
    default: <TrendingUp className="w-5 h-5" />,
    trending: <Flame className="w-5 h-5" />,
    new: <Sparkles className="w-5 h-5" />,
    deals: <Percent className="w-5 h-5" />,
    featured: <Star className="w-5 h-5" />,
};

export function ProductCarousel({
    title,
    products,
    linkUrl,
    icon,
    variant = "default",
    showBadges = true,
}: ProductCarouselProps) {
    if (!products || products.length === 0) return null;

    const styles = VARIANT_STYLES[variant];
    const defaultIcon = VARIANT_ICONS[variant];

    return (
        <section className="py-6">
            <div className="flex items-center justify-between mb-6 px-1">
                <div className="flex items-center gap-3">
                    <div className={cn("p-2.5 rounded-xl border shadow-sm", styles.iconBg)}>
                        {icon || defaultIcon}
                    </div>
                    <div>
                        <h2 className={cn("text-xl md:text-2xl font-bold tracking-tight", styles.titleColor)}>
                            {title}
                        </h2>
                        {showBadges && styles.badge && (
                            <span className="text-xs text-slate-500 font-medium">
                                {products.length} urun
                            </span>
                        )}
                    </div>
                </div>

                {linkUrl && (
                    <Link
                        href={linkUrl}
                        className="group flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors"
                    >
                        Tumunu Gor
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                )}
            </div>

            <Carousel
                opts={{
                    align: "start",
                    loop: false,
                }}
                className="w-full relative group"
            >
                <CarouselContent className="-ml-4 pb-4">
                    {products.map((product, index) => (
                        <CarouselItem
                            key={`${product.id}-${index}`}
                            className="pl-4 basis-1/2 md:basis-1/3 lg:basis-1/5 xl:basis-1/6"
                        >
                            <ProductCard
                                product={product}
                                badge={showBadges && index < 3 && variant === "trending" ? `#${index + 1}` : undefined}
                            />
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="left-0 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-lg border-slate-200" />
                <CarouselNext className="right-0 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-lg border-slate-200" />
            </Carousel>
        </section>
    );
}

// Grid variant for featured/new products
export function ProductGrid({
    title,
    products,
    linkUrl,
    icon,
    columns = 6,
    rows = 2,
    showRanking = false,
}: {
    title: string;
    products: any[];
    linkUrl?: string;
    icon?: React.ReactNode;
    columns?: 3 | 4 | 5 | 6;
    rows?: 1 | 2 | 3;
    showRanking?: boolean;
}) {
    if (!products || products.length === 0) return null;

    // Limit products based on columns x rows
    const maxProducts = columns * rows;
    const displayProducts = products.slice(0, maxProducts);

    const gridCols = {
        3: "grid-cols-2 sm:grid-cols-3",
        4: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
        5: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5",
        6: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6",
    };

    return (
        <section className="py-6">
            <div className="flex items-center justify-between mb-6 px-1">
                <div className="flex items-center gap-3">
                    {icon && (
                        <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800 shadow-sm">
                            {icon}
                        </div>
                    )}
                    <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{title}</h2>
                </div>

                {linkUrl && (
                    <Link
                        href={linkUrl}
                        className="group flex items-center gap-1 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                        Tumunu Gor
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                )}
            </div>

            <div className={cn("grid gap-4", gridCols[columns])}>
                {displayProducts.map((product, index) => (
                    <div key={`${product.id}-${index}`} className="relative">
                        {showRanking && index < 3 && (
                            <div
                                className={cn(
                                    "absolute -top-2 -left-2 z-10 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white shadow-lg",
                                    index === 0 && "bg-gradient-to-br from-amber-400 to-amber-600",
                                    index === 1 && "bg-gradient-to-br from-slate-300 to-slate-500",
                                    index === 2 && "bg-gradient-to-br from-orange-400 to-orange-600"
                                )}
                            >
                                {index + 1}
                            </div>
                        )}
                        <ProductCard product={product} />
                    </div>
                ))}
            </div>
        </section>
    );
}

// Horizontal scrolling list for mobile-first design
export function ProductScrollList({
    title,
    products,
    linkUrl,
    size = "md",
}: {
    title: string;
    products: any[];
    linkUrl?: string;
    size?: "sm" | "md" | "lg";
}) {
    if (!products || products.length === 0) return null;

    const formatPrice = (price?: number) => {
        if (!price) return "---";
        return new Intl.NumberFormat("tr-TR", {
            style: "currency",
            currency: "TRY",
        }).format(price);
    };

    const sizeStyles = {
        sm: { card: "w-32", image: "h-24", text: "text-xs" },
        md: { card: "w-40", image: "h-32", text: "text-sm" },
        lg: { card: "w-48", image: "h-40", text: "text-base" },
    };

    const styles = sizeStyles[size];

    return (
        <section className="py-4">
            <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="text-lg font-bold text-slate-900">{title}</h3>
                {linkUrl && (
                    <Link href={linkUrl} className="text-sm text-blue-600 font-medium">
                        Tumunu Gor
                    </Link>
                )}
            </div>

            <div className="relative -mx-4 px-4">
                <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                    {products.map((product) => (
                        <Link
                            key={product.id}
                            href={`/market/product/${product.id}`}
                            className={cn("flex-shrink-0 group", styles.card)}
                        >
                            <div
                                className={cn(
                                    "rounded-xl overflow-hidden bg-slate-100 mb-2",
                                    styles.image
                                )}
                            >
                                {product.image ? (
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-3xl opacity-50">
                                        💊
                                    </div>
                                )}
                            </div>
                            <p
                                className={cn(
                                    "font-medium text-slate-900 line-clamp-2 group-hover:text-blue-600 transition-colors",
                                    styles.text
                                )}
                            >
                                {product.name}
                            </p>
                            <p className="text-sm font-bold text-blue-600 mt-1">
                                {formatPrice(product.lowest_price)}
                            </p>
                        </Link>
                    ))}
                </div>

                {/* Fade edges */}
                <div className="absolute right-0 top-0 bottom-4 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none" />
            </div>
        </section>
    );
}

// Featured products with larger cards
export function FeaturedProducts({
    title = "One Cikan Urunler",
    products,
    linkUrl,
}: {
    title?: string;
    products: any[];
    linkUrl?: string;
}) {
    if (!products || products.length === 0) return null;

    const formatPrice = (price?: number) => {
        if (!price) return "---";
        return new Intl.NumberFormat("tr-TR", {
            style: "currency",
            currency: "TRY",
        }).format(price);
    };

    // First product is featured (large), rest are smaller
    const [featured, ...rest] = products.slice(0, 5);

    return (
        <section className="py-6">
            <div className="flex items-center justify-between mb-6 px-1">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl text-white shadow-lg shadow-orange-500/25">
                        <Star className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">{title}</h2>
                </div>

                {linkUrl && (
                    <Link
                        href={linkUrl}
                        className="group flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors"
                    >
                        Tumunu Gor
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Featured Product (Large) */}
                <Link
                    href={`/market/product/${featured.id}`}
                    className="group relative bg-gradient-to-br from-slate-50 to-slate-100 rounded-3xl p-6 overflow-hidden border border-slate-200 hover:border-blue-300 hover:shadow-xl transition-all"
                >
                    {/* Background decoration */}
                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-100/50 rounded-full blur-3xl" />

                    <div className="relative flex flex-col md:flex-row items-center gap-6">
                        {/* Image */}
                        <div className="w-48 h-48 rounded-2xl overflow-hidden bg-white shadow-lg flex-shrink-0">
                            {featured.image ? (
                                <img
                                    src={featured.image}
                                    alt={featured.name}
                                    className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-6xl opacity-50">
                                    💊
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 text-center md:text-left">
                            <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full mb-3">
                                ONE CIKAN
                            </span>
                            {featured.brand && (
                                <p className="text-sm text-slate-500 font-medium mb-1">
                                    {featured.brand}
                                </p>
                            )}
                            <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                                {featured.name}
                            </h3>
                            <div className="flex items-baseline gap-2 justify-center md:justify-start mb-4">
                                <span className="text-3xl font-bold text-blue-600">
                                    {formatPrice(featured.lowest_price)}
                                </span>
                                {featured.offers_count && (
                                    <span className="text-sm text-slate-500">
                                        {featured.offers_count} satıcı
                                    </span>
                                )}
                            </div>
                            <span className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 group-hover:gap-3 transition-all">
                                Detaylari Gor
                                <ArrowRight className="w-4 h-4" />
                            </span>
                        </div>
                    </div>
                </Link>

                {/* Rest of Products (Grid) */}
                <div className="grid grid-cols-2 gap-4">
                    {rest.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>
        </section>
    );
}
