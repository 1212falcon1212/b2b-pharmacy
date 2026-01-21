# Phase 12.4: BizimHesap ERP & Invoicing System
# Rol: Full-Stack Developer & Backend Architect

## Hedef
BizimHesap ERP entegrasyonunu önceliklendirmek, satıcı ve admin için fatura kesme özelliği eklemek, komisyon ve vergi yönetimi.

## 1. Backend: BizimHesap Driver Geliştirmesi

### A. BizimHesapProvider İyileştirmesi
```php
// Mevcut: app/Services/Erp/Providers/BizimHesapProvider.php

Yeni metodlar:
- createInvoice(Order $order) → Satış faturası oluştur
- getCustomers() → Müşteri listesi çek
- getProducts() → Ürün listesi çek
- syncProducts() → Ürün senkronizasyonu
```

### B. Invoice Model ve Migration
```php
// invoices table
- id, order_id, user_id
- invoice_number, invoice_date
- total_amount, tax_amount, commission_amount
- status (draft, issued, sent, cancelled)
- erp_reference_id (BizimHesap fatura ID)
- pdf_path
```

### C. InvoiceService
```php
// Services/Invoicing/InvoiceService.php
- calculateCommission(Order $order)
- calculateTax(Order $order)
- calculateShippingCost(Order $order)
- generateInvoicePdf(Invoice $invoice)
- sendToErp(Invoice $invoice)
```

## 2. Satıcı: Fatura Kesme

### A. Seller Order Detail Güncellemesi
```tsx
// "Fatura Kes" butonu ekle
// Fatura önizleme modal
// PDF indirme
```

### B. API Endpoint
```php
// POST /api/orders/{order}/invoice
// Satıcı kendi siparişi için fatura oluşturur
```

### C. Fatura İçeriği (Satıcı)
- Ürün adı, miktar, birim fiyat
- Ara toplam
- Kargo ücreti (varsa)
- KDV (%8 veya %18)
- Genel toplam

## 3. Admin: Komisyon Faturası

### A. Filament Invoice Resource
```php
// Tüm faturaları listele
// Komisyon kesintilerini göster
// Toplu fatura oluşturma
```

### B. Admin Fatura Kesme
```
Admin, satıcıya komisyon faturası kesebilir:
- Komisyon oranı (kategori bazlı)
- Kargo maliyeti
- Platform ücreti
- KDV
```

### C. Payout İle Entegrasyon
```php
// Hakediş ödemesinde:
// - Satış tutarı
// - Komisyon kesintisi
// - Vergi kesintisi
// - Net ödeme
```

## 4. Kategori Bazlı Komisyon

### A. Categories Tablosu Güncellemesi
```php
// Mevcut: commission_rate alanı var ✅
// Kullanımı: Order oluşturulduğunda komisyon hesapla
```

### B. Komisyon Hesaplama
```php
// Order oluşturulduğunda:
$commission = $item->total * ($product->category->commission_rate / 100);
```

## 5. Vergi Yönetimi

### A. Tax Settings (Admin)
```php
// Farklı KDV oranları:
// - İlaç: %8
// - Kozmetik: %18
// - Tıbbi cihaz: %8
```

### B. Category Tax Rate
```php
// categories table'a tax_rate ekle (varsa güncelle)
```

## 6. Filament Admin Sayfaları

### A. Commission Settings Page
- Varsayılan komisyon oranı
- Kategori bazlı override
- Minimum komisyon tutarı

### B. Invoice Management
- Tüm faturalar listesi
- Satıcı bazlı filtreleme
- Tarih aralığı filtreleme
- Toplu PDF indirme

### C. Financial Reports
- Günlük/haftalık/aylık satış
- Komisyon gelirleri
- Vergi toplamları

## Talimat:
1. `invoices` migration oluştur
2. `Invoice` model ve ilişkileri ekle
3. `InvoiceService` oluştur
4. Seller order detail'e "Fatura Kes" butonu ekle
5. Admin Filament'e Invoice resource ekle
