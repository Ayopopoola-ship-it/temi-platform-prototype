/**
 * Display formatters for the consoles. All numbers in the prototype are mock
 * display data; these keep number rendering consistent across cards, tables
 * and charts.
 */

/** Full integer with thousands separators, e.g. 48230 → "48,230". */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(Math.round(value))
}

/**
 * Compact volume for cards and sparklines, e.g. 48230 → "48.2k",
 * 1840 → "1.8k", 520 → "520".
 */
export function formatCompact(value: number): string {
  if (value < 1000) return String(Math.round(value))
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value)
}

/** An ISO date string as a readable date, e.g. "2026-04-22" → "22 Apr 2026". */
export function formatDate(iso: string): string {
  // Local, dependency-light: parse the Y-M-D and format without a timezone shift.
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number)
  const MONTHS = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ]
  if (!y || !m || !d) return iso
  return `${d} ${MONTHS[m - 1]} ${y}`
}

/** A 0–1 rate as a whole percentage, e.g. 0.83 → "83%". */
export function formatPercent(value: number, decimals = 0): string {
  return `${(value * 100).toFixed(decimals)}%`
}

/** A signed 0–1 delta as a percentage-point change, e.g. 0.06 → "+6 pts". */
export function formatDeltaPts(delta: number): string {
  const pts = Math.round(delta * 100)
  const sign = pts > 0 ? "+" : ""
  return `${sign}${pts} pts`
}

/** Two-letter monogram from an entity name, e.g. "FCMB Bank" → "FB". */
export function monogram(name: string): string {
  const words = name.trim().split(/\s+/)
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[1][0]).toUpperCase()
}
