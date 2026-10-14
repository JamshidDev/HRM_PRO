// Daraxtli tanlash popover'lari (UISelect, UIStructure, UIDepartment, SuperStructure)
// kengligi: trigger kengligi, lekin `fallback`dan tor emas. Trigger filtr paneli
// (UIPageFilter) ichida bo'lsa — panel kengligidan oshmaydi, ya'ni tor panelda
// popover panel bilan BIR XIL bo'ladi. Har doim viewport'ga sig'adi (16px chetlar).
//
// Filtr paneli kengligi sahifaga qarab har xil (`w-auto`), shuning uchun qat'iy
// raqam emas — har ochilishda o'lchanadi.

const HOST_SELECTOR = '.ui-filter-panel-shell, .ui-filter-content'

export const useTreePopoverWidth = (show, triggerRef, { fallback = 420 } = {}) => {
  const width = ref(null)

  const measure = () => {
    const el = triggerRef.value?.$el ?? triggerRef.value
    if (!el?.getBoundingClientRect) return
    // Trigger kengligi, lekin `fallback`dan tor emas. Filtr paneli ichida — panel
    // kengligidan OSHMAYDI: tor (bir ustunli) panelda popover panel bilan bir xil,
    // keng (ko'p ustunli) panelda esa butun panelga cho'zilib ketmaydi.
    const host = el.closest?.(HOST_SELECTOR)
    let base = Math.max(el.getBoundingClientRect().width, fallback)
    if (host) base = Math.min(base, host.getBoundingClientRect().width)
    width.value = Math.round(Math.min(base, window.innerWidth - 32))
  }

  // Popover render bo'lishidan OLDIN o'lchanadi — kenglik "sakramaydi".
  watch(show, (v) => v && measure())

  const popoverStyle = computed(() =>
    width.value ? { width: `${width.value}px`, maxWidth: 'none' } : { width: `${fallback}px` }
  )

  return { popoverStyle }
}
