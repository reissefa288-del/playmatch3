# ADIM 4.4 — Hesap Silme Cascade

Firebase Auth `deleteUser()` sonrası **`cascadeDeleteAccount`** trigger temizler.

## Silinen veriler

| Koleksiyon | Kapsam |
|------------|--------|
| `likes` | fromUid veya toUid |
| `matches` + `messages` | userA veya userB |
| `blocks` | blocker veya blocked |
| `dailyLikes/{uid}` | doküman |
| `users/{uid}` | profil |
| Storage | `users/{uid}/photos/*` |

`reports` moderasyon için **silinmez**.

## Client

`deletePlayMeetAccount` yalnızca Auth `deleteUser()` çağırır — cascade CF'de.

## Deploy

```powershell
npm run deploy:functions
```

## Test

| # | Senaryo | Beklenen |
|---|---------|----------|
| D1 | Profil → Hesabımı Sil | Auth silinir |
| D2 | Console: users, likes, matches | Temiz |
| D3 | Storage photos | Silinmiş |
| D4 | Aynı Google tekrar giriş | Yeni onboarding |

---

Sıradaki: **ADIM 4.5** (sen — Blaze deploy)
