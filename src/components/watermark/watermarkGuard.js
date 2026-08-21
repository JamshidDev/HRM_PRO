import { onBeforeUnmount, onMounted, watch } from 'vue'

// Watermark himoyasi (integrity guard).
//
// Maqsad: devtools orqali watermark tugunini o'chirish, `class`ini olib tashlash,
// `display:none` qilish yoki uning CSS qoidalarini o'chirish orqali watermarkni
// yashirib bo'lmasin. Buzilish aniqlansa avval o'zini tiklaydi (heal), agar tiklash
// ham ishlamasa yoki buzish qayta-qayta takrorlansa — sahifa "lockdown"ga o'tadi:
// ilova DOM'dan o'chiriladi va oq ekran qoladi.
//
// DIQQAT: bu 100% himoya emas — brauzerda ishlaydigan JS'ni tajribali odam
// breakpoint qo'yib yoki script'ni bloklab chetlab o'tishi mumkin. Bu "tasodifiy
// va oson chetlab o'tishni" imkonsiz qiladigan to'sqinlik.

export const WATERMARK_ROOT_CLASS = 'app-watermark'
export const WATERMARK_TILES_CLASS = 'app-watermark__tiles'

// Tekshiruv qadami (ms). MutationObserver darhol ushlaydi; interval esa observer
// yetib bormaydigan holatlar uchun (masalan stylesheet qoidasi o'chirilgani).
const CHECK_INTERVAL = 700
// Shu oyna ichida (ms) MAX_STRIKES'dan ko'p buzilish bo'lsa — lockdown. Ya'ni
// birinchi 2 urinish tiklanadi, 3-chisida ekran oq bo'lib qoladi.
const STRIKE_WINDOW = 60_000
const MAX_STRIKES = 2
// Plitkalar shundan xiraroq bo'lsa — "o'chirilgan" deb hisoblanadi.
const MIN_TILE_OPACITY = 0.04
const Z_INDEX = '99999'

const ROOT_STYLE = {
  position: 'fixed',
  top: '0px',
  right: '0px',
  bottom: '0px',
  left: '0px',
  'z-index': Z_INDEX,
  'pointer-events': 'none',
  overflow: 'hidden',
  'user-select': 'none',
  display: 'block',
  visibility: 'visible',
  opacity: '1',
  'mix-blend-mode': 'difference'
}

const TILES_STATIC_STYLE = {
  position: 'absolute',
  top: '-50%',
  left: '-50%',
  width: '200%',
  height: '200%',
  'background-repeat': 'repeat',
  display: 'block',
  visibility: 'visible'
}

// Kritik stillar `!important` bilan inline yoziladi: shunda scoped CSS qoidasini
// (yoki butun <style> tegini) o'chirish watermarkni yo'q qilmaydi.
const forceStyles = (node, map) => {
  for (const [prop, value] of Object.entries(map)) {
    if (node.style.getPropertyValue(prop) !== value) {
      node.style.setProperty(prop, value, 'important')
    }
  }
}

export const applyWatermarkStyles = (root, tilesStyle) => {
  if (!root) return
  forceStyles(root, ROOT_STYLE)
  const tiles = root.firstElementChild
  if (!tiles) return
  forceStyles(tiles, TILES_STATIC_STYLE)
  if (tilesStyle) {
    forceStyles(tiles, {
      'background-image': tilesStyle.backgroundImage,
      transform: tilesStyle.transform,
      opacity: String(tilesStyle.opacity)
    })
  }
}

// Buzilgan bo'lsa — sababni (string) qaytaradi, joyida bo'lsa — null.
const inspect = (root) => {
  if (!root) return 'root:missing'
  if (!root.isConnected || root.parentNode !== document.body) return 'root:detached'
  if (!root.classList.contains(WATERMARK_ROOT_CLASS)) return 'root:class'

  const cs = getComputedStyle(root)
  if (cs.display === 'none') return 'root:display'
  if (cs.visibility !== 'visible') return 'root:visibility'
  if (cs.position !== 'fixed') return 'root:position'
  if (cs.mixBlendMode !== 'difference') return 'root:blend'
  if (parseFloat(cs.opacity) < 0.99) return 'root:opacity'
  if (!(parseInt(cs.zIndex, 10) >= 1000)) return 'root:zIndex'

  // Fon tabida brauzer layout'ni to'xtatib turishi mumkin — o'lchamni faqat sahifa
  // ko'rinib turganda tekshiramiz, aks holda bekordan-bekorga lockdown bo'ladi.
  if (document.visibilityState === 'visible') {
    const rect = root.getBoundingClientRect()
    if (rect.width < window.innerWidth * 0.9 || rect.height < window.innerHeight * 0.9) {
      return 'root:size'
    }
  }

  const tiles = root.firstElementChild
  if (!tiles) return 'tiles:missing'
  if (!tiles.classList.contains(WATERMARK_TILES_CLASS)) return 'tiles:class'

  const ts = getComputedStyle(tiles)
  if (ts.display === 'none') return 'tiles:display'
  if (ts.visibility !== 'visible') return 'tiles:visibility'
  if (!ts.backgroundImage || ts.backgroundImage === 'none') return 'tiles:image'
  if (!(parseFloat(ts.opacity) >= MIN_TILE_OPACITY)) return 'tiles:opacity'
  if (ts.backgroundRepeat.indexOf('repeat') !== 0) return 'tiles:repeat'

  return null
}

let locked = false

// Ilovani ko'rsatmaslik: <style> + oq qatlam qo'yiladi va ikkisi ham doimiy
// qayta tiklanadi (o'chirilsa — darhol qaytadi). Keyin `#app` ichi tozalanadi,
// ya'ni kontent DOM'da ham qolmaydi — faqat sahifani reload qilish yordam beradi.
export const lockdownPage = (reason) => {
  if (locked) return
  locked = true

  const LOCK_ATTR = 'data-wm-lock'
  const STYLE_ID = 'wm-lock-style'
  const CSS =
    `html,body{background:#ffffff!important;overflow:hidden!important}` +
    `body>*:not([${LOCK_ATTR}]){display:none!important;visibility:hidden!important;` +
    `opacity:0!important;pointer-events:none!important}`

  const message =
    "Sahifa himoyasi buzilgani aniqlandi. Davom etish uchun sahifani qayta yuklang."

  const ensure = () => {
    let style = document.getElementById(STYLE_ID)
    if (!style || !style.isConnected) {
      style = document.createElement('style')
      style.id = STYLE_ID
      style.setAttribute(LOCK_ATTR, '')
      document.head.appendChild(style)
    }
    if (style.textContent !== CSS) style.textContent = CSS

    let veil = document.querySelector(`div[${LOCK_ATTR}]`)
    if (!veil || !veil.isConnected) {
      veil = document.createElement('div')
      veil.setAttribute(LOCK_ATTR, '')
      veil.textContent = message
      document.body.appendChild(veil)
    }
    forceStyles(veil, {
      position: 'fixed',
      top: '0px',
      right: '0px',
      bottom: '0px',
      left: '0px',
      'z-index': '2147483647',
      background: '#ffffff',
      color: '#9ca3af',
      display: 'flex',
      'align-items': 'center',
      'justify-content': 'center',
      'text-align': 'center',
      padding: '24px',
      font: '400 14px/1.5 Inter, Arial, sans-serif',
      'user-select': 'none'
    })
  }

  ensure()
  setInterval(ensure, 300)
  new MutationObserver(ensure).observe(document.documentElement, {
    childList: true,
    subtree: true
  })

  // Kontentni DOM'dan olib tashlash — "faqat yashirish" emas.
  setTimeout(() => {
    try {
      const appRoot = document.getElementById('app')
      if (appRoot) appRoot.replaceChildren()
    } catch {
      /* lockdown paytida xatolar ahamiyatsiz */
    }
  }, 400)

  if (import.meta.env.DEV) console.warn('[watermark] lockdown:', reason)
}

const strictMode = () => {
  if (import.meta.env.PROD) return true
  try {
    // Dev'da HMR sababli lockdown bezor qiladi; sinash uchun:
    // localStorage.setItem('wm-guard-strict', '1')
    return localStorage.getItem('wm-guard-strict') === '1'
  } catch {
    return false
  }
}

// `getRoot` — watermark ildiz tuguni, `isActive` — watermark ko'rinishi kerakmi,
// `getTilesStyle` — plitkalarning dinamik stillari (rasm/burilish/xiralik).
export const useWatermarkGuard = ({ getRoot, isActive, getTilesStyle }) => {
  let bodyObserver = null
  let rootObserver = null
  let observedRoot = null
  let timer = null
  let strikes = []
  let queued = false
  let healQueued = false

  // Tugundagi `class`/`style` o'zgarishini kuzatish: faqat watermark daraxti ustida —
  // butun sahifani attribute bilan kuzatish qimmatga tushadi.
  const watchRoot = () => {
    const root = getRoot()
    if (root === observedRoot) return
    rootObserver?.disconnect()
    observedRoot = root
    if (!root) return
    rootObserver = new MutationObserver(scheduleCheck)
    rootObserver.observe(root, {
      attributes: true,
      attributeFilter: ['class', 'style', 'hidden'],
      childList: true,
      subtree: true
    })
  }

  const reactAfterHeal = (reason) => {
    // Tiklashdan keyin holat tuzalganini bir freym o'tib tekshiramiz.
    if (healQueued) return
    healQueued = true
    requestAnimationFrame(() => {
      healQueued = false
      // Ildiz yo'q bo'lsa — bu Vue'ning unmount'i (logout va h.k.), buzish emas.
      if (locked || !isActive() || !getRoot()) return
      const still = inspect(getRoot())
      if (still && strictMode()) lockdownPage(`heal-failed:${reason}->${still}`)
    })
  }

  const heal = (root, reason) => {
    // Tugun butunlay o'chirilgan bo'lsa Vue uni qayta yaratmaydi — o'zimiz qaytaramiz.
    if (root) {
      if (!document.body.contains(root)) document.body.appendChild(root)
      root.classList.add(WATERMARK_ROOT_CLASS)
      root.removeAttribute('hidden')
      if (!root.firstElementChild) {
        const tiles = document.createElement('div')
        tiles.className = WATERMARK_TILES_CLASS
        root.appendChild(tiles)
      }
      root.firstElementChild.classList.add(WATERMARK_TILES_CLASS)
      applyWatermarkStyles(root, getTilesStyle?.())
      watchRoot()
    }
    reactAfterHeal(reason)
  }

  const check = () => {
    if (locked || !isActive()) return
    watchRoot()
    const root = getRoot()
    // Tugunni faqat Vue yaratadi/o'chiradi: `null` — render navbati, buzish emas.
    // Devtools'dan o'chirilganda `rootRef` tugunga ishlab turadi (`root:detached`).
    if (!root) return
    const reason = inspect(root)
    if (!reason) return

    const now = performance.now()
    strikes = strikes.filter((at) => now - at < STRIKE_WINDOW)
    strikes.push(now)

    if (import.meta.env.DEV) console.warn('[watermark] tampering:', reason)

    // Qayta-qayta buzilsa — tiklashni kutmasdan lockdown (aks holda har o'chirishda
    // kontent bir lahza watermarksiz ko'rinib qolardi).
    if (strikes.length > MAX_STRIKES && strictMode()) {
      lockdownPage(`repeat:${reason}`)
      return
    }
    heal(root, reason)
  }

  // Mutation'lar to'p-to'p keladi: bitta freymga bittagina tekshiruv.
  function scheduleCheck() {
    if (queued || locked) return
    queued = true
    requestAnimationFrame(() => {
      queued = false
      check()
    })
  }

  onMounted(() => {
    applyWatermarkStyles(getRoot(), getTilesStyle?.())
    watchRoot()

    // Ildiz tugun `body`ning bevosita farzandi — subtree kuzatish shart emas.
    bodyObserver = new MutationObserver(scheduleCheck)
    bodyObserver.observe(document.body, { childList: true })

    // Interval — observer yetib bormaydigan holatlar uchun: stylesheet qoidasi
    // o'chirilishi, ota elementdagi `transform`/`filter` o'zgarishi va h.k.
    timer = setInterval(check, CHECK_INTERVAL)
    window.addEventListener('resize', scheduleCheck)
  })

  // Watermark ko'rinishi kerak bo'lganda (login'dan keyin) stillarni qo'yib chiqamiz.
  watch(
    () => [isActive(), getTilesStyle?.()],
    () => {
      if (!isActive()) return
      requestAnimationFrame(() => {
        applyWatermarkStyles(getRoot(), getTilesStyle?.())
        watchRoot()
      })
    },
    { immediate: true }
  )

  onBeforeUnmount(() => {
    bodyObserver?.disconnect()
    rootObserver?.disconnect()
    bodyObserver = null
    rootObserver = null
    observedRoot = null
    if (timer) clearInterval(timer)
    timer = null
    window.removeEventListener('resize', scheduleCheck)
  })
}
