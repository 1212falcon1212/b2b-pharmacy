# Phase 9: Mobile-First Experience & Notification Center
# Rol: PWA Expert & Frontend Developer

## 1. PWA Barcode Scanner
- **Entegrasyon:** 'html5-qrcode' veya benzeri bir kütüphane kullanarak Next.js üzerinde bir 'BarcodeScanner' bileşeni oluştur.
- **Action:** Eczacı kamerayı açıp barkodu okuttuğunda, direkt olarak o barkoda ait 'Product Detail' (Fiyat Karşılaştırma) sayfasına yönlendir.
- **UX:** PWA içinde kameraya erişim izinlerini ve hata durumlarını şık bir şekilde yönet.

## 2. Notification Engine (Push & SMS)
- **Push Notifications:** Firebase Cloud Messaging (FCM) entegrasyonu ile PWA üzerinden anlık bildirim gönder (Yeni sipariş, Fiyat düşüşü).
- **SMS Service:** Netgsm veya İleti Merkezi gibi bir servis için 'SmsService' oluştur. Kritik durumlarda (Sipariş onayı, Ödeme uyarısı) SMS gönder.
- **User Settings:** Kullanıcının hangi bildirimleri almak istediğini seçebileceği bir 'Notification Settings' sayfası ekle.

## 3. Engagement Features
- Ürün takip listesi (Wishlist) oluştur; eczacı bir ürünü takibe aldığında fiyatı düşerse bildirim gitsin.