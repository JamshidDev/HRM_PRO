/**
 * Tabel panjarasining rang tizimi.
 *
 * Manba — Figma «HRM Railway» maketi (node 3368:103614). Har bir holat uchun
 * maketda fon va matn rangi juftligi berilgan; ular loyihaning mavjud
 * `--fig-*` tokenlariga xaritalandi (yangi rang kiritilmadi):
 *
 *   I / ish kuni   RANGSIZ — oddiy katakcha (fon ham, matn rangi ham berilmaydi)
 *   T / ta'til     --fig-chip-amber-bg    / --fig-chip-amber-text (sariq)
 *   B / bayram     --fig-red-50           / --fig-text-red        (qizil)
 *   K / kasallik   --fig-chip-pink-bg     / --fig-chip-pink-text  (pushti)
 *   Y / kelmagan   --fig-chip-pink-bg     / --fig-chip-pink-text  (pushti)
 *   dam olish      --fig-red-50           (bo'sh dam olish kuni ham qizil)
 *
 * MUHIM: kalit — backend qaytaradigan `detail.status` HARFI (tabel enum'idagi
 * `key`). Harf ro'yxatda bo'lmasa element neytral ko'rinishda chiziladi, ya'ni
 * yangi holat turi qo'shilsa jadval buzilmaydi — faqat rangsiz chiqadi.
 */
// TimeSheetTypeEnum id → MATN rangi. Har bir option o'z rangida chiziladi,
// katakcha foni esa neytral qoladi (faqat dam olish/bayram kuni xira qizil).
//
// Kalit ID (harf EMAS): harflar to'qnashadi — lotin `K` (id 1) va kirill `К`
// (id 10), lotin `T` (id 2) va kirill `Т` (id 26).
export const TimesheetTypeColor = {
  // ── Ishlangan vaqt (soat qo'yiladi) ────────────────────────────────────
  1: 'var(--textColor0)', //     K   Kunduzgi ish soatlari — QORA
  2: 'var(--fig-icon-green)', //  T   Tungi ish soatlari — YASHIL
  3: 'var(--fig-icon-amber)', //  РП  Dam olish/bayram kunlari ishlash — SARIQ
  5: 'var(--fig-text-brand)', //  С   Qo'shimcha ish soatlari — KO'K
  17: 'var(--fig-chip-indigo-text)', // УВ  Qisqartirilgan (o'qiydiganlar) — INDIGO
  27: 'var(--fig-chip-indigo-text)', // ЛЧ  Qonun asosida qisqartirilgan — INDIGO
  32: 'var(--textColor3)', //     НС  Ma'muriyat tashabbusi bilan bajarilmagan — KULRANG

  // ── Ishda, lekin ish joyida emas ───────────────────────────────────────
  10: 'var(--fig-text-brand)', // К   Xizmat safarida — KO'K

  // ── Ta'tillar — SARIQ oila ─────────────────────────────────────────────
  14: 'var(--fig-chip-amber-text)', // MT  Yillik asosiy to'lanadigan
  15: 'var(--fig-chip-amber-text)', // ОД  Qo'shimcha to'lanadigan
  16: 'var(--fig-chip-amber-text)', // У   O'qish bo'yicha to'lanadigan
  18: 'var(--fig-chip-amber-text)', // УД  O'qish bo'yicha to'lanmaydigan
  19: 'var(--fig-icon-pink)', //      Р   Homiladorlik va tug'ish — PUSHTI
  20: 'var(--fig-icon-pink)', //      ОЧ  Qisman to'lanadigan bola parvarishi — PUSHTI
  21: 'var(--fig-icon-pink)', //      ОЖ  To'lanmaydigan bola parvarishi — PUSHTI
  22: 'var(--fig-chip-amber-text)', // ДО  Ma'muriyat ruxsati bilan
  24: 'var(--fig-chip-amber-text)', // ОЗ  Qonun bilan ruxsat etilgan

  // ── Kasallik — BINAFSHA/PUSHTI ─────────────────────────────────────────
  25: 'var(--fig-chip-pink-text)', // Б   Vaqtincha mehnatga layoqatsizlik
  26: 'var(--fig-chip-pink-text)', // Т   To'lanmaydigan layoqatsizlik

  // ── Ishga chiqmagan / ishlamagan — QIZIL oila ──────────────────────────
  28: 'var(--fig-text-red)', //  ВП  Ishchi aybisiz turib qolish
  29: 'var(--fig-text-red)', //  Г   Qonun asosida to'liq kun ishlamagan
  31: 'var(--fig-bg-red-fill)', // ПР  Sababsiz kelmagan (pragul) — TO'Q QIZIL
  34: 'var(--fig-text-red)', //  ЗБ  Qonuniy ish tashlash
  35: 'var(--fig-bg-red-fill)', // НН  Aniqlanmagan sabab — TO'Q QIZIL

  // ── Dam olish va bayram ────────────────────────────────────────────────
  33: 'var(--fig-bg-red-fill)' // D   Dam olish va bayram kunlari — QIZIL
}

/** Bitta yozuvning matn rangi; noma'lum tur — qora. */
export const colorOfDetail = (detail) =>
  TimesheetTypeColor[detail?.status_id] ?? 'var(--textColor0)'
