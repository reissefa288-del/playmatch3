/** SHA-256 fingerprint normalize + validate (Google assetlinks format). */
export function normalizeSha256Fingerprint(raw) {
  const trimmed = String(raw).trim().toUpperCase()
  if (/^([0-9A-F]{2}:){31}[0-9A-F]{2}$/.test(trimmed)) return trimmed
  const hex = trimmed.replace(/[^0-9A-F]/g, '')
  if (hex.length !== 64) return null
  return hex.match(/.{1,2}/g).join(':')
}

export function isValidSha256Fingerprint(value) {
  return normalizeSha256Fingerprint(value) != null
}

export function parseKeytoolOutput(text) {
  const match = text.match(/SHA-?256:\s*([0-9A-Fa-f:]+)/i)
  if (!match) return null
  return normalizeSha256Fingerprint(match[1])
}
