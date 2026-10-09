import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { premiumPackages } from './data'
import { usePremiumSubscription } from './usePremiumSubscription'

export type PremiumSheetKind = 'upgrade' | 'gift' | null

export type PremiumToastPayload = {
  id: number
  title: string
  subtitle?: string
  variant: 'premium' | 'success'
}

const defaultPackageId =
  premiumPackages.find((p) => p.popular)?.id ?? premiumPackages[0]?.id ?? '3m'

export function usePremiumScreen() {
  const { activatePremium } = usePremiumSubscription()
  const location = useLocation()
  const navigate = useNavigate()
  const [selectedPackageId, setSelectedPackageId] = useState(defaultPackageId)
  const [sheet, setSheet] = useState<PremiumSheetKind>(null)
  const [toast, setToast] = useState<PremiumToastPayload | null>(null)
  const toastId = useRef(0)

  const selectedPackage =
    premiumPackages.find((p) => p.id === selectedPackageId) ?? premiumPackages[0]

  const showToast = useCallback((title: string, subtitle?: string) => {
    toastId.current += 1
    setToast({ id: toastId.current, title, subtitle, variant: 'premium' })
  }, [])

  const dismissToast = useCallback(() => setToast(null), [])

  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(dismissToast, 4200)
    return () => window.clearTimeout(t)
  }, [toast, dismissToast])

  useEffect(() => {
    const notice = (location.state as { notice?: string } | null)?.notice
    if (!notice) return
    showToast('Premium almalısın', notice)
    setSheet('upgrade')
    navigate(location.pathname, { replace: true, state: null })
  }, [location.pathname, location.state, navigate, showToast])

  const openUpgrade = useCallback(() => setSheet('upgrade'), [])
  const openGift = useCallback(() => setSheet('gift'), [])
  const closeSheet = useCallback(() => setSheet(null), [])

  const confirmUpgrade = useCallback(() => {
    if (!selectedPackage) return
    void activatePremium(selectedPackage.id)
      .then(() => {
        setSheet(null)
        showToast(
          'Premium aktif!',
          `${selectedPackage.duration} paketin tanımlandı. Oyuna davet artık açık.`,
        )
      })
      .catch((error: unknown) => {
        showToast(
          'Satın alma tamamlanamadı',
          error instanceof Error ? error.message : 'Play Store veya stub modunu kontrol et.',
        )
      })
  }, [activatePremium, selectedPackage, showToast])

  const confirmGift = useCallback(
    (friendName: string) => {
      if (!selectedPackage) return
      setSheet(null)
      toastId.current += 1
      setToast({
        id: toastId.current,
        title: 'Hediye gönderildi',
        subtitle: `${friendName} için ${selectedPackage.duration} Premium hediye edildi.`,
        variant: 'success',
      })
    },
    [selectedPackage, showToast],
  )

  return {
    selectedPackageId,
    setSelectedPackageId,
    selectedPackage,
    sheet,
    openUpgrade,
    openGift,
    closeSheet,
    confirmUpgrade,
    confirmGift,
    toast,
    dismissToast,
  }
}
