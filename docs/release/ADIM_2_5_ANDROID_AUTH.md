# ADIM 2.5 — Android TWA Google Sign-In

PlayMeet Firebase Auth: **Google provider** (`signInWithPopup` / `signInWithRedirect`).

## Uygulama davranışı (kod)

| Ortam | Yöntem | Dosya |
|-------|--------|-------|
| Desktop / iOS / Chrome tab | `signInWithPopup` | `firebaseAuth.ts` |
| Android TWA (standalone / `android-app://`) | `signInWithRedirect` | `firebaseAuth.ts` + `androidTwa.ts` |

Redirect dönüşü: `handleGoogleRedirectResult()` → `useAuthSession.ts` (app açılışında bir kez).

TWA algılama:

- `display-mode: standalone` veya `fullscreen`
- `document.referrer` → `android-app://...`

---

## Firebase Console (zorunlu)

### 1. Authorized domains

Authentication → Settings → **Authorized domains**:

- `localhost` (dev)
- Firebase Hosting: `<project-id>.web.app`
- Firebase Hosting: `<project-id>.firebaseapp.com`
- Custom domain varsa: `playmeet.app`

### 2. Android OAuth client

Project settings → **Add app → Android**:

| Alan | Değer |
|------|-------|
| Package name | `app.playmeet.twa` |
| SHA-1 | Upload keystore (ADIM 2.2) |
| SHA-256 | Upload keystore (ADIM 2.2) |

Web SDK kullanıldığı için `google-services.json` **gerekmez**.

### 3. OAuth consent screen (Google Cloud)

- User type: External (test → production)
- Scopes: `email`, `profile`, `openid` (Firebase default)

---

## TWA / Bubblewrap ayarları

`android/twa-manifest.json`:

```json
"fallbackType": "customtabs"
```

Custom Tabs, Google OAuth için WebView’dan daha güvenilir. **WebView fallback kullanma.**

Digital Asset Links (ADIM 2.2) doğrulanmazsa TWA tarayıcı modunda açılır → giriş yine çalışabilir ama UX bozulur.

---

## Test checklist (fiziksel Android)

| # | Senaryo | Beklenen |
|---|---------|----------|
| T1 | TWA ilk açılış → Google giriş | Redirect → Google → uygulama → ana ekran |
| T2 | Giriş sonrası kapat/aç | Oturum kalır (`browserLocalPersistence`) |
| T3 | Çıkış → tekrar giriş | `/welcome` → giriş OK |
| T4 | Koşullar onayı olmadan giriş | Engellenir |
| T5 | Chrome’da PWA (Add to Home) | Popup akışı |
| T6 | Desktop Chrome | Popup akışı |

---

## Sık hatalar

| Belirti | Olası neden | Çözüm |
|---------|-------------|-------|
| `auth/unauthorized-domain` | Domain authorized listesinde yok | Firebase Auth domains |
| Popup blocked (Android) | Eski build / WebView | Redirect build deploy et (2.5 kodu) |
| Redirect loop | `getRedirectResult` çağrılmıyor | `useAuthSession` güncel mi |
| `auth/operation-not-allowed` | Google provider kapalı | Firebase Console → Auth |
| Giriş OK ama Firestore 403 | Rules / App Check | ADIM 3 |
| TWA dış link açılıyor | assetlinks hatalı | ADIM 2.2 + deploy |

---

## Popup vs redirect — neden?

| | Popup | Redirect |
|---|--------|----------|
| UX | Sayfa yerinde kalır | Tam sayfa Google → geri dönüş |
| Desktop | ✅ İdeal | Gereksiz |
| Android TWA | ⚠️ Custom Tab edge case | ✅ Daha güvenilir |
| iOS Safari | Popup bazen sorunlu | Redirect alternatif (şu an popup) |

---

## Dev test (redirect simülasyonu)

Chrome DevTools → Application → manifest → **standalone** simülasyonu sınırlı. Gerçek test **fiziksel cihaz + AAB** ile yap.

---

Sıradaki: **ADIM 2.6** — Internal/Closed test (`ADIM_2_6_CLOSED_TEST.md`).
