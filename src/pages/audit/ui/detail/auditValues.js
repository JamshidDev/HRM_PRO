/**
 * Tarix modalidagi qiymatlarni o'qiladigan matnga aylantiradi.
 *
 * Backend imzolovchi yozuvida turi, holati va usulini xom kod bilan beradi
 * (`s`, `1`, `1`). Yozuv imzolovchiniki ekanini turi maydonidagi `w/s/d/r`
 * kodidan bilamiz; faqat shunday yozuvlarda kod o'rniga ma'nosi chiqadi,
 * boshqa sahifalardagi `status` maydonlariga tegilmaydi. Noma'lum kod
 * (masalan holat `5`) o'zicha ko'rsatiladi — taxmin qilinmaydi.
 */
import i18n from '@/i18n/index.js'

const { t } = i18n.global

const SIGNER_ROLES = ['w', 's', 'd', 'r']
// Imzo usuli: ApprovalHistory.vue dagi kabi; hozircha faqat `1` aniq ma'lum.
const SIGN_METHODS = { 1: 'E-IMZO' }

// Maydon turi kalit nomi YOKI backend bergan yorlig'i bo'yicha topiladi
// (kalit nomlari hujjatlanmagan, yorliq esa so'rov tilida keladi).
const fieldText = (f) => `${f.field || ''} ${f.label || ''}`
const isRoleField = (f) => /type|role|turi|тури|тип|рол/i.test(fieldText(f))
const isMethodField = (f) => /method|usul|усул|способ/i.test(fieldText(f))
const isStatusField = (f) => /status|state|holat|ҳолат|статус|состояни/i.test(fieldText(f))

const roleCode = (value) =>
  String(value ?? '')
    .trim()
    .toLowerCase()

export const isEmpty = (value) => value === null || value === undefined || value === ''

export const isBool = (f, value) => f.type === 'bool' && !isEmpty(value)

/** Yozuv imzolovchiniki: turi maydonida `w/s/d/r` kodlaridan biri turibdi. */
export const isSignerChange = (ch) =>
  (ch.fields || []).some(
    (f) => isRoleField(f) && [f.old, f.new].some((v) => SIGNER_ROLES.includes(roleCode(v)))
  )

// Imzolovchi kodining ma'nosi; ma'lum bo'lmasa `null`.
const codeMeaning = (f, value) => {
  const code = String(value).trim()
  const role = roleCode(value)
  if (isRoleField(f) && SIGNER_ROLES.includes(role)) {
    return role === 'r'
      ? t('documentPage.command.form.route.roleView')
      : t(`documentPage.signature.approval.roles.${role}`)
  }
  // Usul holatdan OLDIN: "Imzo usuli" kaliti `sign_type` bo'lishi mumkin.
  if (isMethodField(f)) return SIGN_METHODS[code] || null
  if (isStatusField(f) && ['1', '2', '3', '4'].includes(code)) {
    return t(`documentPage.command.dataTab.resend.status.${code}`)
  }
  return null
}

/**
 * Imzolovchi yozuvidagi kod, ma'nosi bizga noma'lum (masalan holat `5`).
 * Bunday qiymat raqamligicha, lekin "tavsifi yo'q" izohi bilan chiziladi.
 */
export const isUnknownCode = (f, value, signer) =>
  signer &&
  !isEmpty(value) &&
  typeof value !== 'object' &&
  f.type !== 'bool' &&
  (isRoleField(f) || isMethodField(f) || isStatusField(f)) &&
  !codeMeaning(f, value)

/**
 * Qiymat matni. `ref` tipidagi maydon backenddan `{id, name}` bo'lib keladi.
 * Imzolovchi yozuvida kod o'rniga uning ma'nosi chiqadi (`s` → Kelishuvchi).
 * `bool` bu yerda ishlanmaydi — u ikonka bilan chiziladi.
 */
export const valueText = (f, value, signer) => {
  if (isEmpty(value)) return '—'
  if (typeof value === 'object') {
    if (f.type === 'ref') return value.name || `#${value.id}`
    return JSON.stringify(value)
  }
  return (signer && codeMeaning(f, value)) || String(value)
}

/**
 * Yozuvning qisqa nomi qatori uchun: birinchi matnli maydon — sarlavha,
 * keyingilari — izoh (imzolovchida: familiya · lavozim · rol · usul).
 * O'chirilgan yozuvda eski, qolganlarida yangi qiymatlar olinadi.
 */
export const recordOf = (ch, signer) => {
  const side = ch.has_new ? 'new' : 'old'
  const parts = (ch.fields || [])
    .filter((f) => f.type !== 'bool' && !isEmpty(f[side]))
    .filter((f) => !signer || !isStatusField(f) || isRoleField(f))
    .map((f) => valueText(f, f[side], signer))
  const [title, ...rest] = parts
  return {
    title: title || (ch.trigger_id ? `#${ch.trigger_id}` : '—'),
    // Imzolovchida rol va usul ham izohga kiradi; boshqa yozuvlarda faqat bittasi.
    subtitle: rest.slice(0, signer ? 3 : 1).join(' · ')
  }
}

/** Hodisaning bir jumlalik xulosasi: "2 ta qo'shildi, 1 ta o'chirildi". */
export const summaryOf = (ev) => {
  const counts = {}
  for (const ch of ev.changes || []) counts[ch.status] = (counts[ch.status] || 0) + 1
  return ['create', 'update', 'delete', 'restore']
    .filter((s) => counts[s])
    .map((s) => t(`audit.detail.summary.${s}`, { n: counts[s] }))
    .join(', ')
}
