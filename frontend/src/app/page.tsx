"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
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
  HelpCircle
} from 'lucide-react';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100/50">

      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200/80"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl flex items-center justify-center shadow-lg shadow-slate-900/20">
                <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 2L12 22M2 12L22 12" strokeLinecap="round" />
                </svg>
              </div>
              <span className="font-bold text-xl text-slate-900">EczanePazarı</span>
              <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                B2B
              </span>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <a href="#nasil-calisir" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">
                Nasıl Çalışır?
              </a>
              <a href="#avantajlar" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">
                Avantajlar
              </a>
              <Link href="/yardim" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">
                Yardım
              </Link>
            </nav>
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-slate-700 hover:text-blue-600 font-medium px-4 py-2 transition-colors"
              >
                Giriş Yap
              </Link>
              <Link
                href="/register"
                className="bg-gradient-to-r from-slate-800 to-slate-900 text-white px-5 py-2.5 rounded-xl font-semibold hover:from-slate-900 hover:to-slate-950 transition-all shadow-lg shadow-slate-900/25 flex items-center gap-2"
              >
                <BadgeCheck className="w-4 h-4" />
                GLN ile Kayıt
              </Link>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 lg:pt-40 lg:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <motion.div
                variants={fadeInUp}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 border border-slate-200 mb-6"
              >
                <Shield className="w-4 h-4 text-slate-700" />
                <span className="text-sm font-medium text-slate-700">Kapalı Devre Eczane Pazaryeri</span>
              </motion.div>

              <motion.h1
                variants={fadeInUp}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight"
              >
                Eczacılar Arası{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-500">
                  Güvenli Ticaret
                </span>{' '}
                Platformu
              </motion.h1>

              <motion.p
                variants={fadeInUp}
                className="mt-6 text-lg sm:text-xl text-slate-600 leading-relaxed"
              >
                GLN doğrulaması ile sadece onaylı eczacıların erişebildiği güvenli B2B platformu.
                Atıl stoklarınızı nakde çevirin, ihtiyaçlarınızı en uygun fiyatla tedarik edin.
              </motion.p>

              <motion.div
                variants={fadeInUp}
                className="mt-8 flex flex-col sm:flex-row gap-4"
              >
                <Link
                  href="/register"
                  className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-blue-600 transition-all shadow-xl shadow-blue-500/30 flex items-center justify-center gap-2 group"
                >
                  Ücretsiz Kayıt Ol
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a
                  href="#nasil-calisir"
                  className="bg-white text-slate-700 px-8 py-4 rounded-xl font-semibold text-lg border-2 border-slate-200 hover:border-blue-500 hover:text-blue-600 transition-all flex items-center justify-center gap-2"
                >
                  Nasıl Çalışır?
                </a>
              </motion.div>

              <motion.div
                variants={fadeInUp}
                className="mt-10 flex items-center gap-8 text-slate-600"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-blue-500" />
                  <span className="text-sm font-medium">GLN Doğrulama</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-blue-500" />
                  <span className="text-sm font-medium">Güvenli Ödeme</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-blue-500" />
                  <span className="text-sm font-medium">7/24 Destek</span>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="hidden lg:block relative"
            >
              <div className="absolute -top-10 -right-10 w-72 h-72 bg-gradient-to-br from-blue-400/20 to-slate-400/20 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-gradient-to-br from-slate-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse"></div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="relative bg-white rounded-3xl shadow-2xl shadow-slate-900/10 p-8 border border-slate-100"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Günlük Aktif Teklif</p>
                    <p className="text-2xl font-bold text-slate-900">5,000+</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { name: 'A Vitamin 1000 mg', price: '₺45.90', change: '-12%' },
                    { name: 'Omega 3 Balık Yağı', price: '₺78.50', change: '-8%' },
                    { name: 'Probiyotik Kapsül', price: '₺125.00', change: '-15%' },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + i * 0.15 }}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center">
                          <Package className="w-5 h-5 text-slate-400" />
                        </div>
                        <span className="font-medium text-slate-700">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900">{item.price}</p>
                        <p className="text-xs text-blue-600 font-medium">{item.change} piyasadan</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="nasil-calisir" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
              3 Adımda Başlayın
            </h2>
            <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
              Dakikalar içinde sisteme dahil olun ve eczacılar arası ticarete başlayın.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8 relative"
          >
            {/* Connection Lines */}
            <div className="hidden md:block absolute top-16 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-slate-200 via-blue-300 to-slate-200"></div>

            {[
              {
                step: '01',
                icon: BadgeCheck,
                title: 'GLN ile Doğrulanın',
                description: 'Eczane GLN numaranız ile kayıt olun. 13 haneli kodunuz sisteme erişim için yeterli.',
              },
              {
                step: '02',
                icon: Package,
                title: 'Stoklarınızı Listeleyin',
                description: 'Atıl stoklarınızı kolayca listeleyin veya ihtiyacınız olan ürünleri arayın.',
              },
              {
                step: '03',
                icon: CreditCard,
                title: 'Güvenle Al/Sat',
                description: 'Güvenli ödeme sistemi ile alışverişinizi tamamlayın. Hakedişi cüzdanınızdan çekin.',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={scaleIn}
                whileHover={{ y: -5 }}
                className="relative bg-white rounded-2xl p-8 border border-slate-100 shadow-xl shadow-slate-100/50 hover:shadow-2xl hover:shadow-blue-100 transition-all group"
              >
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-100 transition-all">
                  <item.icon className="w-8 h-8 text-slate-600 group-hover:text-blue-600 transition-colors" />
                </div>
                <div className="absolute -top-3 -right-3 w-10 h-10 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                <p className="text-slate-600">{item.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Advantages */}
      <section id="avantajlar" className="py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
              Neden EczanePazarı?
            </h2>
            <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
              Eczacılar tarafından, eczacılar için tasarlanmış güvenli B2B platformu.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[
              {
                icon: TrendingUp,
                title: 'En Uygun Fiyatı Bul',
                description: 'Cimri benzeri karşılaştırma ile aynı ürün için tüm teklifleri görün.',
                gradient: 'from-blue-500 to-blue-600',
              },
              {
                icon: Package,
                title: 'Atıl Stokları Nakde Çevir',
                description: 'Fazla stoklarınızı ihtiyacı olan eczacılara satarak gelir elde edin.',
                gradient: 'from-slate-700 to-slate-800',
              },
              {
                icon: CreditCard,
                title: 'Güvenli Ödeme',
                description: 'Havale/EFT veya kredi kartı ile güvenli ödeme. Hakediş garantisi.',
                gradient: 'from-blue-600 to-indigo-600',
              },
              {
                icon: FileCheck,
                title: 'Otomatik Fatura',
                description: 'Her işlem için otomatik e-fatura oluşturma. Muhasebe entegrasyonu.',
                gradient: 'from-indigo-500 to-purple-500',
              },
              {
                icon: Truck,
                title: 'Entegre Kargo',
                description: 'Anlaşmalı kargo firmaları ile uygun ve hızlı teslimat.',
                gradient: 'from-purple-500 to-pink-500',
              },
              {
                icon: Shield,
                title: 'GLN Güvencesi',
                description: 'Sadece doğrulanmış eczacılar. Kapalı devre güvenli ticaret.',
                gradient: 'from-slate-800 to-slate-900',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-2xl p-6 border border-slate-100 shadow-lg hover:shadow-xl transition-all group"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${item.gradient} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-600 text-sm">{item.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="py-20 bg-gradient-to-r from-slate-800 to-slate-900"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center"
          >
            {[
              { value: '1,000+', label: 'Kayıtlı Eczane', icon: Building2 },
              { value: '5,000+', label: 'Aktif Teklif', icon: Package },
              { value: '₺2M+', label: 'Aylık İşlem Hacmi', icon: TrendingUp },
              { value: '4.9/5', label: 'Kullanıcı Puanı', icon: Users },
            ].map((stat, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                className="text-white"
              >
                <stat.icon className="w-8 h-8 mx-auto mb-4 opacity-80" />
                <motion.p
                  initial={{ scale: 0.5 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.1, type: "spring" }}
                  className="text-4xl font-bold mb-2"
                >
                  {stat.value}
                </motion.p>
                <p className="text-slate-300 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Hemen Ücretsiz Başlayın
          </h2>
          <p className="text-lg text-slate-600 mb-8">
            GLN numaranız ile dakikalar içinde kayıt olun. Üyelik tamamen ücretsiz!
          </p>
          <motion.div
            variants={staggerContainer}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.div variants={fadeInUp}>
              <Link
                href="/register"
                className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-blue-600 transition-all shadow-xl shadow-blue-500/30 flex items-center justify-center gap-2 group"
              >
                <BadgeCheck className="w-5 h-5" />
                GLN ile Kayıt Ol
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
            <motion.div variants={fadeInUp}>
              <Link
                href="/login"
                className="bg-slate-100 text-slate-700 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-slate-200 transition-all flex items-center justify-center"
              >
                Giriş Yap
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 2L12 22M2 12L22 12" strokeLinecap="round" />
                  </svg>
                </div>
                <span className="font-bold text-xl text-white">EczanePazarı</span>
              </div>
              <p className="text-sm">
                Eczacılar arası güvenli B2B ticaret platformu. GLN doğrulaması ile kapalı devre sistem.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#nasil-calisir" className="hover:text-white transition-colors">Nasıl Çalışır?</a></li>
                <li><a href="#avantajlar" className="hover:text-white transition-colors">Avantajlar</a></li>
                <li><Link href="/register" className="hover:text-white transition-colors">Kayıt Ol</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Giriş Yap</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Yardım</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/yardim" className="hover:text-white transition-colors flex items-center gap-1"><HelpCircle className="w-3 h-3" /> Yardım Merkezi</Link></li>
                <li><Link href="/yardim/satici-rehberi/urun-ekleme" className="hover:text-white transition-colors">Satıcı Rehberi</Link></li>
                <li><Link href="/yardim/alici-rehberi/siparis-takibi" className="hover:text-white transition-colors">Alıcı Rehberi</Link></li>
                <li><Link href="/iletisim" className="hover:text-white transition-colors">İletişim</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Yasal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/legal/terms" className="hover:text-white transition-colors">Kullanım Koşulları</Link></li>
                <li><Link href="/legal/privacy" className="hover:text-white transition-colors">Gizlilik Politikası</Link></li>
                <li><Link href="/legal/kvkk" className="hover:text-white transition-colors">KVKK Aydınlatma</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm">
              © {new Date().getFullYear()} EczanePazarı. Tüm hakları saklıdır.
            </p>
            <div className="flex items-center gap-4">
              <span className="text-sm">Güvenli Ödeme:</span>
              <div className="flex items-center gap-2">
                <div className="w-10 h-6 bg-white/10 rounded flex items-center justify-center text-xs font-bold">VISA</div>
                <div className="w-10 h-6 bg-white/10 rounded flex items-center justify-center text-xs font-bold">MC</div>
                <div className="w-10 h-6 bg-white/10 rounded flex items-center justify-center text-xs font-bold">EFT</div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
