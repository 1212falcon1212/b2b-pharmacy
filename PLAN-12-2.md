# Phase 12.2: Seller Dashboard & Dynamic Data
# Rol: Full-Stack Developer

## Hedef
Seller Dashboard'u gerçek API verilerine bağlamak, placeholder verileri kaldırmak.

## 1. Backend: Seller Stats API Endpoint

### A. Yeni Controller Method: SellerController
```php
// GET /api/seller/stats
return [
    'total_sales' => Toplam satış tutarı (bu ay),
    'total_sales_change' => Geçen aya göre değişim %,
    'active_offers' => Aktif teklif sayısı,
    'pending_orders' => Bekleyen sipariş sayısı,
    'wallet_balance' => Cüzdan bakiyesi,
];

// GET /api/seller/recent-orders
return limitli son 5 sipariş;
```

### B. API Routes
```php
Route::prefix('seller')->middleware('auth:sanctum')->group(function () {
    Route::get('/stats', [SellerController::class, 'stats']);
    Route::get('/recent-orders', [SellerController::class, 'recentOrders']);
});
```

## 2. Frontend: Dashboard Güncelleme

### A. `seller/dashboard/page.tsx` Değişiklikleri
- Placeholder `stats` array'ini kaldır
- `useEffect` ile `/api/seller/stats` çağır
- Loading skeleton ekle
- Error state handle et

### B. Recent Orders Bölümü
- API'den dinamik çek
- Empty state tasarla
- Sipariş detayına link ekle

## 3. Seller Products Sayfası

### A. API Bağlantısı
- `productsApi.getAll()` çağrısını doğru parametrelerle yap
- Seller'ın kendi ürünlerini filtrele (sadece teklif verdiği ürünler)

### B. Yeni Endpoint (Opsiyonel)
```php
// GET /api/seller/products → Sadece teklif verilen ürünler
```

## 4. Seller Orders Sayfası

### A. `ordersApi.getSellerOrders()` Kullan
- Status filtreleme ekle
- Pagination tamamla

## 5. Seller Offers Sayfası

### A. Type Düzeltmeleri
- `Offer` tipini frontend/backend arasında senkronize et
- `created_at` alanını ekle

## Talimat:
Önce `SellerController.php` oluştur, stats ve recentOrders endpoint'lerini ekle. Ardından `seller/dashboard/page.tsx`'i API'ye bağla.
