import kizPortrait from '../reference/kız.jpg'
import erkekPortrait from '../reference/erkek.jpg'

export type FakePortraitGender = 'female' | 'male'

export const FAKE_PORTRAIT_FEMALE = kizPortrait
export const FAKE_PORTRAIT_MALE = erkekPortrait

/** Demo profil fotoğrafı — kız.jpg / erkek.jpg */
export function fakePortraitForGender(gender: FakePortraitGender): string {
  return gender === 'male' ? FAKE_PORTRAIT_MALE : FAKE_PORTRAIT_FEMALE
}

const FEMALE_IDS = new Set([
  'zeynep',
  'damla',
  'ece',
  'azra',
  'selin',
  'ilayda',
])

/** ID veya isimden cinsiyet tahmini (demo veri) */
export function fakePortraitForProfile(id: string, gender?: FakePortraitGender): string {
  if (gender) return fakePortraitForGender(gender)
  return FEMALE_IDS.has(id.toLowerCase()) ? FAKE_PORTRAIT_FEMALE : FAKE_PORTRAIT_MALE
}
