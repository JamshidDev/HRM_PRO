<script setup>
  // Maxfiylik siyosati — ommaviy sahifa (login shart emas). Matn — rasmiy PDF (`public/terms/HRM_PRO_Privacy_*.pdf`,
  // 1.0, 2026-07-01) dan olingan: `content/{uz,ru,en}.json` (`scripts/privacy-pdf2json.py` bilan yaratilgan —
  // PDF o'zgarsa qayta ishga tushiring). Ko'rinishi QR / imzolash sahifalari bilan bir xil: xira sarlavha, kartalar,
  // kompyuterda chapda yopishib turuvchi mundarija.
  import { useRouter } from 'vue-router'
  import { AppPaths } from '@/utils/index.js'
  import { UILanguage, UIThemeSwitch } from '@/components/index.js'
  import { ArrowDownload20Regular, TextBulletListLtr24Filled } from '@vicons/fluent'
  import { useAppBreakpoints } from '@/composables/useBreakpoint.js'
  import i18n from '@/i18n/index.js'
  import { setSeo } from '@/utils/seo.js'

  const router = useRouter()

  // Til → matn fayli. Kirill / yangi alifbo / qoraqalpoq — rasmiy o'zbekcha (lotin) matn.
  const LOADERS = {
    uz: () => import('./content/uz.json'),
    ru: () => import('./content/ru.json'),
    en: () => import('./content/en.json')
  }
  const docLang = computed(() => {
    const l = String(i18n.global.locale || 'uz')
    return LOADERS[l] ? l : 'uz'
  })
  const pdfUrl = computed(() => `/terms/HRM_PRO_Privacy_${docLang.value.toUpperCase()}.pdf`)

  // SEO (JAMACODER, 5820add8): sahifa sarlavhasi va tavsifi tilga qarab
  const SEO = {
    uz: {
      title: 'Maxfiylik siyosati — HRM PRO',
      description:
        "HRM PRO va HR Rail mobil ilovasining maxfiylik siyosati: qanday ma'lumotlar yig'iladi, nima uchun ishlatiladi va qanday himoyalanadi."
    },
    ru: {
      title: 'Политика конфиденциальности — HRM PRO',
      description:
        'Политика конфиденциальности HRM PRO и мобильного приложения HR Rail: какие данные собираются, как используются и защищаются.'
    },
    en: {
      title: 'Privacy Policy — HRM PRO',
      description:
        'Privacy policy of HRM PRO and the HR Rail mobile app: what data is collected, how it is used and protected.'
    }
  }
  watchEffect(() => setSeo({ ...SEO[docLang.value], path: AppPaths.PrivacyPolicy }))

  const doc = ref(null)
  const loading = ref(true)
  let loadId = 0
  watch(
    docLang,
    async (lang) => {
      const id = ++loadId
      loading.value = true
      try {
        const mod = await LOADERS[lang]()
        if (id === loadId) doc.value = mod.default
      } finally {
        if (id === loadId) loading.value = false
      }
    },
    { immediate: true }
  )

  // Bo'lim bloklari: ketma-ket `li` lar bitta ro'yxatga yig'iladi
  const groupBlocks = (blocks) => {
    const out = []
    for (const b of blocks) {
      if (b.t === 'li') {
        const last = out[out.length - 1]
        if (last?.t === 'ul') last.items.push(b.text)
        else out.push({ t: 'ul', items: [b.text] })
      } else out.push(b)
    }
    return out
  }
  const sections = computed(() =>
    (doc.value?.sections || []).map((s) => ({ ...s, groups: groupBlocks(s.blocks) }))
  )

  // Mundarija: hozir ko'rinib turgan bo'lim belgilanadi; bosilsa — silliq aylantiriladi
  const active = ref(1)
  // Telefon / planshet: mundarija chapdan chiqadigan oynada, uni ekranning chap chetidagi tugma ochadi
  // (QR sahifadagi «Kelishuvchilar» tugmasi kabi — tepaga-pastga surish mumkin, joyi eslab qolinadi).
  const tocOpen = ref(false)
  const { isDesktop } = useAppBreakpoints()
  watch(isDesktop, (v) => v && (tocOpen.value = false))
  const TAB_KEY = 'privacy.tocTabTop'
  const tabRef = ref(null)
  const tabTop = ref(null)
  const clampTop = (y) => {
    const h = tabRef.value?.offsetHeight ?? 44
    return Math.min(Math.max(y, 76), window.innerHeight - h - 12)
  }
  const placeTab = () => {
    let saved = null
    try {
      saved = Number(localStorage.getItem(TAB_KEY)) || null
    } catch {
      saved = null
    }
    tabTop.value = clampTop(saved ?? window.innerHeight - 44 - 96)
  }
  let drag = null
  let justDragged = false
  const onTabDown = (e) => {
    drag = { y: e.clientY, top: tabTop.value, moved: false }
    e.currentTarget.setPointerCapture?.(e.pointerId)
  }
  const onTabMove = (e) => {
    if (!drag) return
    const dy = e.clientY - drag.y
    if (Math.abs(dy) > 5) drag.moved = true
    if (drag.moved) tabTop.value = clampTop(drag.top + dy)
  }
  const onTabUp = () => {
    if (!drag) return
    justDragged = drag.moved
    drag = null
    if (!justDragged) return
    try {
      localStorage.setItem(TAB_KEY, String(Math.round(tabTop.value)))
    } catch {
      /* saqlab bo'lmasa — keyingi safar standart joyda */
    }
  }
  const onTabClick = () => {
    if (justDragged) {
      justDragged = false
      return
    }
    tocOpen.value = true
  }
  const showTab = computed(() => !isDesktop.value && !tocOpen.value && sections.value.length > 0)
  watch(showTab, async (v) => {
    if (!v || tabTop.value !== null) return
    await nextTick()
    placeTab()
  })
  const onResize = () => tabTop.value !== null && (tabTop.value = clampTop(tabTop.value))

  // Faol bo'lim — sahifa holatidan hisoblanadi: tepasi sarlavha ostidan o'tgan oxirgi bo'lim; sahifa oxirida —
  // oxirgi bo'lim (13, 14 qisqa — tepaga chiqa olmaydi). Mundarijadan bosilgan bo'lim esa foydalanuvchi o'zi
  // aylantirmaguncha (g'ildirak / sensor / klaviatura) «qadab» qo'yiladi — sahifa oxiridagi bo'lim ham belgilanadi.
  let pinned = null
  let raf = 0
  const computeActive = () => {
    raf = 0
    if (pinned !== null || !sections.value.length) return
    const doc = document.documentElement
    if (window.innerHeight + window.scrollY >= doc.scrollHeight - 4) {
      active.value = sections.value[sections.value.length - 1].n
      return
    }
    let cur = sections.value[0].n
    document.querySelectorAll('.pp-section').forEach((el) => {
      if (el.getBoundingClientRect().top <= 100) cur = Number(el.dataset.n)
    })
    active.value = cur
  }
  const onScroll = () => {
    if (!raf) raf = requestAnimationFrame(computeActive)
  }
  const unpin = () => (pinned = null)
  const USER_SCROLL = ['wheel', 'touchmove', 'keydown']
  onMounted(() => {
    window.addEventListener('resize', onResize)
    window.addEventListener('scroll', onScroll, { passive: true })
    USER_SCROLL.forEach((e) => window.addEventListener(e, unpin, { passive: true }))
  })
  onBeforeUnmount(() => {
    cancelAnimationFrame(raf)
    window.removeEventListener('resize', onResize)
    window.removeEventListener('scroll', onScroll)
    USER_SCROLL.forEach((e) => window.removeEventListener(e, unpin))
  })

  // Manzil o'zimiz hisoblanadi: sarlavha 64px + 16px oraliq.
  const scrollToSection = (n) => {
    const el = document.getElementById(`pp-${n}`)
    if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY - 80
    window.scrollTo({ top, behavior: 'smooth' })
  }
  // Telefonda: oyna yopilib bo'lgach aylantiriladi. Yopilish paytida Naive fokusni tugmaga qaytaradi — shu payt
  // boshlangan silliq aylantirish to'xtab qolardi. Oyna sahifani qulflamaydi (`block-scroll` o'chiq) — qulf
  // yoqilganda Naive uni yopilgandan keyin ham ~2–3 s ushlab turardi.
  let pendingN = null
  const goTo = (n) => {
    active.value = n
    pinned = n
    if (tocOpen.value) {
      pendingN = n
      tocOpen.value = false
    } else scrollToSection(n)
  }
  const onDrawerClosed = () => {
    if (pendingN === null) return
    scrollToSection(pendingN)
    pendingN = null
  }
</script>

<template>
  <div class="pp-bg min-h-screen w-full pt-[64px]">
    <!-- Sarlavha — QR sahifa sarlavhasi bilan bir xil -->
    <div class="pp-topbar fixed left-0 top-0 z-50 h-[64px] w-full px-3 sm:px-6">
      <div class="mx-auto flex h-full max-w-[1200px] items-center justify-between gap-3">
        <div class="flex min-w-0 items-center gap-3">
          <button
            type="button"
            class="flex shrink-0 cursor-pointer items-center gap-2"
            @click="router.push(AppPaths.Login)"
          >
            <img class="h-9 w-auto object-contain" src="/logo-new.png" alt="app logo" />
            <span class="hidden whitespace-nowrap text-base font-semibold text-primary md:inline">
              {{ $t('homePage.appName') }}
            </span>
          </button>
          <span class="hidden h-6 w-px shrink-0 bg-surface-line sm:block"></span>
          <span class="truncate text-sm font-medium text-textColor2">
            {{ $t('offerModal.privacy') }}
          </span>
        </div>
        <div class="flex shrink-0 items-center gap-2 sm:gap-3">
          <UIThemeSwitch />
          <UILanguage />
        </div>
      </div>
    </div>

    <div class="mx-auto w-full max-w-[1200px] px-3 pb-10 pt-5 sm:px-6 sm:pt-6">
      <div class="flex flex-col gap-4 lg:grid lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start lg:gap-6">
        <!-- Mundarija (kompyuterda yopishib turadi) -->
        <aside class="pp-card hidden p-2 lg:sticky lg:top-[80px] lg:block">
          <div class="mb-1 px-2 pt-1.5 text-base font-bold text-textColor0">
            {{ $t('privacyPage.toc') }}
          </div>
          <nav class="pp-toc flex flex-col gap-0.5">
            <button
              v-for="s in sections"
              :key="s.n"
              type="button"
              class="pp-toc-item"
              :class="{ 'is-active': active === s.n }"
              @click="goTo(s.n)"
            >
              <span class="pp-toc-num">{{ s.n }}</span>
              <span class="min-w-0 text-left">{{ s.title }}</span>
            </button>
          </nav>
        </aside>

        <main class="flex min-w-0 flex-col gap-4">
          <!-- Hujjat boshi: nomi, tizim, sana / versiya, PDF -->
          <div class="pp-card p-5 sm:p-7">
            <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div class="min-w-0">
                <h1 class="text-2xl font-bold leading-tight text-textColor0 sm:text-[28px]">
                  {{ $t('offerModal.privacy') }}
                </h1>
                <p v-if="doc" class="mt-1.5 text-base text-textColor2">{{ doc.subtitle }}</p>
                <p v-if="doc" class="mt-1 text-sm text-textColor3">{{ doc.meta }}</p>
              </div>
              <a :href="pdfUrl" target="_blank" rel="noopener noreferrer" class="shrink-0">
                <n-button secondary type="primary">
                  <template #icon>
                    <n-icon><ArrowDownload20Regular /></n-icon>
                  </template>
                  {{ $t('privacyPage.pdf') }}
                </n-button>
              </a>
            </div>
          </div>

          <template v-if="loading && !doc">
            <n-skeleton v-for="i in 3" :key="i" height="220px" style="border-radius: 8px" />
          </template>

          <!-- Bo'limlar -->
          <section
            v-for="s in sections"
            :id="`pp-${s.n}`"
            :key="s.n"
            :data-n="s.n"
            class="pp-section pp-card p-5 sm:p-7"
          >
            <h2 class="text-xl font-bold leading-snug text-textColor0">
              <span class="mr-1.5 text-primary">{{ s.n }}.</span>{{ s.title }}
            </h2>
            <div class="mt-4 flex flex-col gap-3">
              <template v-for="(g, gi) in s.groups" :key="gi">
                <h3 v-if="g.t === 'h'" class="mt-2 text-[17px] font-bold text-textColor0">
                  <span class="mr-1.5 text-primary">{{ g.n }}.</span>{{ g.text }}
                </h3>
                <ul v-else-if="g.t === 'ul'" class="pp-list">
                  <li v-for="(it, ii) in g.items" :key="ii">{{ it }}</li>
                </ul>
                <p v-else class="pp-text">
                  <span v-if="g.n" class="mr-1.5 font-bold text-primary">{{ g.n }}.</span>{{ g.text }}
                </p>
              </template>
            </div>
          </section>

          <!-- Pastki qism -->
          <div
            v-if="doc"
            class="flex flex-col items-center justify-between gap-3 px-1 py-2 text-[13px] text-textColor3 sm:flex-row"
          >
            <span>© 2026 {{ $t('homePage.appName') }}</span>
            <n-button text type="primary" @click="router.push(AppPaths.Login)">
              {{ $t('privacyPage.backToLogin') }}
            </n-button>
          </div>
        </main>
      </div>
    </div>

    <!-- Telefon / planshet: chap chetga yopishgan tugma — aylantirganda ham joyida -->
    <Transition name="pp-tab">
      <button
        v-if="showTab"
        ref="tabRef"
        type="button"
        class="pp-tab fixed left-0 z-40 flex h-11 w-12 cursor-grab items-center justify-center rounded-r-full bg-primary pr-0.5 text-white active:cursor-grabbing"
        :style="{ top: (tabTop ?? -999) + 'px' }"
        :aria-label="$t('privacyPage.toc')"
        @pointerdown="onTabDown"
        @pointermove="onTabMove"
        @pointerup="onTabUp"
        @pointercancel="onTabUp"
        @click="onTabClick"
      >
        <n-icon size="20"><TextBulletListLtr24Filled /></n-icon>
      </button>
    </Transition>

    <n-drawer
      v-model:show="tocOpen"
      placement="left"
      width="min(86vw, 340px)"
      :block-scroll="false"
      @after-leave="onDrawerClosed"
    >
      <n-drawer-content :title="$t('privacyPage.toc')" closable :body-content-style="{ padding: '8px' }">
        <nav class="pp-toc flex flex-col gap-0.5">
          <button
            v-for="s in sections"
            :key="s.n"
            type="button"
            class="pp-toc-item"
            :class="{ 'is-active': active === s.n }"
            @click="goTo(s.n)"
          >
            <span class="pp-toc-num">{{ s.n }}</span>
            <span class="min-w-0 text-left">{{ s.title }}</span>
          </button>
        </nav>
      </n-drawer-content>
    </n-drawer>
  </div>
</template>

<style scoped>
  /* QR / imzolash sahifalaridagi kabi: tepada brend rangidagi yumshoq «tuman» */
  .pp-bg {
    background:
      radial-gradient(
        1200px 380px at 50% -60px,
        color-mix(in srgb, var(--color-primary) 16%, transparent),
        transparent 70%
      ),
      var(--color-surface-ground);
  }
  .pp-topbar {
    border-bottom: 1px solid var(--color-surface-line);
    background: color-mix(in srgb, var(--color-surface-section) 86%, transparent);
    backdrop-filter: saturate(160%) blur(10px);
    box-shadow: 0 6px 24px -18px rgb(16 24 40 / 35%);
  }
  .pp-card {
    border: 1px solid var(--color-surface-line);
    border-radius: 8px;
    background: var(--color-surface-section);
    box-shadow:
      0 1px 2px rgb(16 24 40 / 4%),
      0 12px 32px -12px rgb(16 24 40 / 18%);
  }
  /* Sarlavha ostida qolmasin */
  .pp-section {
    scroll-margin-top: 80px;
  }
  .pp-text {
    font-size: 16px;
    line-height: 1.75;
    color: var(--color-textColor1);
  }
  .pp-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-left: 4px;
  }
  .pp-list li {
    position: relative;
    padding-left: 18px;
    font-size: 16px;
    line-height: 1.7;
    color: var(--color-textColor1);
  }
  .pp-list li::before {
    content: '';
    position: absolute;
    left: 2px;
    top: 11px;
    width: 6px;
    height: 6px;
    border-radius: 999px;
    background: var(--color-primary);
  }
  .pp-toc-item {
    display: flex;
    align-items: flex-start;
    gap: 4px;
    border-radius: 10px;
    padding: 6px 8px;
    font-size: 15.5px;
    font-weight: 500; /* faol bo'lganda ham shu — qalinlik o'zgarsa matn qayta o'raladi va ro'yxat sakraydi */
    line-height: 1.35;
    color: var(--color-textColor2);
    transition:
      background 0.15s ease,
      color 0.15s ease;
  }
  .pp-toc-item:hover {
    background: var(--color-surface-ground);
    color: var(--color-textColor0);
  }
  .pp-toc-item.is-active {
    background: color-mix(in srgb, var(--color-primary) 10%, transparent);
    color: var(--color-primary);
  }
  .pp-toc-num {
    min-width: 20px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    color: var(--color-textColor3);
  }
  .pp-toc-item.is-active .pp-toc-num {
    color: var(--color-primary);
  }
  /* Chap chetdagi «Mundarija» tugmasi — soya o'ng tomonga */
  .pp-tab {
    box-shadow: 6px 8px 24px -10px rgb(16 24 40 / 45%);
    touch-action: none; /* surishda sahifa aylanmasin */
    user-select: none;
  }
  .pp-tab-enter-active,
  .pp-tab-leave-active {
    transition:
      transform 0.25s ease,
      opacity 0.25s ease;
  }
  .pp-tab-enter-from,
  .pp-tab-leave-to {
    opacity: 0;
    transform: translateX(-100%);
  }
</style>
