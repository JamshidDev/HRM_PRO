import { ref, toValue, watchEffect } from 'vue'
import QRCode from 'qrcode'

/**
 * Beriladigan qiymatdan QR kod rasmini (data URL) hosil qiladi.
 * Qiymat berilmasa joriy sahifa manziliga QR yasaladi.
 *
 * @param {import('vue').MaybeRefOrGetter<string>} value QR ichiga yoziladigan matn
 * @param {{ size?: number, errorCorrectionLevel?: string }} [options]
 */
export function useQrCode(value, options = {}) {
  const { size = 270, errorCorrectionLevel = 'M' } = options
  const qrDataUrl = ref('')

  watchEffect(() => {
    const text = toValue(value) || window.location.href
    QRCode.toDataURL(text, {
      margin: 0,
      width: size,
      errorCorrectionLevel,
      color: { dark: '#101828ff', light: '#ffffffff' }
    })
      .then((url) => {
        qrDataUrl.value = url
      })
      .catch(() => {
        qrDataUrl.value = ''
      })
  })

  return { qrDataUrl }
}
