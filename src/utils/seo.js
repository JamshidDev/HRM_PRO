// Ochiq sahifalar SEO'si: sarlavha, tavsif, canonical, OG va JSON-LD (Google renderdan keyin o'qiydi).
const SITE = 'https://hrm.railway.uz'

const upsertMeta = (attr, key, content) => {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

export function setSeo({ title, description, path = '/', jsonLd = null }) {
  const url = SITE + path
  if (title) {
    document.title = title
    upsertMeta('property', 'og:title', title)
    upsertMeta('name', 'twitter:title', title)
  }
  if (description) {
    upsertMeta('name', 'description', description)
    upsertMeta('property', 'og:description', description)
    upsertMeta('name', 'twitter:description', description)
  }
  upsertMeta('property', 'og:url', url)
  let canonical = document.head.querySelector('link[rel="canonical"]')
  if (!canonical) {
    canonical = document.createElement('link')
    canonical.setAttribute('rel', 'canonical')
    document.head.appendChild(canonical)
  }
  canonical.setAttribute('href', url)

  // Sahifaga xos JSON-LD alohida tegda (index.html'dagi umumiy JSON-LD saqlanadi).
  document.getElementById('page-jsonld')?.remove()
  if (jsonLd) {
    const s = document.createElement('script')
    s.type = 'application/ld+json'
    s.id = 'page-jsonld'
    s.textContent = JSON.stringify(jsonLd)
    document.head.appendChild(s)
  }
}

export const SEO_SITE = SITE
