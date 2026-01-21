# Phase 2: Local GLN Whitelist & Cimri Model Implementation
# Rol: Senior Full-Stack Developer

## Hedefler
Elimizdeki GLN listesini veritabanına aktarmak, kayıt sırasında bu listeden kontrol yapmak ve ürün bazlı fiyat karşılaştırma API'sini tamamlamak.

## 1. Backend: GLN Veri Yapısı ve Import Sistemi (Laravel)
- 'valid_glns' adında bir tablo oluştur (id, gln_code, pharmacy_name, city, is_used).
- Bu listeyi toplu olarak içeri aktarabilmek için bir 'ImportGlnList' Artisan komutu yaz. (JSON veya Excel dosyasından okuyacak şekilde planla).
- 'GlnVerificationService' oluştur; bu servis girilen GLN'nin 'valid_glns' tablosunda olup olmadığını ve daha önce başka bir kullanıcı tarafından kullanılıp kullanılmadığını (is_used) kontrol etsin.

## 2. Backend: Cimri Tarzı Fiyat Karşılaştırma API
- 'Product' ve 'Offer' modelleri arasındaki ilişkiyi kur (One-to-Many).
- 'ProductController@show' metodunu yaz: 
    - İstek geldiğinde ürünü ve o ürüne ait tüm aktif 'offers' verilerini getir.
    - Teklifleri (Offers) veritabanı seviyesinde 'price' kolonuna göre ARTAN (ASC) sırada sırala.
    - Eager loading kullanarak 'seller' (eczane) bilgilerini de ekle.

## 3. Frontend: Auth ve PWA Arayüzü (Next.js & shadcn/ui)
- 'shadcn/ui' bileşenleri ile Register formunu oluştur.
- Form gönderildiğinde GLN kodunu backend'e ilet; eğer kod listede yoksa veya kullanılmışsa uygun hata mesajını göster.
- PWA standartları için 'next-pwa' kurulumunu yap ve 'manifest.json' dosyasını eczane temasına uygun düzenle.
- Ürün detay sayfasında (Cimri modeli):
    - En ucuz satıcıyı "En Uygun Fiyat" etiketiyle en üstte göster.
    - Diğer satıcıları liste halinde (Satıcı Adı | Stok | Fiyat) şeklinde sırala.

## Talimat:
Lütfen önce 'valid_glns' tablosu ve import mantığıyla başla. Veritabanı tutarlı hale geldikten sonra fiyat karşılaştırma API'sine ve frontend entegrasyonuna geç.