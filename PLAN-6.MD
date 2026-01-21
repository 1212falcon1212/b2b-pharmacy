# Phase 6: Public Landing Page, User Documentation & Deployment Prep
# Rol: Senior Frontend Engineer & UI/UX Specialist

## Hedef
Eczacılar için güven veren, profesyonel bir B2B açılış sayfası (Landing Page) tasarlamak, sistemin nasıl kullanılacağını anlatan interaktif bir kullanım kılavuzu hazırlamak ve projeyi canlıya geçişe (Deployment) hazır hale getirmek.

## 1. Public Landing Page (Next.js & Tailwind CSS)
- **Tasarım Hedefi:** Güvenilir, kurumsal ve B2B odaklı. "Kapalı Devre Eczane Pazaryeri" vurgusu.
- **Bölümler (Sections):**
    - **Hero Section:** Güçlü bir başlık ("Eczacılar Arası Güvenli Ticaret Platformu"), kısa açıklama ve "Giriş Yap / Kayıt Ol" (GLN vurgulu) CTA butonları.
    - **Nasıl Çalışır?:** 3 adımda özet (1. GLN ile Doğrulan, 2. Stoklarını Listele/Ürün Ara, 3. Güvenle Al/Sat).
    - **Avantajlar:** "En Uygun Fiyatı Bul", "Atıl Stokları Nakde Çevir", "Güvenli Ödeme & Otomatik Fatura" gibi özellik vurguları (shadcn Icon'ları ile).
    - **Footer:** İletişim linkleri, Kullanım Koşulları, Gizlilik Politikası ve "Yardım Merkezi" linki.
- **Teknik:** Ana rota (`/`) bu sayfa olacak. Giriş yapmış kullanıcı bu sayfaya gelirse otomatik olarak `/dashboard` rotasına yönlendirilmeli (Middleware kontrolü).

## 2. User Guide & Help Center (Next.js + MDX)
- **Altyapı:** Next.js'in yerleşik MDX (Markdown with JSX) desteğini veya 'nextra' gibi hafif bir dokümantasyon kütüphanesini kur.
- **Yapı:** `/docs` veya `/yardim` rotası altında çalışan, sol tarafta kenar çubuğu navigasyonu olan bir yapı.
- **İçerik Başlıkları (Taslak MDX Dosyaları):**
    - **Başlarken:** "Kayıt ve GLN Doğrulama Nasıl Yapılır?"
    - **Satıcı Rehberi:** "Ürün Ekleme", "Fiyat/Stok Güncelleme", "Sipariş Yönetimi ve Kargo", "Ödeme Talebi ve Hakedişler".
    - **Alıcı Rehberi:** "En Uygun Fiyatı Bulma (Cimri Modeli)", "Sepet ve Ödeme Adımları", "Sipariş Takibi".
- **Entegrasyon:** Landing page footer'ından ve Dashboard içindeki bir "Yardım" menüsünden buraya link ver.

## 3. Final Polish & SEO
- **SEO:** Landing page için uygun 'metadata' (title, description, open graph görselleri) ayarlarını yap.
- **Performance (Lighthouse):** Görselleri optimize et (next/image), gereksiz CSS/JS yüklerini azalt. Mobil puanını maksimize et.
- **PWA Check:** Uygulama ikonlarının, açılış ekranının (splash screen) ve offline modun düzgün çalıştığını son kez test et.

## Talimat:
Lütfen önce modern ve güven veren Landing Page tasarımını 'shadcn/ui' bileşenlerini özelleştirerek kodla. Ardından MDX altyapısını kurarak temel kullanım kılavuzu sayfalarını oluştur ve birbirine bağla.