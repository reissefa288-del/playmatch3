import { TURKEY_PROVINCES, type TurkeyProvince } from './turkey-places';

export type CheckInPlace = {
  id: string;
  city: string;
  district: string;
};

function slug(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase('tr-TR')
    .replaceAll('ı', 'i')
    .replaceAll('ğ', 'g')
    .replaceAll('ü', 'u')
    .replaceAll('ş', 's')
    .replaceAll('ö', 'o')
    .replaceAll('ç', 'c')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function placeId(city: string, district: string): string {
  return `tr-${slug(city)}-${slug(district)}`;
}

export function checkInPlaceLabel(place: CheckInPlace): string {
  return `${place.district}, ${place.city}`;
}

export function turkeyProvinces(): readonly TurkeyProvince[] {
  return TURKEY_PROVINCES;
}
