# ADIM 1.6 — Deploy Sonrası Smoke Checklist

Hosting + rules deploy sonrası hızlı doğrulama (`ADIM_1_5_DEPLOY.md`).

Preflight:

```powershell
npm run post-deploy:smoke
```

---

## P0 — Canlı site (5 dk)

- [ ] `https://<domain>` açılıyor (404 yok)
- [ ] `/manifest.webmanifest` + `/sw.js` yükleniyor
- [ ] `/.well-known/assetlinks.json` erişilebilir (TWA)
- [ ] Google giriş → onboarding veya ana ekran
- [ ] Yasal: `/legal/kullanim-kosullari`, `/legal/gizlilik-politikasi`

## P1 — Firebase servisleri

- [ ] Keşfet profilleri yükleniyor
- [ ] Like + mutual match (functions deploy sonrası)
- [ ] Chat mesajı
- [ ] Profil foto upload

## P2 — Güvenlik (3.x deploy sonrası)

- [ ] `SECURITY_TEST_CHECKLIST.md` P0
- [ ] App Check enforce (3.7) sonrası giriş OK

## P2 — Functions (4.5 sonrası)

- [ ] `GET .../health` → `{ ok: true }`
- [ ] 11. like reddediliyor (4.3)
- [ ] Hesap silme → veri temiz (4.4)

---

Detay: **`CLOSED_TEST_PLAN.md`** · Güvenlik: **`SECURITY_TEST_CHECKLIST.md`**

Sıradaki: **ADIM 4.5** (sen — Blaze + `deploy:functions`)
