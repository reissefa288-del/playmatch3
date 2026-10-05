/** Premium UI — varsayılan açık; kapalı testte `.env` → `VITE_PREMIUM_ENABLED=false` */
export function isPremiumFeatureEnabled(): boolean {
  return import.meta.env.VITE_PREMIUM_ENABLED !== 'false'
}
