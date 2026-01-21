# Phase 4.1: Advanced Financial Operations & Multi-Party Invoicing
# Rol: Senior Financial Software Architect & Backend Developer

## Hedef
Kategori bazlı vergi ve komisyonların yönetilmesi, üçlü fatura mekanizmasının (Satıcı->Alıcı, Platform->Satıcı) kurulması ve satıcılar için "Ödeme Talebi" (Payout Request) sisteminin inşası.

## 1. Backend: Financial Variables & Tax Management (Laravel)
- **Settings & Database:**
    - 'categories' tablosuna 'vat_rate' (KDV) ve 'withholding_tax' (Stopaj) kolonlarını ekle.
    - 'settings' tablosuna 'platform_commission_vat' (Komisyon KDV'si) anahtarını ekle.
- **FilamentPHP Admin:** Süper-adminin her kategori için KDV ve Stopaj oranlarını, kargo ücretlerini ve komisyonları yönetebileceği gelişmiş bir 'Finance Settings' paneli oluştur.

## 2. Backend: Triple-Point Invoicing Logic (Bizimhesap)
- **Fatura Senaryoları:**
    1. **Ürün Faturası (Satıcıdan Alıcıya):** Satıcı eczacı, alıcı eczacıya toplam satış tutarı üzerinden 'Satış Faturası' keser.
    2. **Komisyon Faturası (Platformdan Satıcıya):** Platform sahibi, satıcıdan kestiği komisyon tutarı + KDV için 'Hizmet Bedeli Faturası' keser.
    3. **Kargo Faturası:** Kargo maliyetine göre ilgili tarafa (admin veya satıcı) fatura yansıtma mantığını kur.
- **Implementation:** 'BizimhesapService' içinde bu senaryolara uygun 'invoice_type' parametreleri kurgula.

## 3. Backend: Wallet & Payout Request System
- **Wallet Logic:** - 'seller_wallets': (seller_id, balance, pending_balance, withdrawn_balance)
    - 'payout_requests': (id, seller_id, amount, status [pending, approved, rejected], bank_account_id)
- **Transactions:** Yapılan her ödeme 'pending_balance' (bloke tutar) olarak başlar. Kargo teslim edildiğinde veya X gün sonra 'balance' (çekilebilir tutar) alanına aktarılır.
- **Super-Admin Panel:** Tüm ödeme taleplerini gör, onayla veya reddet. Onaylandığında otomatik olarak Iyzico/PayTR üzerinden veya manuel olarak transfer kaydı oluştur.

## 4. Frontend: Vendor & Admin Financial Dashboards (Next.js)
- **Vendor Dashboard (Satıcı):**
    - "Cüzdanım" sayfası: Toplam Kazanç, Bekleyen Ödemeler, Kesilen Komisyonlar ve Kargo Giderleri.
    - "Ödeme Talebi Oluştur" butonu ve geçmiş taleplerin listesi.
    - Satışların yanında "Faturayı İndir" butonu.
- **Super-Admin Dashboard:** - Platform genelinde dönen toplam para, toplam kazanılan komisyon ve bekleyen ödeme taleplerinin özeti.

## Talimat:
Lütfen önce vergi ve cüzdan tablolarını oluştur. Ardından 'OrderService' içindeki hakediş mantığını 'Stopaj' ve 'KDV' hesaplamalarını içerecek şekilde güncelle. Bizimhesap entegrasyonunda fatura tiplerini (Satış vs Komisyon) netleştir ve en son satıcı ödeme talebi (Payout) akışını kodla.