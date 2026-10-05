// Qo'lda tekshiriladigan (n-form rules'siz) buyruq formalari uchun: saqlash
// muvaffaqiyatsiz bo'lgach bo'sh qolgan maydonlarni qizil bilan belgilaydi.
// Maydon to'ldirilishi bilan belgi o'zi yo'qoladi.
export const isEmptyValue = (v) =>
  v === null || v === undefined || (typeof v === 'string' && !v.trim())

export function useEmptyFieldMarks() {
  const showErrors = ref(false)
  const status = (v) => (showErrors.value && isEmptyValue(v) ? 'error' : undefined)
  return { showErrors, status }
}
