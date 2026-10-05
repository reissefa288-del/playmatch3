# PlayMeet — Kapalı Test Planı

Play Console kurulum: **`ADIM_2_6_CLOSED_TEST.md`**  
Güvenlik deploy (3.4): **`ADIM_3_4_DEPLOY_TEST.md`** · **`SECURITY_TEST_CHECKLIST.md`**  
App Check enforce (3.7): **`ADIM_3_7_ENFORCE_DEPLOY.md`**  
Ön kontrol: `npm run closed-test:preflight`

## Ön koşullar

- [ ] Production Firebase + rules deploy (`npm run deploy:security`)
- [ ] `https://<domain>` canlı
- [ ] 2 test Google hesabı (A ve B)
- [ ] Android cihaz + TWA APK/AAB veya Chrome PWA

---

## 1. Auth

| # | Senaryo | Beklenen |
|---|---------|----------|
| A1 | Google ile giriş | Onboarding veya ana ekrana yönlendirme |
| A2 | Koşullar + gizlilik onayı olmadan giriş | Engellenir |
| A3 | Çıkış yap | `/welcome` |
| A4 | Tekrar giriş | Oturum / profil yüklenir |

## 2. Onboarding

| # | Senaryo | Beklenen |
|---|---------|----------|
| O1 | Ad, yaş (18+), tercih, foto, ilgi, bio tamamla | Firestore `users/{uid}` oluşur |
| O2 | Yaş 17 | Hata mesajı |
| O3 | Onboarding sonrası ana ekran | Tab navigasyon çalışır |

## 3. Match

| # | Senaryo | Beklenen |
|---|---------|----------|
| M1 | Hesap A keşfette B'yi görür | Profil kartı |
| M2 | A, B'yi beğenir | Like kaydı |
| M3 | B, A'yı beğenir | `matches` dokümanı oluşur |
| M4 | Eşleşmelerim sekmesi | B listede |
| M5 | Günlük like limiti | 10 sonrası engel (premium yoksa) |

## 4. Chat

| # | Senaryo | Beklenen |
|---|---------|----------|
| C1 | A, B ile sohbet açar | Mesaj ekranı |
| C2 | A mesaj gönderir | B'de anlık görünür |
| C3 | B okur | `readAt` güncellenir |
| C4 | Eşleşmeyen kullanıcıya `/chat/{uid}` | `/chat` redirect |

## 5. Report

| # | Senaryo | Beklenen |
|---|---------|----------|
| R1 | Sohbet ⋮ → Şikayet Et | Form açılır |
| R2 | Keşfet profil ⋮ → Şikayet Et | Form açılır |
| R3 | Gönder | `reports` koleksiyonunda kayıt (Console) |

## 6. Block

| # | Senaryo | Beklenen |
|---|---------|----------|
| B1 | A, B'yi engeller | Başarılı |
| B2 | A keşfette B'yi görmez | Filtrelenmiş |
| B3 | A sohbeti açamaz | Redirect |
| B4 | A mesaj gönderemez | Hata / engel |

## 7. Delete Account

| # | Senaryo | Beklenen |
|---|---------|----------|
| D1 | Profil → Hesabımı Sil → onay | Auth silinir |
| D2 | `/welcome` yönlendirme | Oturum kapalı |
| D3 | Aynı Google ile tekrar giriş | Yeni onboarding |

## 8. Güvenlik (Rules + App Check — ADIM 3)

Deploy: `npm run deploy:security` · Detay: **`SECURITY_TEST_CHECKLIST.md`**

| # | Senaryo | Beklenen |
|---|---------|----------|
| SEC1 | Onboarding tamamlamamış C — keşfet listesinde | Görünmez (3.1 list scope) |
| SEC2 | A, B'nin tam profilini keşfette görür | OK |
| SEC3 | Match olmadan A, B'nin `users/{B}` raw get (Console playground) | Allow (onboardingCompleted) |
| SEC4 | C, A↔B like dokümanını get (C taraf değil) | Deny (3.2) |
| SEC5 | Match sonrası A, B partner profilini okur | OK (`isMatchPartner`) |
| SEC6 | Profil foto upload | Storage rules allow (owner) |
| SEC7 | App Check enforce açıkken giriş + keşfet | Çalışır (site key deploy edilmiş) |
| SEC8 | C, onboarding yarım D'nin `users/D/photos/*` okuma | Deny (3.5 Storage scoped) |

## Regresyon (hızlı)

- [ ] Oyun lobisi açılır (bot düello)
- [ ] Yasal sayfalar: `/legal/kullanim-kosullari`, `/legal/gizlilik-politikasi`
- [ ] Offline: auth hatası kullanıcı dostu

## Kabul kriteri

Tüm P0 senaryolar (A, O, M, C, R, B, D) **2 hesapla** Android cihazda geçerse kapalı teste çıkılabilir.
