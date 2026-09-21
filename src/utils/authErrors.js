/**
 * Login xatolarini TANIB OLISH.
 *
 * Hozircha bitta holat: parol muddati o'tgani uchun backend kirishga ruxsat
 * bermasligi. Bunday xato oddiy toast bo'lib o'tib ketmasligi kerak —
 * foydalanuvchiga nima qilish kerakligi (Telegram bot orqali parolni tiklash)
 * login sahifasining o'zida ko'rsatiladi.
 *
 * ⚠️ Backend bu holatni QANDAY belgilashi kelishilishi kerak. Quyida ehtimoliy
 * ko'rinishlarning hammasi tekshiriladi:
 *   - `password_expired: true` yoki `must_change: true` bayrog'i;
 *   - `code` / `error_code` / `error` maydonida `password_expired` yoki
 *     `password_change_required` satri.
 * Backend boshqacha qaytarsa — o'zgartirish faqat shu faylda, bitta funksiyada.
 *
 * ATAYLAB xabar MATNI bo'yicha tekshirilmaydi: matn to'rt tilda keladi va
 * backendda istalgan payt tahrirlanishi mumkin — bunday tekshiruv jimgina
 * ishlamay qo'yardi.
 */
export const isPasswordExpiredError = (error) => {
  const data = error?.response?.data
  if (!data || typeof data !== 'object') return false

  if (data.password_expired === true || data.must_change === true) return true

  const code = String(data.code ?? data.error_code ?? data.error ?? '').toLowerCase()
  return code.includes('password_expired') || code.includes('password_change_required')
}
