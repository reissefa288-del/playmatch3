import type { LegalDocument } from '../types'

export const termsOfService: LegalDocument = {
  id: 'terms',
  title: 'Kullanım Koşulları',
  subtitle: 'PlayMeet mobil uygulaması ve ilgili hizmetler',
  updatedAt: '2 Haziran 2026',
  sections: [
    {
      id: 'intro',
      title: '1. Giriş ve Kabul',
      paragraphs: [
        'Bu Kullanım Koşulları (“Koşullar”), PlayMeet (“Uygulama”, “biz”, “bizim”) tarafından sunulan mobil uygulama, web arayüzü ve bağlı tüm hizmetlerin kullanımına ilişkin kuralları belirler.',
        'Uygulamaya kayıt olarak, giriş yaparak veya hizmetlerimizi kullanarak bu Koşulları, Gizlilik Politikamızı ve uygulama içi bildirimlerde yer alan ek kuralları okuduğunuzu, anladığınızı ve kabul ettiğinizi beyan etmiş olursunuz. Koşulları kabul etmiyorsanız Uygulamayı kullanmamalısınız.',
      ],
    },
    {
      id: 'service',
      title: '2. Hizmetin Tanımı',
      paragraphs: [
        'PlayMeet; oyun oynayarak ve sosyal keşif özellikleriyle yeni insanlarla tanışmayı bir araya getiren bir platformdur. Uygulama kapsamında profil oluşturma, eşleşme ve beğeni, mesajlaşma, yakındaki oyuncuları görüntüleme, çok oyunculu mini oyunlar (düello modları), seviye ve rozet sistemi, premium abonelik ve uygulama içi satın almalar sunulabilir.',
        'Hizmetlerin kapsamı zaman içinde güncellenebilir. Bazı özellikler bölgeye, cihaza veya abonelik durumuna göre farklılık gösterebilir.',
      ],
    },
    {
      id: 'eligibility',
      title: '3. Uygunluk ve Yaş Sınırı',
      paragraphs: [
        'PlayMeet yalnızca 18 yaşını doldurmuş kişilere yöneliktir. Kayıt sırasında bu şartı kabul etmiş sayılırsınız. Reşit olmadığınızın tespiti hâlinde hesabınız derhal kapatılabilir.',
        'Hesabınızı yalnızca kendiniz adına oluşturabilirsiniz. Bir kişi yalnızca bir aktif hesap açabilir; izinsiz çoğaltılmış veya sahte hesaplar kapatılabilir.',
      ],
    },
    {
      id: 'account',
      title: '4. Hesap ve Güvenlik',
      paragraphs: [
        'Google ile giriş dahil desteklenen kimlik doğrulama yöntemleriyle hesap oluşturabilirsiniz. Hesap bilgilerinizin gizliliğinden ve cihazınızdaki oturum güvenliğinden siz sorumlusunuz.',
        'Profilinizde paylaştığınız ad, fotoğraf, biyografi, konum bilgisi, oyun tercihleri ve benzeri içeriklerin doğruluğundan ve güncelliğinden siz sorumlusunuz. Yanıltıcı kimlik, başkasına ait fotoğraf veya sahte bilgi kullanımı yasaktır.',
      ],
    },
    {
      id: 'conduct',
      title: '5. Kabul Edilebilir Kullanım',
      paragraphs: [
        'PlayMeet’i yalnıca yürürlükteki mevzuata, bu Koşullara ve topluluk standartlarına uygun şekilde kullanmalısınız. Aşağıdaki davranışlar kesinlikle yasaktır:',
      ],
      bullets: [
        'Taciz, tehdit, nefret söylemi, ayrımcılık, cinsel taciz veya şiddet içeren mesaj ve içerikler',
        'Reşit olmayanları hedef alan veya onlarla iletişim kurmaya yönelik davranışlar',
        'Sahte profil, kimlik hırsızlığı veya dolandırıcılık',
        'Spam, istenmeyen ticari mesajlar veya otomatik bot kullanımı',
        'Uygulama güvenliğini zayıflatmaya yönelik girişimler, hile, exploit veya tersine mühendislik',
        'Başkalarının kişisel verilerini izinsiz toplama, paylaşma veya yayma',
        'Telif hakkı veya gizlilik haklarını ihlal eden içerik paylaşımı',
        'Platform dışına yönlendirerek ödeme, kişisel bilgi veya zararlı bağlantı talep etme',
      ],
    },
    {
      id: 'matching',
      title: '6. Eşleşme, Beğeni ve Mesajlaşma',
      paragraphs: [
        'Eşleşme ve keşif özellikleri size uygun profilleri göstermek için algoritmalar kullanabilir. Filtreler (örneğin cinsiyet tercihi) ve konum/il bilgisi bu amaçla işlenebilir. Günlük beğeni limiti, boost ve benzeri özellikler ücretsiz veya premium plana göre değişebilir.',
        'PlayMeet, kullanıcılar arasında kurulan iletişimin tarafı değildir. Mesajlaşma ve buluşma kararları tamamen kullanıcıların sorumluluğundadır. Gerçek hayatta buluşmadan önce kişisel güvenliğiniz için gerekli önlemleri almanızı öneririz.',
        'Raporlama ve engelleme araçlarını kullanarak uygunsuz davranışları bildirebilirsiniz. Bildirimler incelenir; ihlal tespit edilen hesaplar uyarı, geçici askıya alma veya kalıcı kapatma ile sonuçlanabilir.',
      ],
    },
    {
      id: 'games',
      title: '7. Oyunlar ve Düellolar',
      paragraphs: [
        'Uygulama içi oyunlar eğlence amaçlıdır. Skorlar, seviyeler ve sıralamalar adil oyun ilkesine göre değerlendirilir; hile, lag exploit veya haksız avantaj sağlayan yazılım kullanımı yasaktır.',
        'Oyun sonuçları profil veya eşleşme görünürlüğünü etkileyebilir. Teknik arızalar, bağlantı kesintileri veya bakım çalışmaları nedeniyle oyun verilerinde geçici aksaklıklar yaşanabilir; bu durumlarda makul düzeltme yapılabilir.',
      ],
    },
    {
      id: 'content',
      title: '8. Kullanıcı İçeriği',
      paragraphs: [
        'Yüklediğiniz fotoğraflar, metinler ve diğer içeriklerin yasal hakları size aittir. İçerik yükleyerek PlayMeet’e, hizmeti sunmak, geliştirmek, moderasyon yapmak ve tanıtmak amacıyla sınırlı, devredilebilir olmayan, alt lisanslanabilir bir kullanım hakkı vermiş olursunuz.',
        'Uygunsuz, müstehcen, şiddet içeren veya yasa dışı içerikler kaldırılabilir. Tekrarlayan ihlallerde hesabınız kalıcı olarak kapatılabilir.',
      ],
    },
    {
      id: 'premium',
      title: '9. Premium, Elmas ve Satın Almalar',
      paragraphs: [
        'PlayMeet Premium abonelikleri ve uygulama içi satın almalar (elmas, boost vb.) ilgili mağaza (App Store, Google Play) veya web ödeme altyapısı üzerinden işlenir. Fiyatlar, süreler ve paket içerikleri uygulama içinde gösterildiği şekilde geçerlidir.',
        'Abonelikler, mağaza kurallarına tabi olarak yenilenir veya iptal edilir. Kullanılmayan süreler için iade koşulları, platform politikası ve yürürlükteki tüketici mevzuatına göre uygulanır.',
        'Premium özellikler (sınırsız beğeni, profil ziyaretçilerini görme, boost, okundu bilgisi, reklamsız deneyim, özel rozet vb.) önceden haber verilmeksizin güncellenebilir.',
      ],
    },
    {
      id: 'ip',
      title: '10. Fikri Mülkiyet',
      paragraphs: [
        'PlayMeet adı, logosu, arayüz tasarımı, oyun varlıkları, yazılım kodu ve marka unsurları PlayMeet veya lisans verenlerine aittir. İzinsiz kopyalama, dağıtma veya ticari kullanım yasaktır.',
      ],
    },
    {
      id: 'termination',
      title: '11. Askıya Alma ve Fesih',
      paragraphs: [
        'Koşulları ihlal etmeniz, güvenlik riski oluşturmanız veya yasal zorunluluk hâlinde hesabınızı önceden bildirimde bulunmaksızın askıya alabilir veya kapatabiliriz.',
        'Hesabınızı dilediğiniz zaman uygulama ayarları veya destek kanalı üzerinden kapatma talebinde bulunabilirsiniz. Kapatma sonrasında bazı veriler yasal saklama yükümlülükleri kapsamında belirli süre tutulabilir.',
      ],
    },
    {
      id: 'disclaimer',
      title: '12. Sorumluluk Sınırı',
      paragraphs: [
        'PlayMeet “olduğu gibi” sunulur. Kesintisiz, hatasız veya belirli bir sonucu garanti eden bir hizmet taahhüdü verilmez. Kullanıcılar arası etkileşimlerden, üçüncü taraf bağlantılarından veya cihaz uyumsuzluklarından doğan dolaylı zararlardan sorumluluk kabul edilmez; yürürlükteki zorunlu tüketici hakları saklıdır.',
      ],
    },
    {
      id: 'law',
      title: '13. Uygulanacak Hukuk ve Uyuşmazlık',
      paragraphs: [
        'Bu Koşullar Türkiye Cumhuriyeti kanunlarına tabidir. Uyuşmazlıklarda Türkiye mahkemeleri ve icra daireleri yetkilidir; tüketici olarak yerleşim yerinizdeki Tüketici Hakem Heyetleri ve Tüketici Mahkemelerine başvuru hakkınız saklıdır.',
      ],
    },
    {
      id: 'changes',
      title: '14. Değişiklikler',
      paragraphs: [
        'Koşulları zaman zaman güncelleyebiliriz. Önemli değişiklikler uygulama içi bildirim veya e-posta yoluyla duyurulur. Güncellemeden sonra hizmeti kullanmaya devam etmeniz, yeni koşulları kabul ettiğiniz anlamına gelir.',
      ],
    },
    {
      id: 'contact',
      title: '15. İletişim',
      paragraphs: [
        'Kullanım Koşulları hakkında sorularınız için: destek@playmeet.app',
        'PlayMeet — Türkiye',
      ],
    },
  ],
}
