<?php

namespace Database\Seeders;

use App\Models\GlnWhitelist;
use App\Models\Offer;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create GLN Whitelist entries
        $glnEntries = [
            ['gln_code' => '8680000000011', 'pharmacy_name' => 'Merkez Eczanesi', 'city' => 'İstanbul', 'district' => 'Kadıköy'],
            ['gln_code' => '8680000000028', 'pharmacy_name' => 'Sağlık Eczanesi', 'city' => 'Ankara', 'district' => 'Çankaya'],
            ['gln_code' => '8680000000035', 'pharmacy_name' => 'Güven Eczanesi', 'city' => 'İzmir', 'district' => 'Konak'],
            ['gln_code' => '8680000000042', 'pharmacy_name' => 'Anadolu Eczanesi', 'city' => 'Bursa', 'district' => 'Nilüfer'],
            ['gln_code' => '8680000000059', 'pharmacy_name' => 'Hayat Eczanesi', 'city' => 'Antalya', 'district' => 'Muratpaşa'],
        ];

        foreach ($glnEntries as $entry) {
            GlnWhitelist::create($entry);
        }

        // Create Super Admin user
        User::create([
            'email' => 'admin@eczanepazari.com',
            'password' => Hash::make('password'),
            'gln_code' => '8680000000011',
            'pharmacy_name' => 'Merkez Eczanesi',
            'city' => 'İstanbul',
            'role' => 'super-admin',
            'is_verified' => true,
            'verified_at' => now(),
        ]);

        // Create demo pharmacist users
        $pharmacists = [
            ['gln_code' => '8680000000028', 'pharmacy_name' => 'Sağlık Eczanesi', 'city' => 'Ankara', 'email' => 'saglik@eczane.com'],
            ['gln_code' => '8680000000035', 'pharmacy_name' => 'Güven Eczanesi', 'city' => 'İzmir', 'email' => 'guven@eczane.com'],
        ];

        foreach ($pharmacists as $pharmacist) {
            User::create([
                'email' => $pharmacist['email'],
                'password' => Hash::make('password'),
                'gln_code' => $pharmacist['gln_code'],
                'pharmacy_name' => $pharmacist['pharmacy_name'],
                'city' => $pharmacist['city'],
                'role' => 'pharmacist',
                'is_verified' => true,
                'verified_at' => now(),
            ]);
        }

        // Create sample products
        $products = [
            ['barcode' => '86800001234565', 'name' => 'Parol 500 mg 20 Tablet', 'brand' => 'Eczacıbaşı', 'category' => 'Ağrı Kesici', 'manufacturer' => 'Eczacıbaşı İlaç'],
            ['barcode' => '86800001234572', 'name' => 'Aspirin 100 mg 20 Tablet', 'brand' => 'Bayer', 'category' => 'Ağrı Kesici', 'manufacturer' => 'Bayer Türk'],
            ['barcode' => '86800001234589', 'name' => 'Augmentin 1000 mg 14 Tablet', 'brand' => 'GSK', 'category' => 'Antibiyotik', 'manufacturer' => 'GlaxoSmithKline'],
            ['barcode' => '86800001234596', 'name' => 'Voltaren Emulgel 50g', 'brand' => 'Novartis', 'category' => 'Kas Gevşetici', 'manufacturer' => 'Novartis'],
            ['barcode' => '86800001234602', 'name' => 'Coraspin 100 mg 30 Tablet', 'brand' => 'Bayer', 'category' => 'Kalp', 'manufacturer' => 'Bayer Türk'],
            ['barcode' => '86800001234619', 'name' => 'Nexium 40 mg 28 Kapsül', 'brand' => 'AstraZeneca', 'category' => 'Mide', 'manufacturer' => 'AstraZeneca'],
            ['barcode' => '86800001234626', 'name' => 'Xanax 0.5 mg 30 Tablet', 'brand' => 'Pfizer', 'category' => 'Nöroloji', 'manufacturer' => 'Pfizer'],
            ['barcode' => '86800001234633', 'name' => 'Cipro 500 mg 14 Tablet', 'brand' => 'Bayer', 'category' => 'Antibiyotik', 'manufacturer' => 'Bayer Türk'],
            ['barcode' => '86800001234640', 'name' => 'Ventolin İnhaler', 'brand' => 'GSK', 'category' => 'Solunum', 'manufacturer' => 'GlaxoSmithKline'],
            ['barcode' => '86800001234657', 'name' => 'Lipitor 20 mg 30 Tablet', 'brand' => 'Pfizer', 'category' => 'Kolesterol', 'manufacturer' => 'Pfizer'],
        ];

        foreach ($products as $product) {
            Product::create($product);
        }

        // Create sample offers
        $users = User::where('role', 'pharmacist')->get();
        $allProducts = Product::all();

        foreach ($allProducts as $product) {
            // Create 2-4 offers per product
            $offerCount = rand(2, 4);
            $usedUsers = [];

            for ($i = 0; $i < $offerCount && $i < $users->count(); $i++) {
                $user = $users->random();
                
                // Avoid duplicate user offers for same product
                while (in_array($user->id, $usedUsers) && count($usedUsers) < $users->count()) {
                    $user = $users->random();
                }
                $usedUsers[] = $user->id;

                Offer::create([
                    'product_id' => $product->id,
                    'seller_id' => $user->id,
                    'price' => rand(50, 500) + (rand(0, 99) / 100),
                    'stock' => rand(5, 100),
                    'expiry_date' => now()->addMonths(rand(6, 24)),
                    'batch_number' => 'B' . rand(100000, 999999),
                    'status' => 'active',
                ]);
            }
        }

        $this->command->info('Demo veriler başarıyla oluşturuldu!');
        $this->command->info('Admin: admin@eczanepazari.com / password');
        $this->command->info('Demo GLN: 8680000000042 (kayıt için kullanılabilir)');
    }
}

