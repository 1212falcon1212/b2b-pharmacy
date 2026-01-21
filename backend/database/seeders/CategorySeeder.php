<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * B2B Eczane platformu icin kapsamli kategori seeder'i
 *
 * 9 ana kategori ve 90+ alt kategori icermektedir.
 * Her seferinde guvenli sekilde calistirilabilir (updateOrCreate kullanimi).
 */
class CategorySeeder extends Seeder
{
    /**
     * Varsayilan komisyon orani (%)
     */
    private const DEFAULT_COMMISSION_RATE = 10.00;

    /**
     * Varsayilan KDV orani (%)
     */
    private const DEFAULT_VAT_RATE = 20.00;

    /**
     * Varsayilan vergi kesinti orani (%)
     */
    private const DEFAULT_WITHHOLDING_TAX_RATE = 0.00;

    /**
     * Seed islemini calistir
     */
    public function run(): void
    {
        $this->command->info('Kategori seed islemi basliyor...');

        $categories = $this->getCategoryData();
        $totalCategories = 0;
        $totalSubcategories = 0;

        foreach ($categories as $sortOrder => $categoryData) {
            $children = $categoryData['children'] ?? [];
            unset($categoryData['children']);

            // Ana kategoriyi olustur veya guncelle
            $parent = Category::updateOrCreate(
                ['slug' => $categoryData['slug']],
                array_merge($categoryData, [
                    'is_active' => true,
                    'parent_id' => null,
                    'sort_order' => $sortOrder + 1,
                    'commission_rate' => $categoryData['commission_rate'] ?? self::DEFAULT_COMMISSION_RATE,
                    'vat_rate' => $categoryData['vat_rate'] ?? self::DEFAULT_VAT_RATE,
                    'withholding_tax_rate' => $categoryData['withholding_tax_rate'] ?? self::DEFAULT_WITHHOLDING_TAX_RATE,
                ])
            );

            $totalCategories++;

            // Alt kategorileri olustur
            foreach ($children as $childSortOrder => $childData) {
                $childSlug = $childData['slug'] ?? Str::slug($childData['name']);

                Category::updateOrCreate(
                    ['slug' => $childSlug],
                    [
                        'name' => $childData['name'],
                        'slug' => $childSlug,
                        'description' => $childData['description'] ?? $childData['name'] . ' urunleri',
                        'icon' => $childData['icon'] ?? null,
                        'parent_id' => $parent->id,
                        'is_active' => true,
                        'sort_order' => $childSortOrder + 1,
                        'commission_rate' => $childData['commission_rate'] ?? $parent->commission_rate,
                        'vat_rate' => $childData['vat_rate'] ?? $parent->vat_rate,
                        'withholding_tax_rate' => $childData['withholding_tax_rate'] ?? $parent->withholding_tax_rate,
                        'tax_rate' => $childData['tax_rate'] ?? 8,
                    ]
                );

                $totalSubcategories++;
            }
        }

        $this->command->info("Ana kategoriler: {$totalCategories}");
        $this->command->info("Alt kategoriler: {$totalSubcategories}");
        $this->command->info("Toplam: " . ($totalCategories + $totalSubcategories) . " kategori olusturuldu/guncellendi.");
    }

    /**
     * Tum kategori verilerini dondur
     *
     * @return array<int, array<string, mixed>>
     */
    private function getCategoryData(): array
    {
        return [
            // 1. Gunes Urunleri
            [
                'name' => 'Gunes Urunleri',
                'slug' => 'gunes-urunleri',
                'description' => 'Gunes koruma ve bronzlastirma urunleri',
                'icon' => 'sun',
                'commission_rate' => 12.00,
                'children' => [
                    ['name' => 'Gunes Kremi', 'slug' => 'gunes-kremi', 'description' => 'SPF korumali gunes kremleri'],
                    ['name' => 'Gunes Spreyi', 'slug' => 'gunes-spreyi', 'description' => 'Kolay uygulanabilir gunes spreyleri'],
                    ['name' => 'Gunes Losyonu', 'slug' => 'gunes-losyonu', 'description' => 'Nemlendirici gunes losyonlari'],
                    ['name' => 'After Sun', 'slug' => 'after-sun', 'description' => 'Gunes sonrasi bakim urunleri'],
                    ['name' => 'Gunes Yagi', 'slug' => 'gunes-yagi', 'description' => 'Bronzlastirici gunes yaglari'],
                    ['name' => 'Cocuk Gunes Koruma', 'slug' => 'cocuk-gunes-koruma', 'description' => 'Cocuklar icin ozel gunes koruma urunleri'],
                    ['name' => 'Dudak Koruyucu SPF', 'slug' => 'dudak-koruyucu-spf', 'description' => 'SPF iceren dudak bakim urunleri'],
                    ['name' => 'Gunes Sac Spreyi', 'slug' => 'gunes-sac-spreyi', 'description' => 'Saclar icin gunes koruma spreyleri'],
                    ['name' => 'Bronzlastirici', 'slug' => 'bronzlastirici', 'description' => 'Bronzlastirici urunler'],
                    ['name' => 'Self-Tan', 'slug' => 'self-tan', 'description' => 'Guneşsiz bronzluk urunleri'],
                    ['name' => 'Gunes Jeli', 'slug' => 'gunes-jeli', 'description' => 'Hafif formul gunes jelleri'],
                    ['name' => 'Yuz Gunes Koruma', 'slug' => 'yuz-gunes-koruma', 'description' => 'Yuz icin ozel gunes koruma urunleri'],
                ],
            ],

            // 2. Cilt Bakimi
            [
                'name' => 'Cilt Bakimi',
                'slug' => 'cilt-bakimi',
                'description' => 'Yuz ve cilt bakim urunleri',
                'icon' => 'droplet',
                'commission_rate' => 15.00,
                'children' => [
                    ['name' => 'Nemlendirici', 'slug' => 'nemlendirici', 'description' => 'Cilt nemlendirici kremler'],
                    ['name' => 'Anti-Aging', 'slug' => 'anti-aging', 'description' => 'Yaslanma karsiti bakim urunleri'],
                    ['name' => 'Serum', 'slug' => 'serum', 'description' => 'Yogun bakim serumlari'],
                    ['name' => 'Goz Kremi', 'slug' => 'goz-kremi', 'description' => 'Goz cevresi bakim kremleri'],
                    ['name' => 'Yuz Temizleyici', 'slug' => 'yuz-temizleyici', 'description' => 'Yuz temizleme urunleri'],
                    ['name' => 'Tonik', 'slug' => 'tonik', 'description' => 'Cilt tonikleri'],
                    ['name' => 'Peeling', 'slug' => 'peeling', 'description' => 'Cilt soyucu peeling urunleri'],
                    ['name' => 'Maske', 'slug' => 'maske', 'description' => 'Yuz maskeleri'],
                    ['name' => 'Gece Kremi', 'slug' => 'gece-kremi', 'description' => 'Gece bakim kremleri'],
                    ['name' => 'Gunduz Kremi', 'slug' => 'gunduz-kremi', 'description' => 'Gunduz bakim kremleri'],
                    ['name' => 'Leke Kremi', 'slug' => 'leke-kremi', 'description' => 'Cilt lekelerine karsi kremler'],
                    ['name' => 'Akne Bakim', 'slug' => 'akne-bakim', 'description' => 'Akne ve sivilce bakim urunleri'],
                    ['name' => 'Hassas Cilt', 'slug' => 'hassas-cilt', 'description' => 'Hassas ciltler icin ozel urunler'],
                    ['name' => 'Yagli Cilt', 'slug' => 'yagli-cilt', 'description' => 'Yagli ciltler icin bakim urunleri'],
                    ['name' => 'Kuru Cilt', 'slug' => 'kuru-cilt', 'description' => 'Kuru ciltler icin nemlendirici urunler'],
                ],
            ],

            // 3. Sac Bakimi
            [
                'name' => 'Sac Bakimi',
                'slug' => 'sac-bakimi',
                'description' => 'Sac bakim ve sekillendirme urunleri',
                'icon' => 'scissors',
                'commission_rate' => 12.00,
                'children' => [
                    ['name' => 'Sampuan', 'slug' => 'sampuan', 'description' => 'Sac yikama sampuanlari'],
                    ['name' => 'Sac Kremi', 'slug' => 'sac-kremi', 'description' => 'Sac bakim kremleri'],
                    ['name' => 'Sac Maskesi', 'slug' => 'sac-maskesi', 'description' => 'Yogun bakim sac maskeleri'],
                    ['name' => 'Sac Serumu', 'slug' => 'sac-serumu', 'description' => 'Sac bakim serumlari'],
                    ['name' => 'Sac Yagi', 'slug' => 'sac-yagi', 'description' => 'Besleyici sac yaglari'],
                    ['name' => 'Sac Spreyi', 'slug' => 'sac-spreyi', 'description' => 'Sac sekillendirme spreyleri'],
                    ['name' => 'Sac Dokulmesi', 'slug' => 'sac-dokulmesi', 'description' => 'Sac dokulmesine karsi urunler'],
                    ['name' => 'Kepek Karşiti', 'slug' => 'kepek-karsiti', 'description' => 'Kepek onleyici urunler'],
                    ['name' => 'Sac Boyasi', 'slug' => 'sac-boyasi', 'description' => 'Sac boyama urunleri'],
                    ['name' => 'Sac Sekillendirici', 'slug' => 'sac-sekillendirici', 'description' => 'Jole, wax ve sekillendirici urunler'],
                    ['name' => 'Sac Vitamini', 'slug' => 'sac-vitamini', 'description' => 'Sac sagligi icin vitamin takviyeleri'],
                    ['name' => 'Kuru Sampuan', 'slug' => 'kuru-sampuan', 'description' => 'Susuz sac temizleme urunleri'],
                ],
            ],

            // 4. Vucut Bakimi
            [
                'name' => 'Vucut Bakimi',
                'slug' => 'vucut-bakimi',
                'description' => 'Vucut bakim ve temizlik urunleri',
                'icon' => 'heart',
                'commission_rate' => 10.00,
                'children' => [
                    ['name' => 'Dus Jeli', 'slug' => 'dus-jeli', 'description' => 'Vucut temizleme jelleri'],
                    ['name' => 'Vucut Losyonu', 'slug' => 'vucut-losyonu', 'description' => 'Nemlendirici vucut losyonlari'],
                    ['name' => 'Vucut Kremi', 'slug' => 'vucut-kremi', 'description' => 'Yogun nemlendirici vucut kremleri'],
                    ['name' => 'El Kremi', 'slug' => 'el-kremi', 'description' => 'El bakim kremleri'],
                    ['name' => 'Ayak Bakim', 'slug' => 'ayak-bakim', 'description' => 'Ayak bakim urunleri'],
                    ['name' => 'Vucut Peelingi', 'slug' => 'vucut-peelingi', 'description' => 'Vucut soyucu peeling urunleri'],
                    ['name' => 'Vucut Yagi', 'slug' => 'vucut-yagi', 'description' => 'Besleyici vucut yaglari'],
                    ['name' => 'Banyo Tuzu', 'slug' => 'banyo-tuzu', 'description' => 'Rahatlatici banyo tuzlari'],
                    ['name' => 'Deodorant', 'slug' => 'deodorant', 'description' => 'Ter onleyici ve deodorantlar'],
                    ['name' => 'Antiperspirant', 'slug' => 'antiperspirant', 'description' => 'Yogun ter onleyici urunler'],
                    ['name' => 'Vucut Spreyi', 'slug' => 'vucut-spreyi', 'description' => 'Ferahlatici vucut spreyleri'],
                    ['name' => 'Epilasyon', 'slug' => 'epilasyon', 'description' => 'Tuy alma urunleri'],
                ],
            ],

            // 5. Anne Bebek
            [
                'name' => 'Anne Bebek',
                'slug' => 'anne-bebek',
                'description' => 'Anne ve bebek bakim urunleri',
                'icon' => 'baby',
                'commission_rate' => 8.00,
                'children' => [
                    ['name' => 'Bebek Bezi', 'slug' => 'bebek-bezi', 'description' => 'Bebek bezleri'],
                    ['name' => 'Islak Mendil', 'slug' => 'islak-mendil', 'description' => 'Bebek islak mendilleri'],
                    ['name' => 'Bebek Sampuani', 'slug' => 'bebek-sampuani', 'description' => 'Bebek sac bakim urunleri'],
                    ['name' => 'Bebek Losyonu', 'slug' => 'bebek-losyonu', 'description' => 'Bebek cilt bakim losyonlari'],
                    ['name' => 'Bebek Yagi', 'slug' => 'bebek-yagi', 'description' => 'Bebek masaj yaglari'],
                    ['name' => 'Bebek Kremi', 'slug' => 'bebek-kremi', 'description' => 'Bebek cilt kremleri'],
                    ['name' => 'Pisik Kremi', 'slug' => 'pisik-kremi', 'description' => 'Pisik onleyici kremler'],
                    ['name' => 'Bebek Mamasi', 'slug' => 'bebek-mamasi', 'description' => 'Bebek mamalari ve formuller'],
                    ['name' => 'Emzirme Urunleri', 'slug' => 'emzirme-urunleri', 'description' => 'Anne emzirme yardimci urunleri'],
                    ['name' => 'Biberon', 'slug' => 'biberon', 'description' => 'Bebek biberonlari'],
                    ['name' => 'Emzik', 'slug' => 'emzik', 'description' => 'Bebek emzikleri'],
                    ['name' => 'Anne Bakim', 'slug' => 'anne-bakim', 'description' => 'Hamilelik ve dogum sonrasi bakim'],
                    ['name' => 'Bebek Gunes Koruma', 'slug' => 'bebek-gunes-koruma', 'description' => 'Bebekler icin gunes koruma'],
                ],
            ],

            // 6. Makyaj
            [
                'name' => 'Makyaj',
                'slug' => 'makyaj',
                'description' => 'Makyaj ve guzellik urunleri',
                'icon' => 'palette',
                'commission_rate' => 18.00,
                'children' => [
                    ['name' => 'Fondoten', 'slug' => 'fondoten', 'description' => 'Yuz fondotenleri'],
                    ['name' => 'Pudra', 'slug' => 'pudra', 'description' => 'Yuz pudralari'],
                    ['name' => 'Kapatici', 'slug' => 'kapatici', 'description' => 'Goz alti ve leke kapaticilari'],
                    ['name' => 'Allik', 'slug' => 'allik', 'description' => 'Yanak aliklari'],
                    ['name' => 'Bronzer', 'slug' => 'bronzer', 'description' => 'Yuz bronzerlari'],
                    ['name' => 'Highlighter', 'slug' => 'highlighter', 'description' => 'Aydinlatici urunler'],
                    ['name' => 'Ruj', 'slug' => 'ruj', 'description' => 'Dudak rujlari'],
                    ['name' => 'Dudak Parlaticisi', 'slug' => 'dudak-parlaticisi', 'description' => 'Lip gloss urunleri'],
                    ['name' => 'Maskara', 'slug' => 'maskara', 'description' => 'Kirpik maskaralari'],
                    ['name' => 'Eyeliner', 'slug' => 'eyeliner', 'description' => 'Goz cevresi eyelinerlari'],
                    ['name' => 'Goz Farı', 'slug' => 'goz-fari', 'description' => 'Goz fari paletleri'],
                    ['name' => 'Kas Urunu', 'slug' => 'kas-urunu', 'description' => 'Kas sekillendirme urunleri'],
                    ['name' => 'Makyaj Temizleyici', 'slug' => 'makyaj-temizleyici', 'description' => 'Makyaj temizleme urunleri'],
                    ['name' => 'Makyaj Firçasi', 'slug' => 'makyaj-fircasi', 'description' => 'Makyaj uygulama fircalari'],
                    ['name' => 'Oje', 'slug' => 'oje', 'description' => 'Tirnak ojeleri'],
                ],
            ],

            // 7. Vitaminler
            [
                'name' => 'Vitaminler',
                'slug' => 'vitaminler',
                'description' => 'Vitamin ve mineral takviyeleri',
                'icon' => 'pill',
                'commission_rate' => 10.00,
                'children' => [
                    ['name' => 'Vitamin A', 'slug' => 'vitamin-a', 'description' => 'A vitamini takviyeleri'],
                    ['name' => 'Vitamin B Kompleks', 'slug' => 'vitamin-b-kompleks', 'description' => 'B grubu vitamin takviyeleri'],
                    ['name' => 'Vitamin C', 'slug' => 'vitamin-c', 'description' => 'C vitamini takviyeleri'],
                    ['name' => 'Vitamin D', 'slug' => 'vitamin-d', 'description' => 'D vitamini takviyeleri'],
                    ['name' => 'Vitamin E', 'slug' => 'vitamin-e', 'description' => 'E vitamini takviyeleri'],
                    ['name' => 'Vitamin K', 'slug' => 'vitamin-k', 'description' => 'K vitamini takviyeleri'],
                    ['name' => 'Multivitamin', 'slug' => 'multivitamin', 'description' => 'Coklu vitamin takviyeleri'],
                    ['name' => 'Cocuk Vitaminleri', 'slug' => 'cocuk-vitaminleri', 'description' => 'Cocuklar icin vitamin takviyeleri'],
                    ['name' => 'Hamilelik Vitaminleri', 'slug' => 'hamilelik-vitaminleri', 'description' => 'Hamilelik doneminde vitamin takviyeleri'],
                    ['name' => 'Demir', 'slug' => 'demir', 'description' => 'Demir mineral takviyesi'],
                    ['name' => 'Kalsiyum', 'slug' => 'kalsiyum', 'description' => 'Kalsiyum mineral takviyesi'],
                    ['name' => 'Magnezyum', 'slug' => 'magnezyum', 'description' => 'Magnezyum mineral takviyesi'],
                    ['name' => 'Cinko', 'slug' => 'cinko', 'description' => 'Cinko mineral takviyesi'],
                ],
            ],

            // 8. Besin Takviyeleri
            [
                'name' => 'Besin Takviyeleri',
                'slug' => 'besin-takviyeleri',
                'description' => 'Saglik ve besin destek urunleri',
                'icon' => 'leaf',
                'commission_rate' => 12.00,
                'children' => [
                    ['name' => 'Omega 3', 'slug' => 'omega-3', 'description' => 'Omega 3 yag asitleri'],
                    ['name' => 'Probiyotik', 'slug' => 'probiyotik', 'description' => 'Probiyotik takviyeleri'],
                    ['name' => 'Kolajen', 'slug' => 'kolajen', 'description' => 'Kolajen takviyeleri'],
                    ['name' => 'Protein Tozu', 'slug' => 'protein-tozu', 'description' => 'Protein takviyeleri'],
                    ['name' => 'Kreatin', 'slug' => 'kreatin', 'description' => 'Kreatin takviyeleri'],
                    ['name' => 'BCAA', 'slug' => 'bcaa', 'description' => 'Amino asit takviyeleri'],
                    ['name' => 'Glukozamin', 'slug' => 'glukozamin', 'description' => 'Eklem sagligi takviyeleri'],
                    ['name' => 'Koenzim Q10', 'slug' => 'koenzim-q10', 'description' => 'CoQ10 takviyeleri'],
                    ['name' => 'Spirulina', 'slug' => 'spirulina', 'description' => 'Spirulina alg takviyeleri'],
                    ['name' => 'Kara Murver', 'slug' => 'kara-murver', 'description' => 'Kara murver ozlu urunler'],
                    ['name' => 'Ari Sutu', 'slug' => 'ari-sutu', 'description' => 'Ari sutu takviyeleri'],
                    ['name' => 'Propolis', 'slug' => 'propolis', 'description' => 'Propolis takviyeleri'],
                    ['name' => 'Ginseng', 'slug' => 'ginseng', 'description' => 'Ginseng takviyeleri'],
                    ['name' => 'Ekinezya', 'slug' => 'ekinezya', 'description' => 'Ekinezya bitkisel takviyeler'],
                ],
            ],

            // 9. Kisisel Bakim
            [
                'name' => 'Kisisel Bakim',
                'slug' => 'kisisel-bakim',
                'description' => 'Gunluk kisisel bakim urunleri',
                'icon' => 'user',
                'commission_rate' => 8.00,
                'children' => [
                    ['name' => 'Dis Macunu', 'slug' => 'dis-macunu', 'description' => 'Dis temizleme macunlari'],
                    ['name' => 'Dis Fircasi', 'slug' => 'dis-fircasi', 'description' => 'Manuel ve elektrikli dis fircalari'],
                    ['name' => 'Agiz Bakim', 'slug' => 'agiz-bakim', 'description' => 'Gargara ve agiz spreyleri'],
                    ['name' => 'Dis Ipi', 'slug' => 'dis-ipi', 'description' => 'Dis ipi ve arayuz fircalari'],
                    ['name' => 'Tiras Urunleri', 'slug' => 'tiras-urunleri', 'description' => 'Tiras kopugu, jeli ve losyonlari'],
                    ['name' => 'Tiras Makinesi', 'slug' => 'tiras-makinesi', 'description' => 'Tiras makinalari ve bicaklari'],
                    ['name' => 'Parfum', 'slug' => 'parfum', 'description' => 'Parfum ve koku urunleri'],
                    ['name' => 'Kulak Temizligi', 'slug' => 'kulak-temizligi', 'description' => 'Kulak temizleme urunleri'],
                    ['name' => 'Burun Bakim', 'slug' => 'burun-bakim', 'description' => 'Burun spreyi ve bakim urunleri'],
                    ['name' => 'Lens Solüsyonu', 'slug' => 'lens-solusyonu', 'description' => 'Kontakt lens bakim solüsyonlari'],
                    ['name' => 'Hijyenik Ped', 'slug' => 'hijyenik-ped', 'description' => 'Kadin hijyen urunleri'],
                    ['name' => 'Gunluk Ped', 'slug' => 'gunluk-ped', 'description' => 'Gunluk kullanim pedleri'],
                    ['name' => 'Tampon', 'slug' => 'tampon', 'description' => 'Hijyenik tamponlar'],
                    ['name' => 'Intimasyon Urunleri', 'slug' => 'intimasyon-urunleri', 'description' => 'Ozel bolge bakim urunleri'],
                ],
            ],
        ];
    }
}
