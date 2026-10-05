import type { LegalDocument } from '../types'

export const privacyPolicy: LegalDocument = {
  id: 'privacy',
  title: 'Gizlilik Politikası',
  subtitle: 'Kişisel verilerinizin korunması ve KVKK aydınlatması',
  updatedAt: '2 Haziran 2026',
  sections: [
    {
      id: 'controller',
      title: '1. Veri Sorumlusu',
      paragraphs: [
        '6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) kapsamında veri sorumlusu PlayMeet’tir.',
        'Kişisel verileriniz; hizmet sunumu, güvenlik, yasal yükümlülükler ve meşru menfaatlerimiz doğrultusunda aşağıda açıklanan ilkelere uygun işlenir.',
        'İletişim: destek@playmeet.app',
      ],
    },
    {
      id: 'scope',
      title: '2. Kapsam',
      paragraphs: [
        'Bu politika; PlayMeet mobil uygulaması, web sürümü ve bunlara bağlı hizmetleri kullanırken toplanan kişisel verileri kapsar. Uygulamayı kullanarak bu politikayı okuduğunuzu kabul etmiş olursunuz.',
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
      title: '6. Verilerin Aktarımı',
      paragraphs: [
        'Verileriniz yalnızca gerekli olduğu ölçüde ve uygun güvenlik önlemleriyle paylaşılır:',
      ],
      bullets: [
        'Google: OAuth ile giriş hizmeti (Google Gizlilik Politikası geçerlidir)',
        'Bulut barındırma ve veritabanı sağlayıcıları',
        'Ödeme altyapısı sağlayıcıları (App Store, Google Play vb.)',
        'Analitik, çökme raporlama ve bildirim hizmeti sağlayıcıları',
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
      id: 'children',
      title: '12. Çocukların Gizliliği',
      paragraphs: [
        'PlayMeet 18 yaş altına yönelik değildir. Bilerek reşit olmayanlardan veri toplamayız. Böyle bir durum fark edilirse ilgili veriler silinir ve hesap kapatılır.',
      ],
    },
    {
      id: 'cookies',
      title: '13. Çerezler ve Yerel Depolama',
      paragraphs: [
        'Web sürümünde oturum ve tercihlerinizi hatırlamak için çerezler kullanılabilir. Mobil uygulamada benzer amaçla yerel depolama (localStorage, cihaz hafızası) kullanılabilir. Tarayıcı ayarlarından çerezleri yönetebilirsiniz; bazı özellikler devre dışı kalabilir.',
      ],
    },
    {
      id: 'changes',
      title: '14. Politika Değişiklikleri',
      paragraphs: [
        'Bu Gizlilik Politikası güncellenebilir. Önemli değişiklikler uygulama içi bildirim veya e-posta ile duyurulur. Güncel sürüm her zaman uygulama içinden erişilebilir olacaktır.',
      ],
    },
    {
      id: 'contact',
      title: '15. İletişim',
      paragraphs: [
        'Gizlilik ve kişisel verileriniz hakkında: destek@playmeet.app',
        'PlayMeet — Türkiye',
      ],
    },
  ],
}
