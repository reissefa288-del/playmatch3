# ADIM 2.2 — Upload Keystore + SHA-256

## 1. Keystore oluştur (bir kez, yedekle)

```powershell
keytool -genkeypair -v `
  -keystore android/playmeet-upload.keystore `
  -alias playmeet `
  -keyalg RSA -keysize 2048 -validity 10000
```

- Şifreyi güvenli yerde sakla (Play Console + Bubblewrap build için gerekir)
- Keystore **asla** git'e commit edilmez

## 2. SHA-256 çıkar ve uygula (otomatik)

```powershell
npm run twa:fingerprint -- --keystore android/playmeet-upload.keystore --alias playmeet
npm run twa:apply-fingerprint
npm run validate:twa
```

Manuel alternatif: fingerprint'i `android/upload-fingerprint.txt` dosyasına yapıştır → `npm run twa:apply-fingerprint`

## 3. Hosting'e deploy

```powershell
npm run deploy:hosting
```

Canlı doğrula: `https://<host>/.well-known/assetlinks.json`

## 4. Firebase Console

Project settings → Add app → **Android**

- Package: `app.playmeet.twa`
- SHA-1 ve SHA-256 (upload key) ekle

SHA-1 için:

```powershell
keytool -list -v -keystore android/playmeet-upload.keystore -alias playmeet
```

## 5. Play Console

Play App Signing etkin — upload key ile AAB yüklersin, Google dağıtım anahtarını yönetir.

---

Sıradaki: **ADIM 2.3** — Bubblewrap init + AAB build (`android/README.md`)
