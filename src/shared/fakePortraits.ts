import kizPortraitDisplay from '../reference/opt/thumb/kız.webp'
import kizPortraitFull from '../reference/opt/full/kız.webp'
import erkekPortraitDisplay from '../reference/opt/thumb/erkek.webp'
import erkekPortraitFull from '../reference/opt/full/erkek.webp'

export type FakePortraitGender = 'female' | 'male'
export type FakePortraitSize = 'display' | 'full'

export const FAKE_PORTRAIT_FEMALE = kizPortraitDisplay
export const FAKE_PORTRAIT_MALE = erkekPortraitDisplay

/** Demo profil fotoğrafı — liste/kart için thumb, lightbox için full */
export function fakePortraitForGender(
  gender: FakePortraitGender,
  size: FakePortraitSize = 'display',
): string {
  if (gender === 'male') return size === 'full' ? erkekPortraitFull : erkekPortraitDisplay
  return size === 'full' ? kizPortraitFull : kizPortraitDisplay
}

const FEMALE_IDS = new Set(['zeynep', 'damla', 'ece', 'azra', 'selin', 'ilayda'])

/** ID veya isimden cinsiyet tahmini (demo veri) */
export function fakePortraitForProfile(
  id: string,
  gender?: FakePortraitGender,
  size: FakePortraitSize = 'display',
): string {
  if (gender) return fakePortraitForGender(gender, size)
  return FEMALE_IDS.has(id.toLowerCase())
    ? fakePortraitForGender('female', size)
    : fakePortraitForGender('male', size)
}
