const RAW = `
açı ada ağa akı ala ana anı ant ara arı art aşk ata atı ayı
bağ bal ban bas baş bat bay bel ben bez bin bir biz bol boy boş
cam can caz cık
çağ çal çan çar çay çim çiz
dağ dal dam dar def del der dev dil din diz dol don doz duş düz
ekin emir eşik
göz gül gün güz
hal ham han hap har hat hav haz hız hoş
ırk
jet
kaç kal kan kap kar kaş kat kav kaz kel kes kır kız kol kop kor koy kul kum kur kuş kut küf küp küt
laf mal mor muz
nar naz nem net
oda
pul rol ruh
saç sağ sal sap sav saz sel sen ses set sil sin sis sol son sor soy süt
şan şap şef şen şok şut
tam tan taş tat tay tek tel ten tez tır tip top tor toz tuz tür
ulu üst
var vur
yaş yat yaz yel yer yem yol yün yüz
zam zar zat zil zor

açık adet adım ağız ahit akıl alan alçı alev alım altı anne arsa arzu asıl asma aşçı ataş avcı ayak ayaz ayet ayna ayrı ayva
baba bacı bade bağır bahçe baki bakır bale balık balon banka bant barış barut başak baskı basım batık bavul bayan bayır bebe bekçi belge belki belli beniz bere bereket is too long
bere bıçak biber bilet bilim bilge bilgi binici bira birey bitki bıçak boğa boğaz boru boşluk boya boza bozkır is 6
boz buz
bura burç burun buse butik buzul büyü
camcı canım is name skip
cami cila cilt civa cümle cüce cüzdan is 6
çakı çamur çanak çanta çapa çare çatı çayır çekiç çene çeri çiçek çilek çini çizgi çizim çoban çorap çuval
dağcı daha damat damga darbe davet defne defter değer delik deniz dergi derin dert deri ders deve devir dizgi doğa doku dolap dolu donuk duman durak duru duvar düğme düğün dünya
ebeveyn is 7
ecel edep ekin ekmek elma emek emir engin erik erkek esir eski eşya etek etki evrak evren ezber ezgi
fark fasıl fener fidan fikir filiz fincan fişek fırça fırın fırtına is 7
fıçı fırsat is 6
fiyat folyo form
gaga gamze gazel gece gelin genç gençlik is 7
gemi geniş gezi gıda girişim is 7
gitar gizem gölge gömlek gözlük is 6
göçebe is 6
görev gövde güç gülüş gümüş günah güneş güvercin is 8
güve güven güz
haber hacim hafif hakem hakikat is 7
halkı skip
halk halı hamam hamur hane hanım hapis harita hasat hasır hasta hatıra hatip hayat hazine hediye hedef helezon is 7
helva hesap hızla hırka hışım hüzün
ırmak ısınmak is 7
ısıtma is 6
ışık
ibadet is 6
ibare içki içten iddia iğne ihanet is 6
ihbar ikaz ikram ilahi ilaç ilan ilçe ilgi ilham ilik ilke imaj imdat imza inanç inci insan ipucu irade isim istek işçi işlek iştah ivedi izci izlek
jilet jokey jüri
kaba kablo kabuk kadeh kadın kafes kafa kâğıt is kağıt
kağıt kahve kalem kalıp kamış kamp kamu kanat kapı kapak kara karar karga kasap kasır katır katman is 6
katkı kavil kavim kavun kaya kayık kayıp kayıt kazak kazan kazma kebap kedi kelle keman kemer kenar kepçe kere kese kesim keşif keyif kılıç kınık skip
kırık kıraç kısa kısım kızıl kibar kiler kimse kitap kivi koku kolye komşu konuk konut kopuk koru kota kova koyun kozalak is 7
köfte köhne köpek köprü körfez is 6
köşe köy kök kumaş kuma kumru kuru kutu kuzey küçük küfe külah küme küpe kürek küsür
lamba lavabo is 6
lale lastik is 6
lavaş lazer leke lezzet is 6
lider lifli lime lira liste lodos lamba
maden magaza skip
mağaza mahal makas maket mango manto marka masa masal masum mayıs mektup is 6
melek mermi mesaj metal metin metre mevsim is 6
meydan is 6
meyve meze mısır midye mikrop is 6
mine minik miraç skip
mizaç model moruk skip
motor mumya murat skip name
mutfak is 6
mücevher is 8
mühür mürekkep is 8
müzik
nane narin nefes nehir nemli nergis is 6
nesil neşe nikah nisan niyet nokta
ocak odağı skip
odak oğul okçu okul okuma olgu olta omuz onur ordu orman ortak otel otlak oturak is 6
oymak oyuk oyuncu is 6
öğle ölçü öğüt ömür öncü önlük is 6
önem ördek örgü örnek örtü öykü özlem özne
pabuç paket palet pamuk pano pansuman is 8
para park parmak is 6
pasta patik pazar pelte perde peynir is 6
pilav pırlanta is 8
piyano is 6
plaka plaj polis posta pulcu
radyo rakam raket rampa reçete is 6
rehber rejim renk resim ritim rüzgar is 6
rüya
saat sabah sabır sabun saçak sade safir sağır sahil sakin salça salep salon salya sancı sanrı sapka skip
şapka sargı satın satır savcı savaş sayfa saygı sayım sebep sefer sefil seher sehpa seksi skip
selam selvi semer sergi serin sert sevap sevinç is 6
sepet seyahat is 7
sıcak sıfır sırtı skip
sır sırrı skip
sırat is 5
sırça sıska sitem site sokak soluk somun sonat sonuç sopa soru sorun soğuk soğan sofra sohbet is 6
soket soluk somun
spor suçu skip
sucuk is 5
sulu sunum surat sürü süsleme is 7
sütun
şafak şair şaka şamdan is 6
şarkı şato şebeke is 6
şehir şeker şekil şemsiye is 7
şerit şifre şiir şirin şişe şölen şömine is 7
şube
tabak tabela is 6
taban taciz tane tanık tapu taraf tarih tarla tartı tasarı is 6
taşra tatil tavan taze tebrik is 6
teyze teker tekne telaş telif temel tempo teneke is 6
tepe terlik is 5
terzi teslim is 6
teyze tılsım is 6
tıraş tırnak is 6
timsah is 6
tören toprak is 6
torun totem tutam tuzlu tüfek tülbent is 7
tütün
ufuk ulus umut unlu usta uçuş ümit ünlem ünlü üslup is 6
üstün ütü
vadi vakit vazo vekil vergi vitrin is 6
vücut
yaka yakın yalı yalnız is 6
yanık yankı yaprak is 6
yara yargı yardım is 6
yarış yasak yatak yatay yavaş yavru yayla yazı yelek yemin yerel yemek yeni yerli yığın yılan yemek
yıldız is 6
yolcu yorgan is 6
yorgan is 6
yosun yudum yumak yürek yüklem is 6
yünlü yüzey
zafer zaman zarif zemin zeytin is 6
zımba ziraat is 6
zümrüt is 6

abide acemi acımak is 6
acı acımsı skip
adale adres afiş ahenk ahır ahtapot is 7
akort akşam alaca alarm albüm alçı alenen is 6
aleyh algı alkış altın ambar amca amiral is 7
anıt anız anket anlak anlık anımsama is 8
anneci skip
apolet is 6
araba aracı aralık is 6
arazi argon arıza armağan is 6
arpa arşiv asansör is 7
asetat is 6
askı asker aslan astar aşama aşıcı atkı atlas avare avize ayıptır skip
ayraç ayran azgın azınlık is 7
azim
badem bagaj bahar bahis bahçe bakla baklava is 7
balina is 6
balta banyo baraj bardak is 6
barınak is 6
basın basınç is 7
baskın is 6
batak battaniye is 9
bavul bayat bayrak is 6
beceri is 6
beden bedel belde belek bellek is 6
bencil is 6
benek bengi beraat is 6
bereket is 7
berjer is 6
besin beşik beyaz beyin bezeme is 6
bıçak biber bilet bilge bilgi bilim binbaşı is 7
birim bitki bocurgat is 8
bohça is 5
boncuk is 6
bonfile is 7
borsa boyoz bozkır is 6
bölge bölme börek böcek bölen budak buhar buket bulut burgu burun buton buyruk is 6
bülbül is 6
bülten is 6
büro bütçe büzgü
cadde cahil cambaz is 6
canlı capa carı ceket cennet is 6
ceset cesur cetvel is 6
ceviz ceza cıva cızır cila cilt cinayet is 7
civciv is 6
coşku cömert is 6
cümle cüret
çakmak is 6
çamlık is 6
çamur çanak çanta çapa çare çatı çavuş is 6
çaydanlık is 9
çekiç çekiç çember is 6
çene çengel is 6
çentik is 6
çerçeve is 6
çerez çeri çevre is 5
çıban çıkış çıkın çilek çimen çini çizelge is 7
çizgi çizim çoban çorak çorap çorba çuval
dağcı damat damga damla darbe davul defne defter değer delik demir demet deniz denen is not
denge denli denyo skip
depo dergi derin dert ders destek is 6
devam deve devir deyim dışarı is 6
diken dikey dikim dikiş dilim dizin dizge doğa doku dolap dolgu dolu donuk doruk duman durak duruş duvak duvar düğme düğüm düğün dükkan is 6
dünya düzce düzelt is 6
düzey düzen düzgün is 6
düzen
ecel edep efsane is 6
ekin ekmek eksik ekşi elbet elçi elebaşı is 7
elma elmas is 5
emek emzik is 5
engel engin enkaz erdem ergin erime erik erime erkek erzak esans esinti is 6
esir esmer esnaf esnek espri eski eşarp eşik eşya etken etken etki etnik evcil evrak evren evrim ezber ezgi
facia fagot fahiş fakat fakir falcı falez falso fanila is 6
fark fasıl fasulye is 7
fatura is 6
fayda fecir fedai felaket is 7
fener ferah ferman is 6
fesat fındık is 6
fıçı fırtına is 7
fıskiye is 7
fidan fikir filiz fincan fişek fiyaka is 6
fiyat folyo forma formül is 6
fosil foton
gaga gaklamak is 8
galeri is 6
gamze garaj garip gazap gazel gazete is 6
gebe gece gecikme is 7
gelin gelmek is 6
genç geniş geniz gerek gerçi gergi gemi gergedan is 8
gezi gezgin is 6
gıda gıda gıda
gitar gizem gizil gölge gömlek is 6
gömü görev gövde göç göçmen is 6
güçlü gülüş gümüş günah güneş güreş güven güve güzergah is 8
haber hacim hafif hakan hakem haklı halk halı hamam hamle hamur hane hanım hapis harita hark hasat hasır hasta hatip hatıra hayat hazine hediye hedef helva hesap hevenk is 6
heyelan is 7
hırka hırçın is 6
hışım hiza hızır hizmet is 6
horoz hortum is 6
hoşnut is 6
hukuk humus hurda huri hüzün
ırmak ısıtıcı is 7
ışık ışıltı is 6
ibadet is 6
ibare ibrik içgüdü is 6
içki içten iddia iğne ihbar ikaz ikilem is 6
ikram iksir ilahi ilaç ilan ilçe ilgi ilham ilik ilke illa imaj imdat imge imza inanç inci infaz insan insaf ipucu irade ırmak isim iskele is 6
istek işbaşı is 6
işçi işgal işkembe is 7
işlek iştah ivedi izci ızgara is 6
jandarma is 8
jilet jokey jüri
kaba kablo kabuk kadeh kadın kafes kafa kağıt kahve kaide kaktüs is 6
kalem kalıp kalın kamış kamelya is 7
kamp kamu kanat kanıt kapı kapak kapan kaput kara karar karga karın karış kasap kasır katır katkı katman is 6
kavga kavil kavim kavun kavuz kaya kayık kayıp kayın kayıt kayış kazak kazan kazma kebap kedi kelle keman kemer kemik kenar kepçe kepenk is 6
kere kerpiç is 6
kese kesif kesim keski keskin is 6
keşif keyif kıble kılıç kılıf kırık kıraç kırağı is 6
kısım kısa kısır kızıl kızak kibar kiler kimya kitap kivi kobra koku kolej kolye komik komşu konuk konut kopuk koru koridor is 7
kota kova koyun kozmik is 6
köfte köhne köken köpek köprü körfez is 6
köşe kök kumaş kuma kumru kundak is 6
kural kuru kurum kutu kuzey küçük küfe külah küme küpe kürek küsür kütük
labirent is 8
lamba lastik is 6
lale lazer lavaş leke leylek is 6
lezzet is 6
lider lime lira liste lizöz skip
lodos lokma lokum lamba
maden mağaza mahal makam makas maket mango manto marka martı masa masal masum mayın mayıs medya mektup is 6
melek mermi mesaj metal metin metre mevki mevsim is 6
meydan is 6
meyve meze mısra midye mikro minik mizaç model mozaik is 6
motor muşta mutfak is 6
mühür müjde müzik
nane narin nefes nehir nektar is 6
nemli nergis is 6
nesil neşe nikah nisan nişan is 5
niyet nobran is 6
nokta nazar
ocak odak oğul okçu okul okuma olgu olta omlet is 5
omuz onur ordu orman ortak otel otlak otlak oymak oyuk oyuncu is 6
öğle öğüt ölçü ömür öncü önem ördek örgü örnek örtü öykü özen özlem özne
pabuç paket palet palto pamuk pano panik para parça is 5
park parmak is 6
pasta patik paten pazar pelte perde petek peynir is 6
pınar pilav piyano is 6
plaka plaj polen polis pompa posta pulcu
radyo rakam raket rampa ranza reçel reçete is 6
rehber rejim rekor renk resif resim ritim rüzgar is 6
rüya
saat sabah sabır sabun saçak sade safir sağır sahil sahne sakin sakız salça salep salıncak is 8
salon salya sancı sanrı sapka
sargı satın satır savcı savaş sayfa saygı sayım sebep seccade is 7
sefer sefil seher sehpa seki selam selvi semer semiz is 5
sergi serin sert servis is 6
sevap sevinç is 6
sepet sıcak sıfır sırt sırça sırat sıska sitem site slogan is 6
soba sokak soluk somun sonat sonuç sopa sorgu is 5
soru sorun soğuk soğan sofra sohbet is 6
soket somya spor sucuk sulu sunum sunak surat sürü sütlaç is 6
sütun
şafak şair şaka şamdan is 6
şarkı şato şehir şeker şekil şelale is 6
şerit şifre şiir şirin şişe şölen şube şuur
tabak taban tabela is 6
taciz tane tanık tanrı is 5
tapu taraf tarih tarla tartı taşra taslak is 6
tatil tavan taze tebrik is 6
teyze teker tekne telaş telif temel tempo teneke is 6
tepe terlik is 5
terzi teslim is 6
tılsım is 6
tıraş tırnak is 6
tören toprak is 6
torba torun totem tutam tutku tuzlu tüfek tütün
ufuk ulus umut unlu usul usta uçurtma is 7
uçuş ümit ünlü ünlem üslup is 6
üstün ütü
vadi vakit vazo vekil vergi vücut
yaka yakın yalı yanık yankı yara yargı yarış yasak yasemin is 7
yatak yatay yavaş yavru yayla yazgı is 5
yazı yelek yemin yerel yemek yeni yerli yığın yılan yığın
yıldız is 6
yolcu yosun yudum yumak yürek yünlü yüzey
zafer zaman zarif zaruret is 7
zemin zeytin is 6
zımba ziraat is 6
zümrüt is 6

abajur is 6
abide acemi adale adres afiş ahenk ahır akort akşam alarm albüm algı alkış altın ambar amca anıt anız anket anlak anlık apolet is 6
araba aracı arazi arıza armağan is 6
arpa arşiv asker askı aslan astar aşama aşı atkı atlas avize ayraç ayran azgın azim
badem bagaj bahar bahis bakla balina is 6
balta banyo baraj bardak is 6
barınak is 6
basın baskın is 6
batak bayat bayrak is 6
beceri is 6
beden bedel belde bellek is 6
bencil is 6
benek bengi besin beşik beyaz beyin bezeme is 6
bilinç is 6
birim bohça is 5
boncuk is 6
borsa boyoz bozkır is 6
bölge bölme börek böcek budak buhar buket bulut burgu buton buyruk is 6
bülbül is 6
bülten is 6
büro bütçe
cadde cahil cambaz is 6
canlı ceket cennet is 6
ceset cesur cetvel is 6
ceviz ceza civciv is 6
coşku cömert is 6
cüret
çakmak is 6
çamlık is 6
çavuş is 6
çember is 6
çengel is 6
çentik is 6
çerçeve is 6
çerez çevre çıban çıkış çizelge is 7
çorak çorba
damla davul demir demet denge depo destek is 6
deyim diken dikey dikim dikiş dilim dizin dizge dolgu doruk duruş duvak düğüm dükkan is 6
düzey düzen düzgün is 6
efsane is 6
eksik ekşi elçi elmas is 5
emzik is 5
engel enkaz erdem ergin erzak esans esinti is 6
esmer esnaf esnek espri eşarp etken etnik evcil evrim
facia fakat fakir falcı falez fanila is 6
fatura is 6
fayda fecir fedai fındık is 6
fiyaka is 6
forma formül is 6
fosil
galeri is 6
garaj garip gazap gazete is 6
gelmek is 6
geniz gerek gerçi gergi gezgin is 6
gizil göçmen is 6
güçlü güreş
hakan haklı hamle hark hevenk is 6
hırçın is 6
hiza hızır hizmet is 6
horoz hortum is 6
hoşnut is 6
hukuk humus hurda
ışıltı is 6
ibrik içgüdü is 6
ikilem is 6
iksir illa imge infaz insaf iskele is 6
işgal
kaktüs is 6
kaide kalın kanıt kapan kaput karın karış kayın kayış kemik kepenk is 6
kerpiç is 6
kesif keski keskin is 6
kıble kılıf kırağı is 6
kısır kızak kimya kobra kolej komik koridor is 7
kozmik is 6
köken kundak is 6
kural kurum kütük
leylek is 6
lokma lokum
makam martı mayın medya mevki mısra mozaik is 6
muşta müjde
nektar is 6
nişan nobran is 6
nazar
omlet
palto panik parça petek pınar polen pompa ranza reçel rekor resif
sahne sakız seccade is 7
seki semiz servis is 6
slogan is 6
soba sorgu sunak sütlaç is 6
şelale is 6
şuur
tanrı taslak is 6
torba tutku usul yazgı
abajur is 6

gel git bak dur al ver yaz çiz koş uç aç iç oku sor bil et ol ko çık vur seç geç kaç sat tut bit yet dön bin sev gül uyu sus kal kes kır koy tak çek at çal dön bak yıka sil biç dik ört sar yak sön süz dök kar sür ez piş doğ böl kat ölç say bul sun sunu
akşam sabah öğlen gece gündüz is 6
ilkbahar is 8
yazın kışın
pazar pazartesi is 9
salı çarşamba is 8
perşembe is 8
cuma cumartesi is 9
ocak şubat mart nisan mayıs haziran is 7
temmuz is 6
ağustos is 7
eylül ekim kasım aralık is 6

anne baba abla ağabey is 6
dede nine hala dayı teyze yeğen is 5
kuzen damat gelin bebek çocuk is 5
kardeş is 6
eş dost komşu

kedi köpek kuş balık inek koyun keçi at eşek is 4
tavuk horoz civciv is 6
ördek kaz kurt tilki ayı aslan kaplan is 6
fil deve maymun is 6
arı sinek böcek yılan kurbağa is 7
balık yunus is 5
penguen is 7
zebra zürafa is 6
tavşan is 6
sincap is 6
kirpi fare sıçan is 5
kumru güvercin is 8
serçe kartal şahin baykuş is 6
leylek is 6
papağan is 7
muhabbet is 8
karga saksağan is 8
martı pelikan is 7

elma armut ayva kiraz vişne is 5
üzüm incir kavun karpuz is 6
çilek muz portakal is 8
mandalina is 9
limon greyfurt is 8
nar kiraz erik kayısı is 6
şeftali is 7
muz mango ananas is 6
domates is 7
biber patlıcan is 7
kabak havuç soğan sarımsak is 8
patates is 7
ıspanak is 7
marul maydanoz is 8
dereotu is 7
fasulye is 7
nohut mercimek is 8
pirinç bulgur is 6
makarna is 7
ekmek pide simit poğaça is 6
börek çörek is 5
pasta kek kurabiye is 8
helva lokum reçel bal pekmez is 6
yoğurt is 6
peynir tereyağı is 8
kaymak is 6
süt ayran şalgam is 6
çay kahve su meşrubat is 8
limonata is 8
şerbet is 6
çorba pilav kebap köfte döner is 5
lahmacun is 8
pide pizza hamburger is 9
sandviç is 7
tost menemen is 7
omlet yumurta is 7
sucuk sosis pastırma is 8
zeytin zeytinyağı is 10
sirke salça baharat is 7
tuz karabiber is 9
şeker un nişasta is 7
maya hamur

ev oda salon mutfak is 6
banyo balkon is 6
teras bahçe avlu çatı kapı pencere is 7
duvar tavan taban merdiven is 8
basamak is 7
halı kilim perde yatak yastık is 6
yorgan is 6
çarşaf is 6
battaniye is 9
nevresim is 8
dolap çekmece is 7
raf masa sandalye is 8
koltuk is 6
kanepe is 6
sehpa lamba avize ayna tablo saat
buzdolabı is 8
fırın ocak tencere is 7
tava tava kettle skip
ketıl skip
çaydanlık is 9
bardak is 6
fincan tabak çatal bıçak kaşık is 5
sürahi is 6
süzgeç is 6
rende kepçe maşa
süpürge is 7
faraş kova paspas is 6
deterjan is 8
sabun şampuan is 7
havlu peçete is 6
diş fırçası is two
tarama is 6
tarak

gömlek is 6
pantolon is 8
etek ceket mont palto kazak hırka is 5
tişört is 6
gömlek yelek kravat is 6
kemer çorap ayakkabı is 8
terlik is 5
bot çizme şapka bere atkı eldiven is 7
eşarp kemer düğme cep fermuar is 7
etek boya kumaş iplik is 5
dikiş makas iğne yüksük is 6

okul sınıf sıra tahta tebeşir is 7
kalem silgi defter kitap ders konu sınav is 5
not ödev proje is 5
öğrenci is 7
öğretmen is 8
müdür is 5
rehber müdür
harita dünya ülke şehir ilçe köy kasaba is 6
mahalle is 7
sokak cadde meydan is 6
park bahçe orman dağ tepe vadi ova plato is 5
ırmak nehir göl deniz okyanus is 7
ada yarımada is 8
kıyı sahil liman iskele is 6
köprü tünel yol cadde otoban is 6
istasyon is 8
durak gar havaalanı is 9
uçak gemi tren otobüs is 6
tramvay is 7
metro taksi dolmuş is 6
bisiklet is 8
motosiklet is 10
araba kamyon is 6
tır traktör is 7
tekne sandal is 6
yelken is 6

güneş ay yıldız is 6
bulut yağmur is 6
kar dolu sis rüzgar is 6
fırtına is 7
şimşek is 6
gökkuşağı is 9
gök mavi kırmızı is 7
sarı yeşil mor pembe turuncu is 7
siyah beyaz gri lacivert is 8
bej kahve turkuaz is 7
altın gümüş bronz bakır

müzik şarkı nota ritim melodi is 6
enstrüman is 9
gitar piyano is 6
keman flüt davul zurna is 5
saz bağlama is 7
kanun ud ney trompet is 7
konser is 6
sahne koro şarkıcı is 7
dans bale opera tiyatro is 7
sinema is 6
film dizi roman şiir öykü hikaye is 6
masal fıkra is 5
dergi gazete is 6
yazar şair resim heykel is 6
tablo müze sergi

futbol is 6
basketbol is 9
voleybol is 8
hentbol is 7
tenis golf yüzme koşu yürüyüş is 7
bisiklet is 8
kayak paten boks güreş is 5
okçuluk is 8
atıcılık is 8
jimnastik is 9
yoga pilates is 7
maç gol skor hakem forma stadyum is 7
tribün is 6
kupa madalya is 7
birinci is 7
ikinci is 6
üçüncü is 7
final

doktor is 6
hemşire is 7
hasta ilaç aşı reçete is 6
hastane is 7
eczane is 6
ateş öksürük is 8
ağrı yara kan nabız is 5
kalp akciğer is 7
mide böbrek is 6
karaciğer is 9
beyin sinir kas kemik deri saç tırnak is 6
diş göz kulak burun ağız dil dudak çene alın kaş kirpik is 6
el kol bacak is 5
ayak parmak is 6
diz dirsek is 6
omuz sırt bel göğüs is 5
karın is 5
boy kilo güç sağlık is 6
uyku rüya düş

sevgi aşk dostluk is 7
arkadaş is 7
barış umut korku öfke is 4
neşe keder acı mutluluk is 8
özlem hasret is 6
merak şaşkın is 6
gurur onur saygı sevgi
güven sadakat is 7
kıskanç is 7
utanç is 5
pişman is 6
rahat sakin huzur is 5
neşe coşku heyecan is 7
cesaret is 7
sabır azim irade

iş meslek is 6
maaş ücret is 5
ofis büro masa toplantı is 8
proje rapor is 5
sözleşme is 8
imza mühür kaşe
para kuruş is 5
lira dolar euro
banka hesap kart nakit is 5
çek senet fatura is 6
vergi borç alacak is 6
kâr zarar is 5
ticaret is 7
pazar market is 6
dükkan is 6
mağaza müşteri is 7
satıcı is 6
kasiyer is 7
kasa fiş indirim is 7
kampanya is 8
reklam is 6
marka ürün stok depo kargo is 5
paket kutu etiket is 6

bilgisayar is 10
telefon is 7
ekran klavye is 6
fare yazıcı is 6
tarayıcı is 8
hoparlör is 8
kulaklık is 8
şarj kablo priz düğme
internet is 8
site sayfa bağlantı is 8
mesaj eposta is 6
uygulama is 8
oyun skor seviye is 6
harita konum is 5
arama sonuç is 5

renk biçim şekil boyut is 5
en boy yükseklik is 9
genişlik is 8
derinlik is 8
ağırlık is 7
hafif ağır uzun kısa dar geniş yüksek alçak is 5
büyük küçük orta dev minik
yeni eski taze bayat
sıcak soğuk ılık serin
sert yumuşak is 7
pürüzsüz is 9
parlak mat koyu açık
temiz kirli düzenli is 7
dağınık is 7
güzel çirkin is 6
iyi kötü doğru yanlış is 6
kolay zor hızlı yavaş
sessiz is 6
gürültülü is 9
aydınlık is 8
karanlık is 8
ıslak kuru nemli
tatlı acı ekşi tuzlu
keskin is 6
hafif yoğun sıvı katı gaz
canlı cansız is 6
gerçek is 6
hayal düş

bir iki üç dört beş altı yedi sekiz dokuz on
yirmi otuz kırk elli altmış is 6
yüz bin
ilk son orta
bugün is 5
dün yarın is 5
şimdi is 5
hemen sonra önce
sabah öğle akşam gece
hafta ay yıl mevsim is 6
dakika is 6
saniye is 6
saat zaman an süre

evet hayır is 5
belki tamam is 5
lütfen is 6
teşekkür is 8
merhaba is 7
günaydın is 8
iyi akşamlar is two
hoşça is 5
görüşürüz is 9
affedersin is 10
özür pardon is 6
tamam peki olur
selam merhaba is 7

kuzey güney doğu batı
sağ sol ön arka iç dış üst alt
yan çevre kenar orta merkez is 6
uzak yakın burada is 6
orada is 5
şurada is 6
heryer skip
hiçbir is 6
bazen is 5
sıkça is 5
nadiren is 7
daima is 5
asla henüz is 5
artık hâlâ

kırmızı is 7
turuncu is 7
sarı yeşil mavi lacivert is 8
mor pembe siyah beyaz gri kahverengi is 10
bej altın gümüş

ankara is 6
istanbul is 8
izmir is 5
bursa antalya is 7
adana konya gaziantep is 9
şanlıurfa is 9
kayseri is 7
mersin is 6
diyarbakır is 10
samsun is 6
denizli is 7
eskişehir is 9
trabzon is 7
erzurum is 7
malatya is 7
van ağrı rize artvin is 6
bolu düzce yalova is 6
muğla is 5
aydın manisa is 6
balıkesir is 9
çanakkale is 9
edirne is 6
kırklareli is 10
tekirdağ is 8
kocaeli is 7
sakarya is 7
bilecik is 7
eskişehir
afyon is 5
kütahya is 7
uşak isparta is 7
burdur is 6
antalya
hatay osmaniye is 8
kahramanmaraş is 14
adıyaman is 8
mardin is 6
batman siirt is 5
şırnak is 6
hakkari is 7
bitlis is 6
muş bingöl is 6
tunceli is 7
elazığ is 6
erzincan is 8
gümüşhane is 9
bayburt is 7
giresun is 7
ordu giresun
sivas yozgat is 6
kırşehir is 8
nevşehir is 8
niğde aksaray is 7
karaman is 7
kırıkkale is 9
çorum amasya is 6
tokat sinop is 5
kastamonu is 9
zonguldak is 9
bartın is 6
karabük is 7
çankırı is 7
kars ığdır is 5
ardahan is 7
kilis

çayır çimen funda orman ağaç is 4
çam meşe kayın is 5
kavak söğüt is 5
çınar is 5
zeytin incir asma gül lale nergis is 6
papatya is 7
menekşe is 7
orkide is 6
sümbül is 6
zambak is 6
yaprak is 6
dal kök gövde kabuk tomurcuk is 8
çiçek tohum meyve polen
toprak is 6
taş kum çakıl is 5
kaya mermer is 6
granit is 6
maden altın bakır demir çelik is 5
kömür is 5
petrol is 6
doğalgaz is 8

anneciğim skip
canım skip
sevgilim is 8
arkadaşım is 9

kalemlik is 8
defterlik is 9
kitaplık is 8
gözlük is 6
kulaklık
ayakkabı
çamaşır is 7
ütü makinesi is two
bulaşık is 7
çamaşırhane is 11

pilot hostes is 6
kaptan is 6
şoför is 5
makinist is 8
aşçı garson is 6
fırıncı is 7
kasap manav is 5
bakkal is 6
terzi berber is 6
kuaför is 6
eczacı is 6
avukat is 6
hakim savcı polis asker itfaiye is 8
öğretmen
mühendis is 8
mimar is 5
ressam is 6
heykeltıraş is 11
müzisyen is 8
oyuncu is 6
yönetmen is 8
yazar şair gazeteci is 8
muhabir is 7
spiker is 6
sunucu is 6
çiftçi is 6
balıkçı is 7
ormancı is 7
madenci is 7
inşaatçı is 8
boyacı is 6
tamirci is 7
elektrikçi is 10
tesisatçı is 9
marangoz is 8
demirci is 7
kuyumcu is 7
saatçi is 6
fotoğrafçı is 10
kameraman is 9
pilot astronot is 8
bilim insanı is two
araştırmacı is 11
öğrenci
hemşire doktor
veteriner is 9
dişçi is 5
psikolog is 8
sosyolog is 8
tarihçi is 7
coğrafyacı is 10
matematikçi is 11
fizikçi is 7
kimyacı is 7
biyolog is 7
filozof is 7
hukukçu is 7
ekonomist is 9
bankacı is 7
muhasebeci is 10
sekreter is 8
asistan is 7
müdür müdire is 6
patron is 6
işçi memur is 5
emekli is 6
öğrenci stajyer is 7

masa sandalye
koltuk kanepe
yatak dolap
pencere kapı
duvar tavan
halı perde
lamba avize
ayna tablo
saat vazo
çiçek saksı is 5
toprak
su hava ateş toprak
güneş ay
yıldız bulut
yağmur kar
rüzgar fırtına
şimşek gök gürültü is 7

sevmek is 6
görmek is 6
bilmek is 6
gelmek is 6
gitmek is 6
bakmak is 6
durmak is 6
almak is 5
vermek is 6
yazmak is 6
çizmek is 6
koşmak is 6
uçmak is 5
açmak is 5
içmek is 5
okumak is 6
sormak is 6
etmek is 5
olmak is 5
koymak is 6
çıkmak is 6
vurmak is 6
seçmek is 6
geçmek is 6
kaçmak is 6
satmak is 6
tutmak is 6
bitmek is 6
yetmek is 6
dönmek is 6
binmek is 6
inmek is 5
anmak is 5
sevmek
gülmek is 6
uyumak is 6
susmak is 6
kalmak is 6
kesmek is 6
kırmak is 6
koymak
takmak is 6
çekmek is 6
atmak is 5
çalmak is 6
yıkamak is 7
silmek is 6
biçmek is 6
dikmek is 6
örtmek is 6
sarmak is 6
yakmak is 6
sönmek is 6
süzmek is 6
dökmek is 6
karmak is 6
sürmek is 6
ezmek is 5
pişmek is 6
doğmak is 6
bölmek is 6
katmak is 6
ölçmek is 6
saymak is 6
bulmak is 6
sunmak is 6
aramak is 6
aramak
beklemek is 8
dinlemek is 8
anlamak is 7
anlatmak is 8
konuşmak is 8
gülmek
ağlamak is 7
uyumak
uyanmak is 7
çalışmak is 8
oturmak is 7
kalkmak is 7
yürümek is 7
koşmak
yüzmek is 6
düşünmek is 8
hatırlamak is 10
unutmak is 7
öğrenmek is 8
öğretmek is 8
sevmek
özlemek is 7
aramak
buluşmak is 8
ayrılmak is 8
kavuşmak is 8
gülümsemek is 10
bakmak
görmek
duymak is 6
hissetmek is 9
istemek is 7
vermek
almak
satın almak is two
ödemek is 6
kazanmak is 8
kaybetmek is 9
başlamak is 8
bitirmek is 8
devam etmek is two
durmak
beklemek
acele etmek is two
yavaşlamak is 10
hızlanmak is 9

mutlu is 5
üzgün is 5
kızgın is 6
korkmuş is 7
şaşkın is 6
meraklı is 7
yorgun is 6
dinç zinde is 5
hasta sağlam is 6
güçlü zayıf is 5
zengin is 6
fakir cömert is 6
cimri is 5
nazik is 5
kaba kibar
cesur korkak is 6
dürüst is 6
yalancı is 7
akıllı is 6
zeki aptal is 5
çalışkan is 8
tembel is 6
düzenli
dağınık
temiz kirli
yeni eski
genç yaşlı is 5
bebek çocuk
genç yetişkin is 8
yaşlı
uzun kısa
ince kalın is 5
şişman is 6
zayıf
esmer sarışın is 7
kumral is 6
mavi yeşil ela kahve
siyah
güzel yakışıklı is 10
sevimli is 7
tatlı sert
sıcak soğuk
yakın uzak
içten samimi is 6
dürüst
sadık is 5
vefalı is 6
mert
alçak gönüllü is two
kibirli is 7
mütevazı is 8

oda salon
koridor is 7
antre is 5
hol mutfak
kiler kiler
bodrum is 6
çatı katı is two
asansör is 7
merdiven
balkon teras
bahçe avlu
garaj depo
ofis dükkan
market is 6
bakkal
manav kasap
fırın pastane is 7
eczane
hastane
okul
üniversite is 11
kütüphane is 9
müze tiyatro
sinema
park
stadyum
havuz is 5
spor salonu is two
plaj kumsal is 6
orman
göl nehir
deniz
ada
dağ tepe
vadi ova
köy kasaba
şehir ilçe
ülke
dünya
gökyüzü is 7
uzay is 4
yıldız
gezegen is 7
ay güneş

kalem defter
kitap dergi
gazete
roman şiir
öykü masal
not kâğıt
kağıt
zarf pul
mektup
adres
isim
soyad is 5
yaş meslek
şehir
telefon
numara is 6
şifre
hesap
parola is 6
kullanıcı is 9
profil is 6
ayarlar is 7
bildirim is 8
mesaj
sohbet
arama
eşleşme is 8
beğeni is 6
yorum is 5
paylaşım is 8
fotoğraf is 8
video is 5
ses müzik
oyun
skor
can süre
dalga hız
ipucu
harf kelime is 6
çark ızgara is 6
bulmaca is 7
doğru yanlış
puan can
elmas is 5
ödül kupa

açık kapalı is 6
kilitli is 7
boş dolu
yeni bitmiş is 6
devam
başla is 5
bitir is 5
yeniden is 7
karıştır is 8
ipucu
çözüm is 5
cevap is 5
soru
bilmece is 7
tahmin is 6
şans
zar kart
taş kağıt
makas

anne baba
kardeş
abla ağabey
dede nine
hala dayı
teyze yeğen
kuzen eş
damat gelin
bebek torun
komşu dost
arkadaş
tanıdık is 7
yabancı is 7
misafir is 7
konuk ev sahibi is two

ekmek peynir
zeytin bal
reçel tereyağı
yumurta
süt yoğurt
çay kahve
su meyve
sebze is 5
salata is 6
çorba pilav
makarna
börek poğaça
simit pide
lahmacun
döner köfte
kebap ızgara
salça sos
tuz biber
nane kekik is 5
pul biber is two
kimyon is 6
tarçın is 6
karanfil is 8
vanilya is 7
kakao is 5
çikolata is 8
dondurma is 8
lokma tulumba is 7
baklava
kadayıf is 7
künefe is 6
helva
aşure is 5
hoşaf is 5
komposto is 8
limonata
ayran şalgam
boza sahlep is 6
salep

gömlek pantolon
etek ceket
mont kaban is 5
palto kazak
hırka tişört
yelek kravat
kemer çorap
ayakkabı
terlik bot
çizme şapka
bere atkı
eldiven
eşarp fular is 5
kemer cep
düğme fermuar
ceket yaka
kol paça is 4
etek boy

okul sınıf
sıra tahta
tebeşir
kalem silgi
defter kitap
çanta is 5
beslenme is 8
su matara is 6
forma önlük
öğrenci
öğretmen
müdür
ders teneffüs is 8
sınav not
karne is 5
diploma is 7
mezun is 5
kayıt

araba otobüs
tren uçak
gemi tekne
bisiklet
motosiklet
taksi dolmuş
metro tramvay
vapur is 5
feribot is 7
teleferik is 9
asansör
yürüyen is 7
merdiven
yol kaldırım is 8
kavşak is 6
tabela
ışık trafik is 6
kırmızı
sarı yeşil
dur geç
park yeri is two
garaj
benzin is 6
istasyon
lastik
direksiyon is 10
fren gaz
ayna sinyal is 6
korna is 5
emniyet is 7
kemeri is 5

hava güneş
bulut yağmur
kar dolu sis
rüzgar
fırtına
şimşek
gökkuşağı
mevsim
ilkbahar
yaz sonbahar is 8
kış sıcak
soğuk ılık
serin nem
kurak is 5
yağışlı is 7
güneşli is 7
bulutlu is 7
rüzgarlı is 8
fırtınalı is 9
karlı sisli
ayaz kırağı
don çiy

çiçek ağaç
yaprak dal
kök gövde
kabuk tohum
meyve polen
toprak taş
kum çakıl
kaya mermer
granit maden
altın gümüş
bakır demir
çelik kömür
petrol
orman çayır
çimen funda
göl nehir
ırmak dere
şelale
çağlayan is 8
pınar kaynak is 6
kuyu artezyen is 8
vaha ova
plato yayla
dağ tepe
yamaç is 5
uçurum is 7
mağara is 6
in vadi
kanyon is 6
ada yarımada
kıyı sahil
plaj kumsal
falez koy
burun körfez
boğaz liman
iskele rıhtım is 6
mendirek is 8
deniz okyanus
dalga akıntı is 6
gelgit is 6
med cezir is 5
kabarma is 7
alçalma is 7

müzik nota
ritim melodi
armoni is 6
akor is 4
şarkı söz is 3
nakarat is 7
koro solo
enstrüman
gitar keman
piyano flüt
davul zurna
saz bağlama
kanun ud
ney trompet
saksofon is 8
klarnet is 7
obua viyola is 6
çello is 5
arp org
bateri is 6
mikrofon is 8
hoparlör
sahne ışık
perde kulis is 5
seyirci is 7
alkış
bilet loca
konser turne is 5
albüm single is 6
klip video
radyo
yayın is 5
kanal is 5
program is 7
dizi film
belgesel is 8
çizgi film is two
animasyon is 9
oyuncu
yönetmen
senarist is 8
yapımcı is 7
kurgu is 5
ses efekt is 5
müzik

futbol basket
voley hentbol
tenis golf
yüzme koşu
yürüyüş
bisiklet
kayak paten
boks güreş
yoga pilates
maç gol
skor hakem
forma stadyum
tribün kupa
madalya
birinci ikinci
üçüncü final
şampiyon is 8
lig grup
puan averaj is 6
penaltı is 7
korner is 6
taç ofsayt is 6
faul kart
sarı kırmızı
kaleci is 6
forvet is 6
defans is 6
orta saha is two
antrenör is 8
kaptan
takım is 5
taraftar is 8
tezahürat is 9
marş

doktor hemşire
hasta ilaç
aşı reçete
hastane eczane
ateş ağrı
yara kan
nabız kalp
akciğer
mide böbrek
karaciğer
beyin sinir
kas kemik
deri saç
tırnak diş
göz kulak
burun ağız
dil dudak
çene alın
kaş kirpik
el kol
bacak ayak
parmak diz
dirsek omuz
sırt bel
göğüs karın
boy kilo
güç sağlık
uyku rüya
düş nefes
öksürük
hapşırık is 8
ateş ölçer is two
tansiyon is 8
şeker tahlil is 6
röntgen is 7
mr ultrason is 9
ameliyat is 8
dikiş alçı
sargı bandaj is 6
serum is 5
aşı iğne
merhem is 6
şurup is 5
hap kapsül is 6
vitamin is 7
mineral is 7
protein is 7
karbonhidrat is 12
yağ lif
diyet is 5
egzersiz is 8
spor yürüyüş
nefes meditasyon is 10
yoga huzur

sevgi aşk
dostluk
arkadaşlık is 10
barış umut
korku öfke
neşe keder
acı mutluluk
özlem hasret
merak şaşkınlık is 9
gurur onur
saygı güven
sadakat
kıskançlık is 10
utanç pişmanlık is 9
rahat sakin
huzur coşku
heyecan
cesaret
sabır azim
irade inanç
iman is 4
dua ibadet
namaz is 5
oruç is 4
bayram is 6
kandil is 6
cami kilise is 6
sinagog is 7
havra is 5
türbe is 5
mezar is 5
anıt heykel

iş meslek
maaş ücret
ofis büro
toplantı
proje rapor
sözleşme
imza mühür
kaşe para
kuruş lira
dolar euro
banka hesap
kart nakit
çek senet
fatura vergi
borç alacak
kâr zarar
ticaret pazar
market dükkan
mağaza müşteri
satıcı kasiyer
kasa fiş
indirim kampanya
reklam marka
ürün stok
depo kargo
paket kutu
etiket barkod is 6

bilgisayar
telefon ekran
klavye fare
yazıcı tarayıcı
hoparlör kulaklık
şarj kablo
priz düğme
internet site
sayfa bağlantı
mesaj eposta
uygulama oyun
skor seviye
harita konum
arama sonuç
renk biçim
şekil boyut
en boy
yükseklik
genişlik
derinlik
ağırlık
hafif ağır
uzun kısa
dar geniş
yüksek alçak
büyük küçük
orta dev
minik yeni
eski taze
bayat sıcak
soğuk ılık
serin sert
yumuşak
parlak mat
koyu açık
temiz kirli
düzenli dağınık
güzel çirkin
iyi kötü
doğru yanlış
kolay zor
hızlı yavaş
sessiz gürültülü
aydınlık karanlık
ıslak kuru
nemli tatlı
acı ekşi
tuzlu keskin
hafif yoğun
sıvı katı
gaz canlı
cansız gerçek
hayal düş

bir iki
üç dört
beş altı
yedi sekiz
dokuz on
yirmi otuz
kırk elli
altmış yetmiş is 7
seksen is 6
doksan is 6
yüz bin
milyon is 6
milyar is 6
ilk son
orta bugün
dün yarın
şimdi hemen
sonra önce
sabah öğle
akşam gece
hafta ay
yıl mevsim
dakika saniye
saat zaman
an süre

evet hayır
belki tamam
lütfen teşekkür
merhaba günaydın
iyi hoşça
görüşürüz
affedersin
özür pardon
peki olur
selam

kuzey güney
doğu batı
sağ sol
ön arka
iç dış
üst alt
yan çevre
kenar orta
merkez uzak
yakın burada
orada şurada
hiçbir bazen
sıkça nadiren
daima asla
henüz artık
hâlâ

ankara izmir
bursa adana
konya mersin
samsun van
ağrı rize
bolu düzce
muğla aydın
manisa ordu
sivas tokat
sinop kars
kilis siirt
muş rize
artvin giresun
amasya çorum
yalova bilecik
uşak burdur
hatay mardin
batman şırnak
bitlis tunceli
elazığ bayburt
bartın çankırı
niğde

çayır çimen
funda orman
ağaç çam
meşe kayın
kavak söğüt
çınar zeytin
incir asma
gül lale
nergis papatya
menekşe orkide
sümbül zambak
yaprak dal
kök gövde
kabuk tomurcuk
çiçek tohum
meyve polen
toprak taş
kum çakıl
kaya mermer
granit maden
altın gümüş
bakır demir
çelik kömür
petrol orman
`;

function normalizeBankWord(value: string): string {
  return value.normalize('NFC').trim().toLocaleUpperCase('tr-TR');
}

const NOTES = new Set(['SKIP', 'TOO', 'LONG', 'NAME', 'NOT', 'TWO', 'HERE', 'KETTLE', 'CIK']);

export const WORD_BANK: string[] = [
  ...new Set(
    RAW.split(/\s+/)
      .map(normalizeBankWord)
      .filter((word) => word.length >= 3 && word.length <= 6 && !NOTES.has(word)),
  ),
];
