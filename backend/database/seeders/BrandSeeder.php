<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Brand;
use Illuminate\Database\Seeder;

/**
 * Marka verilerini seed eder - Eczane/ilac sektorunden populer markalar
 */
class BrandSeeder extends Seeder
{
    /**
     * Seed metodunu calistirir
     */
    public function run(): void
    {
        $brands = [
            // Uluslararasi ilac firmalari
            [
                'name' => 'Bayer',
                'slug' => 'bayer',
                'logo_url' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Logo_Bayer.svg/200px-Logo_Bayer.svg.png',
                'description' => 'Alman kokenli kuresel saglik ve tarim bilimleri sirketi',
                'website_url' => 'https://www.bayer.com.tr',
                'is_active' => true,
                'is_featured' => true,
                'sort_order' => 1,
            ],
            [
                'name' => 'Pfizer',
                'slug' => 'pfizer',
                'logo_url' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Pfizer_%282021%29.svg/200px-Pfizer_%282021%29.svg.png',
                'description' => 'Amerikali cokuluslu ilac ve biyoteknoloji sirketi',
                'website_url' => 'https://www.pfizer.com.tr',
                'is_active' => true,
                'is_featured' => true,
                'sort_order' => 2,
            ],
            [
                'name' => 'Roche',
                'slug' => 'roche',
                'logo_url' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Roche_Logo.svg/200px-Roche_Logo.svg.png',
                'description' => 'Isvicre merkezli cokuluslu saglik sirketi',
                'website_url' => 'https://www.roche.com.tr',
                'is_active' => true,
                'is_featured' => true,
                'sort_order' => 3,
            ],
            [
                'name' => 'Novartis',
                'slug' => 'novartis',
                'logo_url' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Novartis-Logo.svg/200px-Novartis-Logo.svg.png',
                'description' => 'Isvicre merkezli cokuluslu ilac sirketi',
                'website_url' => 'https://www.novartis.com.tr',
                'is_active' => true,
                'is_featured' => true,
                'sort_order' => 4,
            ],
            [
                'name' => 'Sanofi',
                'slug' => 'sanofi',
                'logo_url' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Sanofi_logo.svg/200px-Sanofi_logo.svg.png',
                'description' => 'Fransiz cokuluslu ilac sirketi',
                'website_url' => 'https://www.sanofi.com.tr',
                'is_active' => true,
                'is_featured' => true,
                'sort_order' => 5,
            ],
            [
                'name' => 'GSK',
                'slug' => 'gsk',
                'logo_url' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/GSK_logo_2022.svg/200px-GSK_logo_2022.svg.png',
                'description' => 'GlaxoSmithKline - Ingiliz cokuluslu ilac sirketi',
                'website_url' => 'https://www.gsk.com.tr',
                'is_active' => true,
                'is_featured' => true,
                'sort_order' => 6,
            ],
            [
                'name' => 'AstraZeneca',
                'slug' => 'astrazeneca',
                'logo_url' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/AstraZeneca_logo.svg/200px-AstraZeneca_logo.svg.png',
                'description' => 'Ingiliz-Isvec cokuluslu ilac ve biyofarmakoloji sirketi',
                'website_url' => 'https://www.astrazeneca.com.tr',
                'is_active' => true,
                'is_featured' => true,
                'sort_order' => 7,
            ],
            [
                'name' => 'Johnson & Johnson',
                'slug' => 'johnson-johnson',
                'logo_url' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/JNJ_Logo_Stacked.svg/200px-JNJ_Logo_Stacked.svg.png',
                'description' => 'Amerikan cokuluslu tibbi cihaz, ilac ve tuketici saglik urunleri sirketi',
                'website_url' => 'https://www.jnj.com.tr',
                'is_active' => true,
                'is_featured' => true,
                'sort_order' => 8,
            ],

            // Turk ilac firmalari
            [
                'name' => 'Abdi Ibrahim',
                'slug' => 'abdi-ibrahim',
                'logo_url' => 'https://www.abdiibrahim.com.tr/themes/abdi/assets/img/logo.svg',
                'description' => 'Turkiye\'nin en buyuk ilac sirketi',
                'website_url' => 'https://www.abdiibrahim.com.tr',
                'is_active' => true,
                'is_featured' => true,
                'sort_order' => 9,
            ],
            [
                'name' => 'Eczacibasi',
                'slug' => 'eczacibasi',
                'logo_url' => 'https://www.eczacibasi.com.tr/_assets/images/eczacibasi-logo.svg',
                'description' => 'Turk ilac ve saglik urunu ureticisi',
                'website_url' => 'https://www.eczacibasi.com.tr',
                'is_active' => true,
                'is_featured' => true,
                'sort_order' => 10,
            ],
            [
                'name' => 'Bilim Ilac',
                'slug' => 'bilim-ilac',
                'logo_url' => 'https://www.bilimilac.com.tr/assets/images/logo.png',
                'description' => 'Turk jenerik ilac ureticisi',
                'website_url' => 'https://www.bilimilac.com.tr',
                'is_active' => true,
                'is_featured' => false,
                'sort_order' => 11,
            ],

            // Dermokozmetik markalar
            [
                'name' => 'Bioderma',
                'slug' => 'bioderma',
                'logo_url' => 'https://www.bioderma.com.tr/themes/bioderma/images/logo.svg',
                'description' => 'Fransiz dermatolojik cilt bakimi markasi',
                'website_url' => 'https://www.bioderma.com.tr',
                'is_active' => true,
                'is_featured' => true,
                'sort_order' => 12,
            ],
            [
                'name' => 'La Roche-Posay',
                'slug' => 'la-roche-posay',
                'logo_url' => 'https://www.laroche-posay.com.tr/on/demandware.static/Sites-LRPINT-Site/-/default/dw7a3e5f19/images/logo_lrp.svg',
                'description' => 'L\'Oreal grubuna ait dermokozmetik markasi',
                'website_url' => 'https://www.laroche-posay.com.tr',
                'is_active' => true,
                'is_featured' => true,
                'sort_order' => 13,
            ],
            [
                'name' => 'Vichy',
                'slug' => 'vichy',
                'logo_url' => 'https://www.vichy.com.tr/on/demandware.static/Sites-Vichy_UK-Site/-/default/dwd82e2c13/img/logo-vichy.svg',
                'description' => 'Fransiz cilt ve sac bakimi markasi',
                'website_url' => 'https://www.vichy.com.tr',
                'is_active' => true,
                'is_featured' => false,
                'sort_order' => 14,
            ],
            [
                'name' => 'Avene',
                'slug' => 'avene',
                'logo_url' => 'https://www.eau-thermale-avene.com.tr/themes/avene/images/logo.svg',
                'description' => 'Fransiz termal su bazli cilt bakimi markasi',
                'website_url' => 'https://www.eau-thermale-avene.com.tr',
                'is_active' => true,
                'is_featured' => false,
                'sort_order' => 15,
            ],
            [
                'name' => 'Mustela',
                'slug' => 'mustela',
                'logo_url' => 'https://www.mustela.com.tr/themes/mustela/images/logo.svg',
                'description' => 'Bebek ve anne cilt bakimi markasi',
                'website_url' => 'https://www.mustela.com.tr',
                'is_active' => true,
                'is_featured' => false,
                'sort_order' => 16,
            ],
            [
                'name' => 'Bepanthen',
                'slug' => 'bepanthen',
                'logo_url' => 'https://www.bepanthen.com.tr/static/frontend/img/logo.svg',
                'description' => 'Bayer markasi, cilt bakim ve onarim urunleri',
                'website_url' => 'https://www.bepanthen.com.tr',
                'is_active' => true,
                'is_featured' => false,
                'sort_order' => 17,
            ],

            // Diger markalar
            [
                'name' => 'Dogadan',
                'slug' => 'dogadan',
                'logo_url' => 'https://www.dogadan.com.tr/images/logo.svg',
                'description' => 'Bitkisel cay ve saglik urunleri markasi',
                'website_url' => 'https://www.dogadan.com.tr',
                'is_active' => true,
                'is_featured' => false,
                'sort_order' => 18,
            ],
            [
                'name' => 'Centrum',
                'slug' => 'centrum',
                'logo_url' => 'https://www.centrum.com/themes/centrum/images/logo.svg',
                'description' => 'Multivitamin ve takviye gida markasi',
                'website_url' => 'https://www.centrum.com.tr',
                'is_active' => true,
                'is_featured' => false,
                'sort_order' => 19,
            ],
            [
                'name' => 'Solgar',
                'slug' => 'solgar',
                'logo_url' => 'https://www.solgar.com.tr/images/logo.png',
                'description' => 'Premium vitamin ve takviye gida markasi',
                'website_url' => 'https://www.solgar.com.tr',
                'is_active' => true,
                'is_featured' => false,
                'sort_order' => 20,
            ],
        ];

        foreach ($brands as $brandData) {
            Brand::updateOrCreate(
                ['slug' => $brandData['slug']],
                $brandData
            );
        }

        $this->command->info('20 marka basariyla eklendi!');
    }
}
