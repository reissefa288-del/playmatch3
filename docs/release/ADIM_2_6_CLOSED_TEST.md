# ADIM 2.6 — Internal / Closed Test (Play Console)

Play Console: https://play.google.com/console

Ön kontrol:

```powershell
npm run closed-test:preflight
```

Test senaryoları: `docs/release/CLOSED_TEST_PLAN.md`

---

## Ön koşul checklist

- [ ] ADIM 1.5 — Hosting canlı (`https://<HOST>`)
- [ ] ADIM 2.2 — assetlinks fingerprint deploy
- [ ] ADIM 2.3 — AAB build (`npm run twa:build`)
- [ ] ADIM 2.4 — Store listing, Data Safety, Content rating tamam
- [ ] ADIM 2.5 — Web deploy (redirect auth) + Firebase authorized domains
- [ ] 2 test Google hesabı (A ve B)
- [ ] 1+ fiziksel Android cihaz

---

## 1. Internal testing (önerilen ilk adım)

Internal test **hemen** başlatılabilir; Google onay beklemez (max 100 tester).

1. Play Console → **Testing → Internal testing**
2. **Create new release**
3. **Upload** → ADIM 2.3 AAB dosyası
4. Release name: `1.0.0 (1)` — `twa-manifest.json` ile uyumlu
5. Release notes (TR):

```
Kapalı test — ilk sürüm
• Google ile giriş
• Keşfet, eşleşme, sohbet
• Mini oyunlar
• Rapor / engelle / hesap silme
```

6. **Review release** → **Start rollout to Internal testing**

### Tester ekle (Internal)

1. **Testers** sekmesi → **Create email list**
2. Liste adı: `playmeet-internal`
3. E-postalar ekle (Gmail önerilir — test hesapları A ve B dahil)
4. Listeyi Internal testing track'e bağla
5. **Copy link** — tester'lara gönder

Tester opt-in linki formatı:
```
https://play.google.com/apps/internaltest/...
```

---

## 2. Closed testing (geniş tester grubu)

Internal test geçtiyse Closed track'e geç.

1. **Testing → Closed testing** → Create track (ör. `closed-alpha`)
2. Aynı AAB veya yeni sürüm yükle
3. **Testers** → Email list veya Google Group
4. Closed test için **Content rating + Data safety + Store listing** tamamlanmış olmalı
5. İlk closed release Google incelemesi gerektirebilir (birkaç saat – birkaç gün)

### Tester sayısı

| Track | Limit | Not |
|-------|-------|-----|
| Internal | 100 | Hızlı iterasyon |
| Closed | Sınırsız (liste) | Kapalı beta |
| Open | Herkes | ADIM 12 |

---

## 3. Cihazda yükleme

1. Tester e-postasına Play Store davet linki gelir
2. Daveti kabul et (aynı Google hesabı cihazda oturum açık olmalı)
3. Play Store → PlayMeet → **Install**
4. TWA olarak açılmalı (tarayıcı çubuğu yok)
5. İlk açılış: Google giriş (redirect) — ADIM 2.5

### TWA doğrulama

- Uygulama tam ekran / standalone
- `assetlinks` hatalıysa Chrome'da açılır → ADIM 2.2 kontrol

---

## 4. İki hesap test akışı (minimum)

| Sıra | Kim | Aksiyon |
|------|-----|---------|
| 1 | A | Giriş → onboarding tamamla |
| 2 | B | Giriş → onboarding tamamla |
| 3 | A | B'yi beğen |
| 4 | B | A'yı beğen → eşleşme |
| 5 | A | B ile mesajlaş |
| 6 | B | Mesajı oku |

Detay: `CLOSED_TEST_PLAN.md` (Auth, Match, Chat, Report, Block, Delete)

---

## 5. Tester davet e-postası (şablon)

Konu: PlayMeet kapalı test daveti

```
Merhaba,

PlayMeet Android kapalı testine davetlisin.

1. Bu Google hesabıyla giriş yap: [test@gmail.com]
2. Davet linkine tıkla: [PLAY_CONSOLE_OPT_IN_LINK]
3. Play Store'dan PlayMeet'i yükle
4. Geri bildirim: destek@playmeet.app

Not: 18+ uygulama. Test sırasında gerçek kişisel bilgi paylaşma.
```

---

## 6. Sürüm güncelleme (iterasyon)

Web veya auth değişikliği sonrası:

```powershell
npm run deploy:hosting          # web değiştiyse
# twa-manifest appVersionCode++ 
npm run twa:build               # native sürüm değiştiyse
```

Play Console → aynı track → **Create new release** → yeni AAB.

Web-only değişikliklerde AAB yenilemeye gerek yok (TWA canlı URL yükler).

---

## 7. Sık sorunlar

| Sorun | Çözüm |
|-------|-------|
| Davet linki çalışmıyor | Tester listesinde doğru e-posta + davet kabul |
| Play Store'da uygulama yok | Rollout başlatıldı mı, 15–30 dk bekle |
| TWA tarayıcıda açılıyor | assetlinks + fingerprint + redeploy |
| Google giriş hata | ADIM 2.5 authorized domains |
| Eşleşme oluşmuyor | İki farklı hesap, onboarding tamam |

---

## Kabul kriteri

`CLOSED_TEST_PLAN.md` P0 senaryoları **2 Android cihaz/hesap** ile geçerse:

- Closed test track aktif
- Tester listesi tanımlı
- İlk geri bildirimler toplanıyor

→ **ADIM 3** (güvenlik sıkılaştırma) veya production hazırlığına geç.

---

## Tester listesi şablonu

`docs/release/testers.example.txt` — e-postaları kopyala, Play Console listesine yapıştır.
