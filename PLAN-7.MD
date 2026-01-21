# Phase 7: Scalable ERP Integrations & Background Product Sync
# Rol: Senior Integration Architect & Backend Developer

## Hedef
Kullanıcıların kullandığı ERP sistemlerinden (Paraşüt, Entegra, Sentos, Bizimhesap) API aracılığıyla ürünlerini çekip, marketplace sistemimize otomatik olarak 'Offer' (Teklif) olarak eklenmesini sağlamak.

## 1. Backend: Integration Architecture (Laravel)

### A. Integration Settings (Database)
- 'user_integrations' tablosu: (user_id, erp_type [enum: parasut, entegra, sentos, bizimhesap], api_key, api_secret, app_id, extra_params [json], last_sync_at, status).
- **Security:** API key ve secret bilgilerini veritabanında 'encrypted' (Laravel Encryption) olarak sakla.

### B. Strategy Pattern for ERP Drivers
- 'App\Interfaces\ErpIntegrationInterface' oluştur (getProducts(), mapToSystemSchema() metodları).
- Her ERP için ayrı 'Provider' sınıfları oluştur:
    - 'ParasutProvider', 'EntegraProvider', 'SentosProvider', 'BizimhesapProductProvider'.
- 'ErpManager' sınıfı ile kullanıcının aktif entegrasyonuna göre doğru provider'ı çağır.

### C. Background Sync & Queue (Laravel Jobs)
- 'SyncErpProductsJob' oluştur. Bu job:
    1. ERP'den ürünleri (Barkod, Stok, Fiyat, İsim) çeker.
    2. **Mapping:** Barkod üzerinden sistemdeki master 'products' tablosuyla eşleştirir.
    3. Eğer ürün sistemde varsa, kullanıcı için yeni bir 'Offer' oluşturur veya mevcut offer'ı (stok/fiyat) günceller.
    4. Eğer ürün master tabloda yoksa, 'PendingApproval' statüsünde admin onayına gönderir.

## 2. Frontend: Integrations UI (Next.js & shadcn/ui)

### A. Integrations Management Page
- '/dashboard/settings/integrations' rotasında her ERP için şık birer 'Card' (shadcn) oluştur.
- "Bağlan" butonu tıklandığında ilgili ERP'nin API bilgilerini isteyen bir 'Dialog' (Modal) aç.
- Aktif bağlantılar için "Durum: Bağlı" ve "Son Senkronizasyon: ..." bilgilerini göster.

### B. Sync Control & Logs
- "Ürünleri Şimdi Getir" butonu: Tıklandığında backend'deki Job'ı tetikler ve kullanıcıya "İşlem kuyruğa alındı, arka planda ürünleriniz ekleniyor" uyarısı verir.
- Basit bir 'ActivityLog' tablosu ile hangi üründe hata çıktığını veya kaç ürünün başarıyla eklendiğini gösteren bir liste.

## 3. Scalability & Performance
- **Chunking:** ERP'den gelen veriler 10.000+ satır olabilir. Verileri 'chunk' (parça parça) işleyerek memory limitlerini aşma.
- **Rate Limiting:** ERP API'lerinin rate limitlerine (dakikada X istek) dikkat eden bir 'Sleep' veya 'Retry' mekanizması kur.

## Talimat:
Lütfen önce 'user_integrations' tablosunu ve Encryption mantığını kurgula. Ardından 'ErpIntegrationInterface' ve 'Entegra' için ilk provider taslağını yaz. Backend logic'i bittikten sonra Next.js tarafındaki yönetim arayüzüne geç.