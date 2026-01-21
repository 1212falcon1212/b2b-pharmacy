# B2B Eczane Projesi - Kapsamlı Sistem Analiz Raporu

**Rapor Tarihi:** 2026-01-20
**Analiz Edilen Proje:** B2B Eczane Pazaryeri
**Teknoloji Stack:** Laravel 12.44.0 + Next.js 16 + React 19
**PHP Versiyonu:** 8.2.29

---

## İçindekiler

1. [Yönetici Özeti](#1-yönetici-özeti)
2. [Bulgu Özet Tablosu](#2-bulgu-özet-tablosu)
3. [Kritik Bulgular](#3-kritik-bulgular)
4. [Laravel API Analizi](#4-laravel-api-analizi)
5. [Frontend Analizi](#5-frontend-analizi)
6. [Veritabanı Mimarisi](#6-veritabanı-mimarisi)
7. [Entegrasyon Sistemleri](#7-entegrasyon-sistemleri)
8. [Test Durumu](#8-test-durumu)
9. [Güvenlik Analizi](#9-güvenlik-analizi)
10. [Hata ve Log Analizi](#10-hata-ve-log-analizi)
11. [Öncelikli Eylem Planı](#11-öncelikli-eylem-planı)
12. [Oluşturulması Gereken Dosyalar](#12-oluşturulması-gereken-dosyalar)

---

## 1. Yönetici Özeti

Bu rapor, B2B Eczane projesinin 7 farklı perspektiften yapılan kapsamlı analizinin sonuçlarını içermektedir. Analiz sonucunda **119 adet bulgu** tespit edilmiştir.

### Genel Değerlendirme

| Metrik | Durum |
|--------|-------|
| **Güvenlik** | ⚠️ Kritik sorunlar mevcut |
| **Kod Kalitesi** | ⚠️ İyileştirme gerekli |
| **Test Coverage** | 🔴 Kritik düzeyde yetersiz (~0%) |
| **Veritabanı** | ⚠️ İndeks ve FK eksiklikleri |
| **Entegrasyonlar** | ⚠️ Eksik implementasyonlar |
| **Performans** | ⚠️ N+1 query riskleri |

### Kritik Uyarılar

1. **Güvenlik:** Webhook signature doğrulaması YOK - sahte ödeme riski
2. **Test:** Proje neredeyse hiç test içermiyor - regression riski çok yüksek
3. **Aktif Hata:** ProductController'da category sütunu hatası
4. **XSS:** Frontend'de dangerouslySetInnerHTML kullanımı

---

## 2. Bulgu Özet Tablosu

| Kategori | Kritik | Yüksek | Orta | Düşük | Toplam |
|----------|--------|--------|------|-------|--------|
| Laravel API | 5 | 5 | 6 | 3 | 19 |
| Frontend | 5 | 4 | 4 | 2 | 15 |
| Veritabanı | 3 | 6 | 3 | 3 | 15 |
| Entegrasyonlar | 11 | - | 14 | 7 | 32 |
| Test Durumu | 4 | 4 | 3 | 3 | 14 |
| Güvenlik | 2 | 2 | 4 | 4 | 12 |
| Hata/Log | 3 | 3 | 3 | 3 | 12 |
| **TOPLAM** | **33** | **24** | **37** | **25** | **119** |

---

## 3. Kritik Bulgular

### 3.1 Güvenlik Açıkları (Hemen Düzeltilmeli)

| # | Sorun | Dosya | Risk |
|---|-------|-------|------|
| 1 | Webhook signature doğrulaması YOK | `WebhookController.php` | Sahte ödeme bildirimi |
| 2 | Test mode bypass riski | `IyzicoProvider.php:111-117` | Ödeme atlama |
| 3 | SSL doğrulama devre dışı | `PttProvider.php:48-54` | MITM saldırısı |
| 4 | XML Injection riski | `ArasProvider.php:160-164` | Veri manipülasyonu |
| 5 | XSS riski | `legal/[slug]/page.tsx` | Kullanıcı verisi çalınması |
| 6 | Laravel Policy eksik | `app/Policies/` boş | IDOR saldırısı |

### 3.2 Veri Tutarsızlığı

| # | Sorun | Detay |
|---|-------|-------|
| 1 | Aktif veritabanı hatası | `ProductController.php:25` - `category` sütunu kaldırılmış ama kod hala arıyor |
| 2 | FK constraint eksik | `wallet_transactions.order_item_id`, `users.approved_by` |
| 3 | N+1 Query riski | `Order::getItemsBySellerAttribute()`, `Cart::getItemsBySellerAttribute()` |

### 3.3 Test Eksikliği

| Metrik | Mevcut | Hedef |
|--------|--------|-------|
| Toplam Test | 2 (boş örnek) | 150+ |
| Factory Dosyası | 1 (User) | 15+ |
| Code Coverage | ~0% | 80%+ |

---

## 4. Laravel API Analizi

### 4.1 Eksik Form Request'ler (15 adet)

Controller'larda inline `$request->validate()` kullanılıyor. Bunların ayrı Form Request sınıflarında olması gerekiyor:

| Controller | Method | Eksik Form Request |
|------------|--------|-------------------|
| CartController | addItem() | AddCartItemRequest |
| CartController | updateItem() | UpdateCartItemRequest |
| OrderController | store() | StoreOrderRequest |
| OrderController | updateStatus() | UpdateOrderStatusRequest |
| PaymentController | initialize() | InitializePaymentRequest |
| PaymentController | refund() | RefundRequest |
| WalletController | addBankAccount() | StoreBankAccountRequest |
| WalletController | createPayoutRequest() | StorePayoutRequest |
| ShippingController | calculate() | CalculateShippingRequest |
| IntegrationController | store() | StoreIntegrationRequest |
| DocumentController | upload() | UploadDocumentRequest |
| LegalController | approveContract() | ApproveContractRequest |
| NotificationSettingController | update() | UpdateNotificationRequest |
| WishlistController | toggle() | ToggleWishlistRequest |
| UserAddressController | store(), update() | StoreAddressRequest, UpdateAddressRequest |

**Mevcut Request Sayısı:** Sadece 4 adet (Login, Register, StoreOffer, UpdateOffer)

### 4.2 Response Format Tutarsızlığı

```php
// 3 farklı format kullanılıyor:
{ "status": "success", "data": ... }  // CmsController
{ "cart": ..., "items": ... }         // CartController
{ "success": true, "data": ... }      // SellerController
```

**Öneri:** Tek bir standart response formatı belirlenmeli.

### 4.3 Eksik API Resource'lar

Hiçbir controller'da Laravel API Resource kullanılmıyor. Oluşturulması gereken resource'lar:

- UserResource
- ProductResource
- OfferResource
- OrderResource / OrderItemResource
- CartResource / CartItemResource
- InvoiceResource
- BannerResource
- CategoryResource
- WalletResource
- BankAccountResource

### 4.4 Rate Limiting Eksiklikleri

```php
// Sadece auth route'ları için throttle tanımlı
Route::prefix('auth')->middleware('throttle:auth')->group(function () {

// EKSIK: Aşağıdaki hassas endpoint'ler için rate limiting yok:
Route::post('/payments/callback/{gateway}', [...])  // Ödeme callback
Route::post('/webhooks/{provider}', [...])          // Webhook
Route::post('/orders', [...])                       // Sipariş oluşturma
Route::post('/wallet/payout-requests', [...])       // Para çekme
```

### 4.5 Validation Sorunları

**RegisterRequest.php:**
```php
'password' => ['required', 'string', 'min:8', 'confirmed'],
// EKSIK: Şifre güçlülüğü kontrolü (regex ile büyük harf, rakam, özel karakter)
```

**WalletController.php - IBAN Validasyonu:**
```php
'iban' => 'required|string|min:26|max:34',
// EKSIK: Türkiye IBAN formatı kontrolü (TR ile başlamalı, checksum)
```

---

## 5. Frontend Analizi

### 5.1 Zustand Store Sorunları

**Dosya:** `frontend/src/stores/useCartStore.ts`

| Sorun | Açıklama |
|-------|----------|
| Tek store dosyası | User, products, notifications için store yok |
| Error handling yetersiz | Hatalar sadece console.error ile loglanıyor |
| Loading state tek değişken | Paralel işlemlerde sorun çıkarır |

### 5.2 API Client Sorunları

**Dosya:** `frontend/src/lib/api.ts`

| Sorun | Risk |
|-------|------|
| 401 Handler yok | Otomatik logout yapılmıyor |
| Retry mekanizması yok | Geçici hatalarda başarısızlık |
| Network error detayı kayboluyor | Debug zorluğu |

### 5.3 TypeScript `any` Kullanımları

| Dosya | Satır | Kullanım |
|-------|-------|----------|
| orders/[id]/page.tsx | 26 | `icon: any` |
| products/page.tsx | 38 | `item: any` |
| IntegrationCard.tsx | 33, 47 | `error: any` |
| ProductCarousel.tsx | 10 | `products: any[]` |
| MarketHeader.tsx | 214 | `...props: any` |
| api.ts | 829 | `api.get<any>` |

### 5.4 Tekrar Eden Kodlar

**formatPrice Fonksiyonu - 17 dosyada tekrar:**
```typescript
const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
    }).format(price);
};
```

**Diğer tekrarlar:**
- Pagination logic - 5+ sayfa
- Empty state pattern - 10+ sayfa
- Loading skeleton - 8+ sayfa
- API response handling - Her sayfada

### 5.5 Form Validasyon Eksiklikleri

**Kritik:** Projede Zod entegrasyonu YOK!

| Sayfa | Sorun |
|-------|-------|
| Login | Email format kontrolü yok |
| Register | GLN checksum kontrolü yok |
| Checkout | Telefon format kontrolü yok |
| Address Form | İl/İlçe listesi yok |

---

## 6. Veritabanı Mimarisi

### 6.1 Eksik İndeksler

| Tablo | Alan | Öneri |
|-------|------|-------|
| users | verified_at, verification_status, city | İndeks ekle |
| order_items | product_id, offer_id | FK indeksi ekle |
| cart_items | product_id | FK indeksi ekle |
| user_addresses | user_id | FK indeksi ekle |
| invoices | buyer_id | İndeks ekle |

### 6.2 Eksik Foreign Key Constraint'ler

| Tablo | Alan | İlişkili Tablo |
|-------|------|----------------|
| wallet_transactions | order_item_id | order_items |
| users | approved_by | users |

### 6.3 OnDelete Davranış Tutarsızlıkları

```
offers: product_id -> cascade, seller_id -> cascade
cart_items: cart_id -> cascade, diğer FK'lar -> yok
order_items: order_id -> cascade, diğer FK'lar -> yok
invoices: order_id -> set null, seller_id -> set null
```

**Öneri:** Tutarlı bir strateji belirlenmeli.

### 6.4 N+1 Query Riskleri

| Dosya | Metod | Risk Seviyesi |
|-------|-------|---------------|
| Order.php | getItemsBySellerAttribute() | YÜKSEK |
| Cart.php | getItemsBySellerAttribute() | YÜKSEK |
| Product.php | getLowestPriceAttribute() | ORTA |
| Product.php | getTotalStockAttribute() | ORTA |

### 6.5 Soft Delete Eksikliği

Aşağıdaki tablolarda soft delete olmalı:
- `products` - Ürün silindiğinde sipariş geçmişi bozulabilir
- `users` - Kullanıcı silindiğinde sipariş/fatura geçmişi bozulabilir
- `offers` - Teklif silindiğinde sipariş geçmişi bozulabilir

---

## 7. Entegrasyon Sistemleri

### 7.1 Ödeme Entegrasyonları

**iyzico Provider:**
| Sorun | Ciddiyet | Satır |
|-------|----------|-------|
| Webhook doğrulama YOK | KRİTİK | 107-139 |
| Test mode bypass riski | KRİTİK | 111-117 |
| Gerçek SDK entegrasyonu yok | ORTA | 64-105 |
| Refund implementasyonu eksik | ORTA | 142-158 |

**PayTR Provider:**
| Sorun | Ciddiyet | Satır |
|-------|----------|-------|
| Hash doğrulama eksik | KRİTİK | 186-195 |
| getIframeToken() çalışmıyor | ORTA | 107-150 |
| Refund implementasyonu eksik | ORTA | 213-229 |

### 7.2 Kargo Entegrasyonları (8 adet)

| Provider | Sorun | Ciddiyet |
|----------|-------|----------|
| ArasProvider | XML Injection riski | KRİTİK |
| PttProvider | SSL doğrulama devre dışı | KRİTİK |
| YurtIciProvider | HTTP kullanımı (HTTPS değil) | KRİTİK |
| MngProvider | HTTP kullanımı | KRİTİK |
| SuratProvider | HTTP kullanımı + Stub implementation | KRİTİK |
| Tüm provider'lar | getLabel() implementasyonu eksik | ORTA |
| Tüm provider'lar | Timeout ayarı yok | DÜŞÜK |
| Tüm provider'lar | Retry mekanizması yok | DÜŞÜK |

### 7.3 ERP Entegrasyonları

| Provider | Sorun |
|----------|-------|
| EntegraProvider | Token expiry kontrolü yok |
| ParasutProvider | Credential açık metin saklanabilir |
| BizimHesapProvider | Pagination desteği yok |
| Tüm provider'lar | Timeout ve rate limiting yok |

### 7.4 Webhook Handler

**Dosya:** `WebhookController.php`

```php
public function handle(string $provider, Request $request)
{
    Log::info("Webhook received from {$provider}", $request->all());
    return response()->json(['status' => 'received']);
}
// KRİTİK: Hiçbir güvenlik kontrolü yok!
```

**Eksikler:**
- Signature doğrulama YOK
- Rate limiting YOK
- IP whitelisting YOK

---

## 8. Test Durumu

### 8.1 Mevcut Durum

| Dosya | İçerik |
|-------|--------|
| tests/Unit/ExampleTest.php | `assertTrue(true)` - Boş örnek |
| tests/Feature/ExampleTest.php | Ana sayfa 200 status kontrolü |
| tests/TestCase.php | Boş base test class |

**Sonuç:** Proje neredeyse hiçbir gerçek test içermiyor!

### 8.2 Eksik Factory Dosyaları

**Mevcut:** Sadece `UserFactory.php`

**Gerekli (Yüksek Öncelik):**
- OrderFactory.php
- OrderItemFactory.php
- CartFactory.php
- CartItemFactory.php
- ProductFactory.php
- OfferFactory.php
- CategoryFactory.php

**Gerekli (Orta Öncelik):**
- InvoiceFactory.php
- SellerWalletFactory.php
- WalletTransactionFactory.php
- PayoutRequestFactory.php

### 8.3 Test Edilmesi Gereken Kritik İş Mantığı

**OrderService:**
- createFromCart() - Stok kontrolü, komisyon hesaplaması
- cancelOrder() - Stok restore, status güncelleme
- generateOrderNumber() - Unique numara üretimi

**CartService:**
- addItem() - Stok kontrolü, miktar artırma
- validateCart() - Fiyat değişikliği, stok yetersizliği
- syncPrices() - Güncel fiyat alma

**WalletService:**
- addOrderEarnings() - Pending balance, komisyon hesaplama
- releasePendingBalance() - Bakiye serbest bırakma
- processWithdrawal() - Para çekme kontrolü

---

## 9. Güvenlik Analizi

### 9.1 OWASP Top 10 Değerlendirmesi

| Kategori | Durum | Notlar |
|----------|-------|--------|
| SQL Injection | ✅ Düşük Risk | Eloquent kullanımı, raw query'ler admin panelinde |
| XSS | 🔴 Yüksek Risk | dangerouslySetInnerHTML kullanımı |
| Broken Auth | ⚠️ Orta Risk | Token expiration null |
| Sensitive Data | ✅ Düşük Risk | Password hidden, credentials encrypted |
| Broken Access Control | 🔴 Yüksek Risk | Policy sistemi kullanılmıyor |
| Security Misconfiguration | ⚠️ Orta Risk | Debug mode açık, CORS wildcard |
| Insecure Deserialization | ✅ Düşük Risk | Tespit edilmedi |
| Insufficient Logging | ⚠️ Orta Risk | Security olayları loglanmıyor |

### 9.2 Authentication & Authorization

**Sanctum Yapılandırması:**
```php
// config/sanctum.php
'expiration' => null,  // KRİTİK: Token süresi sınırlanmamış!
'token_prefix' => '',  // Secret scanning için prefix yok
```

**Authorization:**
- Laravel Policy sistemi kullanılmıyor
- Her controller'da tekrar eden authorization kodu
- IDOR (Insecure Direct Object Reference) riski

### 9.3 Frontend Güvenlik

**Token Saklama:**
```typescript
// api.ts
localStorage.setItem('token', token);  // XSS ile çalınabilirlik riski
```

**XSS Riski:**
```tsx
// legal/[slug]/page.tsx
<CardContent dangerouslySetInnerHTML={{ __html: content }} />
```

### 9.4 CORS Yapılandırması

```php
// config/cors.php
'allowed_origins' => [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    // Üretim URL'i EKSİK!
],
'allowed_methods' => ['*'],  // Wildcard
'allowed_headers' => ['*'],  // Wildcard
```

---

## 10. Hata ve Log Analizi

### 10.1 Aktif Hata

**Dosya:** `storage/logs/laravel.log`

```
[2026-01-01 10:32:57] local.ERROR: SQLSTATE[42S22]: Column not found: 1054
Unknown column 'category' in 'where clause'
```

**Kaynak:** `ProductController.php:25`
```php
if ($category) {
    $query->where('category', $category);  // HATALI - sütun artık yok
}
```

**Düzeltme:**
```php
if ($category) {
    $query->whereHas('category', fn($q) => $q->where('slug', $category));
}
```

### 10.2 Log Yapılandırması

| Ayar | Değer | Öneri |
|------|-------|-------|
| Log Level | debug | Production'da `error` olmalı |
| Log Channel | single | `daily` kullanılmalı |
| Deprecations | null | Aktifleştirilmeli |

### 10.3 Exception Handler

```php
// bootstrap/app.php
->withExceptions(function (Exceptions $exceptions): void {
    // BOŞ - Özel hata işleme yok!
})
```

**Eksikler:**
- API hataları HTML dönebilir
- Model not found → 404 JSON olmalı
- Validation → 422 JSON olmalı

### 10.4 Sentry Entegrasyonu

```php
// config/sentry.php
'dsn' => env('SENTRY_DSN'),  // .env'de YOK - Sentry aktif değil!
```

---

## 11. Öncelikli Eylem Planı

### 11.1 Bu Hafta (Kritik)

| # | Görev | Dosya | Tahmini Süre |
|---|-------|-------|--------------|
| 1 | Webhook signature doğrulaması | WebhookController.php | 2-3 saat |
| 2 | Test mode bypass düzeltmesi | IyzicoProvider.php | 1 saat |
| 3 | ProductController category fix | ProductController.php | 30 dk |
| 4 | XSS koruması (DOMPurify) | legal/[slug]/page.tsx | 1-2 saat |
| 5 | Rate limiting ekleme | routes/api.php | 1-2 saat |
| 6 | APP_DEBUG=false | .env | 5 dk |

### 11.2 1-2 Hafta İçinde (Yüksek)

| # | Görev | Tahmini Süre |
|---|-------|--------------|
| 1 | Form Request sınıfları (15 adet) | 1-2 gün |
| 2 | Laravel Policy sınıfları | 1 gün |
| 3 | Factory dosyaları (7 adet) | 1 gün |
| 4 | Token expiration ayarı | 30 dk |
| 5 | formatPrice utility fonksiyonu | 1 saat |
| 6 | Zod entegrasyonu | 1 gün |

### 11.3 Sonraki Sprint (Orta)

| # | Görev | Tahmini Süre |
|---|-------|--------------|
| 1 | API Resource sınıfları (10 adet) | 2-3 gün |
| 2 | Custom exception sınıfları | 1 gün |
| 3 | Retry mekanizması | 1 gün |
| 4 | HTTPS migration (kargo API'ları) | 2-3 saat |
| 5 | Test yazımı (50+ test) | 1 hafta |
| 6 | N+1 query düzeltmeleri | 1 gün |

### 11.4 Backlog (Düşük)

- Soft delete ekleme
- Audit logging
- Response caching
- Performance optimization
- Documentation

---

## 12. Oluşturulması Gereken Dosyalar

### 12.1 Form Request'ler

```
backend/app/Http/Requests/Api/
├── AddCartItemRequest.php
├── UpdateCartItemRequest.php
├── StoreOrderRequest.php
├── UpdateOrderStatusRequest.php
├── InitializePaymentRequest.php
├── RefundRequest.php
├── StoreBankAccountRequest.php
├── StorePayoutRequest.php
├── CalculateShippingRequest.php
├── ShippingOptionsRequest.php
├── StoreIntegrationRequest.php
├── UploadDocumentRequest.php
├── ApproveContractRequest.php
├── UpdateNotificationRequest.php
├── ToggleWishlistRequest.php
├── StoreAddressRequest.php
├── UpdateAddressRequest.php
└── CreateShipmentRequest.php
```

### 12.2 API Resource'lar

```
backend/app/Http/Resources/
├── UserResource.php
├── ProductResource.php
├── OfferResource.php
├── OrderResource.php
├── OrderItemResource.php
├── CartResource.php
├── CartItemResource.php
├── InvoiceResource.php
├── BannerResource.php
├── CategoryResource.php
├── WalletResource.php
└── BankAccountResource.php
```

### 12.3 Middleware'ler

```
backend/app/Http/Middleware/
├── VerifyWebhookSignature.php
├── EnsureSellerRole.php
└── EnsureDocumentsApproved.php
```

### 12.4 Policy'ler

```
backend/app/Policies/
├── OrderPolicy.php
├── OfferPolicy.php
├── DocumentPolicy.php
├── InvoicePolicy.php
└── WalletPolicy.php
```

### 12.5 Exception'lar

```
backend/app/Exceptions/
├── InsufficientStockException.php
├── InvalidCartException.php
├── PaymentFailedException.php
└── UnauthorizedActionException.php
```

### 12.6 Factory'ler

```
backend/database/factories/
├── OrderFactory.php
├── OrderItemFactory.php
├── CartFactory.php
├── CartItemFactory.php
├── ProductFactory.php
├── OfferFactory.php
├── CategoryFactory.php
├── InvoiceFactory.php
├── SellerWalletFactory.php
├── WalletTransactionFactory.php
└── PayoutRequestFactory.php
```

### 12.7 Test Dosyaları

```
backend/tests/
├── Unit/
│   ├── Models/
│   │   ├── OrderTest.php
│   │   ├── CartTest.php
│   │   ├── OfferTest.php
│   │   └── ProductTest.php
│   └── Services/
│       ├── CartServiceTest.php
│       ├── OrderServiceTest.php
│       └── WalletServiceTest.php
├── Feature/
│   └── Api/
│       ├── AuthControllerTest.php
│       ├── CartControllerTest.php
│       ├── OrderControllerTest.php
│       └── PaymentControllerTest.php
└── Integration/
    ├── CheckoutFlowTest.php
    └── OrderLifecycleTest.php
```

### 12.8 Frontend Dosyaları

```
frontend/src/
├── lib/
│   └── utils.ts  (formatPrice eklenmeli)
├── hooks/
│   ├── usePagination.ts
│   └── useApi.ts
└── types/
    └── wishlist.ts
```

---

## Sonuç

Bu rapor, B2B Eczane projesinin kapsamlı bir analizini sunmaktadır. **119 adet bulgu** tespit edilmiş olup, bunların **33'ü kritik**, **24'ü yüksek** önceliklidir.

**En acil düzeltilmesi gerekenler:**
1. Webhook güvenlik açığı
2. Test mode bypass
3. XSS koruması
4. ProductController hatası

Projenin production ortamına geçmeden önce en azından kritik ve yüksek öncelikli bulguların düzeltilmesi önerilmektedir.

---

**Rapor Hazırlanma Tarihi:** 2026-01-20
**Analiz Araçları:** Claude Code + Laravel Boost MCP
**Analiz Edilen Dizinler:**
- `/Users/sahinyildiz/Desktop/Siteler/b2b-pharmacy/backend`
- `/Users/sahinyildiz/Desktop/Siteler/b2b-pharmacy/frontend`
