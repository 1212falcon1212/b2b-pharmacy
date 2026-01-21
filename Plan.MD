# Proje: Eczacılara Özel Kapalı Pazaryeri (B2B)
# Rol: Senior Full-Stack Architect & Developer

## Sistem Özeti
Eczacıların GLN numarası ile doğrulandığı, sadece doğrulanmış kullanıcıların girebildiği, ürün bazlı fiyat karşılaştırma (Cimri modeli) sunan bir pazaryeri inşa edeceğiz.

## Teknoloji Stack
- **Backend:** Laravel 11 (REST API), MySQL, Redis, Laravel Sanctum, FilamentPHP (Admin Paneli).
- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui.
- **Standartlar:** PWA, Responsive Design, API-First Architecture.

## Mimari Gereksinimler (Lütfen Adım Adım Planla)

### 1. Veritabanı ve Model Yapısı (Cimri Modeli)
- 'products' (Master ürün bilgileri: Barkod, İsim, Marka, Görsel).
- 'offers' (Eczacıların satış ilanları: product_id, seller_id, price, stock, expiry_date, batch_number).
- 'users' (GLN_code, pharmacy_name, is_verified, role: super-admin, pharmacist).

### 2. GLN Doğrulama ve Auth Akışı
- Kayıt aşamasında GLN kodu doğrulaması (Service Pattern ile İTS/GS1 veya statik whitelist kontrolü).
- Laravel Sanctum ile güvenli API authentication.
- Next.js Middleware ile "Unauthorized" veya "Unverified" kullanıcıların iç sayfalara erişiminin engellenmesi.

### 3. Fiyat Karşılaştırma Mantığı
- Bir ürün arandığında, o ürüne ait tüm 'offers' tablosundaki verilerin fiyata göre (ASC) sıralanarak getirilmesi.
- Laravel Scout veya Eloquent Indexing ile hızlı arama.

### 4. Entegrasyonlar (Service Layer)
- **Fatura:** 'Bizimhesap' API entegrasyonu için abstract bir 'InvoicingService' yapısı.
- **Kargo:** Kargo firmaları için 'ShippingService' yapısı (Barkod oluşturma, takip).

### 5. Frontend (UI/UX)
- shadcn/ui bileşenleri ile modern, temiz bir arayüz.
- PWA desteği (next-pwa) ve mobile-first yaklaşım.
- Eczacılar için gelişmiş Dashboard (Stok yönetimi, Sipariş takibi).

## Talimat:
Lütfen önce veritabanı şemasını (Migrations) ve modelleri planlayarak başla. Ardından GLN doğrulama logic'ini kurgula. Her aşamada onayımı alarak ilerle.