"use client";

import { useRef, useCallback, useEffect, useState, MouseEvent } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    type CarouselApi,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import Autoplay from "embla-carousel-autoplay";
import { Banner } from "@/lib/api";
import { cn } from "@/lib/utils";

interface HeroSliderProps {
    banners: Banner[];
}

// Fallback banners for when no data
const FALLBACK_BANNERS: Banner[] = [
    {
        id: 1,
        title: "B2B Eczane Pazaryeri",
        subtitle: "Binlerce eczane, tek platformda. En uygun fiyatlarla depo fazlasi urunlere ulasın.",
        image_url: "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=1920&h=800&fit=crop",
        link_url: "/market/products",
        button_text: "Kesfet",
    },
    {
        id: 2,
        title: "Yeni Sezon Kampanyası",
        subtitle: "Secili urunlerde %30'a varan indirimler. Stoklar tukenmeden alın!",
        image_url: "https://images.unsplash.com/photo-1576602976047-174e57a47881?w=1920&h=800&fit=crop",
        link_url: "/market/products",
        button_text: "Kampanyaları Gor",
    },
    {
        id: 3,
        title: "Guvenilir Tedarik",
        subtitle: "Onaylı satıcılar, hızlı teslimat. B2B eczane ticaretinin yeni adresi.",
        image_url: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=1920&h=800&fit=crop",
        link_url: "/market/products",
        button_text: "Satıcıları Incele",
    },
];

export function HeroSlider({ banners }: HeroSliderProps) {
    const [api, setApi] = useState<CarouselApi>();
    const [current, setCurrent] = useState(0);
    const [count, setCount] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    const plugin = useRef(
        Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true })
    );

    const displayBanners = banners && banners.length > 0 ? banners : FALLBACK_BANNERS;

    useEffect(() => {
        if (!api) return;

        setCount(api.scrollSnapList().length);
        setCurrent(api.selectedScrollSnap());

        api.on("select", () => {
            setCurrent(api.selectedScrollSnap());
        });
    }, [api]);

    const scrollTo = useCallback(
        (index: number) => {
            api?.scrollTo(index);
        },
        [api]
    );

    const scrollPrev = useCallback(() => {
        api?.scrollPrev();
    }, [api]);

    const scrollNext = useCallback(() => {
        api?.scrollNext();
    }, [api]);

    // Parallax mouse movement handler
    const handleMouseMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
        const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
        setMousePosition({ x, y });
    }, []);

    const handleMouseLeave = useCallback(() => {
        setMousePosition({ x: 0, y: 0 });
        setIsHovered(false);
    }, []);

    return (
        <div
            ref={containerRef}
            className="relative w-full"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleMouseLeave}
            onMouseMove={handleMouseMove}
        >
            <Carousel
                setApi={setApi}
                plugins={[plugin.current]}
                className="w-full"
                opts={{
                    loop: true,
                    align: "start",
                }}
            >
                <CarouselContent>
                    {displayBanners.map((banner, index) => (
                        <CarouselItem key={banner.id}>
                            <div className="relative w-full h-[420px] sm:h-[480px] lg:h-[560px] overflow-hidden">
                                {/* Background Image with Ken Burns + Parallax Effect */}
                                <div
                                    className={cn(
                                        "absolute inset-0 bg-cover bg-center transition-all duration-[8000ms] ease-linear",
                                        current === index && "scale-110"
                                    )}
                                    style={{
                                        backgroundImage: `url(${banner.image_url})`,
                                        transform: `scale(${current === index ? 1.1 : 1}) translate(${mousePosition.x * 20}px, ${mousePosition.y * 20}px)`,
                                    }}
                                />

                                {/* Multi-layer Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/60 to-transparent" />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent" />

                                {/* Decorative Elements with Parallax */}
                                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                                    <div
                                        className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl transition-transform duration-300"
                                        style={{ transform: `translate(${mousePosition.x * -30}px, ${mousePosition.y * -30}px)` }}
                                    />
                                    <div
                                        className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl transition-transform duration-300"
                                        style={{ transform: `translate(${mousePosition.x * 30}px, ${mousePosition.y * 30}px)` }}
                                    />
                                    {/* Floating particles */}
                                    <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/20 rounded-full animate-pulse" />
                                    <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-blue-400/30 rounded-full animate-pulse delay-300" />
                                    <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-purple-400/30 rounded-full animate-pulse delay-500" />
                                </div>

                                {/* Content */}
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                                        <div className="max-w-2xl space-y-6">
                                            {/* Badge */}
                                            <div
                                                className={cn(
                                                    "inline-flex items-center px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md transition-all duration-700",
                                                    current === index
                                                        ? "opacity-100 translate-y-0"
                                                        : "opacity-0 -translate-y-4"
                                                )}
                                            >
                                                <span className="relative flex h-2 w-2 mr-2">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                                </span>
                                                <span className="text-xs font-bold text-white uppercase tracking-widest">
                                                    {banner.link_url ? "Ozel Fırsat" : "Duyuru"}
                                                </span>
                                            </div>

                                            {/* Title */}
                                            <h1
                                                className={cn(
                                                    "text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white tracking-tight leading-[1.1] transition-all duration-700 delay-100",
                                                    current === index
                                                        ? "opacity-100 translate-y-0"
                                                        : "opacity-0 translate-y-8"
                                                )}
                                            >
                                                {banner.title}
                                            </h1>

                                            {/* Subtitle */}
                                            {banner.subtitle && (
                                                <p
                                                    className={cn(
                                                        "text-lg sm:text-xl text-slate-200 line-clamp-2 max-w-lg leading-relaxed font-medium transition-all duration-700 delay-200",
                                                        current === index
                                                            ? "opacity-100 translate-y-0"
                                                            : "opacity-0 translate-y-8"
                                                    )}
                                                >
                                                    {banner.subtitle}
                                                </p>
                                            )}

                                            {/* CTA Button */}
                                            {banner.link_url && (
                                                <div
                                                    className={cn(
                                                        "pt-4 transition-all duration-700 delay-300",
                                                        current === index
                                                            ? "opacity-100 translate-y-0"
                                                            : "opacity-0 translate-y-8"
                                                    )}
                                                >
                                                    <Button
                                                        asChild
                                                        size="lg"
                                                        className="group px-8 h-14 text-base font-semibold rounded-full bg-white text-slate-900 hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-xl hover:shadow-blue-600/25 border-2 border-transparent hover:border-blue-400"
                                                    >
                                                        <Link href={banner.link_url}>
                                                            {banner.button_text || "Hemen Incele"}
                                                            <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                                                        </Link>
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Slide Number */}
                                <div className="absolute bottom-6 right-6 hidden sm:flex items-center gap-2 text-white/60 font-mono text-sm">
                                    <span className="text-white font-bold text-lg">
                                        {String(index + 1).padStart(2, "0")}
                                    </span>
                                    <span className="text-white/40">/</span>
                                    <span>{String(displayBanners.length).padStart(2, "0")}</span>
                                </div>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>

            {/* Navigation Arrows */}
            <button
                onClick={scrollPrev}
                className={cn(
                    "absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300",
                    isHovered ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                )}
            >
                <ChevronLeft className="w-6 h-6" />
            </button>
            <button
                onClick={scrollNext}
                className={cn(
                    "absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300",
                    isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
                )}
            >
                <ChevronRight className="w-6 h-6" />
            </button>

            {/* Navigation Dots */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
                {displayBanners.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => scrollTo(index)}
                        className={cn(
                            "relative h-2 rounded-full transition-all duration-300 overflow-hidden",
                            current === index
                                ? "w-10 bg-white"
                                : "w-2 bg-white/40 hover:bg-white/60"
                        )}
                    >
                        {current === index && (
                            <div
                                className="absolute inset-0 bg-blue-500 origin-left animate-progress"
                                style={{
                                    animation: "progress 5s linear forwards",
                                }}
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* Progress Animation Keyframes - Add to global CSS or use inline style */}
            <style jsx>{`
                @keyframes progress {
                    from {
                        transform: scaleX(0);
                    }
                    to {
                        transform: scaleX(1);
                    }
                }
            `}</style>
        </div>
    );
}
