# Phase 5: Operational Dashboards, User Approval & System Polish
# Rol: Senior Full-Stack Developer & UX Specialist

## Hedef
Süper-adminin eczacıları onaylayabildiği, eczacıların stok ve hakedişlerini yönetebildiği profesyonel panelleri tamamlamak ve PWA özelliklerini finalize etmek.

## 1. Backend: Super-Admin Operations (FilamentPHP)
- **Pharmacy Approval Workflow:** - Eczacıların kayıt olurken yüklediği belgeleri (Ruhsat, Oda Kaydı vb.) görüntüleme ve 'Verified' statüsünü onaylama ekranı.
    - Onaylandığında eczacıya otomatik hoş geldin e-postası gönderimi.
- **Financial Monitoring:** - Platform genelindeki toplam satış, kazanılan komisyon ve bekleyen 'Payout Request' (Ödeme Talebi) yönetimi.
- **System Logs:** Bizimhesap ve Kargo API'lerinden gelen hata loglarını filtreleyerek admin panelinde göster.

## 2. Frontend: Vendor (Eczacı) Dashboard (Next.js & shadcn/ui)
- **Inventory Management:** - Eczacının kendi 'Offers' (Tekliflerini) yönetebileceği bir alan: Fiyat güncelleme, Stok durumu ve SKT (Son Kullanma Tarihi) takibi.
- **Payout & Wallet:** - Cüzdan özet ekranı: "Çekilebilir Tutar", "Bloke Tutar" ve "Geçmiş Ödemeler".
    - 'Payout Request' butonu ve talep durumu takibi.
- **Order Management:** - Gelen siparişlerin listesi: Fatura PDF'ini indir, Kargo Barkodu al ve sipariş statüsünü güncelle.

## 3. Frontend: PWA & Performance Polish
- **PWA Finalization:** 'next-pwa' ile manifest ve service worker ayarlarını tamamla. Offline modda sepetin ve sipariş geçmişinin görüntülenebilmesini sağla.
- **Security Audit:** Sistemin gerçekten "kapalı" olduğundan emin ol. Auth olmayan veya GLN onayı bekleyen kullanıcıların ürün fiyatlarını görmesini sağlayan bir açık var mı kontrol et.

## 4. Deployment Readiness
- Production ortamı için '.env.example' dosyalarını güncelle.
- VPS üzerinde (Laravel Forge veya manuel) kurulum için gerekli olan Nginx/PM2 yapılandırma taslaklarını hazırla.

## Talimat:
Lütfen önce FilamentPHP tarafındaki eczacı onaylama ve finansal özet ekranlarıyla başla. Ardından Next.js tarafındaki satıcı (Vendor) paneline geç ve en son PWA testlerini yaparak bitir.