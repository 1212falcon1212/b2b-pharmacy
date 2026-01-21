'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
    LayoutDashboard,
    ShoppingBag,
    MapPin,
    Settings,
    LogOut,
    Store,
    Menu,
    X,
    User,
    ChevronRight,
    Home
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

export default function AccountLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const menuItems = [
        {
            title: 'Panel',
            href: '/account/dashboard',
            icon: LayoutDashboard
        },
        {
            title: 'Siparişlerim',
            href: '/account/orders',
            icon: ShoppingBag
        },
        {
            title: 'Adreslerim',
            href: '/account/addresses',
            icon: MapPin
        },
        {
            title: 'Hesap Ayarları',
            href: '/account/settings',
            icon: Settings
        }
    ];

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row">
            {/* Mobile Header */}
            <header className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between sticky top-0 z-50">
                <Link href="/market" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Store className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white">Hesabım</span>
                </Link>
                <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                    {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>
            </header>

            {/* Sidebar */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="h-full flex flex-col">
                    {/* Sidebar Header */}
                    <div className="p-6 hidden md:block">
                        <Link href="/market" className="flex items-center gap-2 mb-1">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <Store className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-bold text-xl text-slate-900 dark:text-white">EczanePazarı</span>
                        </Link>
                        <p className="text-xs text-slate-500 ml-10">Alıcı Paneli</p>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-4 space-y-1">
                        <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Menü</p>
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors",
                                        isActive
                                            ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                                            : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
                                    )}
                                    onClick={() => setIsSidebarOpen(false)}
                                >
                                    <Icon className={cn("w-5 h-5", isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400")} />
                                    {item.title}
                                    {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                                </Link>
                            );
                        })}

                        <Separator className="my-4" />

                        <Link
                            href="/market"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            <Home className="w-5 h-5 text-slate-400" />
                            Alışverişe Dön
                        </Link>
                    </nav>

                    {/* User Profile & Logout */}
                    <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
                        <div className="flex items-center gap-3 px-2 mb-2">
                            <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-slate-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                                    {user?.pharmacy_name || user?.email || 'Kullanıcı'}
                                </p>
                                <p className="text-xs text-slate-500 truncate">{user?.pharmacy_name}</p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            className="w-full justify-start text-slate-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 border-slate-200 dark:border-slate-800"
                            onClick={handleLogout}
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Çıkış Yap
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0 overflow-y-auto">
                <div className="max-w-7xl mx-auto p-4 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
