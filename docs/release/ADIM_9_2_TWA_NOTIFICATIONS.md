# ADIM 9.2 — TWA Notification Bridge

Android TWA üzerinden web push bildirimleri ve deep link.

---

## Yapılandırma

`android/twa-manifest.json`:

```json
"enableNotifications": true
```

Bu bayrak Bubblewrap'a **Notification Delegation** ekler; TWA, web push bildirimlerini native Android bildirimi olarak gösterebilir.

---

## İstemci köprüsü

| Bileşen | Davranış |
|---------|----------|
| `detectFcmPlatform()` | `twa` vs `web` token etiketi |
| `PushNotificationBridge` | TWA'da izin isteği 1.5s (web 4s) |
| `sw.js` `notificationclick` | `postMessage` → React Router `/chat/:id` |
| `isTwaOrStandalone()` | TWA/standalone algılama |

Token Firestore: `platform: 'twa' | 'web'`

---

## Senin adımların

### 1. TWA yeniden derle

Hosting deploy sonrası (push çalışan HTTPS URL):

```powershell
npm run twa:sync-host
npm run twa:init      # mevcut projeyi günceller
npm run twa:build
```

`enableNotifications: true` değişikliği için **manifest yeniden generate** gerekir.

### 2. Android bildirim izni

Android 13+: uygulama ilk push'ta `POST_NOTIFICATIONS` isteyebilir.  
Test cihazında: Ayarlar → Uygulamalar → PlayMeet → Bildirimler → Açık

### 3. Test akışı

1. TWA APK/AAB yükle (internal test)
2. Giriş yap → bildirim izni ver
3. Başka hesaptan eşleş / mesaj at
4. Bildirime dokun → sohbet ekranı açılmalı

---

## Bilinen sınırlar

- Push **HTTPS** + geçerli VAPID (9.1) olmadan TWA bridge çalışmaz
- iOS PWA/TWA bu doküman kapsamı dışında
- Bubblewrap eski sürüm: `enableNotifications` desteklenmiyorsa CLI güncelle

---

## Sıradaki

| Kod | Kim | İş |
|-----|-----|-----|
| **9.3** | **Sen** | Firebase Cloud Messaging + VAPID (9.1 rehberi) |
