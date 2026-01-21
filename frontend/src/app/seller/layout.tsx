'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
    LayoutDashboard,
    Package,
    Tag,
    ShoppingBag,
    Wallet,
    Settings,
    Link2,
    ShoppingCart,
    LogOut
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { ThemeToggle } from '@/components/ThemeToggle';

const sidebarItems = [
    { label: 'Panel', href: '/seller/dashboard', icon: LayoutDashboard },
    { label: 'Ürünlerim', href: '/seller/products', icon: Package },
    { label: 'Tekliflerim', href: '/seller/offers', icon: Tag },
    { label: 'Siparişlerim', href: '/seller/orders', icon: ShoppingBag },
    { label: 'Cüzdanım', href: '/seller/wallet', icon: Wallet },
    { label: 'Entegrasyonlar', href: '/seller/integrations', icon: Link2 },
    { label: 'Ayarlar', href: '/seller/settings', icon: Settings },
];

export default function SellerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isLoading, isAuthenticated, logout } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex">
                <div className="w-64 bg-slate-900 p-4">
                    <Skeleton className="h-8 w-32 mb-8 bg-slate-800" />
                    <div className="space-y-2">
                        {[...Array(7)].map((_, i) => (
                            <Skeleton key={i} className="h-10 w-full bg-slate-800" />
                        ))}
                    </div>
                </div>
                <div className="flex-1 p-8">
                    <Skeleton className="h-8 w-64 mb-6" />
                    <div className="grid grid-cols-3 gap-6">
                        <Skeleton className="h-32" />
                        <Skeleton className="h-32" />
                        <Skeleton className="h-32" />
                    </div>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    const initials = user?.pharmacy_name
        ?.split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || 'EC';

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col fixed inset-y-0 left-0 z-50">
                {/* Logo */}
                <div className="h-16 flex items-center px-4 border-b border-slate-800">
                    <Link href="/seller/dashboard" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                            <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M12 2L12 22M2 12L22 12" strokeLinecap="round" />
                            </svg>
                        </div>
                        <div>
                            <span className="font-bold text-sm">Satıcı Merkezi</span>
                            <p className="text-[10px] text-slate-400">EczanePazarı</p>
                        </div>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                    {sidebarItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors group"
                        >
                            <item.icon className="w-5 h-5 text-slate-400 group-hover:text-blue-400" />
                            <span className="text-sm font-medium">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                {/* Back to Market */}
                <div className="p-3 border-t border-slate-800">
                    <Button
                        variant="ghost"
                        className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800"
                        onClick={() => router.push('/market')}
                    >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Pazaryerine Dön
                    </Button>
                </div>

                {/* User */}
                <div className="p-3 border-t border-slate-800">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800 transition-colors">
                                <Avatar className="h-9 w-9 border border-slate-700">
                                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-sm font-medium">
                                        {initials}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 text-left">
                                    <p className="text-sm font-medium text-white truncate">{user?.pharmacy_name}</p>
                                    <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                                </div>
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end">
                            <DropdownMenuLabel>
                                <p className="text-xs text-muted-foreground font-mono">GLN: {user?.gln_code}</p>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href="/seller/settings">Ayarlar</Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600" onClick={() => logout()}>
                                <LogOut className="w-4 h-4 mr-2" />
                                Çıkış Yap
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 ml-64">
                {/* Top Bar */}
                <header className="h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-end px-6">
                    <ThemeToggle />
                </header>
                <main className="p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
