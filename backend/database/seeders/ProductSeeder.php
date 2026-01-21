<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\Category;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $categories = Category::pluck('id', 'slug')->toArray();

        // Vitaminler & Mineraller
        $vitaminler = [
            ['barcode' => '8699546090136', 'name' => 'Centrum A\'dan Çinko\'ya 60 Tablet', 'brand' => 'Centrum', 'manufacturer' => 'GSK'],
            ['barcode' => '8699546090143', 'name' => 'Centrum Silver 50+ 30 Tablet', 'brand' => 'Centrum', 'manufacturer' => 'GSK'],
            ['barcode' => '8699809090011', 'name' => 'Supradyn Energy Plus 30 Tablet', 'brand' => 'Supradyn', 'manufacturer' => 'Bayer'],
            ['barcode' => '8699809090028', 'name' => 'Supradyn All Day 30 Tablet', 'brand' => 'Supradyn', 'manufacturer' => 'Bayer'],
            ['barcode' => '8699809090035', 'name' => 'Redoxon Vitamin C 1000mg 30 Efervesan', 'brand' => 'Redoxon', 'manufacturer' => 'Bayer'],
            ['barcode' => '0033984421011', 'name' => 'Solgar Vitamin C 1000mg 100 Kapsül', 'brand' => 'Solgar', 'manufacturer' => 'Solgar'],
            ['barcode' => '0033984421028', 'name' => 'Solgar Vitamin D3 1000 IU 100 Softgel', 'brand' => 'Solgar', 'manufacturer' => 'Solgar'],
            ['barcode' => '0033984421035', 'name' => 'Solgar Omega-3 Triple Strength 50 Softgel', 'brand' => 'Solgar', 'manufacturer' => 'Solgar'],
            ['barcode' => '8699874080014', 'name' => 'Orzax Ocean Omega 3 150 Kapsül', 'brand' => 'Ocean', 'manufacturer' => 'Orzax'],
            ['barcode' => '8699874080021', 'name' => 'Orzax Ocean Vitamin D3 1000 IU 50ml', 'brand' => 'Ocean', 'manufacturer' => 'Orzax'],
            ['barcode' => '8699874080038', 'name' => 'Orzax Ocean B12 1000mcg 10ml Sprey', 'brand' => 'Ocean', 'manufacturer' => 'Orzax'],
            ['barcode' => '8699536090017', 'name' => 'Elanur Multivitamin 30 Tablet', 'brand' => 'Elanur', 'manufacturer' => 'Nobel'],
            ['barcode' => '8699536090024', 'name' => 'Nutraxin Vitamin C 1000mg 30 Tablet', 'brand' => 'Nutraxin', 'manufacturer' => 'Nobel'],
            ['barcode' => '8699536090031', 'name' => 'Nutraxin D-Mannose 1200mg 60 Tablet', 'brand' => 'Nutraxin', 'manufacturer' => 'Nobel'],
            ['barcode' => '8699536090048', 'name' => 'Nutraxin Magnezyum Complex 60 Tablet', 'brand' => 'Nutraxin', 'manufacturer' => 'Nobel'],
            ['barcode' => '8690539090015', 'name' => 'Sambucol Black Elderberry 120ml Şurup', 'brand' => 'Sambucol', 'manufacturer' => 'PharmAbant'],
            ['barcode' => '8690539090022', 'name' => 'Nature\'s Bounty Vitamin E 400 IU 30 Softgel', 'brand' => 'Nature\'s Bounty', 'manufacturer' => 'Nestle'],
            ['barcode' => '8690539090039', 'name' => 'Nature\'s Bounty B Complex 60 Tablet', 'brand' => 'Nature\'s Bounty', 'manufacturer' => 'Nestle'],
            ['barcode' => '8690539090046', 'name' => 'Nature\'s Bounty Zinc 50mg 100 Caplet', 'brand' => 'Nature\'s Bounty', 'manufacturer' => 'Nestle'],
            ['barcode' => '8690539090053', 'name' => 'GNC Mega Men 90 Tablet', 'brand' => 'GNC', 'manufacturer' => 'GNC'],
            ['barcode' => '8690539090060', 'name' => 'GNC Women\'s Ultra Mega 90 Tablet', 'brand' => 'GNC', 'manufacturer' => 'GNC'],
            ['barcode' => '8699548090017', 'name' => 'Pharmanord Bio-Quinon Q10 30mg 60 Kapsül', 'brand' => 'Pharmanord', 'manufacturer' => 'Pharmanord'],
            ['barcode' => '8699548090024', 'name' => 'NOW Foods Vitamin K2 100mcg 100 Kapsül', 'brand' => 'NOW Foods', 'manufacturer' => 'NOW'],
            ['barcode' => '8699548090031', 'name' => 'NOW Foods Magnesium Citrate 200mg 100 Tablet', 'brand' => 'NOW Foods', 'manufacturer' => 'NOW'],
            ['barcode' => '8699548090048', 'name' => 'NOW Foods Iron 18mg 120 Kapsül', 'brand' => 'NOW Foods', 'manufacturer' => 'NOW'],
            ['barcode' => '8699548090055', 'name' => 'Garden of Life Vitamin Code Men 120 Kapsül', 'brand' => 'Garden of Life', 'manufacturer' => 'Nestle'],
            ['barcode' => '8699548090062', 'name' => 'Garden of Life Probiyotik 30 Milyar 30 Kapsül', 'brand' => 'Garden of Life', 'manufacturer' => 'Nestle'],
            ['barcode' => '8699548090079', 'name' => 'Nordic Naturals Ultimate Omega 60 Softgel', 'brand' => 'Nordic Naturals', 'manufacturer' => 'Nordic Naturals'],
            ['barcode' => '8699548090086', 'name' => 'Nordic Naturals Omega-3 Pet 90 Softgel', 'brand' => 'Nordic Naturals', 'manufacturer' => 'Nordic Naturals'],
            ['barcode' => '8699548090093', 'name' => 'Life Extension Super K 90 Softgel', 'brand' => 'Life Extension', 'manufacturer' => 'Life Extension'],
        ];

        // Ağrı Kesiciler
        $agriKesiciler = [
            ['barcode' => '8699502090011', 'name' => 'Majezik 100mg 30 Film Tablet', 'brand' => 'Majezik', 'manufacturer' => 'Sanofi'],
            ['barcode' => '8699502090028', 'name' => 'Majezik Duo 200mg 10 Saşe', 'brand' => 'Majezik', 'manufacturer' => 'Sanofi'],
            ['barcode' => '8699502090035', 'name' => 'Apranax Fort 550mg 20 Tablet', 'brand' => 'Apranax', 'manufacturer' => 'Abdi İbrahim'],
            ['barcode' => '8699502090042', 'name' => 'Apranax Plus 275mg 20 Tablet', 'brand' => 'Apranax', 'manufacturer' => 'Abdi İbrahim'],
            ['barcode' => '8699502090059', 'name' => 'Arveles 25mg 20 Film Tablet', 'brand' => 'Arveles', 'manufacturer' => 'Ufsa'],
            ['barcode' => '8699502090066', 'name' => 'Dikloron 75mg/3ml 5 Ampul', 'brand' => 'Dikloron', 'manufacturer' => 'Deva'],
            ['barcode' => '8699502090073', 'name' => 'Voltaren 100mg 10 Tablet', 'brand' => 'Voltaren', 'manufacturer' => 'Novartis'],
            ['barcode' => '8699502090080', 'name' => 'Voltaren Emulgel 50g Jel', 'brand' => 'Voltaren', 'manufacturer' => 'Novartis'],
            ['barcode' => '8699502090097', 'name' => 'Nurofen 400mg 20 Tablet', 'brand' => 'Nurofen', 'manufacturer' => 'Reckitt'],
            ['barcode' => '8699502090104', 'name' => 'Nurofen Express 400mg 10 Kapsül', 'brand' => 'Nurofen', 'manufacturer' => 'Reckitt'],
            ['barcode' => '8699502090111', 'name' => 'Dolven 400mg 20 Süspansiyon', 'brand' => 'Dolven', 'manufacturer' => 'Sanofi'],
            ['barcode' => '8699502090128', 'name' => 'Parol 500mg 20 Tablet', 'brand' => 'Parol', 'manufacturer' => 'Atabay'],
            ['barcode' => '8699502090135', 'name' => 'Tylol 500mg 20 Tablet', 'brand' => 'Tylol', 'manufacturer' => 'Nobel'],
            ['barcode' => '8699502090142', 'name' => 'Minoset Plus 500mg 20 Tablet', 'brand' => 'Minoset', 'manufacturer' => 'Zentiva'],
            ['barcode' => '8699502090159', 'name' => 'Geralgine-K 500mg 30 Tablet', 'brand' => 'Geralgine', 'manufacturer' => 'Deva'],
            ['barcode' => '8699502090166', 'name' => 'Aspirin 500mg 20 Tablet', 'brand' => 'Aspirin', 'manufacturer' => 'Bayer'],
            ['barcode' => '8699502090173', 'name' => 'Aspirin Cardio 100mg 28 Tablet', 'brand' => 'Aspirin', 'manufacturer' => 'Bayer'],
            ['barcode' => '8699502090180', 'name' => 'Dolorex 400mg 20 Kapsül', 'brand' => 'Dolorex', 'manufacturer' => 'Biofarma'],
            ['barcode' => '8699502090197', 'name' => 'Etol Fort 400mg 14 Tablet', 'brand' => 'Etol', 'manufacturer' => 'Nobel'],
            ['barcode' => '8699502090204', 'name' => 'Etoricoxib 90mg 14 Tablet', 'brand' => 'Arcoxia', 'manufacturer' => 'MSD'],
            ['barcode' => '8699502090211', 'name' => 'Celebrex 200mg 30 Kapsül', 'brand' => 'Celebrex', 'manufacturer' => 'Pfizer'],
            ['barcode' => '8699502090228', 'name' => 'Tilcotil 20mg 10 Tablet', 'brand' => 'Tilcotil', 'manufacturer' => 'Roche'],
            ['barcode' => '8699502090235', 'name' => 'Naprosyn 500mg 20 Tablet', 'brand' => 'Naprosyn', 'manufacturer' => 'Abdi İbrahim'],
            ['barcode' => '8699502090242', 'name' => 'Brufen 400mg 20 Draje', 'brand' => 'Brufen', 'manufacturer' => 'Abbott'],
            ['barcode' => '8699502090259', 'name' => 'Piroflam 20mg 20 Kapsül', 'brand' => 'Piroflam', 'manufacturer' => 'Deva'],
        ];

        // Antibiyotikler
        $antibiyotikler = [
            ['barcode' => '8699503090010', 'name' => 'Augmentin BID 1000mg 14 Tablet', 'brand' => 'Augmentin', 'manufacturer' => 'GSK'],
            ['barcode' => '8699503090027', 'name' => 'Augmentin BID 625mg 14 Tablet', 'brand' => 'Augmentin', 'manufacturer' => 'GSK'],
            ['barcode' => '8699503090034', 'name' => 'Klavunat BID 1000mg 14 Tablet', 'brand' => 'Klavunat', 'manufacturer' => 'Deva'],
            ['barcode' => '8699503090041', 'name' => 'Amoklavin BID 1000mg 14 Tablet', 'brand' => 'Amoklavin', 'manufacturer' => 'Deva'],
            ['barcode' => '8699503090058', 'name' => 'Largopen 1000mg 16 Tablet', 'brand' => 'Largopen', 'manufacturer' => 'Bilim'],
            ['barcode' => '8699503090065', 'name' => 'Cipro 500mg 14 Tablet', 'brand' => 'Cipro', 'manufacturer' => 'Bayer'],
            ['barcode' => '8699503090072', 'name' => 'Ciflosin 500mg 14 Tablet', 'brand' => 'Ciflosin', 'manufacturer' => 'Deva'],
            ['barcode' => '8699503090089', 'name' => 'Resprim Fort 960mg 20 Tablet', 'brand' => 'Resprim', 'manufacturer' => 'Sanofi'],
            ['barcode' => '8699503090096', 'name' => 'Bactrim Fort 800/160mg 20 Tablet', 'brand' => 'Bactrim', 'manufacturer' => 'Roche'],
            ['barcode' => '8699503090103', 'name' => 'Klacid 500mg 14 Tablet', 'brand' => 'Klacid', 'manufacturer' => 'Abbott'],
            ['barcode' => '8699503090110', 'name' => 'Klaritr 500mg 14 Tablet', 'brand' => 'Klaritr', 'manufacturer' => 'Bilim'],
            ['barcode' => '8699503090127', 'name' => 'Zithromax 500mg 3 Tablet', 'brand' => 'Zithromax', 'manufacturer' => 'Pfizer'],
            ['barcode' => '8699503090134', 'name' => 'Azitro 500mg 3 Tablet', 'brand' => 'Azitro', 'manufacturer' => 'Deva'],
            ['barcode' => '8699503090141', 'name' => 'Azomax 500mg 3 Tablet', 'brand' => 'Azomax', 'manufacturer' => 'Eczacıbaşı'],
            ['barcode' => '8699503090158', 'name' => 'Cefaks 500mg 10 Tablet', 'brand' => 'Cefaks', 'manufacturer' => 'Abdi İbrahim'],
            ['barcode' => '8699503090165', 'name' => 'Duricef 500mg 20 Kapsül', 'brand' => 'Duricef', 'manufacturer' => 'Bilim'],
            ['barcode' => '8699503090172', 'name' => 'Zinnat 500mg 10 Tablet', 'brand' => 'Zinnat', 'manufacturer' => 'GSK'],
            ['barcode' => '8699503090189', 'name' => 'Cefurol 500mg 10 Tablet', 'brand' => 'Cefurol', 'manufacturer' => 'Nobel'],
            ['barcode' => '8699503090196', 'name' => 'Suprax 400mg 5 Kapsül', 'brand' => 'Suprax', 'manufacturer' => 'Sanofi'],
            ['barcode' => '8699503090203', 'name' => 'Amoxil 500mg 16 Kapsül', 'brand' => 'Amoxil', 'manufacturer' => 'GSK'],
            ['barcode' => '8699503090210', 'name' => 'Alfoxil 500mg 16 Kapsül', 'brand' => 'Alfoxil', 'manufacturer' => 'Actavis'],
            ['barcode' => '8699503090227', 'name' => 'Doksicilin 100mg 14 Kapsül', 'brand' => 'Doksicilin', 'manufacturer' => 'Koçak'],
            ['barcode' => '8699503090234', 'name' => 'Tetradox 100mg 10 Tablet', 'brand' => 'Tetradox', 'manufacturer' => 'Biofarma'],
            ['barcode' => '8699503090241', 'name' => 'Ornidazol 500mg 10 Tablet', 'brand' => 'Ornidazol', 'manufacturer' => 'Deva'],
            ['barcode' => '8699503090258', 'name' => 'Metronidazol 500mg 20 Tablet', 'brand' => 'Flagyl', 'manufacturer' => 'Sanofi'],
        ];

        // Sindirim Sistemi
        $sindirim = [
            ['barcode' => '8699504090019', 'name' => 'Nexium 40mg 28 Tablet', 'brand' => 'Nexium', 'manufacturer' => 'AstraZeneca'],
            ['barcode' => '8699504090026', 'name' => 'Nexium 20mg 28 Tablet', 'brand' => 'Nexium', 'manufacturer' => 'AstraZeneca'],
            ['barcode' => '8699504090033', 'name' => 'Lansor 30mg 28 Kapsül', 'brand' => 'Lansor', 'manufacturer' => 'Sanofi'],
            ['barcode' => '8699504090040', 'name' => 'Lansoprol 30mg 28 Kapsül', 'brand' => 'Lansoprol', 'manufacturer' => 'Bilim'],
            ['barcode' => '8699504090057', 'name' => 'Pantpas 40mg 28 Tablet', 'brand' => 'Pantpas', 'manufacturer' => 'Abdi İbrahim'],
            ['barcode' => '8699504090064', 'name' => 'Controloc 40mg 28 Tablet', 'brand' => 'Controloc', 'manufacturer' => 'Takeda'],
            ['barcode' => '8699504090071', 'name' => 'Losec 20mg 14 Kapsül', 'brand' => 'Losec', 'manufacturer' => 'AstraZeneca'],
            ['barcode' => '8699504090088', 'name' => 'Omeprazol 20mg 14 Kapsül', 'brand' => 'Omeprazol', 'manufacturer' => 'Deva'],
            ['barcode' => '8699504090095', 'name' => 'Gaviscon 200ml Süspansiyon', 'brand' => 'Gaviscon', 'manufacturer' => 'Reckitt'],
            ['barcode' => '8699504090102', 'name' => 'Rennie 48 Çiğneme Tableti', 'brand' => 'Rennie', 'manufacturer' => 'Bayer'],
            ['barcode' => '8699504090119', 'name' => 'Talcid 500mg 20 Tablet', 'brand' => 'Talcid', 'manufacturer' => 'Bayer'],
            ['barcode' => '8699504090126', 'name' => 'Maalox Plus 40 Tablet', 'brand' => 'Maalox', 'manufacturer' => 'Sanofi'],
            ['barcode' => '8699504090133', 'name' => 'Buscopan 10mg 20 Draje', 'brand' => 'Buscopan', 'manufacturer' => 'Sanofi'],
            ['barcode' => '8699504090140', 'name' => 'Buscopan Plus 20 Tablet', 'brand' => 'Buscopan', 'manufacturer' => 'Sanofi'],
            ['barcode' => '8699504090157', 'name' => 'Primperan 10mg 30 Tablet', 'brand' => 'Primperan', 'manufacturer' => 'Sanofi'],
            ['barcode' => '8699504090164', 'name' => 'Motilium 10mg 30 Tablet', 'brand' => 'Motilium', 'manufacturer' => 'Janssen'],
            ['barcode' => '8699504090171', 'name' => 'Duphalac 300ml Şurup', 'brand' => 'Duphalac', 'manufacturer' => 'Abbott'],
            ['barcode' => '8699504090188', 'name' => 'Laxoberon 15ml Damla', 'brand' => 'Laxoberon', 'manufacturer' => 'Sanofi'],
            ['barcode' => '8699504090195', 'name' => 'Imodium 2mg 20 Kapsül', 'brand' => 'Imodium', 'manufacturer' => 'Janssen'],
            ['barcode' => '8699504090202', 'name' => 'Reflor 250mg 10 Saşe', 'brand' => 'Reflor', 'manufacturer' => 'Sanofi'],
        ];

        // Solunum Sistemi
        $solunum = [
            ['barcode' => '8699505090018', 'name' => 'Sudafed 60mg 20 Tablet', 'brand' => 'Sudafed', 'manufacturer' => 'Johnson & Johnson'],
            ['barcode' => '8699505090025', 'name' => 'Tylol Hot 500mg 12 Saşe', 'brand' => 'Tylol', 'manufacturer' => 'Nobel'],
            ['barcode' => '8699505090032', 'name' => 'Gripin 20 Tablet', 'brand' => 'Gripin', 'manufacturer' => 'Abdi İbrahim'],
            ['barcode' => '8699505090049', 'name' => 'Theraflu Forte 10 Saşe', 'brand' => 'Theraflu', 'manufacturer' => 'GSK'],
            ['barcode' => '8699505090056', 'name' => 'Peditus 100ml Şurup', 'brand' => 'Peditus', 'manufacturer' => 'Abdi İbrahim'],
            ['barcode' => '8699505090063', 'name' => 'Prospan 100ml Şurup', 'brand' => 'Prospan', 'manufacturer' => 'Engelhard'],
            ['barcode' => '8699505090070', 'name' => 'Mucosolvan 100ml Şurup', 'brand' => 'Mucosolvan', 'manufacturer' => 'Sanofi'],
            ['barcode' => '8699505090087', 'name' => 'Asist 600mg 20 Efervesan', 'brand' => 'Asist', 'manufacturer' => 'Hüsnü Arsan'],
            ['barcode' => '8699505090094', 'name' => 'ACC 600mg 20 Efervesan', 'brand' => 'ACC', 'manufacturer' => 'Sandoz'],
            ['barcode' => '8699505090101', 'name' => 'Fluimucil 600mg 20 Efervesan', 'brand' => 'Fluimucil', 'manufacturer' => 'Zambon'],
            ['barcode' => '8699505090118', 'name' => 'Ventolin Evohaler 100mcg 200 Doz', 'brand' => 'Ventolin', 'manufacturer' => 'GSK'],
            ['barcode' => '8699505090125', 'name' => 'Seretide 250/50 60 Doz', 'brand' => 'Seretide', 'manufacturer' => 'GSK'],
            ['barcode' => '8699505090132', 'name' => 'Symbicort 160/4.5 120 Doz', 'brand' => 'Symbicort', 'manufacturer' => 'AstraZeneca'],
            ['barcode' => '8699505090149', 'name' => 'Flixotide 250mcg 60 Doz', 'brand' => 'Flixotide', 'manufacturer' => 'GSK'],
            ['barcode' => '8699505090156', 'name' => 'Budesonide 200mcg 200 Doz', 'brand' => 'Pulmicort', 'manufacturer' => 'AstraZeneca'],
            ['barcode' => '8699505090163', 'name' => 'Strepsils 24 Pastil', 'brand' => 'Strepsils', 'manufacturer' => 'Reckitt'],
            ['barcode' => '8699505090170', 'name' => 'Tantum Verde 30 Pastil', 'brand' => 'Tantum Verde', 'manufacturer' => 'Angelini'],
            ['barcode' => '8699505090187', 'name' => 'Orofar 20 Pastil', 'brand' => 'Orofar', 'manufacturer' => 'Novartis'],
            ['barcode' => '8699505090194', 'name' => 'Hexoral 200ml Gargara', 'brand' => 'Hexoral', 'manufacturer' => 'Johnson & Johnson'],
            ['barcode' => '8699505090201', 'name' => 'Iliadin Burun Spreyi 10ml', 'brand' => 'Iliadin', 'manufacturer' => 'Merck'],
        ];

        // Kardiyovasküler
        $kardiyovaskuler = [
            ['barcode' => '8699506090017', 'name' => 'Beloc Zok 50mg 20 Tablet', 'brand' => 'Beloc', 'manufacturer' => 'AstraZeneca'],
            ['barcode' => '8699506090024', 'name' => 'Beloc Zok 100mg 20 Tablet', 'brand' => 'Beloc', 'manufacturer' => 'AstraZeneca'],
            ['barcode' => '8699506090031', 'name' => 'Concor 5mg 30 Tablet', 'brand' => 'Concor', 'manufacturer' => 'Merck'],
            ['barcode' => '8699506090048', 'name' => 'Dilatrend 25mg 28 Tablet', 'brand' => 'Dilatrend', 'manufacturer' => 'Roche'],
            ['barcode' => '8699506090055', 'name' => 'Norvasc 5mg 30 Tablet', 'brand' => 'Norvasc', 'manufacturer' => 'Pfizer'],
            ['barcode' => '8699506090062', 'name' => 'Norvasc 10mg 30 Tablet', 'brand' => 'Norvasc', 'manufacturer' => 'Pfizer'],
            ['barcode' => '8699506090079', 'name' => 'Enapril 10mg 20 Tablet', 'brand' => 'Enapril', 'manufacturer' => 'Abdi İbrahim'],
            ['barcode' => '8699506090086', 'name' => 'Cozaar 50mg 28 Tablet', 'brand' => 'Cozaar', 'manufacturer' => 'MSD'],
            ['barcode' => '8699506090093', 'name' => 'Diovan 160mg 28 Tablet', 'brand' => 'Diovan', 'manufacturer' => 'Novartis'],
            ['barcode' => '8699506090100', 'name' => 'Atacand 16mg 28 Tablet', 'brand' => 'Atacand', 'manufacturer' => 'AstraZeneca'],
            ['barcode' => '8699506090117', 'name' => 'Zyllt 75mg 28 Tablet', 'brand' => 'Zyllt', 'manufacturer' => 'Krka'],
            ['barcode' => '8699506090124', 'name' => 'Plavix 75mg 28 Tablet', 'brand' => 'Plavix', 'manufacturer' => 'Sanofi'],
            ['barcode' => '8699506090131', 'name' => 'Coumadin 5mg 28 Tablet', 'brand' => 'Coumadin', 'manufacturer' => 'Bristol-Myers'],
            ['barcode' => '8699506090148', 'name' => 'Crestor 10mg 28 Tablet', 'brand' => 'Crestor', 'manufacturer' => 'AstraZeneca'],
            ['barcode' => '8699506090155', 'name' => 'Lipitor 20mg 30 Tablet', 'brand' => 'Lipitor', 'manufacturer' => 'Pfizer'],
            ['barcode' => '8699506090162', 'name' => 'Ezetrol 10mg 28 Tablet', 'brand' => 'Ezetrol', 'manufacturer' => 'MSD'],
            ['barcode' => '8699506090179', 'name' => 'Lasix 40mg 12 Tablet', 'brand' => 'Lasix', 'manufacturer' => 'Sanofi'],
            ['barcode' => '8699506090186', 'name' => 'Aldactone 25mg 20 Tablet', 'brand' => 'Aldactone', 'manufacturer' => 'Pfizer'],
            ['barcode' => '8699506090193', 'name' => 'Lanoxin 0.25mg 50 Tablet', 'brand' => 'Lanoxin', 'manufacturer' => 'Aspen'],
            ['barcode' => '8699506090200', 'name' => 'Isoptin 80mg 50 Draje', 'brand' => 'Isoptin', 'manufacturer' => 'Abbott'],
        ];

        // Diyabet İlaçları
        $diyabet = [
            ['barcode' => '8699507090016', 'name' => 'Glucophage 1000mg 100 Tablet', 'brand' => 'Glucophage', 'manufacturer' => 'Merck'],
            ['barcode' => '8699507090023', 'name' => 'Glucophage XR 500mg 30 Tablet', 'brand' => 'Glucophage', 'manufacturer' => 'Merck'],
            ['barcode' => '8699507090030', 'name' => 'Glifor 1000mg 100 Tablet', 'brand' => 'Glifor', 'manufacturer' => 'Bilim'],
            ['barcode' => '8699507090047', 'name' => 'Metformin 850mg 100 Tablet', 'brand' => 'Metformin', 'manufacturer' => 'Deva'],
            ['barcode' => '8699507090054', 'name' => 'Januvia 100mg 28 Tablet', 'brand' => 'Januvia', 'manufacturer' => 'MSD'],
            ['barcode' => '8699507090061', 'name' => 'Galvus 50mg 28 Tablet', 'brand' => 'Galvus', 'manufacturer' => 'Novartis'],
            ['barcode' => '8699507090078', 'name' => 'Trajenta 5mg 30 Tablet', 'brand' => 'Trajenta', 'manufacturer' => 'Boehringer'],
            ['barcode' => '8699507090085', 'name' => 'Amaryl 4mg 30 Tablet', 'brand' => 'Amaryl', 'manufacturer' => 'Sanofi'],
            ['barcode' => '8699507090092', 'name' => 'Diamicron MR 60mg 30 Tablet', 'brand' => 'Diamicron', 'manufacturer' => 'Servier'],
            ['barcode' => '8699507090109', 'name' => 'Victoza 6mg/ml Kalem', 'brand' => 'Victoza', 'manufacturer' => 'Novo Nordisk'],
            ['barcode' => '8699507090116', 'name' => 'Ozempic 1mg Kalem', 'brand' => 'Ozempic', 'manufacturer' => 'Novo Nordisk'],
            ['barcode' => '8699507090123', 'name' => 'Trulicity 1.5mg Kalem', 'brand' => 'Trulicity', 'manufacturer' => 'Eli Lilly'],
            ['barcode' => '8699507090130', 'name' => 'Jardiance 25mg 30 Tablet', 'brand' => 'Jardiance', 'manufacturer' => 'Boehringer'],
            ['barcode' => '8699507090147', 'name' => 'Forxiga 10mg 28 Tablet', 'brand' => 'Forxiga', 'manufacturer' => 'AstraZeneca'],
            ['barcode' => '8699507090154', 'name' => 'Invokana 300mg 30 Tablet', 'brand' => 'Invokana', 'manufacturer' => 'Janssen'],
            ['barcode' => '8699507090161', 'name' => 'NovoRapid FlexPen 5x3ml', 'brand' => 'NovoRapid', 'manufacturer' => 'Novo Nordisk'],
            ['barcode' => '8699507090178', 'name' => 'Lantus SoloStar 5x3ml', 'brand' => 'Lantus', 'manufacturer' => 'Sanofi'],
            ['barcode' => '8699507090185', 'name' => 'Humalog KwikPen 5x3ml', 'brand' => 'Humalog', 'manufacturer' => 'Eli Lilly'],
            ['barcode' => '8699507090192', 'name' => 'Accu-Chek Guide 50 Strip', 'brand' => 'Accu-Chek', 'manufacturer' => 'Roche'],
            ['barcode' => '8699507090209', 'name' => 'Freestyle Libre Sensör', 'brand' => 'Freestyle', 'manufacturer' => 'Abbott'],
        ];

        // Dermatoloji
        $dermatoloji = [
            ['barcode' => '8699508090015', 'name' => 'Bepanthol Cilt Bakım Kremi 100g', 'brand' => 'Bepanthol', 'manufacturer' => 'Bayer'],
            ['barcode' => '8699508090022', 'name' => 'Bepanthol Sensiderm 50g', 'brand' => 'Bepanthol', 'manufacturer' => 'Bayer'],
            ['barcode' => '8699508090039', 'name' => 'Advantan Krem 15g', 'brand' => 'Advantan', 'manufacturer' => 'Bayer'],
            ['barcode' => '8699508090046', 'name' => 'Fucidin Krem 15g', 'brand' => 'Fucidin', 'manufacturer' => 'Leo Pharma'],
            ['barcode' => '8699508090053', 'name' => 'Triderm Krem 15g', 'brand' => 'Triderm', 'manufacturer' => 'MSD'],
            ['barcode' => '8699508090060', 'name' => 'Elocon Krem 15g', 'brand' => 'Elocon', 'manufacturer' => 'MSD'],
            ['barcode' => '8699508090077', 'name' => 'Psorifix Krem 40g', 'brand' => 'Psorifix', 'manufacturer' => 'Bilim'],
            ['barcode' => '8699508090084', 'name' => 'Daivobet Merhem 30g', 'brand' => 'Daivobet', 'manufacturer' => 'Leo Pharma'],
            ['barcode' => '8699508090091', 'name' => 'Protopic 0.1% 30g', 'brand' => 'Protopic', 'manufacturer' => 'Astellas'],
            ['barcode' => '8699508090108', 'name' => 'Elidel Krem 30g', 'brand' => 'Elidel', 'manufacturer' => 'Meda'],
            ['barcode' => '8699508090115', 'name' => 'Locoid Lipocream 30g', 'brand' => 'Locoid', 'manufacturer' => 'Astellas'],
            ['barcode' => '8699508090122', 'name' => 'Lamisil Krem 15g', 'brand' => 'Lamisil', 'manufacturer' => 'Novartis'],
            ['barcode' => '8699508090139', 'name' => 'Canesten Krem 20g', 'brand' => 'Canesten', 'manufacturer' => 'Bayer'],
            ['barcode' => '8699508090146', 'name' => 'Travocort Krem 15g', 'brand' => 'Travocort', 'manufacturer' => 'Bayer'],
            ['barcode' => '8699508090153', 'name' => 'Zovirax Krem 5g', 'brand' => 'Zovirax', 'manufacturer' => 'GSK'],
            ['barcode' => '8699508090160', 'name' => 'Dermatix Ultra Jel 15g', 'brand' => 'Dermatix', 'manufacturer' => 'Menarini'],
            ['barcode' => '8699508090177', 'name' => 'Contractubex Jel 20g', 'brand' => 'Contractubex', 'manufacturer' => 'Merz'],
            ['barcode' => '8699508090184', 'name' => 'Bepanthen Plus Krem 30g', 'brand' => 'Bepanthen', 'manufacturer' => 'Bayer'],
            ['barcode' => '8699508090191', 'name' => 'Sudocrem 125g', 'brand' => 'Sudocrem', 'manufacturer' => 'Teva'],
            ['barcode' => '8699508090208', 'name' => 'Eucerin AtopiControl 400ml', 'brand' => 'Eucerin', 'manufacturer' => 'Beiersdorf'],
        ];

        // Bebek & Çocuk
        $bebekCocuk = [
            ['barcode' => '8699509090014', 'name' => 'Calpol 120mg/5ml 150ml Şurup', 'brand' => 'Calpol', 'manufacturer' => 'GSK'],
            ['barcode' => '8699509090021', 'name' => 'Nurofen Junior 100mg/5ml 150ml', 'brand' => 'Nurofen', 'manufacturer' => 'Reckitt'],
            ['barcode' => '8699509090038', 'name' => 'Peditus 100ml Şurup', 'brand' => 'Peditus', 'manufacturer' => 'Abdi İbrahim'],
            ['barcode' => '8699509090045', 'name' => 'Sinecod 100ml Şurup', 'brand' => 'Sinecod', 'manufacturer' => 'Novartis'],
            ['barcode' => '8699509090052', 'name' => 'Baby Drops D3 400 IU 15ml', 'brand' => 'Baby Drops', 'manufacturer' => 'Orzax'],
            ['barcode' => '8699509090069', 'name' => 'Ferrosanol B 30ml Damla', 'brand' => 'Ferrosanol', 'manufacturer' => 'Sanofi'],
            ['barcode' => '8699509090076', 'name' => 'Bio-Gaia Damla 5ml', 'brand' => 'Bio-Gaia', 'manufacturer' => 'BioGaia'],
            ['barcode' => '8699509090083', 'name' => 'Culturelle Kids 30 Paket', 'brand' => 'Culturelle', 'manufacturer' => 'DSM'],
            ['barcode' => '8699509090090', 'name' => 'Nan Pro 1 400g', 'brand' => 'Nan', 'manufacturer' => 'Nestle'],
            ['barcode' => '8699509090107', 'name' => 'Aptamil 1 400g', 'brand' => 'Aptamil', 'manufacturer' => 'Nutricia'],
            ['barcode' => '8699509090114', 'name' => 'Bebelac 1 400g', 'brand' => 'Bebelac', 'manufacturer' => 'Nutricia'],
            ['barcode' => '8699509090121', 'name' => 'Hipp Organik Mama 250g', 'brand' => 'Hipp', 'manufacturer' => 'Hipp'],
            ['barcode' => '8699509090138', 'name' => 'Bebevit D3 15ml Damla', 'brand' => 'Bebevit', 'manufacturer' => 'Berko'],
            ['barcode' => '8699509090145', 'name' => 'Infacol 50ml Damla', 'brand' => 'Infacol', 'manufacturer' => 'Forest'],
            ['barcode' => '8699509090152', 'name' => 'Sudocrem 60g', 'brand' => 'Sudocrem', 'manufacturer' => 'Teva'],
            ['barcode' => '8699509090169', 'name' => 'Bepanthen Bebek Pişik Kremi 30g', 'brand' => 'Bepanthen', 'manufacturer' => 'Bayer'],
            ['barcode' => '8699509090176', 'name' => 'A-Derma Exomega Control 200ml', 'brand' => 'A-Derma', 'manufacturer' => 'Pierre Fabre'],
            ['barcode' => '8699509090183', 'name' => 'Mustela Bebe Şampuan 500ml', 'brand' => 'Mustela', 'manufacturer' => 'Expanscience'],
            ['barcode' => '8699509090190', 'name' => 'Johnson\'s Baby Şampuan 500ml', 'brand' => 'Johnson\'s', 'manufacturer' => 'Johnson & Johnson'],
            ['barcode' => '8699509090207', 'name' => 'Chicco Biberon 250ml', 'brand' => 'Chicco', 'manufacturer' => 'Artsana'],
        ];

        // Kozmetik & Kişisel Bakım
        $kozmetik = [
            ['barcode' => '8699510090013', 'name' => 'La Roche-Posay Effaclar Duo+ 40ml', 'brand' => 'La Roche-Posay', 'manufacturer' => 'L\'Oreal'],
            ['barcode' => '8699510090020', 'name' => 'Vichy Mineral 89 30ml', 'brand' => 'Vichy', 'manufacturer' => 'L\'Oreal'],
            ['barcode' => '8699510090037', 'name' => 'Avene Cicalfate+ 40ml', 'brand' => 'Avene', 'manufacturer' => 'Pierre Fabre'],
            ['barcode' => '8699510090044', 'name' => 'Bioderma Sensibio H2O 500ml', 'brand' => 'Bioderma', 'manufacturer' => 'NAOS'],
            ['barcode' => '8699510090051', 'name' => 'CeraVe Nemlendirici Losyon 236ml', 'brand' => 'CeraVe', 'manufacturer' => 'L\'Oreal'],
            ['barcode' => '8699510090068', 'name' => 'Eucerin DermoPurifyer 50ml', 'brand' => 'Eucerin', 'manufacturer' => 'Beiersdorf'],
            ['barcode' => '8699510090075', 'name' => 'Sebamed Temizleme Köpüğü 150ml', 'brand' => 'Sebamed', 'manufacturer' => 'Sebapharma'],
            ['barcode' => '8699510090082', 'name' => 'Neutrogena Hydro Boost 50ml', 'brand' => 'Neutrogena', 'manufacturer' => 'Johnson & Johnson'],
            ['barcode' => '8699510090099', 'name' => 'Isdin Fotoprotector 50ml SPF50', 'brand' => 'Isdin', 'manufacturer' => 'Isdin'],
            ['barcode' => '8699510090106', 'name' => 'Solgar Kolajen Hyaluronik Asit 30 Tablet', 'brand' => 'Solgar', 'manufacturer' => 'Solgar'],
            ['barcode' => '8699510090113', 'name' => 'Uriage Eau Thermale 300ml', 'brand' => 'Uriage', 'manufacturer' => 'Uriage'],
            ['barcode' => '8699510090120', 'name' => 'SVR Sebiaclear 40ml', 'brand' => 'SVR', 'manufacturer' => 'SVR'],
            ['barcode' => '8699510090137', 'name' => 'Nuxe Huile Prodigieuse 100ml', 'brand' => 'Nuxe', 'manufacturer' => 'Nuxe'],
            ['barcode' => '8699510090144', 'name' => 'Pharmaceris T Sebo-Almond 50ml', 'brand' => 'Pharmaceris', 'manufacturer' => 'Dr Irena Eris'],
            ['barcode' => '8699510090151', 'name' => 'ACM Novophane Şampuan 200ml', 'brand' => 'ACM', 'manufacturer' => 'ACM'],
            ['barcode' => '8699510090168', 'name' => 'Ducray Anaphase+ Şampuan 200ml', 'brand' => 'Ducray', 'manufacturer' => 'Pierre Fabre'],
            ['barcode' => '8699510090175', 'name' => 'Biotin Fort 5000mcg 60 Tablet', 'brand' => 'Solgar', 'manufacturer' => 'Solgar'],
            ['barcode' => '8699510090182', 'name' => 'Collagen Peptides 500mg 90 Kapsül', 'brand' => 'NOW Foods', 'manufacturer' => 'NOW'],
            ['barcode' => '8699510090199', 'name' => 'E45 Cream 350g', 'brand' => 'E45', 'manufacturer' => 'Reckitt'],
            ['barcode' => '8699510090206', 'name' => 'Cetaphil Temizleyici 236ml', 'brand' => 'Cetaphil', 'manufacturer' => 'Galderma'],
        ];

        // Ürünleri oluştur
        $allProducts = [
            'vitaminler' => $vitaminler,
            'agri-kesiciler' => $agriKesiciler,
            'antibiyotikler' => $antibiyotikler,
            'sindirim-sistemi' => $sindirim,
            'solunum-sistemi' => $solunum,
            'kardiyovaskuler' => $kardiyovaskuler,
            'diyabet' => $diyabet,
            'dermatoloji' => $dermatoloji,
            'bebek-cocuk' => $bebekCocuk,
            'kozmetik' => $kozmetik,
        ];

        $count = 0;
        foreach ($allProducts as $categorySlug => $products) {
            $categoryId = $categories[$categorySlug] ?? null;
            if (!$categoryId)
                continue;

            foreach ($products as $product) {
                Product::updateOrCreate(
                    ['barcode' => $product['barcode']],
                    [
                        'name' => $product['name'],
                        'brand' => $product['brand'],
                        'manufacturer' => $product['manufacturer'],
                        'category_id' => $categoryId,
                        'is_active' => true,
                        'approval_status' => 'approved',
                    ]
                );
                $count++;
            }
        }

        $this->command->info("✅ {$count} ürün oluşturuldu.");
    }
}
