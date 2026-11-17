// Sozlamalar → «Shrift»: foydalanuvchi tanlay oladigan shriftlar.
// Hammasi lotin + kirill + lotin-ext (Oʻ Gʻ ʼ, Ö Ğ Ş Ç, qoraqalpoq Á Ń Ú) harflarini qo'llaydi — 6 til buzilmasin.
// Har bir shrift fayli tekshirilgan (2026-11-17, fontTools): ʻ ʼ, Қ Ғ Ҳ Ў, Ǵ hammasida bor.
// Shriftlar bir-biridan aniq farq qilsin: serifli, yumaloq, ensiz.
// Atayin yo'q: Inter / Source Sans 3 (tizim shriftiga juda o'xshash), Montserrat (kerak emas), Poppins (kirill yo'q),
// Manrope / Nunito / Lora / Comfortaa / Roboto Slab / JetBrains Mono va b. (ʻ, Ǵ yoki Қ Ғ Ҳ yo'q)
// — bunday shriftda yetishmagan harf boshqa shriftda chiqib, matn ola-chalpoq bo'ladi.

// Hozirgi standart tizim shrifti (overwrite.scss dagi bilan bir xil)
export const SYSTEM_FONT_STACK =
  "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', 'Segoe UI', Roboto, sans-serif"

export const appFonts = [
  { key: 'system', labelKey: 'content.fontSystem', family: null },
  {
    key: 'merriweather',
    name: 'Merriweather',
    family: 'Merriweather',
    query: 'Merriweather:wght@400;700'
  },
  {
    key: 'rounded',
    name: 'M PLUS Rounded 1c',
    family: 'M PLUS Rounded 1c',
    query: 'M+PLUS+Rounded+1c:wght@400;500;700'
  },
  {
    key: 'condensed',
    name: 'Fira Sans Condensed',
    family: 'Fira Sans Condensed',
    query: 'Fira+Sans+Condensed:wght@400;500;600;700'
  }
]

export const findAppFont = (key) => appFonts.find((f) => f.key === key) || appFonts[0]

export const fontStack = (font) =>
  font?.family ? `'${font.family}', ${SYSTEM_FONT_STACK}` : SYSTEM_FONT_STACK

// Google Fonts stylesheet'ini bir marta qo'shadi — shrift faqat kerak bo'lganda yuklanadi
export const loadAppFont = (font) => {
  if (!font?.query) return
  const id = `app-font-${font.key}`
  if (document.getElementById(id)) return
  const link = document.createElement('link')
  link.id = id
  link.rel = 'stylesheet'
  link.href = `https://fonts.googleapis.com/css2?family=${font.query}&display=swap`
  document.head.appendChild(link)
}
