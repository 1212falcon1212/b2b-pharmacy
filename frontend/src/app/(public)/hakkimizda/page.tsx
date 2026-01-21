import { Metadata } from 'next';
import Link from 'next/link';
import { Building2, Users, Shield, Award, Target, Heart, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Hakkimizda | i-depo',
    description: 'i-depo hakkinda bilgi edinin. Turkiyenin lider B2B eczane pazaryeri.',
};

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
            {/* Hero Section */}
            <section className="relative py-20 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Turkiyenin Lider B2B Eczane Pazaryeri
                    </h1>
                    <p className="text-xl text-emerald-100 max-w-3xl mx-auto">
                        Eczaneler ve ecza depolari arasinda guvenilir, hizli ve ekonomik bir kopru kuruyoruz.
                    </p>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-100">
                            <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center mb-6">
                                <Target className="w-7 h-7 text-emerald-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">Misyonumuz</h2>
                            <p className="text-slate-600 leading-relaxed">
                                Eczanelerin ilac ve saglik urunlerine en uygun fiyatlarla, en hizli sekilde
                                ulasmasini saglamak. Dijital donusum ile eczane tedarik sureclerini
                                kolaylastirmak ve verimlilestirmek.
                            </p>
                        </div>
                        <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-100">
                            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                                <Heart className="w-7 h-7 text-blue-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">Vizyonumuz</h2>
                            <p className="text-slate-600 leading-relaxed">
                                Turkiyenin en buyuk ve en guvenilir B2B eczane pazaryeri olarak,
                                saglik sektorunde dijital donusumun oncusu olmak ve tum paydaşlara
                                deger katmak.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="py-16 bg-slate-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            { value: '5000+', label: 'Aktif Eczane' },
                            { value: '200+', label: 'Ecza Deposu' },
                            { value: '50.000+', label: 'Urun Cesidi' },
                            { value: '81', label: 'Il\'de Hizmet' },
                        ].map((stat, index) => (
                            <div key={index} className="text-center">
                                <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                                    {stat.value}
                                </div>
                                <div className="text-slate-400">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">
                        Degerlerimiz
                    </h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Shield,
                                title: 'Guvenilirlik',
                                description: 'Tum islemleriniz SSL ile korunur. Sadece ruhsatli eczane ve depolar platformumuzu kullanabilir.',
                                color: 'emerald',
                            },
                            {
                                icon: Users,
                                title: 'Musteri Odaklilik',
                                description: '7/24 destek ekibimiz ile her zaman yaninizda. Sorulariniza hizli ve etkili cozumler sunuyoruz.',
                                color: 'blue',
                            },
                            {
                                icon: Award,
                                title: 'Kalite',
                                description: 'Platformumuzdaki tum urunler ITS ile takip edilir. Kalite standartlarindan odun vermeyiz.',
                                color: 'purple',
                            },
                        ].map((value, index) => (
                            <div key={index} className="bg-white rounded-2xl p-8 shadow-lg border border-slate-100 text-center">
                                <div className={`w-16 h-16 bg-${value.color}-100 rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                                    <value.icon className={`w-8 h-8 text-${value.color}-600`} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{value.title}</h3>
                                <p className="text-slate-600">{value.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 bg-gradient-to-r from-emerald-600 to-teal-600">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold text-white mb-6">
                        Hemen Baslayin
                    </h2>
                    <p className="text-emerald-100 mb-8 max-w-2xl mx-auto">
                        i-depo ailesine katilarak avantajli fiyatlarla urun tedarik etmeye baslayin.
                    </p>
                    <Link
                        href="/register"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-white text-emerald-600 font-semibold rounded-xl hover:bg-emerald-50 transition-colors"
                    >
                        Ucretsiz Kayit Ol
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>
        </div>
    );
}
