# ADIM 12.3 — Sentry Production + Son Regresyon

Canlı yayın (12.1 open beta → 12.2 production) öncesi agent tarafı tamamlandı.

---

## Otomatik regresyon

```powershell
npm run release:regression
```

Kapsam: production build, Firebase/rules/functions doğrulama, dist, RUM/Sentry wiring, bundle + medya bütçeleri, Lighthouse regression guard.

Dist zaten güncelse:

```powershell
npm run release:regression -- --skip-build
```

---

## Sentry kurulumu (sen)

1. [sentry.io](https://sentry.io) → **Create Project** → Platform: **React**
2. DSN kopyala → `.env.production`:

```env
VITE_SENTRY_DSN=https://xxxx@oXXXX.ingest.sentry.io/XXXX
VITE_RUM_SAMPLE_RATE=0.05
# Opsiyonel CI/CD sürüm etiketi:
# VITE_APP_RELEASE=playmeet@1.0.0
```

3. Production build + deploy:

```powershell
npm run deploy:hosting
```

4. Sentry → **Performance** → Web Vitals:
   - LCP p75 hedef: ≤ 2500 ms
   - INP p75 hedef: ≤ 200 ms
   - CLS p75 hedef: ≤ 0.1

5. Sentry → **Issues**: `AppErrorBoundary` yakalanan render hataları

---

## İstemci davranışı

| Özellik | Davranış |
|---------|----------|
| Sentry init | `VITE_SENTRY_DSN` varsa **tüm** oturumlarda (hata yakalama) |
| Trace / INP | %5 örnekleme (`VITE_RUM_SAMPLE_RATE`, varsayılan 0.05) |
| Custom RUM beacon | `VITE_RUM_ENDPOINT` + %5 örnekleme, `pagehide` flush |
| Release | `playmeet@<package.version>` veya `VITE_APP_RELEASE` |
| Error boundary | `AppErrorBoundary` → `Sentry.captureException` |

Kod: `src/shared/initProductionMonitoring.ts`, `src/components/AppErrorBoundary.tsx`

---

## Manuel son regresyon (30 dk)

Deploy sonrası `ADIM_1_6_SMOKE_CHECKLIST.md` + ek:

### P0 — Auth & core
- [ ] Google giriş (web + TWA)
- [ ] Onboarding tamamlama → keşfet
- [ ] Like → match (functions deploy)
- [ ] Chat mesaj gönder/al
- [ ] Hesap silme callable (11.3)

### P1 — Konum & KVKK
- [ ] Konum rızası sheet → yakındakiler (gerçek veya demo banner)
- [ ] Gizlilik / kullanım koşulları linkleri

### P2 — Premium & push
- [ ] Premium UI (8.1 kapalı test modu)
- [ ] Push izni + match bildirimi (9.3 FCM Console)

### P3 — Oyun smoke (1 oyun yeterli)
- [ ] Oyun lobby açılışı
- [ ] Duel başlat / bitir (1942 veya XOX)

### P4 — Monitoring
- [ ] Sentry'de test hatası veya performans span görünüyor
- [ ] Functions `health` endpoint 200

---

## Play Console (12.1 / 12.2 — sen)

| Adım | Rehber |
|------|--------|
| Open beta | Play Console → Testing → Open testing |
| Production | Closed/open test onayı sonrası Production track |

Store listing: `ADIM_2_4_PLAY_CONSOLE.md` · Kapalı test: `ADIM_2_6_CLOSED_TEST.md`

---

## Deploy sırası (önerilen)

```
npm run release:regression
npm run deploy:functions
npm run deploy:firebase
npm run post-deploy:smoke
→ Manuel checklist (üstte)
→ Play Console track yükselt (12.1 / 12.2)
```
