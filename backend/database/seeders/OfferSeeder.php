<?php

namespace Database\Seeders;

use App\Models\Offer;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class OfferSeeder extends Seeder
{
    public function run(): void
    {
        // Demo satıcıları al (pharmacist role + verified)
        $sellers = User::where('role', 'pharmacist')
            ->where('is_verified', true)
            ->get();

        if ($sellers->isEmpty()) {
            $this->command->warn('⚠️ Satıcı bulunamadı. Önce DemoAccountSeeder çalıştırın.');
            return;
        }

        // Aktif ürünleri al
        $products = Product::where('is_active', true)->get();

        if ($products->isEmpty()) {
            $this->command->warn('⚠️ Ürün bulunamadı. Önce ProductSeeder çalıştırın.');
            return;
        }

        // Fiyat aralıkları (kategori bazlı)
        $priceRanges = [
            'vitaminler' => [50, 300],
            'agri-kesiciler' => [20, 150],
            'antibiyotikler' => [30, 200],
            'sindirim-sistemi' => [25, 180],
            'solunum-sistemi' => [20, 250],
            'kardiyovaskuler' => [40, 350],
            'diyabet' => [50, 500],
            'dermatoloji' => [30, 400],
            'bebek-cocuk' => [25, 200],
            'kozmetik' => [50, 500],
        ];

        $count = 0;

        foreach ($products as $product) {
            // Her ürün için 1-5 satıcıdan teklif
            $offerCount = rand(1, min(5, $sellers->count()));
            $selectedSellers = $sellers->random($offerCount);

            $categorySlug = $product->category?->slug ?? 'vitaminler';
            $priceRange = $priceRanges[$categorySlug] ?? [30, 200];

            foreach ($selectedSellers as $seller) {
                // Aynı satıcı-ürün kombinasyonu varsa atla
                $exists = Offer::where('product_id', $product->id)
                    ->where('seller_id', $seller->id)
                    ->exists();

                if ($exists)
                    continue;

                // Fiyat hesapla (biraz varyasyon ile)
                $basePrice = rand($priceRange[0] * 100, $priceRange[1] * 100) / 100;

                // SKT: 6-24 ay arası
                $expiryMonths = rand(6, 24);
                $expiryDate = Carbon::now()->addMonths($expiryMonths);

                // Stok: 10-500 arası
                $stock = rand(10, 500);

                // Parti numarası
                $batchNumber = 'P' . date('Y') . '-' . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);

                Offer::create([
                    'product_id' => $product->id,
                    'seller_id' => $seller->id,
                    'price' => $basePrice,
                    'stock' => $stock,
                    'expiry_date' => $expiryDate,
                    'batch_number' => $batchNumber,
                    'status' => 'active',
                    'notes' => null,
                ]);

                $count++;
            }
        }

        $this->command->info("✅ {$count} teklif oluşturuldu.");
    }
}
