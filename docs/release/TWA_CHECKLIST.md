# ADIM 2.1 — TWA Şablon Kontrolü

## Otomatik doğrulama

```powershell
npm run twa:sync-host
npm run validate:twa
```

## Dosyalar

| Dosya | Rol |
|-------|-----|
| `public/manifest.webmanifest` | PWA manifest (Bubblewrap kaynağı) |
| `android/twa-manifest.json` | Bubblewrap TWA config |
| `android/twa-host.json` | Canlı domain (`host`) |
| `public/.well-known/assetlinks.json` | Android ↔ web doğrulama |

## Host güncelleme

Custom domain yoksa Firebase default kullan:

```json
{ "host": "playmeet-prod-a1b2c.web.app" }
```

```powershell
npm run twa:sync-host
npm run validate:twa
npm run deploy:hosting
```

## ADIM 2.2 (sen)

```powershell
keytool -genkeypair -v -keystore android/playmeet-upload.keystore -alias playmeet -keyalg RSA -keysize 2048 -validity 10000
npm run twa:fingerprint -- --keystore android/playmeet-upload.keystore --alias playmeet
npm run twa:apply-fingerprint
npm run validate:twa
npm run deploy:hosting
```

Rehber: `ADIM_2_2_KEYSTORE.md`

## ADIM 2.3 (sen)

```powershell
npm run twa:preflight-build
npm run twa:init
copy android\signingKey.properties.example android\signingKey.properties
npm run twa:build
```

Rehber: `ADIM_2_3_BUBBLEWRAP.md`

## Sabitler (değiştirme)

- Package: `app.playmeet.twa`
- Theme/background: `#060818`
- Orientation: `portrait`
