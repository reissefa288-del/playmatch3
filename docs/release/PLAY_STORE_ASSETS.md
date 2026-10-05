# PlayMeet — Play Store Asset Listesi

## Repo içinde hazır

| Asset | Dosya | Durum |
|-------|-------|-------|
| PWA icon 192 | `public/icons/icon-192.png` | ✅ |
| PWA icon 512 | `public/icons/icon-512.png` | ✅ |
| Maskable 512 | `public/icons/icon-maskable-512.png` | ✅ |
| Play Store icon 512 | `store-assets/play-store-icon-512.png` | ✅ (kopya) |
| Favicon | `public/favicon.svg`, `public/favicon.png` | ✅ |
| Privacy URL path | `/legal/gizlilik-politikasi` | ✅ (hosting gerekir) |
| Support email (metin) | `destek@playmeet.app` | ⚠️ Mailbox kurulmalı |

## Manuel oluşturulması gereken

| Asset | Boyut | Zorunlu | Not |
|-------|-------|---------|-----|
| Feature graphic | 1024 × 500 px | Evet | JPG/PNG, marka + slogan |
| Phone screenshots | Min 2, 16:9 veya 9:16 | Evet | Keşfet, match, chat ekranları |
| 7" tablet screenshots | İsteğe bağlı | Hayır | Kapalı test için opsiyonel |
| 10" tablet screenshots | İsteğe bağlı | Hayır | |
| Promo video | YouTube | Hayır | |
| Short description | Max 80 karakter | Evet | Play Console |
| Full description | Max 4000 karakter | Evet | Play Console |
| Native splash | TWA otomatik | 🟡 | `background_color` #060818 |

## Önerilen store metinleri (taslak)

**Kısa (80 char):**
```
Oyun oynayarak tanış. Keşfet, eşleş, sohbet et. 18+ sosyal oyun platformu.
```

**Uzun:** Keşfet → eşleş → mesajlaş → mini oyunlar. 18+. Report/block/hesap silme.

## ADIM 2.4 (Play Console)

Rehber: `docs/release/ADIM_2_4_PLAY_CONSOLE.md`  
Metinler: `store-assets/STORE_LISTING.tr.md`  
Data Safety: `docs/release/DATA_SAFETY.md`

```powershell
npm run play:preflight-console
```
