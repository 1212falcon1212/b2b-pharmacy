# Phase 3: Dynamic Commission Management, Cart & Multi-Vendor Orders
# Rol: Senior Full-Stack Architect & Developer

## Hedef
Süper-adminin kategori bazlı komisyon oranları belirleyebilmesi, bu oranların sipariş anında hakediş hesaplamalarına yansıması ve sepet/sipariş döngüsünün tamamlanması.

## 1. Backend: Veritabanı ve Model Güncellemeleri (Laravel)

### A. Categories & Commission Rates
- 'categories' tablosuna 'commission_rate' (decimal, default 0) kolonu ekle.
- **FilamentPHP Admin:** 'CategoryResource' içinde süper-adminin bu oranı güncelleyebileceği bir 'TextInput' (numeric, suffix '%') alanı ekle.

### B. Cart & CartItems
- 'carts': (id, user_id, status)
- 'cart_items': (id, cart_id, product_id, offer_id, seller_id, quantity, price_at_addition)

### C. Orders & OrderItems (Financial Snapshot)
- 'orders': (id, user_id, total_amount, status, payment_status, shipping_address)
- 'order_items': (id, order_id, product_id, offer_id, seller_id, quantity, unit_price, commission_rate, commission_amount, seller_payout_amount)
- **Kritik Mantık:** Sipariş oluşturulurken 'commission_rate' bilgisi ürünün bağlı olduğu 'category' üzerinden çekilmeli ve o anki değer 'order_items' tablosuna kaydedilmelidir (Snapshot). İleride kategori komisyonu değişse bile geçmiş siparişler etkilenmemelidir.

## 2. Backend: Service Layer & Logic
- 'OrderService' içinde 'processOrder()' metodu kurgula:
    1. Sepetteki her ürün için bağlı olduğu kategorinin 'commission_rate' değerini bul.
    2. 'commission_amount = (unit_price * quantity) * (rate / 100)' formülüyle hesapla.
    3. 'seller_payout_amount = (Total Price) - (commission_amount)' değerini hesapla.
    4. Stok düşümü ve sipariş kaydını bir DB Transaction içinde gerçekleştir.

## 3. Frontend: User Interface & State (Next.js & shadcn/ui)

### A. Cart Experience
- 'shadcn/ui' Sheet kullanarak sepeti geliştir. Ürünleri 'Seller' (Satıcı) bazlı gruplandırılmış şekilde göster.
- Her satıcı grubu için ara toplam gösterimi ekle.

### B. Checkout Flow
- Teslimat adresi (varsayılan eczane adresi) ve Sipariş Özeti ekranlarını oluştur.
- Ödeme öncesi son fiyat kontrolünü (Offer fiyatı değişti mi?) yapacak bir 'Validation' adımı ekle.

### C. State Management
- Zustand 'useCartStore' ile sepet verilerini yönet. Sepet sayısını ve tutarını header bileşeninde dinamik tut.

## Talimat
Lütfen önce 'categories' tablosuna komisyon kolonunu ekleyerek başla ve Filament panelinde bunu yönetilebilir yap. Ardından sipariş oluşturma (Order Creation) sırasında bu oranları kullanan backend logic'ini tamamla ve frontend entegrasyonuna geç.