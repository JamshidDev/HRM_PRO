import i18n from '@/i18n/index.js'
import {
  ContactCard20Regular,
  DocumentLock20Regular,
  ShieldKeyhole20Regular,
  UsbStick20Regular
} from '@vicons/fluent'
import { SIGN_METHOD_TONES } from '@/store/modules/index.js'

const { t, te } = i18n.global

export const fullName = (w) =>
  [w?.last_name, w?.first_name, w?.middle_name].filter(Boolean).join(' ')

export const methodLabel = (m) =>
  m
    ? te(`signatureHistory.method.${m}`)
      ? t(`signatureHistory.method.${m}`)
      : m
    : t('signatureHistory.method.unknown')

export const methodTone = (m) => SIGN_METHOD_TONES[m] || 'neutral'

export const viaLabel = (v) =>
  v ? (te(`signatureHistory.via.${v}`) ? t(`signatureHistory.via.${v}`) : v) : '—'

export const keyTypeLabel = (k) =>
  k ? (te(`signatureHistory.keyType.${k}`) ? t(`signatureHistory.keyType.${k}`) : k) : '—'

// Kalit turi badge'i: rang va ikonka.
const KEY_TYPE_STYLE = {
  pfx: { tone: 'brand', icon: DocumentLock20Regular },
  idcard: { tone: 'green', icon: ContactCard20Regular },
  baikey: { tone: 'amber', icon: ShieldKeyhole20Regular },
  ckc: { tone: 'red', icon: UsbStick20Regular }
}
export const keyTypeStyle = (k) => KEY_TYPE_STYLE[k] || null

export const documentLabel = (m) =>
  m
    ? te(`signatureHistory.documentModel.${m}`)
      ? t(`signatureHistory.documentModel.${m}`)
      : m
    : '—'

// User-Agent dan qisqa «Brauzer · OS» yorlig'i.
export const shortUserAgent = (ua) => {
  if (!ua) return '—'
  const os = /Windows/i.test(ua)
    ? 'Windows'
    : /Android/i.test(ua)
      ? 'Android'
      : /iPhone|iPad|iOS/i.test(ua)
        ? 'iOS'
        : /Mac OS X|Macintosh/i.test(ua)
          ? 'macOS'
          : /Linux/i.test(ua)
            ? 'Linux'
            : null
  const browser = /Edg\//.test(ua)
    ? 'Edge'
    : /YaBrowser/.test(ua)
      ? 'Yandex'
      : /OPR\/|Opera/.test(ua)
        ? 'Opera'
        : /Firefox\//.test(ua)
          ? 'Firefox'
          : /Chrome\//.test(ua)
            ? 'Chrome'
            : /Safari\//.test(ua)
              ? 'Safari'
              : /Dart|okhttp|CFNetwork/i.test(ua)
                ? 'App'
                : null
  const label = [browser, os].filter(Boolean).join(' · ')
  return label || (ua.length > 30 ? `${ua.slice(0, 30)}…` : ua)
}

// Chizilgan imzo: data-url yoki xom base64.
export const imageSrc = (img) =>
  !img ? null : img.startsWith('data:') ? img : `data:image/png;base64,${img}`
