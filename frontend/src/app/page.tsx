"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import {
  Shield,
  BadgeCheck,
  TrendingUp,
  Package,
  CreditCard,
  FileCheck,
  Truck,
  ArrowRight,
  CheckCircle2,
  Users,
  Building2,
  Zap,
  Lock,
  Globe,
  ChevronDown,
  Play,
  Sparkles,
  ArrowUpRight,
  Menu,
  X,
} from "lucide-react";

// Animated counter hook
function useCounter(end: number, duration: number = 2000, start: number = 0) {
  const [count, setCount] = useState(start);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number | null = null;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(start + (end - start) * easeOutQuart));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [isVisible, end, duration, start]);

  return { count, setIsVisible };
}

// Floating pill decoration component
function FloatingPill({ className, delay = 0 }: { className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.8 }}
      className={className}
    >
      <motion.div
        animate={{ y: [-5, 5, -5], rotate: [-2, 2, -2] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="w-16 h-8 rounded-full bg-gradient-to-r from-emerald-400/20 to-teal-400/20 backdrop-blur-sm border border-emerald-500/10"
      />
    </motion.div>
  );
}

// Organic blob background
function OrganicBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Large gradient orbs */}
      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-emerald-100/40 via-teal-50/30 to-transparent blur-3xl" />
      <div className="absolute top-1/2 -left-40 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-amber-50/40 via-orange-50/20 to-transparent blur-3xl" />
      <div className="absolute -bottom-40 right-1/4 w-[400px] h-[400px] rounded-full bg-gradient-to-tl from-emerald-50/30 via-cyan-50/20 to-transparent blur-3xl" />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `linear-gradient(rgba(16, 185, 129, 1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(16, 185, 129, 1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />

      {/* Floating decorative elements */}
      <FloatingPill className="absolute top-32 right-[15%] hidden lg:block" delay={0.5} />
      <FloatingPill className="absolute top-[60%] left-[8%] hidden lg:block" delay={0.8} />
      <FloatingPill className="absolute bottom-40 right-[25%] hidden lg:block" delay={1.1} />
    </div>
  );
}

// Trust badge component
function TrustBadge({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-sm border border-emerald-100 shadow-sm">
      <Icon className="w-4 h-4 text-emerald-600" />
      <span className="text-sm font-medium text-slate-700">{text}</span>
    </div>
  );
}

// Feature card with hover effect
function FeatureCard({
  icon: Icon,
  title,
  description,
  accent,
}: {
  icon: any;
  title: string;
  description: string;
  accent: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="group relative p-8 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500"
    >
      {/* Accent gradient on hover */}
      <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

      <div className="relative">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/25 group-hover:scale-110 transition-transform duration-500">
          <Icon className="w-7 h-7 text-white" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-emerald-900 transition-colors">
          {title}
        </h3>
        <p className="text-slate-600 leading-relaxed group-hover:text-slate-700 transition-colors">
          {description}
        </p>
      </div>
    </motion.div>
  );
}

// Step card for "How it works"
function StepCard({
  number,
  title,
  description,
  isLast,
}: {
  number: string;
  title: string;
  description: string;
  isLast?: boolean;
}) {
  return (
    <div className="relative flex gap-6">
      {/* Timeline */}
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-emerald-500/30">
          {number}
        </div>
        {!isLast && (
          <div className="w-px h-full bg-gradient-to-b from-emerald-300 to-transparent mt-4" />
        )}
      </div>

      {/* Content */}
      <div className="pb-12">
        <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
        <p className="text-slate-600 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

// Stat counter component
function StatCounter({
  value,
  suffix,
  label,
  icon: Icon,
}: {
  value: number;
  suffix?: string;
  label: string;
  icon: any;
}) {
  const { count, setIsVisible } = useCounter(value, 2500);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [setIsVisible]);

  return (
    <div ref={ref} className="text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm mb-4">
        <Icon className="w-8 h-8 text-emerald-300" />
      </div>
      <div className="text-4xl md:text-5xl font-bold text-white mb-2">
        {count.toLocaleString('tr-TR')}{suffix}
      </div>
      <div className="text-emerald-200/80 font-medium">{label}</div>
    </div>
  );
}

// Testimonial card
function TestimonialCard({
  quote,
  author,
  role,
  avatar,
}: {
  quote: string;
  author: string;
  role: string;
  avatar: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm"
    >
      <div className="flex items-center gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <svg key={i} className="w-5 h-5 text-amber-400 fill-current" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <p className="text-slate-600 leading-relaxed mb-6 italic">"{quote}"</p>
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-lg">
          {avatar}
        </div>
        <div>
          <div className="font-semibold text-slate-900">{author}</div>
          <div className="text-sm text-slate-500">{role}</div>
        </div>
      </div>
    </motion.div>
  );
}

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50/30">
      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-50"
      >
        <div className="mx-4 mt-4">
          <div className="max-w-7xl mx-auto bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-200/60 shadow-lg shadow-slate-900/5">
            <div className="px-6 py-4">
              <div className="flex justify-between items-center">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3 group">
                  <div className="relative">
                    <div className="w-11 h-11 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:shadow-emerald-500/40 transition-shadow">
                      <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M12 2v20M2 12h20" strokeLinecap="round" />
                      </svg>
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full border-2 border-white flex items-center justify-center">
                      <Sparkles className="w-2.5 h-2.5 text-amber-800" />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-xl text-slate-900 tracking-tight">i-Depo</span>
                    <span className="text-[10px] font-medium text-emerald-600 -mt-0.5 tracking-wider uppercase">B2B Eczane</span>
                  </div>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-1">
                  {[
                    { label: "Nasıl Çalışır?", href: "#nasil-calisir" },
                    { label: "Avantajlar", href: "#avantajlar" },
                    { label: "Referanslar", href: "#referanslar" },
                    { label: "SSS", href: "#sss" },
                  ].map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      className="px-4 py-2 text-slate-600 hover:text-emerald-600 font-medium transition-colors rounded-lg hover:bg-emerald-50"
                    >
                      {item.label}
                    </a>
                  ))}
                </nav>

                {/* CTA Buttons */}
                <div className="hidden md:flex items-center gap-3">
                  <Link
                    href="/login"
                    className="px-5 py-2.5 text-slate-700 hover:text-emerald-600 font-semibold transition-colors"
                  >
                    Giriş Yap
                  </Link>
                  <Link
                    href="/register"
                    className="group relative px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/40 transition-all overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <BadgeCheck className="w-4 h-4" />
                      Ücretsiz Başla
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </div>

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>

              {/* Mobile Menu */}
              {mobileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="md:hidden pt-4 pb-2 border-t border-slate-100 mt-4"
                >
                  <nav className="flex flex-col gap-2">
                    {[
                      { label: "Nasıl Çalışır?", href: "#nasil-calisir" },
                      { label: "Avantajlar", href: "#avantajlar" },
                      { label: "Referanslar", href: "#referanslar" },
                      { label: "SSS", href: "#sss" },
                    ].map((item) => (
                      <a
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="px-4 py-3 text-slate-600 hover:text-emerald-600 font-medium transition-colors rounded-lg hover:bg-emerald-50"
                      >
                        {item.label}
                      </a>
                    ))}
                    <div className="flex flex-col gap-2 pt-4 border-t border-slate-100 mt-2">
                      <Link href="/login" className="px-4 py-3 text-center text-slate-700 font-semibold rounded-xl border border-slate-200">
                        Giriş Yap
                      </Link>
                      <Link href="/register" className="px-4 py-3 text-center bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold">
                        Ücretsiz Başla
                      </Link>
                    </div>
                  </nav>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section ref={heroRef} className="relative pt-32 pb-20 lg:pt-44 lg:pb-32 overflow-hidden">
        <OrganicBackground />

        <motion.div style={{ opacity: heroOpacity, scale: heroScale }} className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Trust badges */}
              <div className="flex flex-wrap gap-3 mb-8">
                <TrustBadge icon={Shield} text="GLN Doğrulamalı" />
                <TrustBadge icon={Lock} text="Kapalı Devre Sistem" />
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-[1.1] tracking-tight">
                Eczacılar İçin{" "}
                <span className="relative">
                  <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
                    Güvenli B2B
                  </span>
                  <svg className="absolute -bottom-2 left-0 w-full h-3 text-emerald-200" viewBox="0 0 200 12" preserveAspectRatio="none">
                    <path d="M0,8 Q50,0 100,8 T200,8" stroke="currentColor" strokeWidth="4" fill="none" />
                  </svg>
                </span>{" "}
                Ticaret Platformu
              </h1>

              <p className="mt-8 text-lg sm:text-xl text-slate-600 leading-relaxed max-w-xl">
                Atıl stoklarınızı nakde çevirin, ihtiyaçlarınızı piyasanın altında fiyatlarla tedarik edin.
                <span className="font-semibold text-slate-700"> Sadece GLN doğrulamalı eczacılar</span> için özel platform.
              </p>

              {/* CTA Buttons */}
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link
                  href="/register"
                  className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/40 transition-all overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-3">
                    <BadgeCheck className="w-5 h-5" />
                    GLN ile Ücretsiz Kayıt
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
                <a
                  href="#nasil-calisir"
                  className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-slate-700 rounded-2xl font-bold text-lg border-2 border-slate-200 hover:border-emerald-300 hover:text-emerald-600 transition-all"
                >
                  <Play className="w-5 h-5" />
                  Nasıl Çalışır?
                </a>
              </div>

              {/* Social proof */}
              <div className="mt-12 flex items-center gap-6">
                <div className="flex -space-x-3">
                  {["A", "B", "C", "D", "E"].map((letter, i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 border-2 border-white flex items-center justify-center text-white font-semibold text-sm shadow-md"
                      style={{ zIndex: 5 - i }}
                    >
                      {letter}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="ml-1 font-semibold text-slate-900">4.9</span>
                  </div>
                  <p className="text-sm text-slate-500">1,000+ eczane güveniyor</p>
                </div>
              </div>
            </motion.div>

            {/* Right Content - Platform Preview */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="hidden lg:block relative"
            >
              {/* Main card */}
              <div className="relative">
                {/* Glow effect */}
                <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-[2rem] blur-2xl" />

                <div className="relative bg-white rounded-3xl shadow-2xl shadow-slate-900/10 border border-slate-100 overflow-hidden">
                  {/* Header bar */}
                  <div className="px-6 py-4 bg-gradient-to-r from-slate-800 to-slate-900 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-400" />
                        <div className="w-3 h-3 rounded-full bg-amber-400" />
                        <div className="w-3 h-3 rounded-full bg-emerald-400" />
                      </div>
                      <span className="text-slate-400 text-sm font-medium">i-Depo Market</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 rounded-lg">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-emerald-400 text-xs font-semibold">Canlı</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-4">
                    {/* Stats row */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                        <div className="text-2xl font-bold text-emerald-600">5,240</div>
                        <div className="text-xs text-emerald-600/70 font-medium">Aktif Teklif</div>
                      </div>
                      <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
                        <div className="text-2xl font-bold text-amber-600">₺2.4M</div>
                        <div className="text-xs text-amber-600/70 font-medium">Günlük Hacim</div>
                      </div>
                      <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                        <div className="text-2xl font-bold text-blue-600">%12</div>
                        <div className="text-xs text-blue-600/70 font-medium">Ort. Tasarruf</div>
                      </div>
                    </div>

                    {/* Product list */}
                    <div className="space-y-3">
                      {[
                        { name: "A Vitamini 1000 IU", seller: "Merkez Ecz.", price: "₺45.90", discount: "-15%" },
                        { name: "Omega 3 Balık Yağı", seller: "Yaşam Ecz.", price: "₺78.50", discount: "-22%" },
                        { name: "D3 Vitamini 1000 IU", seller: "Sağlık Ecz.", price: "₺32.00", discount: "-18%" },
                      ].map((item, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.8 + i * 0.15 }}
                          className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors group cursor-pointer"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center group-hover:scale-105 transition-transform">
                              <Package className="w-6 h-6 text-slate-400" />
                            </div>
                            <div>
                              <div className="font-semibold text-slate-800">{item.name}</div>
                              <div className="text-sm text-slate-500">{item.seller}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-slate-900">{item.price}</div>
                            <div className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                              {item.discount} piyasadan
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* CTA */}
                    <div className="pt-2">
                      <button className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25">
                        Tüm Teklifleri Gör
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating notification card */}
              <motion.div
                initial={{ opacity: 0, y: 20, x: -20 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                transition={{ delay: 1.2, duration: 0.6 }}
                className="absolute -left-12 top-1/3 p-4 bg-white rounded-2xl shadow-xl border border-slate-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-800">Yeni Sipariş!</div>
                    <div className="text-xs text-slate-500">Az önce tamamlandı</div>
                  </div>
                </div>
              </motion.div>

              {/* Floating savings card */}
              <motion.div
                initial={{ opacity: 0, y: -20, x: 20 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                transition={{ delay: 1.4, duration: 0.6 }}
                className="absolute -right-8 bottom-1/4 p-4 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl shadow-xl"
              >
                <div className="text-center text-white">
                  <div className="text-2xl font-bold">₺12,450</div>
                  <div className="text-xs text-amber-100 font-medium">Bu ay tasarrufunuz</div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <a href="#nasil-calisir" className="flex flex-col items-center gap-2 text-slate-400 hover:text-emerald-600 transition-colors">
            <span className="text-sm font-medium">Keşfedin</span>
            <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
              <ChevronDown className="w-6 h-6" />
            </motion.div>
          </a>
        </motion.div>
      </section>

      {/* Trusted By Section */}
      <section className="py-16 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-slate-500 font-medium mb-8">
            Türkiye'nin dört bir yanından eczaneler güveniyor
          </p>
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6 opacity-60">
            {["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Adana"].map((city) => (
              <div key={city} className="flex items-center gap-2 text-slate-600">
                <Globe className="w-5 h-5" />
                <span className="font-semibold">{city}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="nasil-calisir" className="py-24 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold mb-6">
              <Zap className="w-4 h-4" />
              Hızlı Başlangıç
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
              3 Adımda Ticarete Başlayın
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              GLN numaranız ile dakikalar içinde sisteme dahil olun ve eczacılar arası güvenli ticarete başlayın.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Steps */}
            <div>
              <StepCard
                number="1"
                title="GLN ile Hızlı Kayıt"
                description="13 haneli GLN numaranızı girin, eczaneniz otomatik olarak doğrulansın. Herhangi bir evrak gerekmez."
              />
              <StepCard
                number="2"
                title="Ürünlerinizi Listeleyin"
                description="Atıl stoklarınızı kolayca listeleyin veya ihtiyacınız olan ürünleri arayın. Barkod okuyucu ile anlık ekleme yapın."
              />
              <StepCard
                number="3"
                title="Güvenle Alın/Satın"
                description="Güvenli ödeme sistemi ile alışverişinizi tamamlayın. Hakedişiniz anında cüzdanınıza yansır."
                isLast
              />
            </div>

            {/* Visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-3xl blur-xl" />
              <div className="relative bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
                <div className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                      <BadgeCheck className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">GLN Doğrulama</h3>
                      <p className="text-slate-500">Sadece onaylı eczaneler</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                      <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                      <span className="font-medium text-emerald-800">Gerçek zamanlı GLN doğrulaması</span>
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                      <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                      <span className="font-medium text-emerald-800">Kapalı devre güvenli sistem</span>
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                      <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                      <span className="font-medium text-emerald-800">Anında hesap aktivasyonu</span>
                    </div>
                  </div>

                  <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-sm text-slate-500 mb-2">Örnek GLN Doğrulama</div>
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value="8699876543210"
                        readOnly
                        className="flex-1 px-4 py-3 bg-white rounded-xl border border-slate-200 font-mono text-lg"
                      />
                      <div className="px-4 py-3 bg-emerald-500 text-white rounded-xl font-semibold flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5" />
                        Doğrulandı
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features/Advantages */}
      <section id="avantajlar" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 text-amber-700 text-sm font-semibold mb-6">
              <Sparkles className="w-4 h-4" />
              Avantajlar
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
              Neden i-Depo?
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Eczacılar tarafından, eczacılar için tasarlanmış tek gerçek B2B platformu.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={TrendingUp}
              title="En Uygun Fiyatları Bul"
              description="Tüm satıcıların tekliflerini karşılaştırın, aynı ürün için piyasanın en uygun fiyatını yakalayın."
              accent="from-emerald-50/50 to-teal-50/50"
            />
            <FeatureCard
              icon={Package}
              title="Atıl Stokları Nakde Çevir"
              description="Fazla stoklarınızı ihtiyacı olan eczacılara satarak hem kar edin hem raf ömrü sorunu yaşamayın."
              accent="from-amber-50/50 to-orange-50/50"
            />
            <FeatureCard
              icon={CreditCard}
              title="Güvenli Ödeme Sistemi"
              description="Kredi kartı veya havale ile güvenle ödeyin. Hakediş garantisi ile satışlarınızı koruma altına alın."
              accent="from-blue-50/50 to-indigo-50/50"
            />
            <FeatureCard
              icon={FileCheck}
              title="Otomatik E-Fatura"
              description="Her işlem için otomatik e-fatura oluşturma. Muhasebe entegrasyonu ile iş yükünüzü azaltın."
              accent="from-purple-50/50 to-pink-50/50"
            />
            <FeatureCard
              icon={Truck}
              title="Entegre Kargo"
              description="Anlaşmalı kargo firmaları ile uygun fiyatlı ve hızlı teslimat. Tek tıkla kargo oluşturun."
              accent="from-rose-50/50 to-red-50/50"
            />
            <FeatureCard
              icon={Shield}
              title="GLN Güvencesi"
              description="Sadece doğrulanmış eczacılar sisteme girebilir. Kapalı devre yapıyla tam güvenlik."
              accent="from-slate-50/50 to-gray-50/50"
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Rakamlarla i-Depo
            </h2>
            <p className="text-lg text-slate-300">
              Her gün büyüyen güvenilir eczacı ağı
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <StatCounter value={1250} suffix="+" label="Kayıtlı Eczane" icon={Building2} />
            <StatCounter value={5000} suffix="+" label="Aktif Teklif" icon={Package} />
            <StatCounter value={2} suffix="M+" label="Aylık İşlem Hacmi (₺)" icon={TrendingUp} />
            <StatCounter value={99} suffix="%" label="Müşteri Memnuniyeti" icon={Users} />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="referanslar" className="py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold mb-6">
              <Users className="w-4 h-4" />
              Referanslar
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
              Eczacılar Ne Diyor?
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Platformumuzu kullanan eczacıların deneyimlerini okuyun.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            <TestimonialCard
              quote="Atıl stoklarımı kolayca nakde çevirebildim. Arayüz çok kullanışlı, GLN doğrulaması da güven veriyor."
              author="Ahmet Yılmaz"
              role="Merkez Eczanesi, İstanbul"
              avatar="AY"
            />
            <TestimonialCard
              quote="Piyasanın altında fiyatlarla tedarik yapabiliyorum. Kargo entegrasyonu da çok pratik."
              author="Fatma Demir"
              role="Yaşam Eczanesi, Ankara"
              avatar="FD"
            />
            <TestimonialCard
              quote="Güvenli ödeme sistemi sayesinde hiç sorun yaşamadım. Hakedişler anında yansıyor."
              author="Mehmet Kaya"
              role="Sağlık Eczanesi, İzmir"
              avatar="MK"
            />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="sss" className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Sıkça Sorulan Sorular
            </h2>
          </motion.div>

          <div className="space-y-4">
            {[
              {
                q: "Kayıt olmak için ne gerekiyor?",
                a: "Sadece 13 haneli GLN numaranız yeterli. Sistem otomatik olarak eczanenizi doğrular ve hesabınız anında aktif olur."
              },
              {
                q: "Üyelik ücreti var mı?",
                a: "Hayır, platforma kayıt olmak ve ürün listelemek tamamen ücretsizdir. Sadece satış gerçekleştiğinde küçük bir komisyon alınır."
              },
              {
                q: "Ödeme güvenliği nasıl sağlanıyor?",
                a: "Tüm ödemeler güvenli ödeme altyapımız üzerinden gerçekleşir. Alıcı ödemesini yaptığında, ürün teslim edilene kadar havuzda tutulur."
              },
              {
                q: "Kargo nasıl çalışıyor?",
                a: "Anlaşmalı kargo firmalarımız ile tek tıkla kargo oluşturabilirsiniz. Kargo ücreti otomatik hesaplanır ve alıcıya yansıtılır."
              },
            ].map((faq, i) => (
              <motion.details
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group p-6 rounded-2xl bg-slate-50 border border-slate-100"
              >
                <summary className="flex items-center justify-between cursor-pointer list-none">
                  <span className="font-semibold text-slate-900">{faq.q}</span>
                  <ChevronDown className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform" />
                </summary>
                <p className="mt-4 text-slate-600 leading-relaxed">{faq.a}</p>
              </motion.details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-br from-emerald-500 to-teal-600 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              Hemen Ücretsiz Başlayın
            </h2>
            <p className="text-xl text-emerald-100 mb-10 max-w-2xl mx-auto">
              GLN numaranız ile dakikalar içinde kayıt olun. Üyelik tamamen ücretsiz!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-emerald-600 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all"
              >
                <BadgeCheck className="w-5 h-5" />
                GLN ile Kayıt Ol
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white/10 text-white rounded-2xl font-bold text-lg border-2 border-white/30 hover:bg-white/20 transition-all backdrop-blur-sm"
              >
                Giriş Yap
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Brand */}
            <div className="lg:col-span-1">
              <Link href="/" className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 2v20M2 12h20" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <span className="font-bold text-xl text-white">i-Depo</span>
                  <span className="block text-xs text-emerald-400 font-medium">B2B Eczane</span>
                </div>
              </Link>
              <p className="text-sm leading-relaxed">
                Eczacılar arası güvenli B2B ticaret platformu. GLN doğrulaması ile kapalı devre sistem.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-semibold text-white mb-4">Platform</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#nasil-calisir" className="hover:text-emerald-400 transition-colors">Nasıl Çalışır?</a></li>
                <li><a href="#avantajlar" className="hover:text-emerald-400 transition-colors">Avantajlar</a></li>
                <li><Link href="/register" className="hover:text-emerald-400 transition-colors">Kayıt Ol</Link></li>
                <li><Link href="/login" className="hover:text-emerald-400 transition-colors">Giriş Yap</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Yardım</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="/yardim" className="hover:text-emerald-400 transition-colors">Yardım Merkezi</Link></li>
                <li><Link href="/yardim/satici-rehberi/urun-ekleme" className="hover:text-emerald-400 transition-colors">Satıcı Rehberi</Link></li>
                <li><Link href="/yardim/alici-rehberi/siparis-takibi" className="hover:text-emerald-400 transition-colors">Alıcı Rehberi</Link></li>
                <li><Link href="/iletisim" className="hover:text-emerald-400 transition-colors">İletişim</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Yasal</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="/legal/terms" className="hover:text-emerald-400 transition-colors">Kullanım Koşulları</Link></li>
                <li><Link href="/legal/privacy" className="hover:text-emerald-400 transition-colors">Gizlilik Politikası</Link></li>
                <li><Link href="/legal/kvkk" className="hover:text-emerald-400 transition-colors">KVKK Aydınlatma</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm">
              © {new Date().getFullYear()} i-Depo. Tüm hakları saklıdır.
            </p>
            <div className="flex items-center gap-4">
              <span className="text-sm">Güvenli Ödeme:</span>
              <div className="flex items-center gap-2">
                <div className="px-3 py-1.5 bg-white/10 rounded text-xs font-bold">VISA</div>
                <div className="px-3 py-1.5 bg-white/10 rounded text-xs font-bold">MC</div>
                <div className="px-3 py-1.5 bg-white/10 rounded text-xs font-bold">EFT</div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
