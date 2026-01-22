"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Search,
    Store,
    User,
    Menu,
    X,
    ShoppingBag,
    Bell,
    LayoutDashboard,
    LogOut,
    ChevronDown,
    ChevronRight,
    Pill,
    Heart,
    Stethoscope,
    Syringe,
    Cross,
    Sparkles,
    Baby,
    Leaf,
    Eye,
    Activity,
    Thermometer,
    Droplets,
    ShieldPlus,
    Tablets,
    Phone,
    MapPin,
    Clock,
    Package,
    Wallet,
    History,
    Settings
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useRef } from "react";
import { CartButton } from "@/components/cart/CartButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetClose,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { CategoryItem, cmsApi } from "@/lib/api";

// Kategori ikonları mapping
const categoryIcons: Record<string, React.ReactNode> = {
    "ilac": <Pill className="w-5 h-5" />,
    "receteli": <Cross className="w-5 h-5" />,
    "recetesiz": <Tablets className="w-5 h-5" />,
    "vitamin": <Sparkles className="w-5 h-5" />,
    "takviye": <ShieldPlus className="w-5 h-5" />,
    "kozmetik": <Heart className="w-5 h-5" />,
    "anne-bebek": <Baby className="w-5 h-5" />,
    "dogal": <Leaf className="w-5 h-5" />,
    "goz": <Eye className="w-5 h-5" />,
    "tibbi-cihaz": <Stethoscope className="w-5 h-5" />,
    "enjeksiyon": <Syringe className="w-5 h-5" />,
    "tansiyon": <Activity className="w-5 h-5" />,
    "ates": <Thermometer className="w-5 h-5" />,
    "serum": <Droplets className="w-5 h-5" />,
    "default": <Pill className="w-5 h-5" />
};

const getCategoryIcon = (slug: string) => {
    const key = Object.keys(categoryIcons).find(k => slug.toLowerCase().includes(k));
    return key ? categoryIcons[key] : categoryIcons.default;
};

export function MarketHeader() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [categories, setCategories] = useState<CategoryItem[]>([]);
    const [activeCategory, setActiveCategory] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [isScrolled, setIsScrolled] = useState(false);
    const megaMenuRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const response = await cmsApi.getHomepage();
                // Backend returns: { status: "success", data: { categories: [...] } }
                // API client wraps it: { data: backendResponse, status: 200 }
                const backendData = response.data as { status: string; data: { categories: CategoryItem[] } } | undefined;
                if (backendData?.data?.categories) {
                    setCategories(backendData.data.categories);
                }
            } catch (error) {
                console.error("Failed to load categories", error);
            }
        };
        loadCategories();
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleCategoryEnter = (categoryId: number) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setActiveCategory(categoryId);
    };

    const handleCategoryLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setActiveCategory(null);
        }, 150);
    };

    const handleMegaMenuEnter = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/market/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const activeCategoryData = categories.find(c => c.id === activeCategory);

    return (
        <header className={cn(
            "sticky top-0 z-50 transition-all duration-300",
            isScrolled ? "shadow-lg" : "shadow-sm"
        )}>
            {/* Top Bar - Contact Info */}
            <div className="bg-[#059669] text-white text-xs py-1.5 hidden lg:block">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <span className="flex items-center gap-1.5">
                            <Phone className="w-3 h-3" />
                            0850 XXX XX XX
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Clock className="w-3 h-3" />
                            Hafta ici 09:00 - 18:00
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5">
                            <MapPin className="w-3 h-3" />
                            Turkiye geneli ucretsiz kargo
                        </span>
                    </div>
                </div>
            </div>

            {/* Main Header */}
            <div className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4 lg:gap-8">
                    {/* Mobile Menu Button */}
                    {mounted ? (
                        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="lg:hidden text-slate-700">
                                    <Menu className="w-6 h-6" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-[320px] p-0 bg-white">
                                <SheetHeader className="p-4 border-b border-slate-100 bg-gradient-to-r from-[#059669] to-[#0284c7]">
                                    <SheetTitle className="text-white flex items-center gap-2">
                                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                                            <Cross className="w-5 h-5 text-white" />
                                        </div>
                                        i-depo Menu
                                    </SheetTitle>
                                </SheetHeader>
                                <div className="overflow-y-auto h-[calc(100vh-80px)]">
                                    {/* Mobile Search */}
                                    <div className="p-4 border-b border-slate-100">
                                        <form onSubmit={handleSearch}>
                                            <div className="relative">
                                                <Input
                                                    type="search"
                                                    placeholder="Ilac veya urun ara..."
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    className="w-full h-10 pl-10 pr-4 bg-slate-50 border-slate-200 rounded-lg"
                                                />
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            </div>
                                        </form>
                                    </div>

                                    {/* Mobile Categories */}
                                    <div className="py-2">
                                        <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                            Kategoriler
                                        </div>
                                        {categories.map((category) => (
                                            <div key={category.id}>
                                                <SheetClose asChild>
                                                    <Link
                                                        href={`/market/category/${category.slug}`}
                                                        className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors"
                                                    >
                                                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#059669]/10 to-[#0284c7]/10 flex items-center justify-center text-[#059669]">
                                                            {getCategoryIcon(category.slug)}
                                                        </div>
                                                        <span className="flex-1 text-sm font-medium text-slate-700">
                                                            {category.name}
                                                        </span>
                                                        {category.children && category.children.length > 0 && (
                                                            <ChevronRight className="w-4 h-4 text-slate-400" />
                                                        )}
                                                    </Link>
                                                </SheetClose>
                                                {category.children && category.children.length > 0 && (
                                                    <div className="pl-12 pb-2">
                                                        {category.children.slice(0, 5).map((child) => (
                                                            <SheetClose key={child.id} asChild>
                                                                <Link
                                                                    href={`/market/category/${child.slug}`}
                                                                    className="block py-2 px-4 text-sm text-slate-500 hover:text-[#059669] transition-colors"
                                                                >
                                                                    {child.name}
                                                                </Link>
                                                            </SheetClose>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Mobile Quick Links */}
                                    <div className="border-t border-slate-100 py-2">
                                        <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                            Hizli Erisim
                                        </div>
                                        <SheetClose asChild>
                                            <Link
                                                href="/hesabim"
                                                className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors"
                                            >
                                                <User className="w-5 h-5 text-[#059669]" />
                                                <span className="text-sm font-medium text-slate-700">Hesabim</span>
                                            </Link>
                                        </SheetClose>
                                        <SheetClose asChild>
                                            <Link
                                                href="/hesabim?tab=satis-panelim"
                                                className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors"
                                            >
                                                <Store className="w-5 h-5 text-[#0284c7]" />
                                                <span className="text-sm font-medium text-slate-700">Satis Panelim</span>
                                            </Link>
                                        </SheetClose>
                                        <SheetClose asChild>
                                            <Link
                                                href="/hesabim?tab=siparislerim"
                                                className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors"
                                            >
                                                <ShoppingBag className="w-5 h-5 text-orange-500" />
                                                <span className="text-sm font-medium text-slate-700">Siparislerim</span>
                                            </Link>
                                        </SheetClose>
                                    </div>

                                    {/* Mobile User Section */}
                                    {user ? (
                                        <div className="border-t border-slate-100 p-4">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#059669] to-[#0284c7] flex items-center justify-center text-white font-medium">
                                                    {user.pharmacy_name?.[0] || user.email?.[0] || "U"}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-900">{user.pharmacy_name || 'Eczane'}</p>
                                                    <p className="text-xs text-slate-500">{user.email}</p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="outline"
                                                className="w-full text-red-500 border-red-200 hover:bg-red-50"
                                                onClick={() => {
                                                    logout();
                                                    setMobileMenuOpen(false);
                                                }}
                                            >
                                                <LogOut className="w-4 h-4 mr-2" />
                                                Cikis Yap
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="border-t border-slate-100 p-4">
                                            <SheetClose asChild>
                                                <Button
                                                    className="w-full bg-gradient-to-r from-[#059669] to-[#0284c7] hover:from-[#047857] hover:to-[#0369a1] text-white"
                                                    onClick={() => router.push("/login")}
                                                >
                                                    Giris Yap / Kayit Ol
                                                </Button>
                                            </SheetClose>
                                        </div>
                                    )}
                                </div>
                            </SheetContent>
                        </Sheet>
                    ) : (
                        <Button variant="ghost" size="icon" className="lg:hidden text-slate-700">
                            <Menu className="w-6 h-6" />
                        </Button>
                    )}

                    {/* Logo */}
                    <Link href="/market" className="flex items-center gap-2.5 shrink-0 group">
                        <div className="w-11 h-11 bg-gradient-to-br from-[#059669] to-[#0284c7] rounded-xl flex items-center justify-center shadow-lg shadow-[#059669]/20 group-hover:scale-105 transition-transform duration-300 relative overflow-hidden">
                            <Cross className="w-6 h-6 text-white relative z-10" />
                            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-xl text-slate-900 dark:text-white leading-none tracking-tight">i-depo</span>
                            <span className="text-[10px] text-[#059669] font-semibold tracking-wider uppercase">Ecza Deposu</span>
                        </div>
                    </Link>

                    {/* Search Bar - Desktop */}
                    <form onSubmit={handleSearch} className="hidden lg:flex flex-1 max-w-2xl relative">
                        <div className="relative w-full group">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                <Search className="w-5 h-5 text-slate-400 dark:text-slate-500 group-focus-within:text-[#059669] transition-colors" />
                            </div>
                            <Input
                                type="search"
                                placeholder="Ilac, urun veya barkod ara..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-12 pl-12 pr-28 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-600 focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/20 rounded-xl transition-all text-base"
                            />
                            <div className="absolute inset-y-0 right-0 p-1.5">
                                <Button
                                    type="submit"
                                    className="h-full px-6 rounded-lg bg-gradient-to-r from-[#059669] to-[#047857] hover:from-[#047857] hover:to-[#065f46] text-white font-medium shadow-md shadow-[#059669]/20"
                                >
                                    Ara
                                </Button>
                            </div>
                        </div>
                    </form>

                    {/* Right Actions */}
                    <div className="flex items-center gap-2 lg:gap-3 shrink-0">

                        {/* Theme Toggle */}
                        <ThemeToggle />

                        {/* Notifications */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-slate-600 dark:text-slate-300 hover:text-[#059669] hover:bg-[#059669]/5 dark:hover:bg-[#059669]/10 relative"
                        >
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-800" />
                        </Button>

                        {/* Cart */}
                        <div className="relative group">
                            <CartButton />
                        </div>

                        {/* User Menu */}
                        {user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="flex items-center gap-2 pl-2 pr-1 ml-1 hover:bg-slate-100 rounded-full">
                                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#059669] to-[#0284c7] flex items-center justify-center text-white font-medium text-sm shadow-md">
                                            {user.pharmacy_name?.[0] || user.email?.[0] || "U"}
                                        </div>
                                        <ChevronDown className="w-4 h-4 text-slate-500 hidden sm:block" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-72 p-2 bg-white border-slate-200 text-slate-900 shadow-xl rounded-xl">
                                    <DropdownMenuLabel className="px-3 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#059669] to-[#0284c7] flex items-center justify-center text-white font-bold text-lg">
                                                {user.pharmacy_name?.[0] || user.email?.[0] || "U"}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-slate-900 truncate">{user.pharmacy_name || 'Eczane'}</p>
                                                <p className="text-xs text-slate-500 truncate">{user.email}</p>
                                                <div className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                                                    <span>GLN:</span>
                                                    <span className="font-mono text-slate-600">{user.gln_code || '---'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator className="bg-slate-100" />
                                    <DropdownMenuItem
                                        onClick={() => router.push('/hesabim?tab=satis-panelim')}
                                        className="focus:bg-[#059669]/5 focus:text-[#059669] cursor-pointer py-2.5 rounded-lg"
                                    >
                                        <Store className="mr-3 h-4 w-4 text-[#059669]" />
                                        <span>Satis Panelim</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => router.push('/hesabim?tab=ilanlarim')}
                                        className="focus:bg-[#0284c7]/5 focus:text-[#0284c7] cursor-pointer py-2.5 rounded-lg"
                                    >
                                        <Package className="mr-3 h-4 w-4 text-[#0284c7]" />
                                        <span>Ilanlarim</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => router.push('/hesabim?tab=siparislerim')}
                                        className="focus:bg-orange-50 focus:text-orange-600 cursor-pointer py-2.5 rounded-lg"
                                    >
                                        <ShoppingBag className="mr-3 h-4 w-4 text-orange-500" />
                                        <span>Siparislerim</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => router.push('/hesabim?tab=begendiklerim')}
                                        className="focus:bg-pink-50 focus:text-pink-600 cursor-pointer py-2.5 rounded-lg"
                                    >
                                        <Heart className="mr-3 h-4 w-4 text-pink-500" />
                                        <span>Begendiklerim</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => router.push('/hesabim?tab=cuzdanim')}
                                        className="focus:bg-purple-50 focus:text-purple-600 cursor-pointer py-2.5 rounded-lg"
                                    >
                                        <Wallet className="mr-3 h-4 w-4 text-purple-500" />
                                        <span>Cuzdanim</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => router.push('/hesabim?tab=hesap-hareketlerim')}
                                        className="focus:bg-cyan-50 focus:text-cyan-600 cursor-pointer py-2.5 rounded-lg"
                                    >
                                        <History className="mr-3 h-4 w-4 text-cyan-500" />
                                        <span>Hesap Hareketlerim</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => router.push('/hesabim?tab=ayarlar')}
                                        className="focus:bg-slate-100 focus:text-slate-700 cursor-pointer py-2.5 rounded-lg"
                                    >
                                        <Settings className="mr-3 h-4 w-4 text-slate-500" />
                                        <span>Ayarlar</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-slate-100" />
                                    <DropdownMenuItem
                                        onClick={logout}
                                        className="text-red-500 focus:text-red-600 focus:bg-red-50 cursor-pointer py-2.5 rounded-lg"
                                    >
                                        <LogOut className="mr-3 h-4 w-4" />
                                        <span>Guvenli Cikis Yap</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Button
                                onClick={() => router.push("/login")}
                                className="bg-gradient-to-r from-[#059669] to-[#0284c7] hover:from-[#047857] hover:to-[#0369a1] text-white font-medium ml-2 shadow-md shadow-[#059669]/20"
                            >
                                <User className="w-4 h-4 mr-2 sm:hidden lg:inline-flex" />
                                <span className="hidden sm:inline">Giris Yap</span>
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Category Navigation Bar - Desktop */}
            <nav className="bg-black hidden lg:block relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center h-11">
                        {/* Main Category Links - Horizontal Layout */}
                        <div className="flex items-center flex-1">
                            {categories.length === 0 ? (
                                // Skeleton loading
                                Array(9).fill(0).map((_, i) => (
                                    <div key={i} className="h-11 flex items-center px-4">
                                        <div className="h-4 w-20 bg-white/10 rounded animate-pulse" />
                                    </div>
                                ))
                            ) : (
                                categories.map((category) => (
                                    <div
                                        key={category.id}
                                        className="relative h-11 flex items-center"
                                        onMouseEnter={() => handleCategoryEnter(category.id)}
                                        onMouseLeave={handleCategoryLeave}
                                    >
                                        <Link
                                            href={`/market/category/${category.slug}`}
                                            className={cn(
                                                "relative flex items-center gap-1.5 h-11 px-4 text-sm font-medium whitespace-nowrap transition-all duration-200 group border-b-2",
                                                activeCategory === category.id
                                                    ? "text-white border-[#10b981] bg-white/5"
                                                    : "text-white/80 hover:text-white border-transparent hover:border-[#10b981]/50"
                                            )}
                                        >
                                            <span>{category.name}</span>
                                            {category.children && category.children.length > 0 && (
                                                <ChevronDown className={cn(
                                                    "w-3.5 h-3.5 transition-transform duration-200 opacity-60 group-hover:opacity-100",
                                                    activeCategory === category.id && "rotate-180"
                                                )} />
                                            )}
                                        </Link>
                                    </div>
                                ))
                            )}
                        </div>

                    </div>
                </div>

                {/* Mega Menu Dropdown */}
                {activeCategory && activeCategoryData && activeCategoryData.children && activeCategoryData.children.length > 0 && (
                    <div
                        ref={megaMenuRef}
                        className="absolute left-0 right-0 top-full bg-white dark:bg-slate-800 shadow-xl border-t border-slate-200 dark:border-slate-700 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                        onMouseEnter={handleMegaMenuEnter}
                        onMouseLeave={handleCategoryLeave}
                    >
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                            {/* Subcategories Grid - 4 columns */}
                            <div className="grid grid-cols-4 gap-x-4 gap-y-1">
                                {activeCategoryData.children.map((child) => (
                                    <Link
                                        key={child.id}
                                        href={`/market/category/${child.slug}`}
                                        className="py-2.5 px-3 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-[#059669] transition-colors"
                                    >
                                        {child.name}
                                    </Link>
                                ))}
                            </div>

                            {/* View All Link */}
                            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                                <Link
                                    href={`/market/category/${activeCategoryData.slug}`}
                                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#059669] hover:text-[#047857] transition-colors group"
                                >
                                    Tum kategoriye git
                                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

            </nav>

            {/* Mobile Search Bar */}
            <div className="lg:hidden bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 px-4 py-3 transition-colors duration-300">
                <form onSubmit={handleSearch}>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Search className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                        </div>
                        <Input
                            type="search"
                            placeholder="Ilac veya urun ara..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-11 pl-10 pr-4 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white rounded-xl"
                        />
                    </div>
                </form>
            </div>

            {/* Mobile Category Bar */}
            <div className="lg:hidden bg-black px-4 py-2.5 overflow-x-auto no-scrollbar">
                <div className="flex items-center gap-2">
                    {categories.length === 0 ? (
                        // Skeleton loading
                        Array(5).fill(0).map((_, i) => (
                            <div key={i} className="h-8 w-20 bg-white/10 rounded-full animate-pulse shrink-0" />
                        ))
                    ) : (
                        categories.slice(0, 6).map((category) => (
                            <Link
                                key={category.id}
                                href={`/market/category/${category.slug}`}
                                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 active:bg-white/25 rounded-full text-sm font-medium text-white/90 whitespace-nowrap transition-all duration-200 shrink-0 border border-white/10 hover:border-white/20"
                            >
                                <span className="w-4 h-4 text-[#10b981]">{getCategoryIcon(category.slug)}</span>
                                {category.name}
                            </Link>
                        ))
                    )}
                    {categories.length > 6 && (
                        <Link
                            href="/market/kategoriler"
                            className="flex items-center gap-1.5 px-4 py-2 bg-[#059669] hover:bg-[#047857] active:bg-[#065f46] rounded-full text-sm font-semibold text-white whitespace-nowrap transition-all duration-200 shrink-0"
                        >
                            <span>Tumunu Gor</span>
                            <ChevronRight className="w-4 h-4" />
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}
