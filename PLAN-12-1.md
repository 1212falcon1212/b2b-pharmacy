# Phase 12.1: Seed Data & Demo Accounts
# Rol: Full-Stack Developer

## Hedef
Gerçekçi ilaç veritabanı, GLN yapısına uygun demo eczane satıcıları ve örnek siparişler ile sistemi doldurmak.

## 1. Demo Kullanıcılar (GLN Yapısı ile)

### A. GLN Whitelist Eklemeleri
```
GLN: 8680000000001 → Demo Eczane 1 (İstanbul)
GLN: 8680000000002 → Merkez Eczanesi (Ankara)
GLN: 8680000000003 → Hayat Eczanesi (İzmir)
GLN: 8680000000004 → Sağlık Eczanesi (Bursa)
GLN: 8680000000005 → Güneş Eczanesi (Antalya)
```

### B. Demo Satıcı Hesapları
- Email formatı: `demo1@eczanepazari.com`, `demo2@eczanepazari.com`, vb.
- Şifre: `Demo123!` (tüm demo hesaplar için)
- Her satıcıya 10-20 aktif teklif ekle

### C. Admin Hesabı
- Email: `admin@eczanepazari.com`
- Şifre: `Admin123!`
- Role: `super_admin`

## 2. İlaç Veritabanı (Gerçek Veriler)

### A. Kategoriler
1. Vitaminler & Mineraller
2. Antibiyotikler
3. Ağrı Kesiciler & Antiinflamatuarlar
4. Sindirim Sistemi
5. Solunum Sistemi
6. Kardiyovasküler
7. Diyabet İlaçları
8. Dermatolojik Ürünler
9. Bebek & Çocuk
10. Kozmetik & Kişisel Bakım

### B. Ürün Verileri (500+ ilaç)
Her kategori için gerçek ilaç isimleri, barkodlar ve üretici bilgileri:
- Barkod: Gerçek EAN-13 formatı (8690...)
- İsim: Gerçek ilaç isimleri (jenerik + marka)
- Üretici: Gerçek firma isimleri (Abdi İbrahim, Bayer, Pfizer vb.)
- Marka: Orijinal marka isimleri

### C. Örnek Ürünler (Her kategoriden 3-5 örnek)
**Vitaminler:**
- Centrum A'dan Çinko'ya 60 Tablet
- Supradyn Energy Plus 30 Tablet
- Solgar Vitamin C 1000mg 100 Kapsül

**Ağrı Kesiciler:**
- Majezik 100mg 30 Film Tablet
- Apranax Fort 550mg 20 Tablet
- Arveles 25mg 20 Tablet

## 3. Teklifler (50+ aktif teklif)

Her demo satıcı için rastgele ürünlere teklif:
- Fiyat: Liste fiyatının %5-25 altı
- Stok: 10-500 arası
- S.K.T.: 6-24 ay arası
- Parti No: Rastgele üretilmiş

## 4. Örnek Siparişler (20+ sipariş)

Farklı durumlarda siparişler:
- 5x `pending` (beklemede)
- 5x `confirmed` (onaylandı)
- 5x `shipped` (kargoda)
- 5x `delivered` (teslim edildi)

## 5. CMS Demo İçerik

### Bannerlar:
- Hero: "Yeni Yıl Kampanyası - %30 İndirim"
- Orta: "Vitamin Haftası - Özel Fiyatlar"

### Menüler:
- Header: Ana Sayfa, Ürünler, Kategoriler, Hakkımızda
- Footer: KVKK, Gizlilik, İletişim, Sıkça Sorulan Sorular

## Talimat:
`ProductSeeder.php` oluştur ve gerçek ilaç verilerini ekle. `DemoAccountSeeder.php` ile GLN yapısına uygun demo satıcılar oluştur.
