// Naive `n-form` ning `validate(callback)` i callback berilgan bo'lsa ham Promise qaytaradi va forma
// noto'g'ri bo'lsa uni xatolar ro'yxati bilan REJECT qiladi. Loyihadagi ~130 formada faqat callback
// ishlatiladi, promise ushlanmaydi → bo'sh formada «Saqlash» bosilsa konsolda «Uncaught (in promise)
// Array(1)» chiqadi, prod'da esa errorReporter uni Telegram'ga «Promise» xatosi qilib yuboradi.
// Bu kutilgan holat (xato maydonlar formada qizil bo'lib ko'rinadi), shuning uchun shu turdagi
// rejection'larni bir joyda jim qilamiz. `await formRef.validate()` ishlatgan joylar o'zgarmaydi —
// ular uchun rejection hamon tashlanadi va kod to'xtaydi.

const isValidateError = (item) =>
  item !== null && typeof item === 'object' && 'message' in item && 'field' in item

// Naive formasi: `[[{ message, field, fieldValue }], …]` (har form-item uchun alohida massiv).
export const isFormValidationRejection = (reason) =>
  Array.isArray(reason) &&
  reason.length > 0 &&
  reason.every((group) => Array.isArray(group) && group.length > 0 && group.every(isValidateError))

const onUnhandledRejection = (event) => {
  if (isFormValidationRejection(event.reason)) event.preventDefault()
}

// main.js dan errorReporter'dan OLDIN chaqiriladi.
export const ignoreFormValidationRejections = () => {
  window.addEventListener('unhandledrejection', onUnhandledRejection)
}
