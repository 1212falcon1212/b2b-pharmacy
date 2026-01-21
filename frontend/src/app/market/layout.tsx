"use client";

import { MarketHeader } from "@/components/market/MarketHeader";
import { CartSheet } from "@/components/cart/CartSheet";
import Link from "next/link";
import {
    Cross,
    Phone,
    Mail,
    MapPin,
    Clock,
    Shield,
    Truck,
    CreditCard,
    Headphones,
    Facebook,
    Twitter,
    Instagram,
    Linkedin,
    ChevronRight
} from "lucide-react";

export default function MarketLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
            {/* Cart Sheet Sidebar */}
            <CartSheet />

            {/* Premium Header */}
            <MarketHeader />

            {/* Page Content */}
            <main>{children}</main>

            {/* Trust Badges */}
            <section className="bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 py-8 mt-12 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-br from-[#059669]/5 dark:from-[#059669]/10 to-transparent">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#059669] to-[#047857] flex items-center justify-center text-white shadow-lg shadow-[#059669]/20">
                                <Truck className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-slate-900 dark:text-white text-sm">Ucretsiz Kargo</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400">500 TL ustu siparislerde</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-br from-[#0284c7]/5 dark:from-[#0284c7]/10 to-transparent">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0284c7] to-[#0369a1] flex items-center justify-center text-white shadow-lg shadow-[#0284c7]/20">
                                <Shield className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-slate-900 dark:text-white text-sm">Guvenli Alisveris</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400">256-bit SSL sertifikasi</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-br from-[#059669]/5 dark:from-[#059669]/10 to-transparent">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#059669] to-[#047857] flex items-center justify-center text-white shadow-lg shadow-[#059669]/20">
                                <CreditCard className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-slate-900 dark:text-white text-sm">Guvenli Odeme</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Tum kartlara taksit</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-br from-[#0284c7]/5 dark:from-[#0284c7]/10 to-transparent">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0284c7] to-[#0369a1] flex items-center justify-center text-white shadow-lg shadow-[#0284c7]/20">
                                <Headphones className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-slate-900 dark:text-white text-sm">7/24 Destek</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Musteri hizmetleri</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gradient-to-b from-[#0f172a] to-[#020617] text-white">
                {/* Main Footer */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
                        {/* Brand Column */}
                        <div className="lg:col-span-2">
                            <Link href="/market" className="flex items-center gap-3 mb-6 group">
                                <div className="w-12 h-12 bg-gradient-to-br from-[#059669] to-[#0284c7] rounded-xl flex items-center justify-center shadow-lg shadow-[#059669]/20 group-hover:scale-105 transition-transform">
                                    <Cross className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <span className="font-bold text-2xl text-white leading-none tracking-tight block">i-depo</span>
                                    <span className="text-xs text-[#10b981] font-semibold tracking-wider uppercase">Ecza Deposu</span>
                                </div>
                            </Link>
                            <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-sm">
                                Turkiye'nin en guvenilir B2B eczane platformu. TITCK onayli tum ecza depolari ve eczaneler icin tek adres.
                            </p>
                            <div className="space-y-3">
                                <a href="tel:08501234567" className="flex items-center gap-3 text-slate-300 hover:text-[#10b981] transition-colors group">
                                    <div className="w-8 h-8 rounded-lg bg-white/5 group-hover:bg-[#059669]/20 flex items-center justify-center transition-colors">
                                        <Phone className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm">0850 123 45 67</span>
                                </a>
                                <a href="mailto:info@i-depo.com" className="flex items-center gap-3 text-slate-300 hover:text-[#10b981] transition-colors group">
                                    <div className="w-8 h-8 rounded-lg bg-white/5 group-hover:bg-[#059669]/20 flex items-center justify-center transition-colors">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm">info@i-depo.com</span>
                                </a>
                                <div className="flex items-center gap-3 text-slate-300">
                                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                                        <Clock className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm">Hafta ici 09:00 - 18:00</span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                                <span className="w-1 h-4 bg-gradient-to-b from-[#059669] to-[#0284c7] rounded-full"></span>
                                Kurumsal
                            </h4>
                            <ul className="space-y-2.5">
                                <li>
                                    <Link href="/hakkimizda" className="text-slate-400 hover:text-[#10b981] transition-colors text-sm flex items-center gap-2 group">
                                        <ChevronRight className="w-3 h-3 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                                        Hakkimizda
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/iletisim" className="text-slate-400 hover:text-[#10b981] transition-colors text-sm flex items-center gap-2 group">
                                        <ChevronRight className="w-3 h-3 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                                        Iletisim
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/yardim" className="text-slate-400 hover:text-[#10b981] transition-colors text-sm flex items-center gap-2 group">
                                        <ChevronRight className="w-3 h-3 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                                        Yardim Merkezi
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/register" className="text-slate-400 hover:text-[#10b981] transition-colors text-sm flex items-center gap-2 group">
                                        <ChevronRight className="w-3 h-3 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                                        Satici Ol
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Help */}
                        <div>
                            <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                                <span className="w-1 h-4 bg-gradient-to-b from-[#059669] to-[#0284c7] rounded-full"></span>
                                Yardim
                            </h4>
                            <ul className="space-y-2.5">
                                <li>
                                    <Link href="/yardim/alici-rehberi/siparis-takibi" className="text-slate-400 hover:text-[#10b981] transition-colors text-sm flex items-center gap-2 group">
                                        <ChevronRight className="w-3 h-3 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                                        Siparis Takibi
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/yardim/alici-rehberi/sepet-odeme" className="text-slate-400 hover:text-[#10b981] transition-colors text-sm flex items-center gap-2 group">
                                        <ChevronRight className="w-3 h-3 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                                        Sepet ve Odeme
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/yardim/baslarken" className="text-slate-400 hover:text-[#10b981] transition-colors text-sm flex items-center gap-2 group">
                                        <ChevronRight className="w-3 h-3 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                                        Baslarken
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/yardim/alici-rehberi/fiyat-karsilastirma" className="text-slate-400 hover:text-[#10b981] transition-colors text-sm flex items-center gap-2 group">
                                        <ChevronRight className="w-3 h-3 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                                        Fiyat Karsilastirma
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Legal */}
                        <div>
                            <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                                <span className="w-1 h-4 bg-gradient-to-b from-[#059669] to-[#0284c7] rounded-full"></span>
                                Yasal
                            </h4>
                            <ul className="space-y-2.5">
                                <li>
                                    <Link href="/legal/kvkk" className="text-slate-400 hover:text-[#10b981] transition-colors text-sm flex items-center gap-2 group">
                                        <ChevronRight className="w-3 h-3 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                                        KVKK Aydinlatma
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/legal/terms" className="text-slate-400 hover:text-[#10b981] transition-colors text-sm flex items-center gap-2 group">
                                        <ChevronRight className="w-3 h-3 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                                        Kullanim Kosullari
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/legal/privacy" className="text-slate-400 hover:text-[#10b981] transition-colors text-sm flex items-center gap-2 group">
                                        <ChevronRight className="w-3 h-3 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                                        Gizlilik Politikasi
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/legal/cookies" className="text-slate-400 hover:text-[#10b981] transition-colors text-sm flex items-center gap-2 group">
                                        <ChevronRight className="w-3 h-3 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                                        Cerez Politikasi
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Bottom Footer */}
                <div className="border-t border-white/10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-xs text-slate-500">
                                <p>&copy; {new Date().getFullYear()} i-depo.com. Tum haklari saklidir.</p>
                                <span className="hidden sm:inline text-slate-700">|</span>
                                <p className="flex items-center gap-1">
                                    <Shield className="w-3 h-3 text-[#059669]" />
                                    <span>Sadece eczacilar icindir</span>
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <a
                                    href="#"
                                    className="w-9 h-9 rounded-lg bg-white/5 hover:bg-[#059669] flex items-center justify-center text-slate-400 hover:text-white transition-all"
                                    aria-label="Facebook"
                                >
                                    <Facebook className="w-4 h-4" />
                                </a>
                                <a
                                    href="#"
                                    className="w-9 h-9 rounded-lg bg-white/5 hover:bg-[#0284c7] flex items-center justify-center text-slate-400 hover:text-white transition-all"
                                    aria-label="Twitter"
                                >
                                    <Twitter className="w-4 h-4" />
                                </a>
                                <a
                                    href="#"
                                    className="w-9 h-9 rounded-lg bg-white/5 hover:bg-gradient-to-br hover:from-purple-500 hover:to-pink-500 flex items-center justify-center text-slate-400 hover:text-white transition-all"
                                    aria-label="Instagram"
                                >
                                    <Instagram className="w-4 h-4" />
                                </a>
                                <a
                                    href="#"
                                    className="w-9 h-9 rounded-lg bg-white/5 hover:bg-[#0077b5] flex items-center justify-center text-slate-400 hover:text-white transition-all"
                                    aria-label="LinkedIn"
                                >
                                    <Linkedin className="w-4 h-4" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
