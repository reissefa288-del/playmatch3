# PlayMeet — Play Console Data Safety Cevapları

Kod tabanı analizine göre (Haziran 2026). Formu doldururken yalnızca **gerçekten toplanan** verileri işaretleyin.

## Veri toplanıyor mu?

**Evet**

## Toplanan veri türleri

### Kişisel bilgiler

| Tür | Toplanıyor | Zorunlu | Amaç |
|-----|------------|---------|------|
| Ad | Evet | Evet (Google giriş) | Hesap, profil |
| E-posta adresi | Evet | Evet (Google giriş) | Hesap, destek |
| Kullanıcı kimliği | Evet | Evet | Firebase UID |
| Fotoğraflar | Evet | Hayır (onboarding) | Profil |

### Uygulama etkinliği

| Tür | Toplanıyor | Amaç |
|-----|------------|------|
| Uygulama etkileşimleri | Evet | Beğeni, eşleşme, engelleme, rapor |
| Diğer kullanıcı oluşturulan içerik | Evet | Mesajlar, profil bio |

### Mesajlar

| Tür | Toplanıyor | Amaç |
|-----|------------|------|
| Diğer mesajlar (sohbet) | Evet | Eşleşme sonrası mesajlaşma |

### Uygulama bilgisi ve performans

| Tür | Toplanıyor | Koşul |
|-----|------------|-------|
| Çökme logları | İsteğe bağlı | `VITE_SENTRY_DSN` ayarlıysa |
| Teşhis | İsteğe bağlı | Sentry/RUM açıksa |

### Toplanmayan (işaretleme)

| Tür | Durum |
|-----|-------|
| Kesin konum / yaklaşık konum | Hayır (GPS kodu yok) |
| Finansal bilgi | Hayır (gerçek ödeme yok) |
| Sağlık bilgisi | Hayır |
| Cinsel yönelim | Hayır |
| Telefon numarası | Hayır |

## Veri paylaşılıyor mu?

**Evet** — hizmet sağlayıcılarla:

| Alıcı | Veri | Amaç |
|-------|------|------|
| Google (Firebase Auth) | E-posta, ad, UID | Kimlik doğrulama |
| Google (Firestore/Storage) | Profil, mesaj, fotoğraf | Backend |
| Sentry (opsiyonel) | Çökme, performans | Hata izleme |

Üçüncü taraflara **satış** yok.

## Güvenlik uygulamaları

- [x] Aktarımda şifreleme (HTTPS/TLS)
- [x] Kullanıcı hesap silme talebi (in-app)

## Hesap oluşturma

**Evet** — Google ile giriş zorunlu.

## Hesap silme

**Evet** — Profil → Hesap → Hesabımı Sil.

Silinen: Auth hesabı, `users/{uid}`, profil fotoğrafları, outgoing likes, blocks, dailyLikes.

Saklanabilir: eşleşme/mesaj kayıtları (yasal saklama; anonim), reports (moderasyon).

## Hedef kitle

**18 yaş ve üzeri** — çocuklara yönelik değil.

## Gizlilik politikası URL

```
https://playmeet.app/legal/gizlilik-politikasi
```

(Domain deploy sonrası güncelleyin.)

## Destek e-posta

```
destek@playmeet.app
```
