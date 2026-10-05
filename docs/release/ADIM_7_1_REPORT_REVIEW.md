# ADIM 7.1 — Report İnceleme Runbook

Moderasyon operasyonu: kullanıcı şikayetlerini Firebase Console üzerinden inceleme ve aksiyon alma rehberi.

---

## Veri modeli

Koleksiyon: `reports/{reportId}`

| Alan | Tip | Açıklama |
|------|-----|----------|
| `reporterUid` | string | Şikayet eden kullanıcı |
| `targetUid` | string | Şikayet edilen kullanıcı |
| `reason` | string | Önceden tanımlı sebep (UI listesi) |
| `details` | string | Opsiyonel açıklama (max 500 karakter) |
| `createdAt` | number | Unix ms |
| `source` | `'profile' \| 'chat'` | Keşfet profili veya sohbet |

Doc ID: `{reporterUid}_{targetUid}_{timestamp}`

**Rules:** istemci yalnızca `create`; okuma/güncelleme/silme kapalı → inceleme **Firebase Console** veya **Admin SDK** ile.

İlgili koleksiyonlar:

- `blocks/{blockerUid}_{blockedUid}` — kullanıcı engelleme
- `users/{uid}` — profil / hesap
- `matches/{matchId}` — eşleşme kanıtı (chat kaynağı için)

**Not:** Hesap silme cascade (`cascadeDeleteAccount`) report kayıtlarını **silmez** — moderasyon geçmişi korunur.

---

## Console erişimi

1. [Firebase Console](https://console.firebase.google.com) → projen → **Firestore Database**
2. Koleksiyon: `reports`
3. Sıralama: `createdAt` desc (manuel veya sorgu)

### Örnek sorgular (Firestore Console → Query)

| Amaç | Filtre |
|------|--------|
| Son 24 saat | `createdAt` > (şimdi − 86400000) |
| Belirli hedef | `targetUid` == `{uid}` |
| Belirli kaynak | `source` == `chat` |

---

## İnceleme checklist (her report)

1. **Kayıt bütünlüğü** — `reporterUid`, `targetUid`, `reason`, `createdAt` dolu mu?
2. **Tekrar şikayet** — Aynı çift için birden fazla report var mı? (pattern abuse)
3. **Hedef profil** — `users/{targetUid}`: onboarding tam mı, fotoğraf/bio uygun mu?
4. **Bağlam** — `source`:
   - `profile` → keşfet kartından
   - `chat` → aktif eşleşme sohbetinden; `matches` doc var mı kontrol et
5. **Engel durumu** — `blocks` içinde reporter → target veya tersi var mı?
6. **Karar** → aşağıdaki aksiyon matrisi

---

## Aksiyon matrisi

| Durum | Aksiyon |
|-------|---------|
| Açık ihlal yok / yanlış alarm | Kayıt bırak; gerekirse not (harici tablo) |
| Hafif ihlal (spam mesaj, uygunsuz bio) | Uyarı e-postası (manuel); profil düzenlemesi iste |
| Ciddi ihlal (taciz, sahte profil, reşit değil) | **Hesabı devre dışı bırak** (Auth disable) + profil gizle |
| Tekrarlayan şikayet aynı hedef | Öncelik yükselt; kalıcı ban değerlendir |

### Hesabı devre dışı bırakma (Console)

1. **Authentication** → Users → `{targetUid}` → **Disable account**
2. İsteğe bağlı: `users/{targetUid}` doc alanı ekle (Admin): `moderationStatus: 'suspended'`
3. Kapalı test notu: tester hesapları için geri açma prosedürü dokümante et

### Kalıcı silme (son çare)

1. Kullanıcı kendi silerse → `cascadeDeleteAccount` otomatik temizlik
2. Admin zorunlu silme → Auth delete user → aynı cascade tetiklenir
3. `reports` kayıtları **kalır** (KVKK saklama politikasına göre 6–24 ay)

---

## SLA (kapalı test)

| Metrik | Hedef |
|--------|-------|
| İlk inceleme | 48 saat içinde |
| Ciddi ihlal (güvenlik) | 4 saat içinde |
| Tester feedback | Haftalık özet |

---

## Kapalı test senaryoları

`CLOSED_TEST_PLAN.md` — **R3**:

1. İki test hesabı ile eşleş / keşfet
2. Moderation menüsünden **Şikayet et** → sebep + detay gönder
3. Console → `reports` koleksiyonunda yeni doc doğrula
4. Runbook checklist ile incele
5. Gerekirse test hesabını disable → uygulamada giriş engellendi mi kontrol et

---

## KVKK / saklama

- Report verisi **meşru menfaat** (platform güvenliği) kapsamında işlenir
- Gizlilik metni: `src/features/legal/content/privacyPolicy.ts`
- Silme talebi: reporter/target ayrı değerlendirilir; report audit için saklanabilir

---

## Sıradaki adım

| Kod | Kim | İş |
|-----|-----|-----|
| **7.2** | **Sen** | Haftalık Console moderasyon rutini (bu runbook) |
