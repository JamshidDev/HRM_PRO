// E-IMZO qo'shimcha tasdig'i qaysi sahifalarda talab qilinadi.
// Butun funksiya `src/features/eimzoGate/` ichida; olib tashlash = shu papkani
// o'chirish + App.vue va SignatureInstance.vue dagi ikkita ulanish qatori.

/** Iqtisod (economist) bo'limi sahifalari. */
export const GATE_PATH_PREFIXES = ['/accountant']

/** signatureStore uchun tur nomi (mavjud turlarga tegilmaydi). */
export const GATE_SIGNATURE_TYPE = 'eimzoGate'

export const isGatedPath = (path) =>
  GATE_PATH_PREFIXES.some((prefix) => path.startsWith(prefix))
