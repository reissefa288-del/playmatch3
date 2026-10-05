# ADIM 9.1 — FCM Web Push

Eşleşme ve mesaj bildirimleri: istemci token kaydı + Cloud Functions tetikleyicileri.

---

## Mimari

```
İstemci (PushNotificationBridge)
  → getToken(VAPID) → users/{uid}/fcmTokens/{hash}

Cloud Functions
  onMatchCreatedPush   → matches/{id} create
  onMessageCreatedPush → matches/{id}/messages/{id} create
  → Admin SDK sendEachForMulticast
```

Service Worker (`dist/sw.js`): `push` + `notificationclick` → `/chat/{partnerUid}` deep link.

---

## Senin adımların (Console)

### 1. Cloud Messaging etkin

Firebase Console → **Build** → **Cloud Messaging**  
(Web Push sertifikası / VAPID key pair oluştur)

### 2. VAPID key → env

Console → Project Settings → Cloud Messaging → **Web Push certificates** → Key pair

`.env.production`:

```env
VITE_FIREBASE_VAPID_KEY=BN...
```

(`VITE_FIREBASE_MESSAGING_SENDER_ID` zaten Firebase web config'te.)

### 3. Deploy

```powershell
npm run deploy:security    # fcmTokens rules
npm run deploy:functions   # onMatchCreatedPush, onMessageCreatedPush
npm run deploy:firebase      # hosting + sw.js push handlers
```

---

## Kod özeti

| Dosya | Rol |
|-------|-----|
| `src/features/push/fcmClient.ts` | Token al/sync, foreground `onMessage` |
| `src/features/push/fcmTokenStore.ts` | Firestore token persist |
| `src/features/push/PushNotificationBridge.tsx` | Auth sonrası kayıt + SW mesajları |
| `functions/src/triggers/onPushNotifications.ts` | Match/message push |
| `vite/generateServiceWorker.ts` | Push + notificationclick |

---

## Test checklist

1. Production build (`npm run build:production`) + HTTPS hosting
2. İki test hesabı — bildirim izni ver (Chrome site ayarları)
3. Firestore: `users/{uid}/fcmTokens` doc oluştu mu?
4. Karşılıklı beğeni → **Yeni eşleşme!** bildirimi (her iki cihaz)
5. Mesaj gönder → alıcıda bildirim; tıkla → `/chat/{senderUid}`
6. Functions log: `onMatchCreatedPush`, `onMessageCreatedPush`

---

## Sorun giderme

| Belirti | Çözüm |
|---------|--------|
| Token yok | VAPID key eksik / HTTP (localhost hariç HTTPS gerekir) |
| Push gelmiyor | Functions deploy + Blaze plan |
| `messaging/registration-token-not-registered` | Token otomatik silinir; uygulamayı yeniden aç |
| iOS Safari | Web push kısıtlı — kapalı test Android TWA öncelikli |

---

## Sıradaki

| Kod | Kim | İş |
|-----|-----|-----|
| **9.2** | **Ben** | TWA notification bridge ✅ |
| **9.3** | **Sen** | Console FCM etkin + VAPID |
