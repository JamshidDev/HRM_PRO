// To'lov turlari (vid) — qisqa nom va turkum mapping (spec 2-bosqich).
// 1C `paying_name` ruscha va ko'pincha "Используется с dd.mm.yyyy …" prefiksi bilan
// keladi. Jadvalda qisqa o'zbekcha nom ko'rsatiladi, to'liq 1C nomi tooltipda.

// 1C nomidagi "Используется с dd.mm.yyyy" kabi prefikslarni olib tashlaydi.
export function stripVidPrefix(name) {
  return String(name ?? '')
    .replace(/используется\s+с\s+\d{1,2}[.\-/]\d{1,2}[.\-/]\d{2,4}\s*/gi, '')
    .replace(/^\s*[«"']?\s*/, '')
    .trim()
}

// Kod → qisqa o'zbekcha nom (eng ko'p uchraydigan vidlar). Yo'q bo'lsa — 1C nomidan
// prefiks olib tashlangan qisqartma ishlatiladi.
export const VID_SHORT = {
  '001': 'Ishbay haq (asosiy)',
  '002': 'Ishbay haq (qo‘shimcha)',
  '004': 'Oklad bo‘yicha haq',
  '005': 'Vaqtbay haq (tarif)',
  '007': 'Tungi ish haqi',
  '008': 'Ishbay mukofot',
  '011': 'Oylik mukofot (vaqtbay)',
  '012': 'Oylik mukofot (rahbar)',
  '013': 'Qo‘shimcha mukofot',
  '023': 'Sinf/malaka ustamasi',
  '030': 'O‘rtacha haq bo‘yicha',
  '032': 'Asosiy ta’til',
  '078': 'Murakkablik ustamasi',
  '247': 'Ovqatlanish to‘lovi'
}

// Turkumlar.
export const VID_CATEGORIES = [
  'Asosiy ish haqi',
  'Mukofotlar',
  'Qo‘shimcha to‘lovlar',
  'Ta’tillar',
  'Moddiy yordam',
  'Boshqa'
]

// Kod bo'yicha aniq turkum (nom heuristikasidan ustun turadi).
const VID_CAT_CODE = {
  '001': 'Asosiy ish haqi',
  '002': 'Asosiy ish haqi',
  '004': 'Asosiy ish haqi',
  '005': 'Asosiy ish haqi',
  '006': 'Asosiy ish haqi',
  '007': 'Asosiy ish haqi',
  '008': 'Mukofotlar',
  '009': 'Mukofotlar',
  '010': 'Mukofotlar',
  '011': 'Mukofotlar',
  '012': 'Mukofotlar',
  '013': 'Mukofotlar',
  '014': 'Mukofotlar',
  '032': 'Ta’tillar',
  '033': 'Ta’tillar',
  '034': 'Ta’tillar'
}

// 1C ruscha nomidan turkum (kalit so'z bo'yicha) — kod mappingi bo'lmasa.
function categoryByName(name) {
  const n = String(name ?? '').toLowerCase()
  if (/отпуск|ta['’ʻ]?til/.test(n)) return 'Ta’tillar'
  if (/матер|помощ|yordam/.test(n)) return 'Moddiy yordam'
  if (/преми|вознагражд|mukofot/.test(n)) return 'Mukofotlar'
  if (/надбавк|доплат|ustama|qo['’ʻ]?shimcha/.test(n)) return 'Qo‘shimcha to‘lovlar'
  if (/оклад|сдельн|тариф|повремен|oklad|ishbay|vaqtbay/.test(n)) return 'Asosiy ish haqi'
  return 'Boshqa'
}

export function vidShortName(code, fullName) {
  return VID_SHORT[code] || stripVidPrefix(fullName) || code
}

export function vidCategory(code, fullName) {
  return VID_CAT_CODE[code] || categoryByName(fullName)
}

// Turkum → fig rang tokeni (stacked bar uchun).
export const VID_CAT_TOKEN = {
  'Asosiy ish haqi': '--fig-icon-brand',
  Mukofotlar: '--fig-icon-orange',
  'Qo‘shimcha to‘lovlar': '--fig-icon-indigo',
  'Ta’tillar': '--fig-icon-green',
  'Moddiy yordam': '--fig-icon-amber',
  Boshqa: '--fig-text-tertiary'
}
