<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\GlnWhitelist;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoAccountSeeder extends Seeder
{
    public function run(): void
    {
        // Demo eczane satıcıları (GLN yapısına uygun)
        $demoSellers = [
            [
                'gln_code' => '8680000000001',
                'pharmacy_name' => 'Demo Eczanesi',
                'email' => 'demo1@eczanepazari.com',
                'city' => 'İstanbul',
                'address' => 'Moda Cad. No:15, Kadıköy',
                'phone' => '05321234567',
            ],
            [
                'gln_code' => '8680000000002',
                'pharmacy_name' => 'Merkez Eczanesi',
                'email' => 'demo2@eczanepazari.com',
                'city' => 'Ankara',
                'address' => 'Kızılay Mah. Atatürk Blv. No:42, Çankaya',
                'phone' => '05329876543',
            ],
            [
                'gln_code' => '8680000000003',
                'pharmacy_name' => 'Hayat Eczanesi',
                'email' => 'demo3@eczanepazari.com',
                'city' => 'İzmir',
                'address' => 'Alsancak Mah. Kordon Cad. No:88, Konak',
                'phone' => '05335551234',
            ],
            [
                'gln_code' => '8680000000004',
                'pharmacy_name' => 'Sağlık Eczanesi',
                'email' => 'demo4@eczanepazari.com',
                'city' => 'Bursa',
                'address' => 'FSM Bulvarı No:156, Nilüfer',
                'phone' => '05347778899',
            ],
            [
                'gln_code' => '8680000000005',
                'pharmacy_name' => 'Güneş Eczanesi',
                'email' => 'demo5@eczanepazari.com',
                'city' => 'Antalya',
                'address' => 'Lara Cad. No:200, Muratpaşa',
                'phone' => '05359991122',
            ],
        ];

        foreach ($demoSellers as $seller) {
            // GLN Whitelist'e ekle
            GlnWhitelist::updateOrCreate(
                ['gln_code' => $seller['gln_code']],
                [
                    'pharmacy_name' => $seller['pharmacy_name'],
                    'city' => $seller['city'],
                    'is_active' => true,
                ]
            );

            // Kullanıcı oluştur (pharmacist role = satıcı)
            User::updateOrCreate(
                ['email' => $seller['email']],
                [
                    'gln_code' => $seller['gln_code'],
                    'pharmacy_name' => $seller['pharmacy_name'],
                    'password' => Hash::make('Demo123!'),
                    'city' => $seller['city'],
                    'address' => $seller['address'],
                    'phone' => $seller['phone'],
                    'role' => 'pharmacist',
                    'email_verified_at' => now(),
                    'is_verified' => true,
                    'verified_at' => now(),
                    'verification_status' => 'approved',
                ]
            );
        }

        $this->command->info('✅ 5 demo satıcı oluşturuldu.');

        // Admin hesabı
        // Admin için de benzersiz bir GLN gerekiyor (NOT NULL constraint)
        GlnWhitelist::updateOrCreate(
            ['gln_code' => '8680000000000'],
            [
                'pharmacy_name' => 'EczanePazarı Admin',
                'city' => 'İstanbul',
                'is_active' => true,
            ]
        );

        User::updateOrCreate(
            ['email' => 'admin@eczanepazari.com'],
            [
                'gln_code' => '8680000000000',
                'pharmacy_name' => 'EczanePazarı Admin',
                'password' => Hash::make('Admin123!'),
                'city' => 'İstanbul',
                'role' => 'super-admin',
                'email_verified_at' => now(),
                'is_verified' => true,
                'verified_at' => now(),
                'verification_status' => 'approved',
            ]
        );

        $this->command->info('✅ Admin hesabı oluşturuldu (admin@eczanepazari.com).');

        // Demo alıcı hesabı (pharmacist role ile)
        GlnWhitelist::updateOrCreate(
            ['gln_code' => '8680000000006'],
            [
                'pharmacy_name' => 'Alıcı Test Eczanesi',
                'city' => 'İstanbul',
                'is_active' => true,
            ]
        );

        User::updateOrCreate(
            ['email' => 'buyer@eczanepazari.com'],
            [
                'gln_code' => '8680000000006',
                'pharmacy_name' => 'Alıcı Test Eczanesi',
                'password' => Hash::make('Demo123!'),
                'city' => 'İstanbul',
                'address' => 'Levent Mah. No:50, Beşiktaş',
                'phone' => '05361112233',
                'role' => 'pharmacist',
                'email_verified_at' => now(),
                'is_verified' => true,
                'verified_at' => now(),
                'verification_status' => 'approved',
            ]
        );

        $this->command->info('✅ Demo alıcı hesabı oluşturuldu (buyer@eczanepazari.com).');
    }
}
