# B2B Eczane Platformu - Teknik Dokumantasyon

**Versiyon:** 1.0
**Tarih:** Ocak 2026

---

## 1. Genel Bakis

B2B Eczane Platformu, eczaneler arasi toptan ilac ve saglik urunleri ticaretini kolaylastiran bir e-ticaret platformudur. Sistem, coklu satici destegiyle pazaryeri modelinde calisir.

### 1.1 Temel Ozellikler

- **Pazaryeri (Marketplace):** Coklu satici destekli urun platformu
- **GLN Dogrulama:** Eczane lisans dogrulama sistemi
- **Akilli Fiyatlandirma:** Satici bazli dinamik fiyatlandirma
- **Entegre Odeme:** iyzico ve PayTR entegrasyonu
- **Kargo Yonetimi:** 8 farkli kargo firmasi entegrasyonu
- **ERP Entegrasyonu:** Entegra, Parasut, BizimHesap, Sentos
- **Cuzdan Sistemi:** Satici bakiye ve hakediş yonetimi

---

## 2. Teknoloji Yigini

### 2.1 Backend

| Teknoloji | Versiyon | Kullanim |
|-----------|----------|----------|
| PHP | 8.2+ | Ana dil |
| Laravel | 12.0 | Web framework |
| Laravel Sanctum | 4.0 | API authentication |
| Laravel Scout | 10.23 | Full-text search |
| Filament | 3.3 | Admin panel |
| DomPDF | - | PDF olusturma |
| Maatwebsite Excel | 3.1 | Excel export |
| Sentry | 4.20 | Hata takibi |

### 2.2 Frontend

| Teknoloji | Versiyon | Kullanim |
|-----------|----------|----------|
| Next.js | 16.1.1 | React framework |
| React | 19.2.3 | UI kutuphanesi |
| TypeScript | 5.x | Tip guvenligi |
| Zustand | 5.0.9 | State yonetimi |
| TailwindCSS | 4.x | Styling |
| Radix UI | - | UI bileşenleri |
| React Hook Form | 7.69 | Form yonetimi |
| Zod | 4.2.1 | Validasyon |
| Framer Motion | 12.23 | Animasyonlar |

### 2.3 Veritabani ve Arama

| Teknoloji | Kullanim |
|-----------|----------|
| SQLite/MySQL | Ana veritabani |
| Meilisearch | Full-text arama |

### 2.4 Dis Servisler

| Servis | Saglayici |
|--------|-----------|
| Odeme | iyzico, PayTR |
| Kargo | Surat, PTT, Yurtici, Sendeo, Aras, MNG, Kolay Gelsin, Hepsijet |
| ERP | Entegra, Parasut, BizimHesap, Sentos |
| SMS | Netgsm |
| Push Notification | Firebase |

---

## 3. Proje Yapisi

```
b2b-pharmacy/
├── backend/                      # Laravel API Sunucusu
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/     # API Controller'lar
│   │   │   └── Requests/        # Form Request validasyonlari
│   │   ├── Models/              # 29 Eloquent model
│   │   ├── Services/            # Is mantigi servisleri
│   │   ├── Filament/            # Admin panel kaynaklari
│   │   ├── Jobs/                # Kuyruk isleri
│   │   ├── Mail/                # E-posta bildirimleri
│   │   ├── Observers/           # Model event listener'lar
│   │   └── Providers/           # Servis saglayicilar
│   ├── config/                  # 15 yapilandirma dosyasi
│   ├── database/
│   │   ├── migrations/          # 41 migrasyon dosyasi
│   │   ├── seeders/             # Veritabani tohumlayicilar
│   │   └── factories/           # Model factory'ler
│   └── routes/
│       └── api.php              # API rota tanimlari
│
└── frontend/                     # Next.js Uygulamasi
    ├── src/
    │   ├── app/                 # App Router sayfalari
    │   │   ├── (auth)/          # Kimlik dogrulama sayfalari
    │   │   ├── (dashboard)/     # Korumali sayfalar
    │   │   ├── (public)/        # Acik sayfalar
    │   │   ├── seller/          # Satici paneli
    │   │   ├── market/          # Pazaryeri sayfalari
    │   │   └── yardim/          # Yardim/kilavuz sayfalari
    │   ├── components/          # React bilesenleri
    │   │   ├── ui/              # Temel UI bilesenleri
    │   │   ├── auth/            # Kimlik dogrulama bilesenleri
    │   │   ├── market/          # Pazaryeri bilesenleri
    │   │   ├── cart/            # Sepet bilesenleri
    │   │   └── shipping/        # Kargo bilesenleri
    │   ├── stores/              # Zustand state yonetimi
    │   ├── hooks/               # Ozel React hook'lar
    │   ├── lib/                 # Yardimci fonksiyonlar ve API istemcisi
    │   └── contexts/            # React context'ler
    └── public/                  # Statik dosyalar
```

---

## 4. Veritabani Modelleri

### 4.1 Model Listesi (29 Model)

#### Kullanici ve Kimlik Dogrulama
- **User** - Ana kullanici modeli (eczacilar, super-admin)
- **SellerDocument** - Belge dogrulama (ruhsat, vergi no vb.)
- **UserAddress** - Teslimat/fatura adresleri
- **UserIntegration** - Kullanici bazli ERP entegrasyon ayarlari

#### Urunler ve Katalog
- **Product** - Temel urun bilgileri
- **Category** - Urun kategorileri (hiyerarsik)
- **Offer** - Satici urun teklifleri (fiyat, stok)
- **Wishlist** - Urun favorileri

#### Alisveris ve Siparisler
- **Cart** - Alisveris sepetleri
- **CartItem** - Sepet urunleri
- **Order** - Musteri siparisleri
- **OrderItem** - Siparis kalemleri

#### Odeme ve Cuzdan
- **SellerWallet** - Satici bakiyesi ve kazanclari
- **WalletTransaction** - Islem gecmisi
- **SellerBankAccount** - Odeme icin banka bilgileri
- **PayoutRequest** - Hakediş cekme talepleri

#### Kargo
- **ShippingLog** - Siparis bazli kargo gecmisi
- **ShippingRate** - Kargo ucret kurallari

#### Icerik ve Ayarlar
- **Banner** - Anasayfa banner'lari
- **NavigationMenu** - Navigasyon menuleri
- **HomepageSection** - Dinamik anasayfa bolumleri
- **Setting** - Anahtar-deger ayarlari
- **SystemSetting** - Sistem yapilandirmasi
- **NotificationSetting** - Kullanici bildirim tercihleri
- **Contract** - Yasal sozlesmeler

#### Operasyonlar
- **Invoice** - Komisyon/vergi/kargo faturalari
- **SystemLog** - Denetim kaydi
- **GlnWhitelist** - Onayli GLN kodlari

### 4.2 Temel Iliskiler

```
User (1) ──→ (N) Offer           # Bir satici birden fazla teklif verebilir
         ──→ (N) SellerDocument  # Bir kullanici birden fazla belge yukleyebilir
         ──→ (1) SellerWallet    # Her saticinin bir cuzdani var
         ──→ (N) SellerBankAccount # Birden fazla banka hesabi
         ──→ (N) Order           # Birden fazla siparis

Product (1) ──→ (N) Offer        # Bir urune birden fazla satici teklif verebilir
         ──→ (1) Category        # Her urun bir kategoriye ait

Order (1) ──→ (N) OrderItem      # Bir siparis birden fazla kalem icerebilir
       ──→ (1) User (buyer)      # Her siparisin bir alicisi var
       ──→ (1) ShippingLog       # Her siparisin kargo kaydi

OrderItem (1) ──→ (1) Product    # Her kalem bir urune bagli
          ──→ (1) Offer          # Her kalem bir teklife bagli
          ──→ (1) User (seller)  # Her kalem bir saticiya ait
```

---

## 5. API Yapisi

### 5.1 Base URL
```
/api
```

### 5.2 Kimlik Dogrulama Endpoint'leri

| Metod | Endpoint | Aciklama | Rate Limit |
|-------|----------|----------|------------|
| POST | /auth/register | Kullanici kaydi | 10/dk |
| POST | /auth/login | Kullanici girisi | 10/dk |
| POST | /auth/logout | Cikis yap | - |
| POST | /auth/logout-all | Tum oturumlardan cik | - |
| GET | /auth/user | Kullanici bilgisi | - |
| POST | /auth/verify-gln | GLN dogrulama | 10/dk |

### 5.3 Urun Endpoint'leri

| Metod | Endpoint | Aciklama |
|-------|----------|----------|
| GET | /products | Urun listesi (sayfalamali) |
| GET | /products/search | Meilisearch ile arama |
| GET | /products/{id} | Urun detayi |
| GET | /products/{id}/offers | Urune ait teklifler |
| GET | /categories | Kategori listesi |
| GET | /categories/{id} | Kategori detayi |

### 5.4 Teklif Endpoint'leri (Satici)

| Metod | Endpoint | Aciklama |
|-------|----------|----------|
| GET | /offers | Saticinin teklifleri |
| POST | /offers | Teklif olustur |
| GET | /offers/{id} | Teklif detayi |
| PUT | /offers/{id} | Teklif guncelle |
| DELETE | /offers/{id} | Teklif sil |
| GET | /my-offers | Aktif tekliflerim |

### 5.5 Sepet Endpoint'leri

| Metod | Endpoint | Aciklama |
|-------|----------|----------|
| GET | /cart | Sepeti getir |
| POST | /cart/items | Sepete urun ekle |
| PUT | /cart/items/{id} | Miktar guncelle |
| DELETE | /cart/items/{id} | Urun cikar |
| POST | /cart/validate | Sepet dogrulama |
| DELETE | /cart | Sepeti temizle |

### 5.6 Siparis Endpoint'leri

| Metod | Endpoint | Aciklama |
|-------|----------|----------|
| GET | /orders | Alici siparisleri |
| GET | /orders/seller | Satici siparisleri |
| POST | /orders | Siparis olustur |
| GET | /orders/{id} | Siparis detayi |
| PUT | /orders/{id}/status | Durum guncelle |
| PUT | /orders/{id}/cancel | Siparis iptal |

### 5.7 Odeme Endpoint'leri

| Metod | Endpoint | Aciklama |
|-------|----------|----------|
| GET | /payments/config | Odeme ayarlari |
| POST | /payments/initialize | Odeme baslat |
| GET | /payments/{id}/checkout | Odeme sayfasi |
| POST | /payments/{id}/refund | Iade islemi |
| POST | /payments/callback/{gateway} | Webhook (public) |

### 5.8 Cuzdan ve Hakediş Endpoint'leri

| Metod | Endpoint | Aciklama |
|-------|----------|----------|
| GET | /wallet | Cuzdan bilgisi |
| GET | /wallet/transactions | Islem gecmisi |
| GET | /wallet/bank-accounts | Banka hesaplari |
| POST | /wallet/bank-accounts | Hesap ekle |
| DELETE | /wallet/bank-accounts/{id} | Hesap sil |
| POST | /wallet/bank-accounts/{id}/default | Varsayilan yap |
| GET | /wallet/payout-requests | Hakediş talepleri |
| POST | /wallet/payout-requests | Hakediş talebi olustur |

### 5.9 Kargo Endpoint'leri

| Metod | Endpoint | Aciklama |
|-------|----------|----------|
| GET | /shipping/config | Kargo ayarlari |
| POST | /shipping/calculate | Ucret hesapla |
| POST | /shipping/options | Kargo secenekleri |
| POST | /shipping/orders/{id}/shipment | Gonderim olustur |
| GET | /shipping/orders/{id}/track | Takip bilgisi |
| GET | /shipping/orders/{id}/label | Kargo etiketi |

### 5.10 Diger Endpoint'ler

| Metod | Endpoint | Aciklama |
|-------|----------|----------|
| GET | /wishlist | Favoriler |
| POST | /wishlist/toggle | Favorilere ekle/cikar |
| GET | /seller/stats | Satici istatistikleri |
| GET | /invoices | Fatura listesi |
| POST | /invoices/{id}/sync-erp | ERP senkronizasyonu |
| GET | /cms/layout | Site yerlesimi |
| GET | /cms/homepage | Anasayfa verisi |

---

## 6. Kimlik Dogrulama Sistemi

### 6.1 Genel Bakis

Sistem, Laravel Sanctum tabanli token authentication kullanmaktadir. Eczacilarin kayit olmadan once GLN (Global Location Number) kodlarini dogrulamasi gerekmektedir.

### 6.2 Kayit Akisi

```
1. Kullanici GLN kodu girer
2. Frontend /auth/verify-gln endpoint'ine istek atar
3. Backend GLN'i dis servisten + whitelist'ten dogrular
4. Gecerliyse eczane_adi, sehir, adres doner
5. Kullanici email/sifre ile kayit formunu doldurur
6. Backend /auth/register endpoint'i cagirilir
7. GLN tekrar dogrulanir, kullanici olusturulur (rol: pharmacist)
8. JWT token dondurulur (Sanctum)
9. Token localStorage'da saklanir
```

### 6.3 Token Yonetimi

- **Saklama:** localStorage
- **Header:** `Authorization: Bearer {token}`
- **Tip:** Laravel Sanctum personal access token
- **Kapsam:** API tabanli, cihaz bazinda iptal edilebilir

### 6.4 Kullanici Rolleri

| Rol | Aciklama |
|-----|----------|
| pharmacist | Standart eczaci kullanici |
| super-admin | Sistem yoneticisi |

---

## 7. Frontend Mimarisi

### 7.1 Sayfa Organizasyonu (App Router)

```
app/
├── (auth)/                      # Kimlik dogrulama sayfalari
│   ├── login/page.tsx          # Giris sayfasi
│   ├── register/page.tsx       # Kayit sayfasi
│   └── verify-gln/page.tsx     # GLN dogrulama
│
├── (public)/                    # Acik sayfalar
│   ├── page.tsx                # Anasayfa
│   └── market/
│       ├── page.tsx            # Pazaryeri
│       └── [id]/page.tsx       # Urun detay
│
├── (dashboard)/                 # Korumali sayfalar
│   └── account/
│       ├── page.tsx            # Hesap ozeti
│       ├── addresses/page.tsx  # Adres yonetimi
│       └── documents/page.tsx  # Belge yukleme
│
├── seller/                      # Satici paneli
│   ├── dashboard/page.tsx      # Dashboard
│   ├── products/               # Urun yonetimi
│   ├── offers/page.tsx         # Teklif yonetimi
│   ├── orders/                 # Siparis yonetimi
│   ├── wallet/page.tsx         # Cuzdan
│   └── integrations/page.tsx   # ERP entegrasyonlari
│
└── yardim/                      # MDX tabanli kilavuzlar
    ├── baslarken/
    ├── alici-rehberi/
    └── satici-rehberi/
```

### 7.2 Bilesen Yapisi

```
components/
├── ui/          # Temel UI bilesenleri (Button, Dialog, Form, vb.)
├── auth/        # Kimlik dogrulama bilesenleri
├── market/      # Pazaryeri bilesenleri (ProductCard, SearchBar, vb.)
├── cart/        # Sepet bilesenleri
├── shipping/    # Kargo bilesenleri
├── integrations/# ERP entegrasyon bilesenleri
└── mobile/      # Mobil ozel bilesenler
```

### 7.3 State Yonetimi (Zustand)

```typescript
// useCartStore.ts - Sepet durumu
interface CartState {
  items: CartItem[]
  itemsBySeller: CartBySeller[]
  itemCount: number
  total: number
  isLoading: boolean
  isOpen: boolean
  validationIssues: ValidationIssue[]

  // Actions
  setOpen: (open: boolean) => void
  fetchCart: () => Promise<void>
  addItem: (offerId: number, quantity?: number) => Promise<void>
  updateQuantity: (itemId: number, quantity: number) => Promise<void>
  removeItem: (itemId: number) => Promise<void>
  clearCart: () => Promise<void>
  validateCart: () => Promise<boolean>
}
```

### 7.4 API Istemcisi

```typescript
// lib/api.ts - Merkezi API istemcisi
class ApiClient {
  setToken(token: string | null)
  getToken(): string | null

  get<T>(endpoint): Promise<T>
  post<T>(endpoint, body): Promise<T>
  put<T>(endpoint, body): Promise<T>
  delete<T>(endpoint): Promise<T>
  postFormData<T>(endpoint, formData): Promise<T>
}

// Modullere ayrilmis API fonksiyonlari
export const authApi, productsApi, offersApi, cartApi, ordersApi
export const paymentsApi, walletApi, shippingApi, integrationsApi
```

---

## 8. Servis Katmani

### 8.1 Temel Servisler

| Servis | Sorumluluk |
|--------|------------|
| CartService | Sepet islemleri (ekle, cikar, guncelle) |
| OrderService | Siparis yasam dongusu yonetimi |
| PaymentManager | Odeme gateway entegrasyonlari |
| ShippingManager | Kargo saglayici entegrasyonlari |
| FeeCalculationService | Komisyon ve ucret hesaplamalari |
| WalletService | Cuzdan islemleri |
| InvoiceService | Fatura olusturma ve yonetimi |

### 8.2 Strategy Pattern Kullanimi

#### Odeme Saglayicilari
```php
PaymentManager
├── IyzicoProvider
└── PayTRProvider
```

#### Kargo Saglayicilari
```php
ShippingManager
├── SuratProvider
├── PttProvider
├── YurtIciProvider
├── SendeoProvider
├── ArasProvider
├── MngProvider
├── KolaygelsinProvider
└── HepsijetProvider
```

#### ERP Saglayicilari
```php
ERPManager
├── EntegraProvider
├── ParasutProvider
├── BizimHesapProvider
└── SentosProvider
```

---

## 9. Komisyon ve Ucret Yapisi

### 9.1 Ucret Kalemleri

| Ucret Tipi | Oran |
|------------|------|
| Pazaryeri Komisyonu | %0.89 |
| Stopaj Vergisi | %1 |

### 9.2 Hesaplama Ornegi

```
Siparis Tutari: 1000 TL
Pazaryeri Komisyonu: 8.90 TL (%0.89)
Stopaj: 10 TL (%1)
Toplam Kesinti: 18.90 TL
Satici Hakediş: 981.10 TL
```

---

## 10. Guvenlik Onlemleri

### 10.1 Kimlik Dogrulama
- Sanctum token tabanli authentication
- Sifre hashleme: Bcrypt (12 round)
- GLN kod dogrulama (kayit oncesi)

### 10.2 Rate Limiting

| Endpoint Grubu | Limit |
|----------------|-------|
| Auth | 10 istek/dk |
| Document Upload | 20 yukleme/dk |
| Search | 30 istek/dk |
| Genel API | 60 istek/dk |

### 10.3 Diger Onlemler
- CORS yapilandirmasi
- CSRF korumasi
- SQL injection onleme (Eloquent ORM)
- Input validasyonu (Form Request sinifları)

---

## 11. Onbellekleme ve Performans

### 11.1 Backend
- Meilisearch ile full-text arama
- Scout observer pattern (otomatik indexleme)
- Database cache driver

### 11.2 Frontend (PWA)
- Google Fonts: 365 gun cache
- Statik dosyalar: 24 saat cache
- API verileri: 24 saat (network fallback)
- Offline sayfa destegi

---

## 12. Ortam Degiskenleri

### 12.1 Backend (.env)

```bash
# Uygulama
APP_NAME=B2BEczane
APP_ENV=local|production
APP_KEY=
APP_DEBUG=true|false
APP_URL=http://localhost

# Veritabani
DB_CONNECTION=sqlite|mysql
DB_DATABASE=database.sqlite

# Oturum ve Onbellek
SESSION_DRIVER=database
CACHE_STORE=database
QUEUE_CONNECTION=database

# Meilisearch
MEILISEARCH_HOST=http://localhost:7700
MEILISEARCH_KEY=

# Firebase
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=

# Odeme
IYZICO_API_KEY=
IYZICO_SECRET_KEY=
PAYTR_MERCHANT_ID=
PAYTR_API_KEY=

# Kargo
SHIPPING_PROVIDER=surat
SURAT_API_KEY=

# ERP
ENTEGRA_API_KEY=
PARASUT_API_KEY=

# SMS
NETGSM_USERNAME=
NETGSM_PASSWORD=

# Hata Takibi
SENTRY_LARAVEL_DSN=
```

### 12.2 Frontend (.env.local)

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

---

## 13. Gelistirme Ortami Kurulumu

### 13.1 Gereksinimler
- PHP 8.2+
- Composer
- Node.js 18+
- npm veya yarn
- Meilisearch (opsiyonel)

### 13.2 Kurulum Adimlari

```bash
# 1. Repo'yu klonla
git clone <repo-url>
cd b2b-pharmacy

# 2. Backend kurulumu
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan db:seed

# 3. Frontend kurulumu
cd ../frontend
npm install
cp .env.example .env.local

# 4. Gelistirme sunucularini baslat
# Root dizinde:
npm run dev
```

### 13.3 Gelistirme Komutlari

```bash
# Tum servisleri baslat
npm run dev

# Ayri ayri baslatmak icin:
php artisan serve          # Backend (8000)
php artisan queue:listen   # Kuyruk isleri
npm run dev                # Frontend (3000)
```

---

## 14. Test Altyapisi

### 14.1 Backend Testleri
- PHPUnit 11.5.3
- Faker ile test verisi olusturma
- tests/ dizininde test sinifları

```bash
# Testleri calistir
php artisan test

# Belirli bir test
php artisan test --filter=UserTest
```

---

## 15. Admin Paneli (Filament)

### 15.1 Erisim
```
URL: /admin
```

### 15.2 Yonetim Alanlari
- Kullanici yonetimi ve dogrulama
- Urun onay is akisi
- Siparis izleme
- Hakediş talep onayi
- Sistem kayitlari ve denetim

---

## 16. Kod Standartlari

### 16.1 Adlandirma Kurallari

| Tip | Kurald | Ornek |
|-----|--------|-------|
| Controller | Tekil + Controller | UserController |
| Model | Tekil + PascalCase | OrderItem |
| Service | Tekil + Service | CartService |
| Provider | Tekil + Provider | IyzicoProvider |
| Tablo | Cogul + snake_case | seller_wallets |
| Component | PascalCase | ProductCard |
| Store | useCamelCase | useCartStore |

### 16.2 Mimari Prensipler

1. **Ince Controller, Kalin Service**
   - Controller sadece HTTP katmanini yonetir
   - Is mantigi Service'lerde

2. **Tek Sorumluluk**
   - Her servis tek bir alani yonetir

3. **Bagimlilik Enjeksiyonu**
   - Constructor injection kullanimi

---

## 17. Ozet Tablo

| Alan | Teknoloji | Detay |
|------|-----------|-------|
| Backend Dili | PHP | 8.2+ |
| Backend Framework | Laravel | 12.0 |
| Frontend Dili | TypeScript | 5.x |
| Frontend Framework | Next.js | 16.1.1 |
| Veritabani | SQLite/MySQL | Eloquent ORM |
| Authentication | Sanctum | Token tabanli |
| State Yonetimi | Zustand | Persist middleware |
| UI Framework | Radix UI + TailwindCSS | Headless + utility |
| Arama | Meilisearch | Full-text |
| Admin Panel | Filament | Laravel admin |
| API Tasarimi | RESTful | JSON response |
| Odeme | iyzico, PayTR | Coklu gateway |
| Kargo | 8 Saglayici | Entegre |
| ERP | 4 Sistem | Entegre |
| SMS | Netgsm | Turkiye |
| Push | Firebase | Cloud messaging |

---

**Dokuman Sonu**
