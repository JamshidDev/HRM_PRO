// plugins/flyUpload.js

let piniaStore = null

const FlyUploadPlugin = {
  install(app, globalOptions = {}) {
    const defaults = {
      target: globalOptions.target || '#taskBtn',
      duration: globalOptions.duration || 1000,
      arcHeight: globalOptions.arcHeight || 120,
      size: globalOptions.size || 44,
      colors: globalOptions.colors || ['#2dcb73', '#2dcb73'],
      icon: globalOptions.icon || 'check',
      trailEnabled: globalOptions.trailEnabled !== false,
      // Pinia store config
      store: globalOptions.store || null,
      storeAction: globalOptions.storeAction || 'increment'
    }

    // Store ni saqlash
    if (globalOptions.store) {
      piniaStore = globalOptions.store
    }

    injectKeyframes()

    // Global directive
    app.directive('fly-upload', {
      mounted(el, binding) {
        const config = { ...defaults, ...binding.value }

        if (binding.modifiers.manual) {
          el._flyConfig = config
          el._triggerFly = () => flyToTarget(el, el._flyConfig)
          return
        }

        el._flyHandler = (e) => {
          e.stopPropagation()
          flyToTarget(el, config)
        }

        el.addEventListener('click', el._flyHandler)
      },

      updated(el, binding) {
        el._flyConfig = { ...defaults, ...binding.value }
      },

      unmounted(el) {
        el.removeEventListener('click', el._flyHandler)
      }
    })

    // Global method
    app.config.globalProperties.$flyUpload = (sourceEl, options = {}) => {
      flyToTarget(sourceEl, { ...defaults, ...options })
    }
  }
}

// Qiymatni viewport ichida saqlash
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function flyToTarget(sourceEl, config) {
  const targetEl = document.querySelector(config.target)
  if (!targetEl) {
    console.warn(`[fly-upload] Target "${config.target}" topilmadi`)
    return
  }

  const sourceRect = sourceEl.getBoundingClientRect()
  const targetRect = targetEl.getBoundingClientRect()

  // Viewport chegaralari
  const vw = window.innerWidth
  const vh = window.innerHeight
  const padding = config.size / 2 + 10

  const start = {
    x: sourceRect.left + sourceRect.width / 2,
    y: sourceRect.top + sourceRect.height / 2
  }

  const end = {
    x: targetRect.left + targetRect.width / 2,
    y: targetRect.top + targetRect.height / 2
  }

  // Arc yo'nalishini aniqlash
  const goingDown = end.y > start.y + 50
  let arcY

  if (goingDown) {
    // Pastga ketayotganda - arc pastda
    arcY = clamp(Math.max(start.y, end.y) + config.arcHeight * 0.5, padding, vh - padding)
  } else {
    // Yuqoriga ketayotganda - arc yuqorida
    arcY = clamp(Math.min(start.y, end.y) - config.arcHeight, padding, vh - padding)
  }

  const cp = {
    x: clamp((start.x + end.x) / 2, padding, vw - padding),
    y: arcY
  }

  // Flying element - Tailwind classes
  const flyer = document.createElement('div')
  flyer.className =
    'fixed flex items-center justify-center pointer-events-none z-[99999] rounded-xl will-change-transform'
  flyer.style.cssText = `
    left: ${start.x - config.size / 2}px;
    top: ${start.y - config.size / 2}px;
    width: ${config.size}px;
    height: ${config.size}px;
    background: linear-gradient(135deg, ${config.colors[0]}, ${config.colors[1]});
    box-shadow: 0 6px 24px ${config.colors[0]}60;
  `
  flyer.innerHTML = getIcon(config.icon)
  document.body.appendChild(flyer)

  const startTime = performance.now()
  let lastTrail = 0

  function animate(now) {
    const progress = Math.min((now - startTime) / config.duration, 1)
    const eased = 1 - Math.pow(1 - progress, 4)
    const t = eased

    const x = (1 - t) ** 2 * start.x + 2 * (1 - t) * t * cp.x + t ** 2 * end.x
    const y = (1 - t) ** 2 * start.y + 2 * (1 - t) * t * cp.y + t ** 2 * end.y

    // Viewport ichida saqlash
    const clampedX = clamp(x, padding, vw - padding)
    const clampedY = clamp(y, padding, vh - padding)

    flyer.style.left = `${clampedX - config.size / 2}px`
    flyer.style.top = `${clampedY - config.size / 2}px`
    flyer.style.transform = `scale(${1 - progress * 0.4}) rotate(${progress * 360}deg)`
    flyer.style.opacity = 1 - progress * 0.3

    if (config.trailEnabled && now - lastTrail > 35) {
      createTrail(clampedX, clampedY, config.colors[0])
      lastTrail = now
    }

    if (progress < 1) {
      requestAnimationFrame(animate)
    } else {
      flyer.remove()

      // Pulse class qo'shish
      targetEl.classList.add('animate-fly-pulse')
      setTimeout(() => targetEl.classList.remove('animate-fly-pulse'), 600)

      // Pinia store ni yangilash
      if (config.store && config.storeAction) {
        const store = typeof config.store === 'function' ? config.store() : config.store
        if (store && typeof store[config.storeAction] === 'function') {
          store[config.storeAction]()
        }
      } else if (piniaStore && config.storeAction) {
        const store = typeof piniaStore === 'function' ? piniaStore() : piniaStore
        if (store && typeof store[config.storeAction] === 'function') {
          store[config.storeAction]()
        }
      }

      if (config.onComplete) config.onComplete(targetEl)
    }
  }

  requestAnimationFrame(animate)
}

function createTrail(x, y, color) {
  const trail = document.createElement('div')
  trail.className = 'fixed w-2.5 h-2.5 rounded-4xl pointer-events-none z-[99998] animate-fly-trail'
  trail.style.cssText = `
    left: ${x - 5}px;
    top: ${y - 5}px;
    background: radial-gradient(circle, ${color}, transparent);
  `
  document.body.appendChild(trail)
  setTimeout(() => trail.remove(), 400)
}

function getIcon(type) {
  const icons = {
    check: `<svg class="w-5 h-5 fill-white" viewBox="0 0 24 24">
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
    </svg>`,
    upload: `<svg class="w-5 h-5 fill-white" viewBox="0 0 24 24">
      <path d="M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z"/>
    </svg>`,
    file: `<svg class="w-5 h-5 fill-white" viewBox="0 0 24 24">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
    </svg>`,
    download: `<svg class="w-5 h-5 fill-white" viewBox="0 0 24 24">
      <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
    </svg>`,
    star: `<svg class="w-5 h-5 fill-white" viewBox="0 0 24 24">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>`,
    cart: `<svg class="w-5 h-5 fill-white" viewBox="0 0 24 24">
      <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
    </svg>`
  }
  return icons[type] || icons.check
}

function injectKeyframes() {
  if (document.getElementById('fly-upload-keyframes')) return

  const style = document.createElement('style')
  style.id = 'fly-upload-keyframes'
  style.textContent = `
    @keyframes fly-trail {
      to { opacity: 0; transform: scale(0); }
    }
    @keyframes fly-pulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
      50% { box-shadow: 0 0 0 12px rgba(34, 197, 94, 0.4); }
    }
    .animate-fly-trail { animation: fly-trail 0.4s ease-out forwards; }
    .animate-fly-pulse { animation: fly-pulse 0.6s ease-out !important; }
  `
  document.head.appendChild(style)
}

export default FlyUploadPlugin
