<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use App\Models\Brand;
use App\Models\Category;
use App\Models\HomepageSection;
use App\Models\NavigationMenu;
use App\Models\Product;
use App\Services\BrandService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

/**
 * CMS Controller - Ana sayfa ve layout verilerini yonetir
 */
class CmsController extends Controller
{
    /**
     * Cache suresi (dakika)
     */
    private const CACHE_TTL = 30;

    public function __construct(
        private readonly BrandService $brandService
    ) {}

    /**
     * Layout verilerini getirir (menuler, site ayarlari)
     * MarketplaceHeader ve Footer componentleri icin
     */
    public function layout(): JsonResponse
    {
        $data = Cache::remember('cms.layout', self::CACHE_TTL * 60, function () {
            $headerMenu = NavigationMenu::getMenuTree('header');
            $footerMenu = NavigationMenu::getMenuTree('footer');
            $categoriesMenu = NavigationMenu::getMenuTree('categories_dropdown');
            $mobileMenu = NavigationMenu::getMenuTree('mobile_menu');

            return [
                'menus' => [
                    'header' => $headerMenu,
                    'footer' => $footerMenu,
                    'categories' => $categoriesMenu,
                    'mobile' => $mobileMenu,
                ],
                'settings' => [
                    'site_name' => config('app.name', 'EczanePazari'),
                    'logo_url' => asset('images/logo.png'),
                ],
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $data,
        ]);
    }

    /**
     * Ana sayfa verilerini getirir (bannerlar, sectionlar, markalar)
     */
    public function homepage(): JsonResponse
    {
        // Hero bannerlar
        $heroBanners = $this->getBannersByLocation('home_hero');

        // Orta bannerlar
        $middleBanners = $this->getBannersByLocation('home_middle');

        // Marka bolumu bannerlari
        $brandBanners = $this->getBannersByLocation('home_brand');

        // Grid bannerlar (2x2)
        $gridBanners = $this->getBannersByLocation('home_grid');

        // Alt bannerlar
        $bottomBanners = $this->getBannersByLocation('home_bottom');

        // Homepage sectionlar (product carousels)
        $sections = $this->getHomepageSections();

        // Kategoriler
        $categories = $this->getCategories();

        // One cikan markalar
        $featuredBrands = $this->brandService->getFeaturedBrands(12);

        // En cok satanlar
        $bestSellers = $this->getBestSellers();

        // Onerilen urunler (featured)
        $recommended = $this->getRecommendedProducts();

        return response()->json([
            'status' => 'success',
            'data' => [
                'banners' => [
                    'hero' => $heroBanners,
                    'middle' => $middleBanners,
                    'brand' => $brandBanners,
                    'grid' => $gridBanners,
                    'bottom' => $bottomBanners,
                ],
                'sections' => $sections,
                'categories' => $categories,
                'brands' => $this->brandService->formatForApi($featuredBrands),
                'best_sellers' => $bestSellers,
                'recommended' => $recommended,
            ],
        ]);
    }

    /**
     * Belirli lokasyondaki bannerlari getirir
     */
    public function banners(string $location): JsonResponse
    {
        $banners = $this->getBannersByLocation($location);

        return response()->json([
            'status' => 'success',
            'data' => $banners,
        ]);
    }

    /**
     * Belirli lokasyondaki banner listesini getirir
     */
    private function getBannersByLocation(string $location): array
    {
        return Cache::remember("cms.banners.{$location}", self::CACHE_TTL * 60, function () use ($location) {
            return Banner::active()
                ->location($location)
                ->ordered()
                ->get()
                ->map(fn($banner) => [
                    'id' => $banner->id,
                    'title' => $banner->title,
                    'subtitle' => $banner->subtitle,
                    'image_url' => $banner->image_url,
                    'link_url' => $banner->link_url,
                    'button_text' => $banner->button_text,
                ])
                ->toArray();
        });
    }

    /**
     * Homepage sectionlarini getirir
     */
    private function getHomepageSections(): array
    {
        return Cache::remember('cms.homepage.sections', self::CACHE_TTL * 60, function () {
            return HomepageSection::active()
                ->ordered()
                ->get()
                ->map(fn($section) => [
                    'id' => $section->id,
                    'title' => $section->title,
                    'subtitle' => $section->subtitle,
                    'type' => $section->type,
                    'settings' => $section->settings,
                    'products' => $this->getSectionProducts($section),
                ])
                ->toArray();
        });
    }

    /**
     * Kategorileri getirir
     */
    private function getCategories(): array
    {
        return Cache::remember('cms.homepage.categories', self::CACHE_TTL * 60, function () {
            return Category::where('is_active', true)
                ->whereNull('parent_id')
                ->with([
                    'children' => function ($q) {
                        $q->where('is_active', true)->orderBy('sort_order');
                    }
                ])
                ->orderBy('sort_order')
                ->take(10)
                ->get()
                ->map(fn($cat) => [
                    'id' => $cat->id,
                    'name' => $cat->name,
                    'slug' => $cat->slug,
                    'icon' => $cat->icon ?? null,
                    'products_count' => $cat->products_count ?? 0,
                    'children' => $cat->children->map(fn($child) => [
                        'id' => $child->id,
                        'name' => $child->name,
                        'slug' => $child->slug,
                        'products_count' => $child->products_count ?? 0,
                    ])
                ])
                ->toArray();
        });
    }

    /**
     * En cok satan urunleri getirir
     */
    private function getBestSellers(int $limit = 8): array
    {
        return Cache::remember("cms.homepage.best_sellers.{$limit}", self::CACHE_TTL * 60, function () use ($limit) {
            return Product::with([
                'category',
                'offers' => function ($q) {
                    $q->where('status', 'active')->orderBy('price');
                }
            ])
                ->active()
                ->withCount('orderItems')
                ->orderByDesc('order_items_count')
                ->take($limit)
                ->get()
                ->map(fn($product) => $this->formatProductForApi($product))
                ->toArray();
        });
    }

    /**
     * Onerilen urunleri getirir (rastgele secim veya featured flag'e gore)
     */
    private function getRecommendedProducts(int $limit = 8): array
    {
        return Cache::remember("cms.homepage.recommended.{$limit}", self::CACHE_TTL * 60, function () use ($limit) {
            return Product::with([
                'category',
                'offers' => function ($q) {
                    $q->where('status', 'active')->orderBy('price');
                }
            ])
                ->active()
                ->whereHas('offers', fn($q) => $q->where('status', 'active'))
                ->inRandomOrder()
                ->take($limit)
                ->get()
                ->map(fn($product) => $this->formatProductForApi($product))
                ->toArray();
        });
    }

    /**
     * Section icin urunleri getirir
     */
    private function getSectionProducts(HomepageSection $section): array
    {
        $limit = $section->getSetting('limit', 8);
        $categoryId = $section->getSetting('category_id');

        $query = Product::with([
            'category',
            'offers' => function ($q) {
                $q->where('status', 'active')->orderBy('price');
            }
        ])->active();

        switch ($section->type) {
            case 'best_sellers':
                $query->withCount('orderItems')
                    ->orderByDesc('order_items_count');
                break;

            case 'new_arrivals':
                $query->orderByDesc('created_at');
                break;

            case 'deals':
                $query->whereHas('offers', fn($q) => $q->where('status', 'active'));
                break;

            case 'featured_products':
                $query->inRandomOrder();
                break;

            case 'product_carousel':
            default:
                if ($categoryId) {
                    $query->where('category_id', $categoryId);
                }
                break;
        }

        return $query->take($limit)
            ->get()
            ->map(fn($product) => $this->formatProductForApi($product))
            ->toArray();
    }

    /**
     * Urun verisini API formati icin hazirlar
     */
    private function formatProductForApi(Product $product): array
    {
        return [
            'id' => $product->id,
            'name' => $product->name,
            'barcode' => $product->barcode,
            'brand' => $product->brand,
            'image' => $product->image,
            'category' => $product->category?->name,
            'category_slug' => $product->category?->slug,
            'lowest_price' => $product->offers->first()?->price,
            'offers_count' => $product->offers->count(),
        ];
    }
}
