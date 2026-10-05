# ADIM 3.5 — Storage Photos Scoped Read

## Değişiklik

`users/{userId}/photos/*` artık **tüm giriş yapmış kullanıcılara açık değil**.

| İşlem | Kim okuyabilir |
|-------|----------------|
| **read** | Foto sahibi · `onboardingCompleted` profiller (keşfet) · eşleşme partneri |

Firestore `users` (3.1) ve `matches` (mevcut) kurallarıyla aynı mantık; Storage rules **Firestore cross-service** kullanır:

- `firestore.get(.../users/{userId})` → keşfet
- `firestore.exists(.../matches/{matchId})` → eşleşme partneri

## Engellenen erişim

- Onboarding tamamlamamış kullanıcının fotoğrafı (sahip hariç)
- Eşleşme olmayan kullanıcının fotoğrafı (keşfette görünmeyen profil)
- Oturumsuz okuma

## Bilinen sınırlar

| Konu | Not |
|------|-----|
| Eski `getDownloadURL` token'ları | Süresi dolana kadar çalışabilir; yeni URL istekleri kurallara tabi |
| App Check Storage enforce | Console'da ayrı — `ADIM_3_3_APPCHECK.md` |
| Rules `hasAppCheck()` | ADIM 3.6 ✅ — deploy: `ADIM_3_6_APPCHECK_RULES.md` |

## Doğrula

```powershell
npm run validate:storage-rules
npm run validate:firestore-rules
```

## Deploy (ADIM 3.4 ile birlikte)

```powershell
npm run deploy:security
```

Storage rules `deploy:security` içinde zaten deploy edilir.

## 2 hesap test

| # | Senaryo | Beklenen |
|---|---------|----------|
| ST1 | A keşfette B fotoğrafı görür | OK |
| ST2 | A ↔ B eşleşme sonrası chat profil foto | OK |
| ST3 | A kendi onboarding foto yükler | OK |
| ST4 | C, onboarding yarım D'nin Storage path'ine doğrudan erişim (Console / SDK) | 403 |

Checklist: **`SECURITY_TEST_CHECKLIST.md`** (S13–S14)

---

Sıradaki: **ADIM 3.7** (sen — enforce + deploy) veya **ADIM 4.1** (Cloud Functions)
