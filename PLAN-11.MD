# Phase 8: Premium Marketplace UI & Brand Re-Design
# Rol: Lead Frontend Developer & Senior UI/UX Designer

## Hedef
Sistemi yeşil tonlarından kurtarıp Koyu Lacivert (#0f172a), Siyah (#020617) ve Slate tonlarında premium bir tasarıma taşımak; "Alıcı (Market)" ve "Satıcı (Dashboard)" dünyalarını keskin bir şekilde ayırmak.

## 1. Tema ve Global Styles (Tailwind & shadcn)
- **Renk Paleti:** Ana renk olarak 'Dark Navy' (#0f172a) ve 'Deep Black' (#020617) kullan. Vurgu rengi olarak 'Electric Blue' veya 'Soft Gold' (sadece kritik aksiyonlar için) tercih et.
- **Dark Mode Optimization:** Tüm shadcn bileşenlerini bu koyu palete göre 'custom' olarak konfigüre et.
- **Tipografi:** Daha kurumsal ve okunaklı bir font (örn: 'Geist' veya 'Plus Jakarta Sans') kullan.

## 2. Marketplace (Alıcı Modu) Ana Sayfa Tasarımı
- **Hero Banner:** Ekranın en üstünde geniş, modern ve degrade (gradient) geçişli bir alan. İçinde: "Eczane Stoklarınızda Dijital Dönüşüm" başlığı ve devasa bir 'Command Palette' tarzı arama barı.
- **Kategori Navigasyonu:** Hero altında, ikon yerine yüksek kaliteli eczane/medikal ürün görselleriyle desteklenmiş dairesel veya kart tipi kategori listesi.
- **Dinamik Ürün Reyonları (Carousels):** - "Çok Satanlar" (Popüler ürünler).
    - "Fırsat Ürünleri" (En yüksek indirim/En ucuz teklifler).
    - "İlginizi Çekebilir" (Kullanıcı geçmişine dayalı feed).
- **Cimri Kart Yapısı:** Ürün kartlarını daha şık yap; en düşük fiyatı vurgula, satıcı sayısını şık bir badge ile göster.

## 3. Navigasyon ve Rota Ayrımı
- **Header Re-design:** Alıcı modunda header'ı basitleştir. Sadece: Logo, Arama, Sepet ve "Satıcı Paneline Geç" butonu (belirgin bir stil ile).
- **Layout Separation:** - `/market/*` rotaları: Tamamen pazar yeri deneyimi (E-ticaret akışı).
    - `/seller/*` rotaları: Profesyonel, sidebar tabanlı, veri yoğunluklu 'Seller Center' (Stok, ERP, Hakediş).

## 4. Landing Page İyileştirmesi
- Sisteme giriş yapmamış kullanıcıyı karşılayan landing page'i, projenin "Kapalı Pazaryeri" vurgusunu yapan, kaliteli görseller ve animasyonlarla (framer-motion) desteklenmiş bir "Kurumsal Vitrin"e dönüştür.

## Talimat:
Lütfen önce tailwind.config.ts ve global CSS üzerinden renk paletini güncelle. Ardından Next.js App Router yapısında `/market` ve `/seller` layout'larını birbirinden ayırarak Marketplace ana sayfasındaki Banner ve Ürün Reyonlarını 'shadcn/ui' bileşenleriyle inşa et.