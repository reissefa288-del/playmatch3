import type { LegalDocument } from '../types'

export const privacyPolicy: LegalDocument = {
  id: 'privacy',
  title: 'Gizlilik Politikası',
  subtitle: 'Kişisel verilerinizin korunması ve KVKK aydınlatması',
  updatedAt: '18 Ekim 2026',
  sections: [
    {
      id: 'controller',
      title: '1. Veri Sorumlusu',
      paragraphs: [
        'Bu Gizlilik Politikası, Google Play’de yayınlanan PlayMeet uygulaması (paket adı: app.playmeet.twa) ile web sürümü için geçerlidir.',
        '6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) kapsamında veri sorumlusu PlayMeet’tir.',
        'Kişisel verileriniz; hizmet sunumu, güvenlik, yasal yükümlülükler ve meşru menfaatlerimiz doğrultusunda aşağıda açıklanan ilkelere uygun işlenir.',
        'Gizlilik iletişimi: destek@playmeet.app',
      ],
    },
    {
      id: 'scope',
      title: '2. Kapsam',
      paragraphs: [
        'Bu politika; PlayMeet Android (Trusted Web Activity), web uygulaması ve bunlara bağlı bulut hizmetlerini kullanırken erişilen, toplanan, kullanılan ve paylaşılan kişisel ve cihaz verilerini kapsar.',
        'Uygulamayı veya hizmeti kullanarak bu politikayı okuduğunuzu kabul etmiş olursunuz.',
      ],
    },
    {
      id: 'collected',
      title: '3. Toplanan Veriler',
      paragraphs: [
        'Hizmeti kullanmanıza bağlı olarak aşağıdaki veri kategorileri işlenebilir:',
      ],
      bullets: [
        'Kimlik ve hesap: Google hesabınızdan alınan ad, e-posta adresi, profil fotoğrafı (OAuth ile giriş seçerseniz), kullanıcı kimliği',
        'Profil: yaş, cinsiyet, biyografi, ilgi alanları, oyun tercihleri, yüklediğiniz fotoğraflar, seviye ve rozet bilgileri',
        'Konum: açık rıza ile yaklaşık GPS koordinatları (geohash) ve isteğe bağlı şehir — yalnızca konum paylaşımını açtığında',
        'Etkileşim: beğeni, eşleşme, engelleme, raporlama, profil ziyaretleri, mesajlaşma içerikleri ve zaman damgaları',
        'Oyun: oyun skorları, düello geçmişi, seviye ilerlemesi ve oyun içi istatistikler',
        'Ödeme: abonelik durumu, satın alma geçmişi (ödeme kartı bilgileri doğrudan PlayMeet tarafından saklanmaz; mağaza/ödeme sağlayıcısı işler)',
        'Teknik: cihaz modeli, işletim sistemi, uygulama sürümü, dil, IP adresi, çökme kayıtları, oturum ve güvenlik logları',
        'Tercihler: bildirim ayarları, filtre tercihleri (ör. cinsiyet), premium durumu',
      ],
    },
    {
      id: 'purposes',
      title: '4. İşleme Amaçları',
      paragraphs: [
        'Kişisel verileriniz şu amaçlarla işlenir:',
      ],
      bullets: [
        'Hesap oluşturma, kimlik doğrulama ve oturum yönetimi',
        'Profil ve eşleşme hizmetlerinin sunulması',
        'Mesajlaşma, oyun düelloları ve sosyal keşif özelliklerinin çalıştırılması',
        'Günlük beğeni limiti, boost ve premium özelliklerin yönetimi',
        'Güvenlik, spam/dolandırıcılık önleme, moderasyon ve ihlal incelemesi',
        'Abonelik ve uygulama içi satın almaların yürütülmesi',
        'Uygulama performansının iyileştirilmesi, hata analizi ve kullanıcı deneyimi geliştirme',
        'Yasal yükümlülüklerin yerine getirilmesi ve yetkili makam taleplerine yanıt',
        'Açık rızanız olması hâlinde pazarlama bildirimleri',
      ],
    },
    {
      id: 'legal-basis',
      title: '5. Hukuki Sebepler (KVKK md. 5 ve 6)',
      paragraphs: [
        'Veri işleme faaliyetlerimiz; sözleşmenin kurulması veya ifası, hukuki yükümlülük, bir hakkın tesisi/korunması veya meşru menfaat hukuki sebeplerine dayanır. Özel nitelikli kişisel veri işlenmesi söz konusu olursa ayrıca açık rızanız alınır.',
        'Pazarlama iletişimi ve isteğe bağlı konum paylaşımı gibi faaliyetler için açık rıza talep edilebilir; rızanızı dilediğiniz zaman geri çekebilirsiniz.',
      ],
    },
    {
      id: 'sharing',
      title: '6. Verilerin Aktarımı ve Üçüncü Taraflar',
      paragraphs: [
        'Verilerinizi satmayız. Yalnızca hizmetin çalışması için gerekli olduğu ölçüde ve güvenlik önlemleriyle paylaşırız:',
      ],
      bullets: [
        'Google Firebase Authentication: Google ile giriş (ad, e-posta, profil fotoğrafı, kullanıcı kimliği)',
        'Google Cloud Firestore / Firebase Storage / Firebase Hosting: profil, mesaj, fotoğraf ve uygulama verilerinin barındırılması',
        'Google Play: uygulama dağıtımı ve (açılırsa) uygulama içi satın alma / abonelik işlemleri',
        'Firebase App Check ve güvenlik servisleri: kötüye kullanım ve bot koruması',
        'Sentry veya benzeri hata izleme (yapılandırılmışsa): çökme ve teşhis verileri',
        'Hukuki zorunluluk hâlinde yetkili kamu kurum ve kuruluşları',
      ],
    },
    {
      id: 'international',
      title: '7. Yurt Dışına Aktarım',
      paragraphs: [
        'Altyapı veya hizmet sağlayıcılarımız yurt dışında bulunuyorsa, KVKK md. 9 kapsamında yeterli korumanın bulunduğu ülkelere aktarım yapılabilir veya açık rızanız alınır. Aktarım yapılan taraflarla veri işleme sözleşmeleri yürütülür.',
      ],
    },
    {
      id: 'retention',
      title: '8. Saklama Süreleri',
      paragraphs: [
        'Kişisel veriler, işleme amacının gerektirdiği süre boyunca saklanır. Hesabınızı sildiğinizde profil, fotoğraflar, beğeniler, eşleşmeler ve mesajlar silinir; moderasyon şikayet kayıtları ve güvenlik logları yasal süreler boyunca saklanabilir.',
        'Örnek: moderasyon kayıtları ve güvenlik logları genellikle 1–3 yıl; mali kayıtlar ilgili mevzuat gereği daha uzun süre tutulabilir.',
      ],
    },
    {
      id: 'security',
      title: '9. Güvenlik',
      paragraphs: [
        'Verilerinizi korumak için şifreleme, erişim kontrolü, güvenli oturum yönetimi ve düzenli güvenlik değerlendirmeleri uygulanır. Hiçbir sistem %100 güvenli değildir; şüpheli bir durum fark ederseniz derhal bize bildirmenizi rica ederiz.',
      ],
    },
    {
      id: 'rights',
      title: '10. KVKK Kapsamındaki Haklarınız',
      paragraphs: [
        'KVKK md. 11 uyarınca veri sorumlusuna başvurarak aşağıdaki haklarınızı kullanabilirsiniz:',
      ],
      bullets: [
        'Kişisel verilerinizin işlenip işlenmediğini öğrenme',
        'İşlenmişse buna ilişkin bilgi talep etme',
        'İşleme amacını ve amaca uygun kullanılıp kullanılmadığını öğrenme',
        'Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme',
        'Eksik veya yanlış işlenmişse düzeltilmesini isteme',
        'KVKK md. 7 kapsamında silinmesini veya yok edilmesini isteme',
        'Düzeltme/silme işlemlerinin aktarıldığı üçüncü kişilere bildirilmesini isteme',
        'Otomatik analiz sonucu aleyhinize bir sonuç çıkmasına itiraz etme',
        'Kanuna aykırı işleme nedeniyle zarara uğramanız hâlinde tazminat talep etme',
      ],
    },
    {
      id: 'application',
      title: '11. Başvuru Yöntemi',
      paragraphs: [
        'Haklarınızı kullanmak için destek@playmeet.app adresine kimliğinizi doğrulayacak bilgilerle başvurabilirsiniz. Talepler en geç 30 gün içinde sonuçlandırılır.',
        'Başvurunuz reddedilir, verilen cevap yetersiz bulunursa veya süresinde yanıt alamazsanız Kişisel Verileri Koruma Kurulu’na şikâyet hakkınız vardır.',
      ],
    },
    {
      id: 'account-deletion',
      title: '12. Hesap ve Veri Silme',
      paragraphs: [
        'PlayMeet hesap oluşturmayı destekler. Hesabınızı ve ilişkili kişisel verilerinizi silmek için uygulama içinde Profil → Hesap → Hesabımı Sil yolunu kullanabilir veya destek@playmeet.app adresine yazabilirsiniz.',
        'Silme talebi üzerine Google hesap oturumunuz, kullanıcı profiliniz, yüklediğiniz fotoğraflar, gönderdiğiniz beğeniler, engellemeler ve ilgili hesap verileri silinir veya kimliksizleştirilir. Yasal saklama zorunluluğu olan moderasyon/güvenlik kayıtları gerekli süre boyunca tutulabilir; bunlar hesap dondurma yerine kalıcı silme sürecinin parçasıdır.',
      ],
    },
    {
      id: 'children',
      title: '13. Çocukların Gizliliği',
      paragraphs: [
        'PlayMeet yalnızca 18 yaş ve üzeri kullanıcılara yöneliktir; çocuklara yönelik bir uygulama değildir. Bilerek reşit olmayanlardan veri toplamayız. Böyle bir durum fark edilirse ilgili veriler silinir ve hesap kapatılır.',
      ],
    },
    {
      id: 'cookies',
      title: '14. Çerezler ve Yerel Depolama',
      paragraphs: [
        'Web sürümünde oturum ve tercihlerinizi hatırlamak için çerezler kullanılabilir. Android TWA / mobil web görünümünde benzer amaçla yerel depolama (localStorage, cihaz hafızası) kullanılabilir. Tarayıcı ayarlarından çerezleri yönetebilirsiniz; bazı özellikler devre dışı kalabilir.',
      ],
    },
    {
      id: 'changes',
      title: '15. Politika Değişiklikleri',
      paragraphs: [
        'Bu Gizlilik Politikası güncellenebilir. Önemli değişiklikler uygulama içi bildirim veya e-posta ile duyurulur. Güncel sürüm her zaman uygulama içinden ve genel erişilebilir URL üzerinden okunabilir olacaktır.',
      ],
    },
    {
      id: 'contact',
      title: '16. İletişim',
      paragraphs: [
        'Gizlilik ve kişisel verileriniz hakkında: destek@playmeet.app',
        'Uygulama: PlayMeet (app.playmeet.twa) — Türkiye',
      ],
    },
  ],
}
