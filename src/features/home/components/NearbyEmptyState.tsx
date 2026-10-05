import { FiMapPin, FiUsers } from 'react-icons/fi'

type NearbyEmptyStateProps = {
  needsLocation: boolean
  onEnableLocation?: () => void
}

export function NearbyEmptyState({ needsLocation, onEnableLocation }: NearbyEmptyStateProps) {
  if (needsLocation) {
    return (
      <div className="pm-nearby-empty">
        <FiMapPin aria-hidden />
        <p className="pm-nearby-empty__title">Konum paylaşımı gerekli</p>
        <p className="pm-nearby-empty__text">
          Yakınındaki gerçek oyuncuları görmek için konumunu aç.
        </p>
        {onEnableLocation ? (
          <button type="button" className="pm-nearby-empty__cta" onClick={onEnableLocation}>
            Konumu Aç
          </button>
        ) : null}
      </div>
    )
  }

  return (
    <div className="pm-nearby-empty">
      <FiUsers aria-hidden />
      <p className="pm-nearby-empty__title">Yakında oyuncu yok</p>
      <p className="pm-nearby-empty__text">
        Bu mesafede henüz aktif profil bulunamadı. Filtreyi genişletmeyi veya daha sonra tekrar
        bakmayı dene.
      </p>
    </div>
  )
}
