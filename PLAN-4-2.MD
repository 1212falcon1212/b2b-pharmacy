# Phase 4.2: Advanced Logistics Management & Shipping API Integration
# Rol: Senior Backend Engineer & Logistics Specialist

## Hedef
Süper-adminin kargo maliyetlerini yönetebilmesi, kargo firması API'si ile tam entegrasyon sağlanması ve uçtan uca gönderi takibi.

## 1. Backend: Shipping Rate Logic (Laravel)
- **Settings & Admin Panel:** - 'settings' tablosuna 'shipping_flat_rate' ve 'shipping_free_threshold' anahtarlarını ekle.
    - FilamentPHP üzerinde bu değerlerin yönetileceği 'Shipping Settings' arayüzünü oluştur.
- **Dynamic Calculation:** 'OrderService' içinde sepet toplamına göre kargo ücretini hesaplayan ve ücretsiz kargo sınırını kontrol eden logic'i kur.
- **Order Updates:** 'orders' tablosuna 'shipping_cost', 'tracking_number', 'shipping_label_url' ve 'shipping_status' (hazırlanıyor, yolda, teslim edildi) kolonlarını ekle.

## 2. Backend: Carrier API Integration
- 'App\Services\Shipping\CarrierService' (veya kargo firması adı) sınıfını kullanıcının ilettiği dökümana göre implement et.
- **Metodlar:**
    - 'createShipment()': Ödemesi onaylanan sipariş bilgilerini kargo API'sine gönder.
    - 'cancelShipment()': İptal durumunda kargo kaydını sil.
    - 'trackShipment()': Kargo durumunu API üzerinden periyodik olarak sorgula (Cron Job / Scheduled Task).

## 3. Frontend: Shipping UI & Tracking (Next.js & shadcn/ui)
- **Checkout:** Sepet özetinde "Kargo Ücreti" bilgisini dinamik göster. "Ücretsiz kargo için kalan tutar" uyarısını shadcn 'Alert' veya 'Badge' ile vurgula.
- **Seller Dashboard:** Eczacı için "Kargo Barkodu Oluştur" ve "Barkod Yazdır" butonlarını ekle (Yeni pencerede açılan PDF veya termal çıktı formatı).
- **Buyer Dashboard:** Siparişlerim sayfasında kargo hareketlerini gösteren 'Timeline' (adım adım takip) bileşeni oluştur.

## 4. Automation & Reliability
- Kargo API isteklerini 'Queue' (Kuyruk) yapısında kurgula. 
- API'den dönen hataları 'shipping_errors' log tablosunda tut ve admini uyar.

## Talimat:
Lütfen önce admin panelindeki kargo maliyet ayarlarını ve veritabanı kolonlarını kurgula. Ardından kullanıcının paylaştığı kargo API dökümanına göre servis metodlarını doldur ve frontend tarafındaki takip ekranlarını tamamla.