# Phase 12.3: Shipping Integration & Barcode Labels
# Rol: Full-Stack Developer

## Hedef
Kargo entegrasyonlarını test modunda çalıştırmak, sipariş sayfalarına "Kargo Barkodu Bas" butonu eklemek.

## 1. Backend: Test Mode Implementation

### A. ShippingManager Güncellemesi
```php
// config/shipping.php
'test_mode' => env('SHIPPING_TEST_MODE', true),

// Test modda:
// - Gerçek API çağrısı yapılmaz
// - Mock tracking number üretilir
// - Demo PDF label oluşturulur
```

### B. Mock Label Generator
```php
// Services/Shipping/MockLabelService.php
- PDF template oluştur (A6 boyut)
- Barkod görseli ekle (Code128)
- Alıcı/Gönderici bilgileri
- Sipariş numarası
```

### C. API Response (Test Mode)
```php
// POST /api/shipping/orders/{order}/shipment
return [
    'success' => true,
    'tracking_number' => 'TEST-' . Str::random(10),
    'label_url' => '/storage/labels/test-{order_id}.pdf',
    'message' => 'Test modu: Kargo etiketi oluşturuldu',
];
```

## 2. Frontend: Seller Order Detail

### A. `seller/orders/[id]/page.tsx` Güncellemesi
Yeni aksiyonlar:
- "Kargo Barkodu Bas" butonu
- "Kargoya Ver" butonu
- PDF önizleme modal

### B. Label Print Component
```tsx
// components/shipping/LabelPrintButton.tsx
- PDF'i yeni sekmede aç
- Print dialog tetikle
- Loading state
```

### C. Sipariş Durumu Güncelleme
```
Sipariş Onayla → Kargoya Ver → Teslim Edildi
(her adımda uygun durum güncellemesi)
```

## 3. Admin Panel: Kargo Ayarları

### A. Filament Settings Page
```php
// app/Filament/Pages/ShippingSettings.php
- Aktif kargo firması seç
- Test modu toggle
- Ücretsiz kargo limiti
- Sabit kargo ücreti
```

## 4. Tracking Sayfası

### A. `orders/[id]/track` Route
- Kargo takip bilgilerini göster
- Mock history timeline
- QR kod ile takip linki

## Talimat:
`MockLabelService.php` oluştur, test modu kargo etiketi üret. Seller sipariş detay sayfasına "Kargo Barkodu Bas" butonu ekle.
