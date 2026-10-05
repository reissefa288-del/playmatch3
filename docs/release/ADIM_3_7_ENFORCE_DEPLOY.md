# ADIM 3.7 — App Check Enforce + Rules Deploy (Sen)

3.6 rules kodda hazır. Bu adımda **canlı ortamda** App Check'i açıp rules deploy edersin.

---

## Ön koşul

- [ ] ADIM 1.4–1.5: Firebase proje + `.env.production`
- [ ] ADIM 3.3: reCAPTCHA v3 site key
- [ ] ADIM 3.6: `hasAppCheck()` rules repo'da ✅

---

## 0. Preflight

```powershell
npm run app-check:preflight
```

Geçmezse: site key, `.firebaserc`, `npx firebase login`.

---

## Faz A — Hosting (App Check client canlı)

### A1. Site key

`.env.production`:

```env
VITE_FIREBASE_APPCHECK_RECAPTCHA_SITE_KEY=6Lc...
```

### A2. reCAPTCHA domain

[reCAPTCHA Admin](https://www.google.com/recaptcha/admin) → v3 → Domains:

- Production domain (`playmeet.app`, `*.web.app`, vb.)
- TWA aynı origin kullanır

### A3. Firebase Console — App Check kaydı

1. Firebase Console → **App Check**
2. Web app → **reCAPTCHA v3** → aynı site key
3. **Monitoring** modunda bırak (henüz Enforce değil)

### A4. Hosting deploy

```powershell
npm run deploy:app-check-rollout
```

(`app-check:preflight` + `deploy:hosting`)

### A5. Monitoring (1–2 gün önerilir)

Console → App Check → Metrics:

- [ ] Geçerli token oranı yüksek
- [ ] Hatalı / eksik token düşük
- [ ] Production URL'den giriş + keşfet çalışıyor

---

## Faz B — Console Enforce (manuel)

**Sadece monitoring temizse:**

1. App Check → **Cloud Firestore** → **Enforce**
2. App Check → **Cloud Storage** → **Enforce**
3. Authentication → Enforce **yapma** (opsiyonel, riskli — şimdilik kapalı)

Enforce sonrası site key olmayan istekler API seviyesinde reddedilir.

---

## Faz C — Rules deploy (3.6)

Console enforce **sonrası**:

```powershell
npm run security:preflight
npm run deploy:security
```

Firestore + Storage rules (`hasAppCheck`) birlikte gider.

> **Sıra önemli:** Önce hosting (Faz A), sonra enforce (Faz B), sonra rules (Faz C).  
> Rules'ı enforce'dan önce deploy edersen client App Check göndermiyorsa 403 alırsın.

---

## Faz D — 2 hesap test

Checklist: **`SECURITY_TEST_CHECKLIST.md`**

| # | Test | Beklenen |
|---|------|----------|
| S8 | Production / TWA Google giriş | OK |
| S9 | Keşfet + like + match + chat | OK |
| S9b | App Check olmadan istek (Console playground) | Deny |
| S13–S15 | Foto upload + scoped storage | OK |

Geniş plan: **`CLOSED_TEST_PLAN.md`** (SEC7–SEC8)

---

## Local dev (rules deploy sonrası)

`.env.local`:

```env
VITE_FIREBASE_APPCHECK_RECAPTCHA_SITE_KEY=6Lc...
VITE_FIREBASE_APPCHECK_DEBUG_TOKEN=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

Console → App Check → Manage debug tokens.

---

## Tek komut özeti

```powershell
npm run app-check:preflight
npm run deploy:app-check-rollout
# → Console Enforce (Firestore + Storage)
npm run deploy:security
# → SECURITY_TEST_CHECKLIST.md
```

---

## Sık hatalar

| Belirti | Çözüm |
|---------|--------|
| Tüm Firestore 403 | Hosting deploy edildi mi? Site key build'e girdi mi? |
| 403 enforce sonrası | reCAPTCHA domain listesi |
| 403 rules deploy sonrası | Faz sırası: hosting → enforce → rules |
| Local dev 403 | Debug token + Console'da kayıtlı mı? |
| TWA 403 | TWA URL = hosting domain; assetlinks OK |

## Geri alma

1. Console → App Check → Monitoring'e al (Enforce kapat)
2. Acil: rules'dan `hasAppCheck` kaldır → `deploy:security` (önerilmez)

---

**ADIM 3 tamam** → P0 checklist + S8–S9 + S13–S15 geçti.

Sıradaki agent: **ADIM 4.1** (Cloud Functions)
