# P0 — Canlı Backend (tek rehber)

Firebase + Hosting + Rules + Indexes + Functions. Play Store öncesi **zorunlu** altyapı.

---

## Durum kontrolü

```powershell
npm run p0:status
```

Yeşil değilse aşağıdaki adımları sırayla uygula.

---

## Adım 1 — Firebase Console (1.3) ~15 dk

Detay: `FIREBASE_CONSOLE_SETUP.md`

1. [Firebase Console](https://console.firebase.google.com) → **Add project**
2. **Web app** ekle → config JSON kopyala
3. **Authentication** → Google → Enable
4. **Firestore** → Production mode → `eur3` / Europe
5. **Storage** → Production mode
6. **Upgrade → Blaze plan** (Functions için — kart gerekir, düşük trafikte birkaç $/ay)

Config dosyası:

```powershell
# İlk çalıştırma şablon oluşturur
npm run firebase:init-env
```

`firebase/firebase-web-config.json` içine Console config yapıştır → tekrar:

```powershell
npm run firebase:init-env
npm run firebase:verify-setup
```

---

## Adım 2 — App Check (3.3) ~10 dk

Firestore/Storage rules App Check token ister.

1. [reCAPTCHA v3](https://www.google.com/recaptcha/admin) → site key
2. `.env.production` dosyasına ekle:

```env
VITE_FIREBASE_APPCHECK_RECAPTCHA_SITE_KEY=6Lc...
```

3. Firebase Console → **App Check** → Web → reCAPTCHA v3 kaydet
4. İlk günler **Monitoring** (Enforce değil) — `ADIM_3_7_ENFORCE_DEPLOY.md`

---

## Adım 3 — Firebase CLI girişi (1.5)

```powershell
npx firebase login
npm run firebase:verify-setup
```

---

## Adım 4 — Tek komut deploy

```powershell
npm run deploy:p0-backend
```

Bu komut sırayla:

| # | Ne deploy eder |
|---|----------------|
| 1 | Preflight (env, rules, functions) |
| 2 | Production build + brotli |
| 3 | Hosting + Firestore rules + **indexes** + Storage rules |
| 4 | Cloud Functions (match, likes, delete, premium, push) |

Sadece hosting (Functions sonra):

```powershell
npm run deploy:p0-backend -- --hosting-only
```

---

## Adım 5 — Deploy sonrası (hemen)

1. **Authorized domains:** Console → Auth → `https://<project-id>.web.app`
2. Tarayıcıda site aç → Google giriş
3. Smoke:

```powershell
npm run post-deploy:smoke
```

Manuel: `ADIM_1_6_SMOKE_CHECKLIST.md`

4. Functions health:

```
GET https://europe-west1-<project-id>.cloudfunctions.net/health
→ { "ok": true }
```

---

## Adım 6 — Güvenlik (3.4 + 3.7)

**Monitoring modunda** 1–2 gün kullanım sonrası:

1. Console → App Check → Firestore + Storage → **Enforce**
2. Rules yeniden deploy:

```powershell
npm run deploy:security
```

3. İki hesap test: `SECURITY_TEST_CHECKLIST.md`

---

## Sık hatalar

| Hata | Çözüm |
|------|--------|
| `.env.production yok` | `npm run firebase:init-env` |
| `403 deploy` | `npx firebase login` |
| Functions deploy fail | Blaze plan |
| `auth/unauthorized-domain` | Authorized domains |
| Firestore `failed-precondition` (index) | `npm run deploy:p0-backend` (indexes dahil) |
| Permission denied + App Check | Site key + Console App Check kaydı |

---

## Komut özeti

```powershell
npm run p0:status              # hazır mı?
npm run firebase:init-env      # config → env
npx firebase login
npm run deploy:p0-backend      # tam P0
npm run deploy:security        # App Check enforce sonrası
```
