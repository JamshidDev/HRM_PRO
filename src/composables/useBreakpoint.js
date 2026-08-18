import { useBreakpoints, useMediaQuery } from '@vueuse/core'

/**
 * Yagona breakpoint manbai — `src/style.css` dagi `@theme --breakpoint-*` bilan
 * AYNAN bir xil. `smaller('md')` -> `(max-width: 767.9px)`, ya'ni Tailwind'ning
 * `md:` prefiksi (`min-width: 768px`) bilan bir vaqtda almashadi. JS va CSS
 * hech qachon bir-biriga zid bo'lmaydi.
 *
 * DIQQAT: `lg` = 976px, `xl` = 1440px — Tailwind standartidan (1024/1280) FARQ
 * qiladi, chunki `style.css` da `--breakpoint-*: initial` bilan standart shkala
 * o'chirilgan.
 */
export const APP_BREAKPOINTS = { sm: 480, md: 768, lg: 976, xl: 1440, xxl: 1536 }

/**
 * Sidebar off-canvas bo'ladigan chegara — `organizationLayout.scss` dagi
 * `$mobile_device_screen_size`. Bu QOBIQ breakpointi, KONTENT breakpointi EMAS:
 * 768–900 oralig'ida sahifa "desktop" ko'rinishda, sidebar esa allaqachon drawer;
 * 900–976 oralig'ida esa aksincha — sidebar joyida, kontent tor. Shu sababli
 * kontent qarorlari uchun bu qiymatdan HECH QACHON foydalanilmaydi.
 */
export const SIDEBAR_BREAKPOINT = 900

export function useAppBreakpoints() {
  const breakpoints = useBreakpoints(APP_BREAKPOINTS)

  return {
    breakpoints,
    isMobile: breakpoints.smaller('md'), //             < 768  (Tailwind: prefikssiz)
    isTablet: breakpoints.between('md', 'lg'), //     768–975  (Tailwind: md:)
    isDesktop: breakpoints.greaterOrEqual('lg'), //     >= 976  (Tailwind: lg:)
    isCompact: breakpoints.smaller('lg'), //            < 976  (mobil + planshet)
    isSidebarOverlay: useMediaQuery(`(max-width: ${SIDEBAR_BREAKPOINT - 0.5}px)`)
  }
}

/** Qisqa yordamchi — faqat bitta bayroq kerak bo'lganda. */
export const useIsMobile = () => useAppBreakpoints().isMobile
