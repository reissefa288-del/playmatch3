# ADIM 3.1 — Firestore Users Scoped Read

## Değişiklik

`users/{userId}` koleksiyonu artık **her authenticated kullanıcıya açık değil**.

| İşlem | Kim okuyabilir |
|-------|----------------|
| **get** (tek profil) | Sahibi · `onboardingCompleted` profiller (keşfet) · eşleşme partneri |
| **list** (sorgu) | Giriş yapmış · kendi hariç · sadece `onboardingCompleted == true` |

Keşfet sorgusu uyumlu:

```typescript
query(collection(db, 'users'), where('onboardingCompleted', '==', true))
```

Eşleşme listesi partner profili:

```typescript
getDoc(doc(db, 'users', partnerUid))  // match dokümanı varsa izinli
```

## Engellenen erişim

- Başkasının **onboarding tamamlanmamış** profili (`get` → 403)
- Rastgele `users` koleksiyonu taraması (list kuralı + sorgu filtresi)
- Oturumsuz okuma

## Bilinen sınırlar (sonraki adımlar)

| Konu | Durum |
|------|--------|
| `likes` herkese açık okuma | ADIM 3.2 ✅ |
| Keşfette `email` alanı görünür | İleride `publicProfile` alt koleksiyon |
| Engellenen kullanıcı rules filtresi | Client-side; rules'da list query kırılır |
| App Check | ADIM 3.3 ✅ (Console enforce sen) |

## Doğrula

```powershell
npm run validate:firestore-rules
```

## Deploy (ADIM 3.4 — sen)

```powershell
npm run deploy:rules
```

2 hesap test (`CLOSED_TEST_PLAN.md`):

- [ ] Keşfet kartları yüklenir
- [ ] Eşleşme sonrası partner profili görünür
- [ ] Kendi profil / onboarding kaydı çalışır
- [ ] Başka kullanıcının incomplete profiline doğrudan `get` → permission denied (Console test)
