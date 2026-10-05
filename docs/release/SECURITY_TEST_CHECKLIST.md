# PlayMeet — Security Test Checklist (2 Hesap)

Hesap **A** ve **B** — farklı Google hesapları, farklı cihazlar veya profiller.

Deploy: `npm run deploy:security`  
App Check enforce varsa önce hosting + site key deploy.

---

## P0 — Rules (3.1 + 3.2)

- [ ] **S1** A: Keşfet sekmesi profil gösteriyor
- [ ] **S2** A: B'yi beğen → hata yok
- [ ] **S3** B: A'yı beğen → eşleşme bildirimi / liste
- [ ] **S4** A: Eşleşmelerde B görünüyor
- [ ] **S5** A ↔ B: Mesaj gönder / al
- [ ] **S6** A: Kendi profil düzenleme kaydediliyor
- [ ] **S7** A: Onboarding yarım profil — başkası keşfette görmez (B listede yok)

## P0 — Auth + App Check (3.3)

- [ ] **S8** TWA veya production URL: Google giriş (redirect/popup)
- [ ] **S9** App Check enforce + rules 3.6: giriş + keşfet + foto çalışıyor
- [ ] **S9b** App Check token olmadan Firestore isteği → 403 (Console playground)

## P1 — Moderasyon (CLOSED_TEST_PLAN)

- [ ] **S10** Rapor gönder (chat veya profil)
- [ ] **S11** Engelle → keşfet + chat kapalı
- [ ] **S12** Hesap sil → tekrar giriş onboarding

## P1 — Storage

- [ ] **S13** Onboarding / profil foto yükle
- [ ] **S14** Onboarding yarım kullanıcı fotoğrafı — başkası Storage'dan okuyamaz (3.5)
- [ ] **S15** Keşfet + eşleşme fotoğrafları normal yükleniyor

---

## Sonuç

| | |
|---|---|
| Tarih | |
| Deploy versiyonu | |
| App Check | Monitoring / Enforce / Kapalı / Rules 3.6 |
| P0 geçti | ☐ Evet ☐ Hayır |
| Notlar | |

Tüm P0 işaretli → **ADIM 3.7 tamam** → ADIM 3 kapanır.

Preflight: `npm run app-check:preflight`
