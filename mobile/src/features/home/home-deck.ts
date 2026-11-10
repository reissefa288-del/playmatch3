export type HomeGender = 'all' | 'female' | 'male';
export type HomeDistance = 10 | 15 | 25 | 50;

export type HomeFilters = {
  gender: HomeGender;
  maxDistanceKm: HomeDistance;
  onlineOnly: boolean;
};

export const DEFAULT_HOME_FILTERS: HomeFilters = {
  gender: 'all',
  maxDistanceKm: 25,
  onlineOnly: true,
};

export const HOME_DISTANCE_OPTIONS: HomeDistance[] = [10, 15, 25, 50];

export const HOME_GENDER_OPTIONS: { id: HomeGender; label: string }[] = [
  { id: 'all', label: 'Hepsi' },
  { id: 'female', label: 'Kadın' },
  { id: 'male', label: 'Erkek' },
];

export const DAILY_LIKES_LIMIT = 20;
export const BOOST_GEM_COST = 35;

export type HomeCard = {
  id: string;
  name: string;
  age: number;
  online: boolean;
  distanceKm: number;
  distanceLabel?: string;
  location: string;
  bio: string;
  portrait?: number;
};

const HOME_BOTS = [
  { name: 'Elif', bio: 'Akşamları oyun, gündüzleri kahve.' },
  { name: 'Zeynep', bio: 'Rekabeti seven biriyim.' },
  { name: 'Defne', bio: 'Yeni oyunlar denemeyi severim.' },
  { name: 'Ece', bio: 'Sakin bir maç, sonra sohbet.' },
  { name: 'Azra', bio: 'Takım oyunlarında iyiyim.' },
  { name: 'Selin', bio: 'Hafta sonu uzun maçlar bana göre.' },
  { name: 'İlayda', bio: 'Kaybetmeyi de kazanmayı da severim.' },
  { name: 'Damla', bio: 'Bir el daha diyemem.' },
  { name: 'Nehir', bio: 'Müzik açık, oyun da açık.' },
  { name: 'Lara', bio: 'Yeni insanlarla oynamayı severim.' },
] as const;

/** Web ana sayfadaki geçici kadın bot destesi. Erkek filtresinde web de desteyi kapatır. */
export function homeCards(filters: HomeFilters): HomeCard[] {
  if (filters.gender === 'male') return [];

  return HOME_BOTS.map((bot, index) => ({
    id: `bot-home-${index + 1}`,
    name: `${bot.name} · Bot`,
    age: 21 + index,
    online: index % 2 === 0,
    distanceKm: index + 1,
    location: 'Bot',
    bio: bot.bio,
  })).filter((card) => {
    if (filters.onlineOnly && !card.online) return false;
    return card.distanceKm <= filters.maxDistanceKm;
  });
}
