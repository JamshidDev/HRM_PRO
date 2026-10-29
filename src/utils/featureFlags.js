// Muhit bo'yicha feature-flaglar.
//
// Oylik nazorati (salary-control) — HOZIRCHA FAQAT DEV, prodda ko'rinmasligi kerak.
// Prod build `vite build --mode production` (MODE='production') → o'chiq.
// Dev build `vite build --mode development` (build:dev, MODE='development') → yoqiq.
// Majburan boshqarish: server .env da VITE_SALARY_CONTROL_ENABLED=true (yoqadi) / =false (o'chiradi).
export const isSalaryControlEnabled =
  import.meta.env.VITE_SALARY_CONTROL_ENABLED === 'true' ||
  (import.meta.env.VITE_SALARY_CONTROL_ENABLED !== 'false' &&
    import.meta.env.MODE !== 'production')
