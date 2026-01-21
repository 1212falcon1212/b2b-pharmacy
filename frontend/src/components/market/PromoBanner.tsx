"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { ArrowRight, Clock, Zap, Gift, Percent, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PromoBannerProps {
    title?: string;
    subtitle?: string;
    description?: string;
    linkUrl?: string;
    linkText?: string;
    endDate?: Date;
    variant?: "gradient" | "glass" | "solid";
    size?: "sm" | "md" | "lg";
    icon?: "clock" | "zap" | "gift" | "percent" | "sparkles";
}

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    total: number;
}

function calculateTimeLeft(endDate: Date): TimeLeft {
    const difference = +endDate - +new Date();
    let timeLeft: TimeLeft = {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        total: difference,
    };

    if (difference > 0) {
        timeLeft = {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60),
            total: difference,
        };
    }

    return timeLeft;
}

const ICONS = {
    clock: Clock,
    zap: Zap,
    gift: Gift,
    percent: Percent,
    sparkles: Sparkles,
};

// Get default end date (3 days from now) - only calculated on client
function getDefaultEndDate() {
    return new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
}

export function PromoBanner({
    title = "Haftalik Super Firsatlar",
    subtitle = "Secili urunlerde %40'a varan indirimler",
    description = "Bu firsati kacirmayin! Sinirli stok.",
    linkUrl = "/market/products?filter=deals",
    linkText = "Firsatlari Gor",
    endDate,
    variant = "gradient",
    size = "lg",
    icon = "zap",
}: PromoBannerProps) {
    const [mounted, setMounted] = useState(false);
    const actualEndDate = endDate || (mounted ? getDefaultEndDate() : new Date(0));
    const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });

    const IconComponent = ICONS[icon];

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        const targetDate = endDate || getDefaultEndDate();
        setTimeLeft(calculateTimeLeft(targetDate));

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft(targetDate));
        }, 1000);

        return () => clearInterval(timer);
    }, [endDate, mounted]);

    const isExpired = timeLeft.total <= 0;

    const TimeBlock = ({ value, label }: { value: number; label: string }) => (
        <div className="flex flex-col items-center">
            <div
                className={cn(
                    "relative overflow-hidden rounded-xl font-bold tabular-nums",
                    variant === "gradient"
                        ? "bg-white/20 backdrop-blur-md text-white border border-white/30"
                        : "bg-slate-900 text-white",
                    size === "lg" ? "w-16 h-16 text-2xl" : size === "md" ? "w-12 h-12 text-xl" : "w-10 h-10 text-lg"
                )}
            >
                <span className="absolute inset-0 flex items-center justify-center">
                    {String(value).padStart(2, "0")}
                </span>
                {/* Flip animation effect */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent h-1/2" />
            </div>
            <span
                className={cn(
                    "mt-1.5 font-medium uppercase tracking-wider",
                    variant === "gradient" ? "text-white/80" : "text-slate-500",
                    size === "lg" ? "text-xs" : "text-[10px]"
                )}
            >
                {label}
            </span>
        </div>
    );

    if (size === "sm") {
        return (
            <div
                className={cn(
                    "relative overflow-hidden rounded-2xl p-4",
                    variant === "gradient"
                        ? "bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600"
                        : variant === "glass"
                            ? "bg-white/10 backdrop-blur-lg border border-white/20"
                            : "bg-slate-900"
                )}
            >
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div
                            className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center",
                                variant === "gradient" ? "bg-white/20" : "bg-violet-500/20"
                            )}
                        >
                            <IconComponent className={cn("w-5 h-5", variant === "gradient" ? "text-white" : "text-violet-500")} />
                        </div>
                        <div>
                            <h4 className={cn("font-bold", variant === "gradient" ? "text-white" : "text-slate-900")}>
                                {title}
                            </h4>
                            <p className={cn("text-sm", variant === "gradient" ? "text-white/70" : "text-slate-500")}>
                                {subtitle}
                            </p>
                        </div>
                    </div>
                    {mounted && !isExpired && (
                        <div className="flex items-center gap-1.5">
                            <TimeBlock value={timeLeft.hours} label="Sa" />
                            <span className={cn("text-xl font-bold pb-5", variant === "gradient" ? "text-white/60" : "text-slate-400")}>:</span>
                            <TimeBlock value={timeLeft.minutes} label="Dk" />
                            <span className={cn("text-xl font-bold pb-5", variant === "gradient" ? "text-white/60" : "text-slate-400")}>:</span>
                            <TimeBlock value={timeLeft.seconds} label="Sn" />
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div
            className={cn(
                "relative overflow-hidden rounded-3xl",
                size === "lg" ? "p-8 md:p-12" : "p-6 md:p-8",
                variant === "gradient"
                    ? "bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700"
                    : variant === "glass"
                        ? "bg-slate-900/80 backdrop-blur-xl border border-slate-700/50"
                        : "bg-slate-900"
            )}
        >
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Floating orbs */}
                <div className="absolute -top-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl animate-pulse delay-1000" />
                <div className="absolute top-1/2 left-1/3 w-40 h-40 bg-blue-400/10 rounded-full blur-2xl animate-pulse delay-500" />

                {/* Grid pattern */}
                <div
                    className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }}
                />

                {/* Sparkle decorations */}
                <Sparkles className="absolute top-8 right-8 w-6 h-6 text-white/30 animate-pulse" />
                <Sparkles className="absolute bottom-12 left-12 w-4 h-4 text-white/20 animate-pulse delay-700" />
            </div>

            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
                {/* Content */}
                <div className="flex-1 text-center lg:text-left">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 mb-4">
                        <IconComponent className="w-4 h-4 text-yellow-300" />
                        <span className="text-xs font-bold text-white uppercase tracking-wider">
                            Sinirli Sure
                        </span>
                    </div>

                    {/* Title */}
                    <h2
                        className={cn(
                            "font-bold text-white tracking-tight mb-2",
                            size === "lg" ? "text-3xl md:text-4xl lg:text-5xl" : "text-2xl md:text-3xl"
                        )}
                    >
                        {title}
                    </h2>

                    {/* Subtitle */}
                    <p
                        className={cn(
                            "text-white/80 mb-4",
                            size === "lg" ? "text-lg md:text-xl" : "text-base"
                        )}
                    >
                        {subtitle}
                    </p>

                    {/* Description */}
                    {description && (
                        <p className="text-white/60 text-sm mb-6 max-w-md mx-auto lg:mx-0">
                            {description}
                        </p>
                    )}

                    {/* CTA Button */}
                    <Button
                        asChild
                        size={size === "lg" ? "lg" : "default"}
                        className="group bg-white text-purple-700 hover:bg-purple-50 font-semibold rounded-full px-8 shadow-xl shadow-purple-900/30 hover:shadow-purple-900/40 transition-all"
                    >
                        <Link href={linkUrl}>
                            {linkText}
                            <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </Button>
                </div>

                {/* Countdown Timer */}
                {mounted && !isExpired && (
                    <div className="flex-shrink-0">
                        <p className="text-white/60 text-sm font-medium text-center mb-4 uppercase tracking-wider">
                            Kampanya Sonu
                        </p>
                        <div className="flex items-center gap-3">
                            <TimeBlock value={timeLeft.days} label="Gun" />
                            <span className="text-2xl font-bold text-white/40 pb-6">:</span>
                            <TimeBlock value={timeLeft.hours} label="Saat" />
                            <span className="text-2xl font-bold text-white/40 pb-6">:</span>
                            <TimeBlock value={timeLeft.minutes} label="Dakika" />
                            <span className="text-2xl font-bold text-white/40 pb-6">:</span>
                            <TimeBlock value={timeLeft.seconds} label="Saniye" />
                        </div>
                    </div>
                )}

                {/* Expired State */}
                {mounted && isExpired && (
                    <div className="flex-shrink-0 text-center">
                        <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
                            <Clock className="w-10 h-10 text-white/60" />
                        </div>
                        <p className="text-white/60 font-medium">Kampanya sona erdi</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// Compact inline promo strip
export function PromoStrip({
    text = "Uye ol, ilk siparisinde %10 indirim kazan!",
    linkUrl = "/register",
    linkText = "Hemen Uye Ol",
}: {
    text?: string;
    linkUrl?: string;
    linkText?: string;
}) {
    return (
        <div className="relative overflow-hidden bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 py-3 px-4">
            {/* Animated shine effect */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_3s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </div>

            <div className="relative flex items-center justify-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-yellow-300" />
                    <span className="text-white font-medium text-sm">{text}</span>
                </div>
                <Link
                    href={linkUrl}
                    className="inline-flex items-center gap-1 text-sm font-bold text-white hover:text-yellow-200 transition-colors"
                >
                    {linkText}
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </div>

            <style jsx>{`
                @keyframes shimmer {
                    100% {
                        transform: translateX(100%);
                    }
                }
            `}</style>
        </div>
    );
}

// Deal of the Day compact card
export function DealOfTheDay({
    product,
    endDate,
}: {
    product?: {
        id: number;
        name: string;
        image?: string;
        originalPrice: number;
        salePrice: number;
        discount: number;
    };
    endDate?: Date;
}) {
    const [mounted, setMounted] = useState(false);
    const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        const targetDate = endDate || getDefaultEndDate();
        setTimeLeft(calculateTimeLeft(targetDate));

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft(targetDate));
        }, 1000);
        return () => clearInterval(timer);
    }, [endDate, mounted]);

    const defaultProduct = {
        id: 1,
        name: "Vitamin C 1000mg - 60 Tablet",
        image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop",
        originalPrice: 149.90,
        salePrice: 89.90,
        discount: 40,
    };

    const displayProduct = product || defaultProduct;

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("tr-TR", {
            style: "currency",
            currency: "TRY",
        }).format(price);
    };

    return (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 p-6">
            {/* Background decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-yellow-300/20 rounded-full blur-2xl" />
            </div>

            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-yellow-200" />
                        <span className="text-white font-bold uppercase tracking-wider text-sm">
                            Gunun Firsati
                        </span>
                    </div>
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-white text-xs font-bold">
                        %{displayProduct.discount} INDIRIM
                    </span>
                </div>

                {/* Product */}
                <Link href={`/market/product/${displayProduct.id}`} className="block group">
                    <div className="flex gap-4">
                        {/* Image */}
                        <div className="w-24 h-24 rounded-xl overflow-hidden bg-white/20 backdrop-blur-md flex-shrink-0">
                            {displayProduct.image ? (
                                <img
                                    src={displayProduct.image}
                                    alt={displayProduct.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-4xl">
                                    💊
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <h4 className="text-white font-bold line-clamp-2 group-hover:underline">
                                {displayProduct.name}
                            </h4>
                            <div className="mt-2 flex items-baseline gap-2">
                                <span className="text-2xl font-bold text-white">
                                    {formatPrice(displayProduct.salePrice)}
                                </span>
                                <span className="text-white/60 line-through text-sm">
                                    {formatPrice(displayProduct.originalPrice)}
                                </span>
                            </div>
                        </div>
                    </div>
                </Link>

                {/* Timer */}
                {mounted && timeLeft.total > 0 && (
                    <div className="mt-4 pt-4 border-t border-white/20">
                        <div className="flex items-center justify-between">
                            <span className="text-white/70 text-xs">Kalan Sure:</span>
                            <div className="flex items-center gap-1 text-white font-mono font-bold">
                                <span>{String(timeLeft.hours).padStart(2, "0")}</span>
                                <span className="text-white/50">:</span>
                                <span>{String(timeLeft.minutes).padStart(2, "0")}</span>
                                <span className="text-white/50">:</span>
                                <span>{String(timeLeft.seconds).padStart(2, "0")}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
