import kizPortraitDisplay from '../reference/opt/thumb/kız.webp'
import kizPortraitFull from '../reference/opt/full/kız.webp'
import kizPortraitDisplayAvif from '../reference/opt/thumb/kız.avif'
import kizPortraitFullAvif from '../reference/opt/full/kız.avif'
import kizPortraitBlur from '../reference/opt/blur/kız.webp'
import erkekPortraitDisplay from '../reference/opt/thumb/erkek.webp'
import erkekPortraitFull from '../reference/opt/full/erkek.webp'
import erkekPortraitDisplayAvif from '../reference/opt/thumb/erkek.avif'
import erkekPortraitFullAvif from '../reference/opt/full/erkek.avif'
import erkekPortraitBlur from '../reference/opt/blur/erkek.webp'
import type { PhotoSet } from './photoPipeline'

export type FakePortraitGender = 'female' | 'male'
export type FakePortraitSize = 'display' | 'full'

export type PortraitSources = { webp: string; avif: string }

export const FAKE_PORTRAIT_FEMALE = kizPortraitDisplay
export const FAKE_PORTRAIT_MALE = erkekPortraitDisplay

const FEMALE_PHOTO: PhotoSet = {
  thumb: { webp: kizPortraitDisplay, avif: kizPortraitDisplayAvif },
  full: { webp: kizPortraitFull, avif: kizPortraitFullAvif },
  blur: kizPortraitBlur,
}

const MALE_PHOTO: PhotoSet = {
  thumb: { webp: erkekPortraitDisplay, avif: erkekPortraitDisplayAvif },
  full: { webp: erkekPortraitFull, avif: erkekPortraitFullAvif },
  blur: erkekPortraitBlur,
}

/** Demo profil fotoğrafı — liste/kart için thumb, lightbox için full */
export function fakePortraitForGender(
  gender: FakePortraitGender,
  size: FakePortraitSize = 'display',
): string {
  const set = gender === 'male' ? MALE_PHOTO : FEMALE_PHOTO
  return size === 'full' ? set.full.webp : set.thumb.webp
}

export function fakePortraitSourcesForGender(
  gender: FakePortraitGender,
  size: FakePortraitSize = 'display',
): PortraitSources {
  const set = gender === 'male' ? MALE_PHOTO : FEMALE_PHOTO
  const pick = size === 'full' ? set.full : set.thumb
  return { webp: pick.webp, avif: pick.avif ?? pick.webp }
}

const FRAME_POSITIONS = ['50% 12%', '50% 42%', '50% 72%'] as const

/** Aynı portrenin üç kadrajı. Ayrı fotoğraf dosyası yok. */
export function fakePortraitFrames(gender: FakePortraitGender, idPrefix: string) {
  const src = fakePortraitForGender(gender)
  return FRAME_POSITIONS.map((objectPosition, index) => ({
    id: `${idPrefix}-${index + 1}`,
    src,
    objectPosition,
  }))
}

/** P12 — thumb + full + blur for responsive PhotoImage */
export function fakePhotoSetForGender(gender: FakePortraitGender): PhotoSet {
  return gender === 'male' ? MALE_PHOTO : FEMALE_PHOTO
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

export function fakePortraitSourcesForProfile(
  id: string,
  gender?: FakePortraitGender,
  size: FakePortraitSize = 'display',
): PortraitSources {
  if (gender) return fakePortraitSourcesForGender(gender, size)
  return FEMALE_IDS.has(id.toLowerCase())
    ? fakePortraitSourcesForGender('female', size)
    : fakePortraitSourcesForGender('male', size)
}

export function fakePhotoSetForProfile(id: string, gender?: FakePortraitGender): PhotoSet {
  if (gender) return fakePhotoSetForGender(gender)
  return FEMALE_IDS.has(id.toLowerCase()) ? FEMALE_PHOTO : MALE_PHOTO
}
