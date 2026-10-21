import DOMPurify from 'dompurify'

// Serverdan/foydalanuvchidan kelgan HTML'ni v-html'dan oldin tozalaydi (XSS).
export const sanitizeHtml = (html) => DOMPurify.sanitize(html == null ? '' : String(html))

// Faqat http/https/blob (va nisbiy) URL'larni qaytaradi; javascript:/data: kabi sxemalar bloklanadi.
export const safeUrl = (url) => {
  if (!url) return null
  try {
    const parsed = new URL(String(url), window.location.origin)
    return ['http:', 'https:', 'blob:'].includes(parsed.protocol) ? parsed.href : null
  } catch {
    return null
  }
}

// Tashqi havolani xavfsiz yangi oynada ochadi.
export const openSafeUrl = (url, target = '_blank') => {
  const href = safeUrl(url)
  if (href) window.open(href, target, 'noopener,noreferrer')
  return !!href
}
