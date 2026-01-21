'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, Building2, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function ContactPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate form submission
        await new Promise((resolve) => setTimeout(resolve, 1000));

        toast.success('Mesajiniz basariyla gonderildi. En kisa surede size donecegiz.');
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
        setIsSubmitting(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
            {/* Hero Section */}
            <section className="relative py-16 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700" />
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Iletisim
                    </h1>
                    <p className="text-xl text-emerald-100 max-w-2xl mx-auto">
                        Sorulariniz, onerileriniz veya sikayetleriniz icin bize ulasin.
                    </p>
                </div>
            </section>

            {/* Contact Info Cards */}
            <section className="py-12 -mt-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-4 gap-6">
                        {[
                            {
                                icon: Phone,
                                title: 'Telefon',
                                content: '0850 123 45 67',
                                subtitle: 'Hafta ici 09:00 - 18:00',
                                color: 'emerald',
                            },
                            {
                                icon: Mail,
                                title: 'E-posta',
                                content: 'destek@i-depo.com',
                                subtitle: '24 saat icinde yanit',
                                color: 'blue',
                            },
                            {
                                icon: MapPin,
                                title: 'Adres',
                                content: 'Istanbul, Turkiye',
                                subtitle: 'Merkez Ofis',
                                color: 'purple',
                            },
                            {
                                icon: Clock,
                                title: 'Calisma Saatleri',
                                content: '09:00 - 18:00',
                                subtitle: 'Pazartesi - Cuma',
                                color: 'orange',
                            },
                        ].map((item, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 text-center hover:shadow-xl transition-shadow"
                            >
                                <div className={`w-14 h-14 bg-${item.color}-100 rounded-xl flex items-center justify-center mx-auto mb-4`}>
                                    <item.icon className={`w-7 h-7 text-${item.color}-600`} />
                                </div>
                                <h3 className="font-semibold text-slate-900 mb-1">{item.title}</h3>
                                <p className="text-slate-900 font-medium">{item.content}</p>
                                <p className="text-sm text-slate-500">{item.subtitle}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Form & Support */}
            <section className="py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-12">
                        {/* Form */}
                        <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-100">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                                    <MessageSquare className="w-6 h-6 text-emerald-600" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900">Bize Yazin</h2>
                                    <p className="text-slate-500">Formu doldurun, size donelim</p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Ad Soyad</Label>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="Adiniz Soyadiniz"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">E-posta</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="ornek@email.com"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Telefon</Label>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            placeholder="0555 123 4567"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="subject">Konu</Label>
                                        <Input
                                            id="subject"
                                            value={formData.subject}
                                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                            placeholder="Mesaj konusu"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="message">Mesajiniz</Label>
                                    <Textarea
                                        id="message"
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        placeholder="Mesajinizi buraya yazin..."
                                        rows={5}
                                        required
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                                >
                                    {isSubmitting ? (
                                        'Gonderiliyor...'
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4 mr-2" />
                                            Mesaj Gonder
                                        </>
                                    )}
                                </Button>
                            </form>
                        </div>

                        {/* Support Options */}
                        <div className="space-y-6">
                            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-8 text-white">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                                        <Headphones className="w-7 h-7 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold">Canli Destek</h3>
                                        <p className="text-emerald-100">Aninda yardim alin</p>
                                    </div>
                                </div>
                                <p className="text-emerald-100 mb-6">
                                    Musteri temsilcilerimiz hafta ici 09:00 - 18:00 saatleri arasinda
                                    canli destek hatti uzerinden size yardimci olmaya hazir.
                                </p>
                                <Button variant="secondary" className="w-full bg-white text-emerald-600 hover:bg-emerald-50">
                                    Canli Destek Baslat
                                </Button>
                            </div>

                            <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-100">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                                        <Building2 className="w-7 h-7 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900">Kurumsal Iletisim</h3>
                                        <p className="text-slate-500">Is birligi teklifleri</p>
                                    </div>
                                </div>
                                <p className="text-slate-600 mb-4">
                                    Is ortakliklari, kurumsal sozlesmeler veya ozel projeler icin
                                    kurumsal iletisim ekibimize ulasin.
                                </p>
                                <p className="text-sm text-slate-500">
                                    <strong>E-posta:</strong> kurumsal@i-depo.com
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
