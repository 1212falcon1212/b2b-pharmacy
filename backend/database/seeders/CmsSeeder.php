<?php

namespace Database\Seeders;

use App\Models\Banner;
use App\Models\NavigationMenu;
use App\Models\HomepageSection;
use Illuminate\Database\Seeder;

class CmsSeeder extends Seeder
{
    public function run(): void
    {
        // Hero Bannerlar
        $heroBanners = [
            [
                'title' => 'Yeni Yıl Kampanyası',
                'subtitle' => 'Tüm vitaminlerde %30\'a varan indirimler',
                'image_path' => 'banners/hero-newyear.jpg',
                'link_url' => '/market/category/vitaminler',
                'button_text' => 'Hemen Alışverişe Başla',
                'location' => 'home_hero',
                'sort_order' => 1,
                'is_active' => true,
            ],
            [
                'title' => 'B2B Eczane Pazaryeri',
                'subtitle' => 'Binlerce ürün, yüzlerce satıcı, en uygun fiyatlar',
                'image_path' => 'banners/hero-b2b.jpg',
                'link_url' => '/market',
                'button_text' => 'Ürünleri Keşfet',
                'location' => 'home_hero',
                'sort_order' => 2,
                'is_active' => true,
            ],
            [
                'title' => 'Kış Sezonu Ürünleri',
                'subtitle' => 'Grip, öksürük ve bağışıklık ürünlerinde özel fiyatlar',
                'image_path' => 'banners/hero-winter.jpg',
                'link_url' => '/market/category/solunum-sistemi',
                'button_text' => 'Kampanyayı Gör',
                'location' => 'home_hero',
                'sort_order' => 3,
                'is_active' => true,
            ],
        ];

        foreach ($heroBanners as $banner) {
            Banner::updateOrCreate(
                ['title' => $banner['title'], 'location' => $banner['location']],
                $banner
            );
        }

        $this->command->info('✅ 3 hero banner oluşturuldu.');

        // Orta Bannerlar
        $middleBanners = [
            [
                'title' => 'Vitamin Haftası',
                'subtitle' => 'Seçili vitaminlerde %20 indirim',
                'image_path' => 'banners/promo-vitamins.jpg',
                'link_url' => '/market/category/vitaminler',
                'button_text' => 'İncele',
                'location' => 'home_middle',
                'sort_order' => 1,
                'is_active' => true,
            ],
            [
                'title' => 'Bebek Ürünleri',
                'subtitle' => 'Anne ve bebek bakım ürünlerinde fırsatlar',
                'image_path' => 'banners/promo-baby.jpg',
                'link_url' => '/market/category/bebek-cocuk',
                'button_text' => 'Ürünleri Gör',
                'location' => 'home_middle',
                'sort_order' => 2,
                'is_active' => true,
            ],
        ];

        foreach ($middleBanners as $banner) {
            Banner::updateOrCreate(
                ['title' => $banner['title'], 'location' => $banner['location']],
                $banner
            );
        }

        $this->command->info('✅ 2 promo banner oluşturuldu.');

        // Header Menüleri
        $headerMenus = [
            ['title' => 'Ana Sayfa', 'url' => '/market', 'sort_order' => 1],
            ['title' => 'Ürünler', 'url' => '/products', 'sort_order' => 2],
            ['title' => 'Kategoriler', 'url' => '/market', 'sort_order' => 3],
            ['title' => 'Satıcı Ol', 'url' => '/seller/dashboard', 'sort_order' => 4],
            ['title' => 'Yardım', 'url' => '/yardim', 'sort_order' => 5],
        ];

        foreach ($headerMenus as $menu) {
            NavigationMenu::updateOrCreate(
                ['title' => $menu['title'], 'location' => 'header'],
                array_merge($menu, [
                    'location' => 'header',
                    'is_active' => true,
                ])
            );
        }

        $this->command->info('✅ Header menüleri oluşturuldu.');

        // Footer Menüleri
        $footerMenus = [
            // Kurumsal
            ['title' => 'Hakkımızda', 'url' => '/legal/hakkimizda', 'sort_order' => 1],
            ['title' => 'İletişim', 'url' => '/legal/iletisim', 'sort_order' => 2],
            ['title' => 'Kariyer', 'url' => '/legal/kariyer', 'sort_order' => 3],
            // Yasal
            ['title' => 'KVKK', 'url' => '/legal/kvkk', 'sort_order' => 4],
            ['title' => 'Gizlilik Politikası', 'url' => '/legal/gizlilik', 'sort_order' => 5],
            ['title' => 'Kullanım Koşulları', 'url' => '/legal/kullanim-kosullari', 'sort_order' => 6],
            ['title' => 'Satıcı Sözleşmesi', 'url' => '/legal/satici-sozlesmesi', 'sort_order' => 7],
            // Yardım
            ['title' => 'Sıkça Sorulan Sorular', 'url' => '/yardim', 'sort_order' => 8],
            ['title' => 'Nasıl Satıcı Olurum?', 'url' => '/yardim/satici-rehberi/urun-ekleme', 'sort_order' => 9],
            ['title' => 'Sipariş Takibi', 'url' => '/yardim/alici-rehberi/siparis-takibi', 'sort_order' => 10],
        ];

        foreach ($footerMenus as $menu) {
            NavigationMenu::updateOrCreate(
                ['title' => $menu['title'], 'location' => 'footer'],
                array_merge($menu, [
                    'location' => 'footer',
                    'is_active' => true,
                ])
            );
        }

        $this->command->info('✅ Footer menüleri oluşturuldu.');

        // Ana Sayfa Bölümleri
        $sections = [
            [
                'title' => 'Çok Satanlar',
                'subtitle' => 'En popüler ürünlerimiz',
                'type' => 'best_sellers',
                'settings' => ['limit' => 8],
                'sort_order' => 1,
                'is_active' => true,
            ],
            [
                'title' => 'Yeni Gelenler',
                'subtitle' => 'Son eklenen ürünler',
                'type' => 'new_arrivals',
                'settings' => ['limit' => 8],
                'sort_order' => 2,
                'is_active' => true,
            ],
            [
                'title' => 'Fırsat Ürünleri',
                'subtitle' => 'Kaçırılmayacak teklifler',
                'type' => 'deals',
                'settings' => ['limit' => 8],
                'sort_order' => 3,
                'is_active' => true,
            ],
            [
                'title' => 'Vitaminler',
                'subtitle' => 'Vitamin ve takviye gıdalar',
                'type' => 'product_carousel',
                'settings' => ['limit' => 8, 'category_slug' => 'vitaminler'],
                'sort_order' => 4,
                'is_active' => true,
            ],
        ];

        foreach ($sections as $section) {
            HomepageSection::updateOrCreate(
                ['title' => $section['title']],
                $section
            );
        }

        $this->command->info('✅ Ana sayfa bölümleri oluşturuldu.');
    }
}
