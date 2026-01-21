# Phase 8: Performance Optimization & Automated Synchronization
# Rol: Senior Backend Engineer & DevOps Specialist

## 1. Backend: Search Engine (Meilisearch)
- **Kurulum:** Laravel Scout paketini kur ve Meilisearch ile entegre et.
- **Indexing:** 'products' ve 'offers' modellerini indexle. Arama sırasında sadece ürün adı değil, barkod ve marka bilgilerinin de aranabilir olduğundan emin ol.
- **Frontend Sync:** Next.js tarafında arama sonuçlarını Meilisearch üzerinden çekecek şekilde güncelle (Anlık sonuçlar için debounce kullan).

## 2. Backend: Automated ERP Sync (Cron & Webhooks)
- **Polling System:** Her ERP sağlayıcısı için 15-30 dakikada bir çalışacak 'SyncStockAndPrices' Scheduled Task (Cron Job) oluştur.
- **Logic:** Sadece fiyatı veya stoğu değişen ürünleri güncelleyerek veritabanı yükünü azalt.
- **Webhook Stubs:** Entegra gibi servislerden gelecek olası stok değişim webhook'ları için endpoint altyapısını hazırla.

## 3. Performance & Caching
- Çok sık sorgulanan "En Ucuz Ürünler" veya "Günün Fırsatları" gibi verileri Redis ile cache'le.
- API response sürelerini optimize etmek için 'Eager Loading' (with) kontrollerini yap.