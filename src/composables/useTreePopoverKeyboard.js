// ♿ Daraxtli tanlash popover'lari (UISelect, UIStructure, UIDepartment, ...) uchun
// klaviatura boshqaruvi. Forma ichida faqat klaviatura bilan ishlash mumkin bo'lsin:
//
//   Trigger input:  Enter / Space / ↓ — ochish (searchable rejimda faqat ↓)
//   Popover ichida: ↑ / ↓ — qidiruv inputi va daraxt qatorlari bo'ylab yurish
//                   Esc — yopish, fokus trigger'ga qaytadi (modal yopilmaydi)
//                   Tab / Shift+Tab — yopib, formadagi keyingi/oldingi maydonga o'tish
//   Qatorlardagi Enter/Space/←/→ — TreeOrg.vue ichida.
//
// Popover DOM'da trigger'dan uzoqda (modal/body oxirida) render bo'ladi, shuning
// uchun Tab'ni o'zimiz trigger'ga "qaytarib" beramiz: keydown paytida fokusni
// trigger'ga qo'yamiz va standart harakatni bekor qilmaymiz — brauzer keyingi
// elementni shu trigger'dan hisoblaydi.

const ROW_SELECTOR = '[data-tree-row]'

const isVisible = (el) => el.getClientRects().length > 0

export const useTreePopoverKeyboard = ({
  disabled = () => false,
  searchable = () => false,
  multiple = () => true
} = {}) => {
  const show = ref(false)
  const triggerRef = ref(null)
  const panelRef = ref(null)
  const searchInputRef = ref(null)

  const triggerInput = () => {
    const el = triggerRef.value?.$el ?? triggerRef.value
    return el?.querySelector?.('input') ?? null
  }

  const focusTrigger = () => triggerInput()?.focus({ preventScroll: true })

  const open = () => {
    if (disabled()) return
    show.value = true
  }

  const close = ({ focus = true } = {}) => {
    show.value = false
    if (focus) focusTrigger()
  }

  // Ochilganda pastdagi qidiruv inputiga fokus — darhol yozish mumkin.
  // Searchable rejimda trigger input'ning o'zi qidiruv — fokusni tortib olmaymiz.
  watch(show, (v) => {
    if (v && !searchable()) nextTick(() => searchInputRef.value?.focus())
  })

  const navigable = () => {
    const panel = panelRef.value
    if (!panel) return []
    const rows = [...panel.querySelectorAll(ROW_SELECTOR)].filter(isVisible)
    const search = searchable() ? null : panel.querySelector('[data-tree-search] input')
    return search ? [search, ...rows] : rows
  }

  const move = (step) => {
    const items = navigable()
    if (!items.length) return
    const current = document.activeElement?.closest?.(ROW_SELECTOR) ?? document.activeElement
    const idx = items.indexOf(current)
    const next = idx === -1 ? (step > 0 ? 0 : items.length - 1) : idx + step
    items[Math.max(0, Math.min(items.length - 1, next))]?.focus()
  }

  const onTriggerKeydown = (e) => {
    if (e.key === 'Escape' && show.value) {
      e.stopPropagation()
      close()
      return
    }
    if (e.key === 'Tab') {
      if (show.value) close({ focus: false })
      return
    }
    const opensOn = searchable() ? ['ArrowDown'] : ['ArrowDown', 'Enter', ' ']
    if (!opensOn.includes(e.key)) return
    e.preventDefault()
    if (!show.value) {
      open()
      return
    }
    // Searchable: popover allaqachon ochiq — ↓ daraxtga tushiradi.
    if (e.key === 'ArrowDown') nextTick(() => navigable()[0]?.focus())
  }

  const onPanelKeydown = (e) => {
    switch (e.key) {
      case 'Escape':
        // Popover modal ichida bo'lsa Esc modalgacha yetib bormasin.
        e.stopPropagation()
        close()
        break
      case 'Tab':
        close()
        break
      case 'ArrowDown':
      case 'ArrowUp':
        e.preventDefault()
        move(e.key === 'ArrowDown' ? 1 : -1)
        break
      case 'Home':
      case 'End':
        if (!e.target.closest(ROW_SELECTOR)) return
        e.preventDefault()
        {
          const rows = navigable().filter((el) => el.matches(ROW_SELECTOR))
          rows[e.key === 'Home' ? 0 : rows.length - 1]?.focus()
        }
        break
      case 'Enter':
      case ' ':
        // Bitta tanlovda qator tanlangach (TreeOrg o'zi tanlaydi) — yopib,
        // formadagi ishni davom ettirish uchun fokus trigger'ga qaytadi.
        if (!multiple() && e.target.closest(ROW_SELECTOR)?.dataset.selectable === 'true') {
          close()
        }
        break
    }
  }

  return {
    show,
    triggerRef,
    panelRef,
    searchInputRef,
    open,
    close,
    onTriggerKeydown,
    onPanelKeydown
  }
}
