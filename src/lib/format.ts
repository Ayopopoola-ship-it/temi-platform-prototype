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
