# ADIM 2.4 — Play Console Kurulumu

Play Console: https://play.google.com/console

Ön kontrol:

```powershell
npm run play:preflight-console
```

---

## 1. Geliştirici hesabı

- Google Play Developer hesabı ($25 tek seferlik)
- Geliştirici adı, iletişim e-postası doğrulanmış

---

## 2. Uygulama oluştur

1. **Create app**
2. App name: **PlayMeet**
3. Default language: **Turkish (Türkiye)**
4. App or game: **App**
5. Free or paid: **Free**
6. Declarations: Play policies onayla

---

## 3. App content (sol menü — tüm maddeleri tamamla)

| Bölüm | Ne yap |
|-------|--------|
| **Privacy policy** | `https://<HOST>/legal/gizlilik-politikasi` |
| **App access** | Tüm işlevler erişilebilir / test hesabı gerekirse not ekle |
| **Ads** | Hayır (reklam yok) |
| **Content rating** | IARC anketi — `DATA_SAFETY.md` + `STORE_LISTING.tr.md` Content rating tablosu |
| **Target audience** | 18+ only — çocuklara yönelik değil |
| **News app** | Hayır |
| **COVID-19 contact tracing** | Hayır |
| **Data safety** | `docs/release/DATA_SAFETY.md` satır satır |
| **Government apps** | Hayır |
| **Financial features** | Hayır (gerçek ödeme yok) |
| **Health** | Hayır |

### Content rating ipuçları (Flört/Sosyal)

- Kullanıcı etkileşimi: **Evet** (mesajlaşma, profil)
- Kullanıcı oluşturulan içerik: **Evet** (foto, bio, mesaj)
- Moderasyon: rapor + engelleme var
- Cinsel içerik / şiddet: **Hayır** (uygulama içeriği)
- Hedef: **Mature 17+ / 18+** (Türkiye için 18+)

---

## 4. Store listing

Metinleri kopyala: **`store-assets/STORE_LISTING.tr.md`**

| Alan | Kaynak |
|------|--------|
| App name | PlayMeet |
| Short description | STORE_LISTING.tr.md |
| Full description | STORE_LISTING.tr.md |
| App icon 512 | `store-assets/play-store-icon-512.png` |
| Feature graphic | `store-assets/feature-graphic.png` |
| Phone screenshots | `store-assets/screenshots/` min 2 |
| Category | Sosyal veya Flört |
| Contact email | `destek@playmeet.app` |
| Privacy policy URL | `https://<HOST>/legal/gizlilik-politikasi` |

---

## 5. Android app technical

Release → **Create new release** (Internal testing ile başla):

| Alan | Değer |
|------|-------|
| Package name | `app.playmeet.twa` |
| AAB | ADIM 2.3 çıktısı |
| Version | `twa-manifest.json` → appVersionName / appVersionCode |

İlk yüklemeden önce **App signing** → Google Play App Signing etkin (upload key ile).

---

## 6. Data Safety formu

`docs/release/DATA_SAFETY.md` dosyasını formda birebir uygula.

Özet:
- **Veri toplanıyor:** Evet
- **Paylaşım:** Firebase/Google (hizmet sağlayıcı), Sentry opsiyonel
- **Silme:** Uygulama içi hesap silme
- **Şifreleme:** Aktarımda (HTTPS)

---

## 7. Kapalı test track (ADIM 2.6 ile devam)

1. **Testing → Internal testing** → Create release
2. AAB yükle
3. Release notes (TR): "Kapalı test — ilk sürüm"
4. Testers ekle (e-posta listesi)

---

## Kontrol listesi

- [ ] `npm run play:preflight-console` (uyarılar giderildi)
- [ ] Privacy URL canlıda açılıyor
- [ ] `destek@playmeet.app` mailbox aktif
- [ ] Content rating tamamlandı
- [ ] Data safety gönderildi
- [ ] Store listing kaydedildi
- [ ] AAB yüklendi (internal/closed track)

---

Sıradaki: **ADIM 2.5** (agent — Android auth notları) veya **ADIM 2.6** (tester + kapalı test).
