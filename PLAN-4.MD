# Phase 4: Dynamic Payment Gateway Switching & External API Setup
# Rol: Senior Full-Stack Architect & Developer

## Hedef
Süper-adminin Iyzico ve PayTR arasında seçim yapabildiği bir 'Payment Settings' paneli oluşturmak, 'Strategy Pattern' ile ödeme sistemini soyutlamak ve dış servis (Bizimhesap/Kargo) altyapısını kurmak.

## 1. Backend: Payment Strategy & Configuration (Laravel)

### A. Payment Settings (Database & Admin)
- 'settings' tablosu oluştur: (id, key, value, group).
- **FilamentPHP Admin:** 'PaymentSettingsPage' adında bir ayar sayfası oluştur.
    - Seçenekler: 'Active Payment Gateway' (Select: iyzico, paytr).
    - 'Iyzico Credentials' (API Key, Secret Key, Base URL).
    - 'PayTR Credentials' (Merchant ID, Key, Salt).
- Bu verileri bir 'PaymentConfig' helper'ı üzerinden cache-safe şekilde çek.

### B. Strategy Pattern Implementation
- 'App\Interfaces\PaymentGatewayInterface' oluştur (pay(), callback(), refund() metodları).
- 'App\Services\Payments\IyzicoProvider' ve 'App\Services\Payments\PayTRProvider' sınıflarını implement et.
- 'PaymentFactory' veya 'PaymentManager' oluştur. Admin panelinden gelen 'active_gateway' bilgisine göre doğru Provider'ı döndürsün.

### C. Split Payment Logic (Pazaryeri Modeli)
- Ödeme isteği gönderilirken, Phase 3'te hesaplanan 'order_items.seller_payout_amount' verilerini ödeme kuruluşunun (Iyzico Sub-merchant / PayTR Marketplace) API'sine uygun formatta gönder.

## 2. Backend: External Service Stubs (Bizimhesap & Shipping)
- Kullanıcının ileteceği API dosyalarına hazırlık yap.
- 'App\Services\Invoicing\BizimhesapService' ve 'App\Services\Shipping\LogisticsService' klasörlerini oluştur. 
- Bu servisler için temel metodları (createInvoice(), createShipment()) şimdilik boş ('Stub') olarak tanımla.

## 3. Frontend: Payment Integration & UI (Next.js & shadcn/ui)

### A. Checkout Payment Step
- Sepet onayından sonra ödeme adımını aktif et.
- Backend'den gelen 'active_gateway' tipine göre ilgili form yapısını (Iyzico iFrame veya PayTR Direct API) render et.
- Ödeme başarılı/başarısız durumları için modern 'shadcn/ui' Alert ve Result sayfaları oluştur.

## Talimat
Lütfen önce 'settings' tablosu ve Filament ayar sayfasından başla. Ardından 'PaymentGatewayInterface' ve Provider'ları oluşturarak ödeme akışını kurgula. Dış servisler için sadece altyapıyı hazırla, detayları kullanıcıdan gelecek dosyalara göre dolduracağız.