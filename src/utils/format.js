/**
 * Format a price using the browser's Intl.NumberFormat.
 * Defaults to Nigerian Naira (₦) for the target audience.
 * Automatically handles symbol placement, grouping, etc.
 *
 * Usage:
 *   formatPrice(5000)          → "₦5,000"
 *   formatPrice(5000, 'USD')   → "$5,000.00"
 *   formatPrice(150.5, 'NGN')  → "₦151"
 */
export const formatPrice = (amount, currency = 'NGN') => {
  const locale = currency === 'NGN' ? 'en-NG' : 'en-US'
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: currency === 'NGN' ? 0 : 2,
  }).format(amount)
}



/**
 * Get the per-lead price for custom amounts.
 *
 * NGN tiers:
 *   ≤100  → ₦50/lead
 *   ≤500  → ₦40/lead
 *   ≤1000 → ₦35/lead
 *   ≤5000 → ₦25/lead
 *   5000+ → ₦20/lead
 */
export const getCustomPricePerLead = (currency = 'NGN', leadCount = 0) => {
  if (currency === 'NGN') {
    if (leadCount <= 100) return 50
    if (leadCount <= 500) return 40
    if (leadCount <= 1000) return 35
    if (leadCount <= 5000) return 25
    return 20
  }
  // USD (Matched to new production tiers)
  if (leadCount <= 100) return 0.18
  if (leadCount <= 500) return 0.12
  if (leadCount <= 1000) return 0.10
  if (leadCount <= 5000) return 0.08
  return 0.07
}
