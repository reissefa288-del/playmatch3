# PlayMeet — Yol Haritası (Sen / Ben)

Komut: **"ADIM X.Y YAP"** — sadece **BENİM** adımlarımı uygularım.

---

## ADIM 1 — Production Firebase + Hosting

| Kod | Kim | İş |
|-----|-----|-----|
| 1.1 | **Ben** | Firebase config doğrula, hosting ignore düzelt, validate script |
| 1.2 | **Ben** | `validate:dist` + `build:production` zinciri (icons, assetlinks, sw, brotli) ✅ |
| 1.3 | **Sen** | Firebase Console: proje, Auth, Firestore, Storage, Hosting — rehber: `FIREBASE_CONSOLE_SETUP.md` |
| 1.4 | **Sen** | Console config → `firebase/firebase-web-config.json` → `npm run firebase:init-env` |
| 1.5 | **Sen** | `npx firebase login` + `npm run deploy:firebase` — rehber: `ADIM_1_5_DEPLOY.md` |
| 1.6 | **Ben** | Deploy sonrası smoke checklist ✅ — `ADIM_1_6_SMOKE_CHECKLIST.md` |

---

## ADIM 2 — Android TWA + Kapalı Test

| Kod | Kim | İş |
|-----|-----|-----|
| 2.1 | **Ben** | `validate:twa` + `twa:sync-host` (manifest / assetlinks uyumu) ✅ |
| 2.2 | **Sen** | Keystore oluştur → `twa:fingerprint` + `twa:apply-fingerprint` — `ADIM_2_2_KEYSTORE.md` |
| 2.3 | **Sen** | `twa:init` + `twa:build` (Bubblewrap AAB) — `ADIM_2_3_BUBBLEWRAP.md` |
| 2.4 | **Sen** | Play Console listing + Data Safety + rating — `ADIM_2_4_PLAY_CONSOLE.md` |
| 2.5 | **Ben** | Android redirect auth + `ADIM_2_5_ANDROID_AUTH.md` ✅ |
| 2.6 | **Sen** | Internal/Closed test + tester — `ADIM_2_6_CLOSED_TEST.md` |

---

## ADIM 3 — Güvenlik (Rules + App Check)

| Kod | Kim | İş |
|-----|-----|-----|
| 3.1 | **Ben** | Firestore `users` scoped read (get/list) ✅ — `ADIM_3_1_RULES.md` |
| 3.2 | **Ben** | `likes` scoped read (get/list) ✅ — `ADIM_3_2_RULES.md` |
| 3.3 | **Ben** | App Check client (reCAPTCHA v3) ✅ — `ADIM_3_3_APPCHECK.md` |
| 3.4 | **Sen** | `deploy:security` + 2 hesap test — `ADIM_3_4_DEPLOY_TEST.md` |
| 3.5 | **Ben** | Storage photos scoped read ✅ — `ADIM_3_5_STORAGE_RULES.md` |
| 3.6 | **Ben** | Rules `hasAppCheck()` ✅ — `ADIM_3_6_APPCHECK_RULES.md` |
| 3.7 | **Sen** | App Check enforce + deploy — `ADIM_3_7_ENFORCE_DEPLOY.md` |

---

## ADIM 4 — Cloud Functions

| Kod | Kim | İş |
|-----|-----|-----|
| 4.1 | **Ben** | Functions projesi kur ✅ — `ADIM_4_1_FUNCTIONS.md` |
| 4.2 | **Ben** | Mutual-like match gate ✅ — `ADIM_4_2_MATCH_GATE.md` |
| 4.3 | **Ben** | dailyLikes server increment ✅ — `ADIM_4_3_DAILY_LIKES.md` |
| 4.4 | **Ben** | Hesap silme cascade ✅ — `ADIM_4_4_DELETE_CASCADE.md` |
| 4.5 | **Sen** | Blaze plan + functions deploy |

---

## ADIM 5 — Keşfet ölçeklendirme

| Kod | Kim | İş |
|-----|-----|-----|
| 5.1 | **Ben** | Discover pagination/limit ✅ |
| 5.2 | **Ben** | Exclude set optimizasyonu ✅ |
| 5.3 | **Ben** | Beğenenler sekmesi kaldırıldı ✅ |

---

## ADIM 6 — Chat ölçeklendirme

| Kod | Kim | İş |
|-----|-----|-----|
| 6.1 | **Ben** | Mesaj sayfalama ✅ |
| 6.2 | **Ben** | Listener dedupe ✅ |
| 6.3 | **Ben** | Mesaj rate limit ✅ |

---

## ADIM 7 — Moderasyon operasyonu

| Kod | Kim | İş |
|-----|-----|-----|
| 7.1 | **Ben** | Report inceleme dokümantasyonu ✅ — `ADIM_7_1_REPORT_REVIEW.md` |
| 7.2 | **Sen** | Console moderasyon rutini |

---

## ADIM 8 — Premium + Billing

| Kod | Kim | İş |
|-----|-----|-----|
| 8.1 | **Ben** | Kapalı test: Premium UI gizle ✅ — `ADIM_8_1_PREMIUM_CLOSED.md` |
| 8.2 | **Ben** | Play Billing + Firestore entitlement ✅ — `ADIM_8_2_PREMIUM_BILLING.md` |
| 8.3 | **Sen** | Play Console merchant / ürünler |

---

## ADIM 9 — Push (FCM)

| Kod | Kim | İş |
|-----|-----|-----|
| 9.1 | **Ben** | FCM client + match/message triggers ✅ — `ADIM_9_1_FCM.md` |
| 9.2 | **Ben** | TWA notification bridge ✅ — `ADIM_9_2_TWA_NOTIFICATIONS.md` |
| 9.3 | **Sen** | Firebase Cloud Messaging etkin |

---

## ADIM 10 — Konum / Yakındakiler

| Kod | Kim | İş |
|-----|-----|-----|
| 10.1 | **Ben** | Mock nearby demo işareti ✅ |
| 10.2 | **Ben** | Geohash + Firestore geo ✅ |
| 10.3 | **Ben** | KVKK konum rızası UI ✅ |

---

## ADIM 11 — KVKK tam uyum

| Kod | Kim | İş |
|-----|-----|-----|
| 11.1 | **Ben** | Gizlilik metni ↔ kod uyumu ✅ |
| 11.2 | **Ben** | Yasal onay Firestore kaydı ✅ |
| 11.3 | **Ben** | Tam hesap silme (CF callable) ✅ |

---

## ADIM 12 — Canlı yayın

| Kod | Kim | İş |
|-----|-----|-----|
| 12.1 | **Sen** | Open beta track |
| 12.2 | **Sen** | Production release |
| 12.3 | **Ben** | Sentry production + son regresyon ✅ — `ADIM_12_3_SENTRY_REGRESSION.md` |
