# ADIM 3.2 — Firestore Likes Scoped Read

## Değişiklik

`likes/{likeId}` artık tüm authenticated kullanıcılara açık değil.

| İşlem | Kim okuyabilir |
|-------|----------------|
| **get** | Beğeninin `fromUid` veya `toUid` tarafı |
| **list** | Sadece `fromUid == auth.uid` (kendi gönderdiğin beğeniler) |

## Uygulama uyumu

| Kod | Sorgu | Rules |
|-----|-------|-------|
| `fetchOutgoingLikeTargets` | `where('fromUid', '==', uid)` | list ✓ |
| `sendFirestoreLike` reverse check | `getDoc(to_from)` | get — `toUid == auth.uid` ✓ |
| `hasFirestoreLike` | `getDoc(from_to)` | get — `fromUid == auth.uid` ✓ |
| Hesap silme | `where('fromUid', '==', uid)` | list ✓ |

Karşılıklı eşleşme kontrolü: A, B→A beğenisini okur (`toUid == A`) — izinli.

## Engellenen erişim

- Üçüncü taraf C, A→B beğenisini okuyamaz
- Tüm `likes` koleksiyonu taraması
- `where('toUid', '==', uid)` list sorgusu (uygulamada yok; ileride Cloud Function gerekir)

## Doğrula

```powershell
npm run validate:firestore-rules
```

## Deploy (ADIM 3.4)

```powershell
npm run deploy:rules
```

Test (2 hesap):

- [ ] A, B'yi beğenir
- [ ] B, A'yı beğenir → eşleşme oluşur
- [ ] Keşfet / günlük limit normal
- [ ] Hesap silme çalışır
