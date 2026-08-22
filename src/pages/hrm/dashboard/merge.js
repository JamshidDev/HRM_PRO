/**
 * Mock va haqiqiy dashboard ma'lumotini birlashtirish.
 *
 * Backend hozir maketdagi ma'lumotning bir qismini beradi (batafsil:
 * repo ildizidagi `dashboard-api.md`). Shu sababli kartalar `mock.js` dagi
 * kontrakt shakli ustiga API'dan kelgan qiymatlar yozilgan obyektni o'qiydi:
 * API'da bor maydon g'olib, yo'q maydon mock'da qoladi.
 *
 * Backend yangi endpointlarni bergach `adapter.js` va `mock.js` dagi
 * tegishli bo'limlar o'chiriladi — kartalarga tegilmaydi.
 */

/**
 * "Yo'q" hisoblanadigan qiymatlar — mock o'z o'rnida qoladi.
 *
 * `null` bu ro'yxatda **yo'q**: adapter ataylab `null` bergan maydon
 * (masalan real songa mos keladigan, ammo backend bermaydigan YoY delta)
 * mock qiymati bilan to'ldirilmasligi kerak — aks holda haqiqiy son ustiga
 * o'ylab topilgan o'zgarish chizilardi.
 */
const isAbsent = (value) =>
  value === undefined || (Array.isArray(value) && value.length === 0)

const isPlainObject = (value) =>
  !!value && typeof value === 'object' && !Array.isArray(value)

/**
 * `mock` ustiga `real` ni chuqur yozadi.
 *
 * - `real` da maydon yo'q yoki bo'sh massiv — mock qiymati qoladi
 * - `real` da `null` — aynan `null` qoladi (mock tiklanmaydi)
 * - ikkalasi ham obyekt — rekursiv birlashadi
 * - qolgan hollarda `real` g'olib (massivlar butunlay almashadi, element-element
 *   birlashtirilmaydi: backend ro'yxati mock ro'yxatidan qisqa bo'lsa ham
 *   aynan o'zi ko'rsatilishi kerak)
 */
export const mergeMock = (mock, real) => {
  if (isAbsent(real)) return mock
  if (isPlainObject(mock) && isPlainObject(real)) {
    const out = { ...mock }
    Object.keys(real).forEach((key) => {
      out[key] = mergeMock(mock[key], real[key])
    })
    return out
  }
  return real
}

/**
 * `path` ('education.levels') bo'yicha qiymat API javobida bor-yo'qligini
 * aytadi — kartalardagi "mock" chipini shu belgilaydi.
 */
export const hasApiValue = (source, path) => {
  const value = String(path || '')
    .split('.')
    .reduce((acc, key) => (acc === null || acc === undefined ? acc : acc[key]), source)
  return !isAbsent(value) && value !== null
}
