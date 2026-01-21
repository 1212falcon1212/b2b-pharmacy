# Phase 8.1: Marketplace CMS & Admin Content Management
# Rol: Full-Stack Developer & Backend Architect

## Hedef
Süper-adminin panel üzerinden banner'ları, navigasyon menülerini ve ana sayfa vitrin bölümlerini (sections) yönetebileceği bir CMS altyapısı kurmak ve Next.js tarafını bu verilere göre dinamik hale getirmek.

## 1. Backend: CMS Database & Models (Laravel)

### A. Banners Table
- 'banners': (id, title, image_path, link_url, location [enum: home_hero, home_middle, sidebar], sort_order, is_active).

### B. Navigation & Menus Table
- 'navigation_menus': (id, title, url, parent_id, location [enum: header, footer, categories_dropdown], sort_order, is_active).
- **Self-relation:** Alt menüleri (dropdown) destekleyecek şekilde parent_id ilişkisini kur.

### C. Homepage Sections (Optional but Recommended)
- 'homepage_sections': (id, title, type [enum: product_carousel, category_grid, banner_full_width], settings [json], sort_order, is_active).
- **Note:** Adminin hangi ürün grubunun (örn: Çok Satanlar) hangi sırada gözükeceğini belirlemesini sağlar.

## 2. Backend: FilamentPHP Admin Resources
- **BannerResource:** Resim yükleme (S3 veya Local storage), önizleme ve link yönetimi.
- **MenuResource:** Sürüklenebilir (draggable) sıralama desteğiyle menü yönetimi.
- **CMS Settings Page:** Sitenin ana renkleri, logo ve footer metinleri gibi genel ayarlar için bir ayar sayfası.

## 3. API & Frontend Integration (Next.js)
- **API Endpoints:** - 'GET /api/cms/layout': Header menüleri ve genel site ayarlarını döner.
    - 'GET /api/cms/homepage': Sadece ana sayfadaki banner'ları ve reyon dizilimlerini döner.
- **Dynamic Rendering:** Next.js tarafındaki header ve ana sayfa bileşenlerini bu API verilerine göre map et. 
- **Fallbacks:** Eğer admin panelinden bir banner girilmemişse, şık bir placeholder veya varsayılan bir görsel göster.

## Talimat:
Lütfen önce 'banners' ve 'navigation_menus' migration'larını ve Filament kaynaklarını oluştur. Ardından API endpoint'lerini yaz ve Next.js tarafında bu verileri tüketecek 'MarketplaceHeader' ve 'HeroSlider' bileşenlerini güncelle.