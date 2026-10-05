# ADIM 1.5 — Firebase Deploy

## Ön koşul (ADIM 1.4)

```powershell
npm run firebase:verify-setup
```

Yeşil değilse önce `firebase/firebase-web-config.json` doldur → `npm run firebase:init-env`.

---

## Deploy (sırayla)

### 1. Firebase CLI girişi

```powershell
npx firebase login
```

Tarayıcıda Google hesabınla giriş yap (PlayMeet Firebase projesine erişimi olan hesap).

### 2. Proje seçimi (init-env sonrası genelde gerekmez)

```powershell
npx firebase use <project-id>
```

### 3. Preflight

```powershell
npm run deploy:preflight
```

### 4. Tam deploy (Hosting + Firestore rules + Storage rules)

```powershell
npm run deploy:firebase
```

Bu komut sırayla: preflight → production build → `validate:dist` → Firebase deploy.

---

## Deploy sonrası (hemen)

```powershell
npm run post-deploy:smoke
```

Manuel checklist: **`ADIM_1_6_SMOKE_CHECKLIST.md`**

1. **Hosting URL** aç: `https://<project-id>.web.app`
2. Firebase Console → Authentication → Authorized domains → bu URL'yi ekle
3. Google giriş dene
4. İki test hesabıyla keşfet / like / match / chat dene

---

## Parçalı deploy

| Komut | Ne deploy eder |
|-------|----------------|
| `npm run deploy:rules` | Sadece Firestore + Storage rules |
| `npm run deploy:hosting` | Sadece Hosting (build dahil) |

---

## Sık hatalar

| Hata | Çözüm |
|------|--------|
| `Invalid project id: YOUR_FIREBASE...` | `npm run firebase:init-env` |
| `Missing production Firebase env` | ADIM 1.4 |
| `HTTP Error: 403` deploy | `npx firebase login` + proje erişimi |
| Google auth `unauthorized-domain` | Authorized domains'e `.web.app` ekle |

---

Deploy bittikten sonra: **`ADIM_1_6_SMOKE_CHECKLIST.md`**
