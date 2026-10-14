// Daraxtli tanlash popover'lari (UISelect, UIStructure, UIDepartment, SuperStructure)
// kengligi. Trigger filtr paneli (UIPageFilter) ichida bo'lsa — popover panel bilan
// BIR XIL kenglikda ochiladi (placement `bottom` bo'lgani uchun chetlari ham panel
// chetlariga to'g'ri keladi). Boshqa joylarda — trigger kengligi, lekin `fallback`dan
// tor emas. Har doim viewport'ga sig'adi (16px chetlar).
//
// Filtr paneli kengligi sahifaga qarab har xil (`w-auto`), shuning uchun qat'iy
// raqam emas — har ochilishda o'lchanadi.

const HOST_SELECTOR = '.ui-filter-panel-shell, .ui-filter-content'

export const useTreePopoverWidth = (show, triggerRef, { fallback = 420 } = {}) => {
  const width = ref(null)

  const measure = () => {
    const el = triggerRef.value?.$el ?? triggerRef.value
    if (!el?.getBoundingClientRect) return
    const host = el.closest?.(HOST_SELECTOR)
    const base = host
      ? host.getBoundingClientRect().width
      : Math.max(el.getBoundingClientRect().width, fallback)
    width.value = Math.round(Math.min(base, window.innerWidth - 32))
  }

  // Popover render bo'lishidan OLDIN o'lchanadi — kenglik "sakramaydi".
  watch(show, (v) => v && measure())

  const popoverStyle = computed(() =>
    width.value ? { width: `${width.value}px`, maxWidth: 'none' } : { width: `${fallback}px` }
  )

  return { popoverStyle }
}
