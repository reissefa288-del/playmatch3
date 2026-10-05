# ADIM 3.4 — Rules Deploy + 2 Hesap Test

## 1. Preflight

```powershell
npm run security:preflight
```

## 2. Rules deploy

```powershell
npm run deploy:security
```

Firestore (3.1 users, 3.2 likes) + Storage rules birlikte deploy edilir.

Alternatif:

```powershell
npx firebase login
npx firebase use <project-id>
npm run validate:firestore-rules
npx firebase deploy --only firestore:rules,storage
```

## 3. App Check enforce (3.7 — Faz B sonrası)

Deploy rehberi: **`ADIM_3_7_ENFORCE_DEPLOY.md`**

1. Site key → `npm run deploy:app-check-rollout`
2. Console → Enforce (Firestore + Storage)
3. `npm run deploy:security`
4. 2 hesap testi tekrarla

## 4. İki hesap test

Checklist: **`SECURITY_TEST_CHECKLIST.md`**

Geniş senaryo: **`CLOSED_TEST_PLAN.md`**

### Minimum güvenlik testi (15 dk)

| # | Hesap | Aksiyon | Beklenen |
|---|-------|---------|----------|
| S1 | A | Keşfet aç | Profil kartları yüklenir |
| S2 | A | B'yi beğen | Başarılı |
| S3 | B | A'yı beğen | Eşleşme oluşur |
| S4 | A | B ile chat | Mesaj gider |
| S5 | A | Profil / onboarding | Kendi profili OK |
| S6 | A | Çıkış + giriş | Oturum OK |

### Rules-spesifik (Console — opsiyonel)

Firebase Console → Firestore → Rules playground:

- Auth user A → `get users/{B}` where B onboardingCompleted → **Allow**
- Auth user A → `get users/{B}` where B onboarding incomplete → **Deny**
- Auth user C → `get likes/{A_B}` (C taraf değil) → **Deny**

## 5. Regresyon

Deploy sonrası hızlı kontrol:

```powershell
npm run closed-test:preflight
```

Canlı URL:

- [ ] Google giriş
- [ ] Keşfet + like + match
- [ ] Chat
- [ ] Foto upload (Storage rules)
- [ ] Hesap silme

## Sık hatalar

| Hata | Çözüm |
|------|--------|
| `Missing or insufficient permissions` keşfet | Rules deploy edildi mi? Query `onboardingCompleted==true` |
| Match sonrası partner profil yok | 3.1 `isMatchPartner` — rules deploy |
| Like sonrası match yok | 3.2 reverse like get — rules deploy |
| Storage upload 403 | `deploy:security` storage rules dahil |
| App Check 403 after enforce | Site key + hosting redeploy |

---

**ADIM 3 tamamlandı** sayılır: deploy + S1–S6 + S13–S15 geçti.

Sıradaki agent: **ADIM 4.1** (Cloud Functions)
