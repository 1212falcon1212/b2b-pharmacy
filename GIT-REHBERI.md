# Git & Deploy Rehberi - B2B Pharmacy

## Hızlı Komutlar

### Değişiklikleri Gönder (En Sık Kullanılan)
```bash
git add -A && git commit -m "Değişiklik açıklaması" && git push
```

### Sadece Durumu Gör
```bash
git status
```

### Son Değişiklikleri Gör
```bash
git diff
```

### Son Commit'leri Gör
```bash
git log --oneline -10
```

---

## Adım Adım İşlemler

### 1. Değişiklikleri Hazırla
```bash
# Tüm değişiklikleri ekle
git add -A

# veya belirli dosyayı ekle
git add dosya-adi.tsx
```

### 2. Commit Yap
```bash
git commit -m "Açıklama buraya"
```

### 3. Push Et (Canlıya Gönder)
```bash
git push
```

> **Not:** Push yaptığında webhook otomatik çalışır ve canlı ortam güncellenir!

---

## Sık Kullanılan Senaryolar

### Yeni Özellik Ekledim
```bash
git add -A
git commit -m "Feat: Yeni özellik açıklaması"
git push
```

### Bug Düzelttim
```bash
git add -A
git commit -m "Fix: Hata açıklaması"
git push
```

### Stil/Tasarım Değişikliği
```bash
git add -A
git commit -m "Style: Değişiklik açıklaması"
git push
```

---

## Sorun Giderme

### Son Commit'i Geri Al (Henüz Push Etmediysen)
```bash
git reset --soft HEAD~1
```

### Değişiklikleri İptal Et (Commit Etmeden)
```bash
git checkout -- .
```

### Canlıdaki Kodu Çek (Lokal'i Güncelle)
```bash
git pull origin main
```

---

## Sunucu Bilgileri

- **GitHub Repo:** https://github.com/1212falcon1212/b2b-pharmacy
- **Canlı Site:** https://i-depo.com
- **Admin Panel:** https://i-depo.com/admin
- **Webhook URL:** https://i-depo.com/api/deploy/webhook

### SSH ile Sunucuya Bağlan
```bash
ssh vps-root
```

### Sunucuda Deploy Log'u Kontrol Et
```bash
ssh vps-root "tail -50 /home/i-depo/htdocs/i-depo.com/public/deploy/deploy.log"
```

### Sunucuda Frontend'i Yeniden Başlat
```bash
ssh vps-root "pm2 restart i-depo-frontend"
```

### Sunucuda Backend Cache Temizle
```bash
ssh vps-root "cd /home/i-depo/htdocs/i-depo.com/public/backend && php artisan config:clear && php artisan cache:clear"
```

---

## Commit Mesajı Örnekleri

| Tip | Örnek |
|-----|-------|
| Yeni özellik | `Feat: Ürün arama filtresi eklendi` |
| Bug düzeltme | `Fix: Login hatası düzeltildi` |
| Stil | `Style: Buton renkleri güncellendi` |
| Refactor | `Refactor: API istekleri optimize edildi` |
| Docs | `Docs: README güncellendi` |

---

## Otomatik Deploy Nasıl Çalışıyor?

1. `git push` yaptığında GitHub'a kod gider
2. GitHub webhook tetiklenir
3. Sunucuda otomatik olarak:
   - `git pull` - Kod çekilir
   - `composer install` - Backend bağımlılıkları
   - `php artisan migrate` - Veritabanı güncellenir
   - `npm install && npm run build` - Frontend build edilir
   - `pm2 restart` - Frontend yeniden başlar

**Deploy süresi:** ~30-60 saniye
