import { Metadata } from 'next';
import { CheckCircle, AlertCircle, ArrowRight, BadgeCheck } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Kayıt ve GLN Doğrulama - EczanePazarı Yardım',
    description: 'EczanePazarı\'na nasıl kayıt olunur ve GLN doğrulaması nasıl yapılır?',
};

export default function BaslarkenPage() {
    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200">
                Kayıt ve GLN Doğrulama
            </h1>

            <p className="text-gray-600 leading-relaxed mb-8">
                EczanePazarı, sadece onaylı eczacıların erişebildiği kapalı devre bir B2B platformudur.
                Platforma kayıt olmak için geçerli bir <strong className="text-gray-900">GLN (Global Location Number)</strong> numarasına
                sahip olmanız gerekmektedir.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4" id="gln">
                GLN Nedir?
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
                GLN (Global Location Number), küresel tedarik zincirinde işletmeleri ve lokasyonları tanımlamak için
                kullanılan 13 haneli benzersiz bir numaradır. Türkiye&apos;de eczaneler için GLN numaraları
                <strong className="text-gray-900"> Tİ-TÜS (Türkiye İlaç ve Tıbbi Cihaz Ulusal Bilgi Bankası)</strong> tarafından verilmektedir.
            </p>

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 my-6">
                <h4 className="font-semibold text-emerald-800 mb-2 flex items-center gap-2">
                    <BadgeCheck className="w-5 h-5" />
                    GLN Numaranızı Nereden Bulabilirsiniz?
                </h4>
                <ul className="text-emerald-700 space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        Tİ-TÜS sistemindeki eczane kaydınızda
                    </li>
                    <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        İlaç Takip Sistemi (İTS) giriş bilgilerinizde
                    </li>
                    <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        Eczane ruhsatnamenizde veya resmi belgelerinizde
                    </li>
                </ul>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
                Kayıt Adımları
            </h2>

            <div className="space-y-6">
                {[
                    {
                        step: 1,
                        title: 'GLN Numaranızı Girin',
                        description: 'Kayıt sayfasına gidin ve 13 haneli GLN numaranızı girin. Sistem, numaranızın geçerliliğini ve daha önce kayıt olup olmadığını kontrol edecektir.',
                    },
                    {
                        step: 2,
                        title: 'Eczane Bilgilerinizi Onaylayın',
                        description: 'GLN numaranız doğrulandığında, sisteme kayıtlı eczane adı, il ve adres bilgileriniz otomatik olarak görünecektir. Bu bilgileri kontrol edin.',
                    },
                    {
                        step: 3,
                        title: 'Hesap Bilgilerinizi Oluşturun',
                        description: 'E-posta adresinizi ve güvenli bir şifre belirleyin. Şifreniz en az 8 karakter olmalıdır.',
                    },
                    {
                        step: 4,
                        title: 'Gerekli Evrakları Yükleyin',
                        description: 'GLİS evrakı, vergi levhası ve diğer gerekli belgeleri yükleyin. Bu belgeler admin ekibimiz tarafından incelenecektir.',
                    },
                    {
                        step: 5,
                        title: 'Onay Bekleyin',
                        description: 'Belgeleriniz onaylandıktan sonra platforma tam erişim sağlayabilirsiniz. Onay süreci genellikle 1 iş günü içinde tamamlanır.',
                    },
                ].map((item) => (
                    <div key={item.step} className="flex gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0">
                            {item.step}
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                            <p className="text-gray-600 text-sm">{item.description}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 my-8">
                <h4 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Önemli Not
                </h4>
                <p className="text-amber-700 text-sm">
                    Bir GLN numarası ile yalnızca bir hesap oluşturulabilir. Eğer eczaneniz için daha önce
                    kayıt yapıldıysa, mevcut hesap yöneticisiyle iletişime geçmeniz veya
                    destek ekibimize ulaşmanız gerekmektedir.
                </p>
            </div>

            <div className="flex items-center gap-4 mt-10">
                <Link
                    href="/register"
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                >
                    Şimdi Kayıt Ol
                    <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                    href="/login"
                    className="text-gray-600 hover:text-emerald-600 font-medium"
                >
                    Zaten hesabım var
                </Link>
            </div>
        </div>
    );
}
