<script setup>
  // Ommaviy hujjat sahifasi — hujjatdagi QR-kod shu yerga olib keladi (/public/<model>/<uuid>), login kerak emas.
  // Ko'rinishi imzolash sahifasi bilan bir xil (DAS-16193): kompyuterda chapda hujjat, o'ngda panel
  // (tizimda borligi + kelishuvchilar). Telefonda: tepada «Muhim ma'lumot» kartasi, ostida «Kelishuvchilar» tugmasi
  // (ro'yxat o'ngdan suriladigan oynada), keyin hujjat.
  import { usePdfViewerStore, usePublicStore } from '@/store/modules/index.js'
  import { ToolBar, Document, Authectication, QuizItem, Confirmations } from './ui/index.js'
  import {
    ShieldCheckmark24Filled,
    DocumentDismiss24Regular,
    Person24Filled
  } from '@vicons/fluent'
  import { useAppBreakpoints } from '@/composables/useBreakpoint.js'
  import { UIStatus } from '@components'
  import i18n from '@/i18n/index.js'

  const store = usePublicStore()
  const pdfViewerStore = usePdfViewerStore()

  const route = useRoute()

  onMounted(() => {
    const { key, model } = route.params
    store.elementId = key
    store.selectedModel = model
    store.list = []
    store.existFile = false
    store.loaded = false
    store._getDocument(async (url) => {
      pdfViewerStore.pdfUrl = url
      await pdfViewerStore.loadPdf()
    })
  })

  const { isDesktop } = useAppBreakpoints()
  // Telefonda kelishuvchilar o'ngdan chiqadigan oynada
  const signersOpen = ref(false)
  watch(isDesktop, (v) => v && (signersOpen.value = false))

  // O'ng chetdagi tugmani barmoq/sichqoncha bilan tepaga-pastga surish mumkin. Boshida pastroqda turadi;
  // surilgan joy shu brauzerda eslab qolinadi. Ozgina siljish (≤ 5px) — bosish deb hisoblanadi.
  const TAB_KEY = 'public.signersTabTop'
  const TAB_DEFAULT_BOTTOM = 96 // ekran pastidan
  const TAB_MIN_TOP = 76 // sarlavha ostidan
  const tabRef = ref(null)
  const tabTop = ref(null)
  const clampTop = (y) => {
    const h = tabRef.value?.offsetHeight ?? 120
    return Math.min(Math.max(y, TAB_MIN_TOP), window.innerHeight - h - 12)
  }
  const placeTab = () => {
    let saved = null
    try {
      saved = Number(localStorage.getItem(TAB_KEY)) || null
    } catch {
      saved = null
    }
    const h = tabRef.value?.offsetHeight ?? 120
    tabTop.value = clampTop(saved ?? window.innerHeight - h - TAB_DEFAULT_BOTTOM)
  }
  let drag = null
  // Ochish `click` da (pointerup da emas): pointerup'dan keyin kelgan click endi ochilgan oynaning qora
  // foniga tushib, oynani darhol yopib qo'yardi. Surishdan keyingi click esa e'tiborsiz qoldiriladi.
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
    const moved = drag.moved
    drag = null
    justDragged = moved
    if (!moved) return
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
    signersOpen.value = true
  }
  const onResize = () => tabTop.value !== null && (tabTop.value = clampTop(tabTop.value))
  onMounted(() => window.addEventListener('resize', onResize))
  onBeforeUnmount(() => window.removeEventListener('resize', onResize))
  const showTab = computed(
    () => !isDesktop.value && !signersOpen.value && store.existFile && store.confirmations.length > 0
  )
  watch(showTab, async (v) => {
    if (!v || tabTop.value !== null) return
    await nextTick()
    placeTab()
  })

  // «Muhim ma'lumot» matni — 3 ta gap nuqta bilan bitta paragrafga qo'shiladi
  const infoText = computed(() =>
    [1, 2, 3].map((n) => i18n.global.t(`publicPage.verifiedPoint${n}`)).join('. ') + '.'
  )

  const isExam = computed(() => route.path.includes('worker-exams'))

  // YYYY-MM-DD → DD.MM.YYYY
  const fmtDate = (v) => (v ? String(v).slice(0, 10).split('-').reverse().join('.') : '')
  const metaRows = computed(() => {
    const m = store.meta
    if (!m) return []
    const t = i18n.global.t
    return [
      { label: t('publicPage.electronicNumber'), value: m.electronic_number },
      { label: t('content.number'), value: m.number },
      { label: t('content.date'), value: fmtDate(m.date) },
      { label: t('content.type'), value: m.type?.name },
      { label: t('content.organization'), value: m.organization?.name }
    ].filter((r) => r.value)
  })

  // Hujjat topilmadi (yoki fayli yo'q) — panel va varaq o'rniga bitta karta.
  const notFound = computed(() => store.loaded && !store.existFile)
</script>

<template>
  <div class="public-bg w-full min-h-screen pt-[64px]">
    <ToolBar />

    <div v-if="notFound" class="mx-auto mt-10 w-full max-w-[480px] px-4 sm:mt-16">
      <div class="public-card flex flex-col items-center px-6 py-12 text-center">
        <span class="public-icon is-bad">
          <n-icon size="36"><DocumentDismiss24Regular /></n-icon>
        </span>
        <h3 class="mt-4 text-xl font-semibold text-textColor0">
          {{ $t('publicPage.invalidDocument') }}
        </h3>
        <p class="mt-1.5 text-sm text-textColor2">{{ $t('publicPage.invalidHint') }}</p>
      </div>
    </div>

    <div v-else class="mx-auto w-full max-w-[1680px] px-3 pb-10 pt-5 sm:px-6 sm:pt-6">
      <div
        class="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_440px] lg:items-start lg:gap-6"
      >
        <!-- Hujjat (+ imtihon natijasi sahifasida savollar) -->
        <div class="flex min-w-0 flex-col gap-4">
          <Document />
          <!-- Kirish tugmasi va savollar faqat imtihon natijasi havolasida (worker-exams) -->
          <Authectication v-if="isExam" />
          <QuizItem
            v-for="(item, index) in store.list"
            :key="item.id"
            :selected-answer="item.result"
            :number="index + 1"
            :question="item.question"
            :answers="item.answers"
          />
        </div>

        <!-- Panel: telefonda hujjatdan tepada (order-first), kompyuterda o'ngda yopishib turadi -->
        <aside class="order-first flex flex-col gap-4 lg:sticky lg:top-[80px] lg:order-none">
          <n-skeleton v-if="!store.loaded" height="132px" style="border-radius: 20px" />
          <!-- Sahifa nima: qog'oz hujjatning elektron nusxasi — qanday kelindi, asl nusxa qayerda, nima qilish kerak -->
          <!-- Telefonda ixchamroq: kichik ikonka, matnlar orasi kamroq -->
          <div v-else class="public-card px-3.5 py-3 lg:p-5">
            <div class="flex items-center gap-2.5 lg:gap-4">
              <span class="public-icon is-ok shrink-0">
                <n-icon :size="isDesktop ? 30 : 18"><ShieldCheckmark24Filled /></n-icon>
              </span>
              <h3 class="min-w-0 text-base font-semibold leading-snug text-textColor0 lg:text-lg">
                {{ $t('publicPage.verifiedTitle') }}
              </h3>
            </div>
            <!-- Uchala gap bitta matnda (alohida qatorlar emas) -->
            <p class="mt-1.5 text-[13px] leading-snug text-textColor2 lg:mt-3 lg:text-sm lg:leading-relaxed">
              {{ infoText }}
            </p>
          </div>
          <!-- Hujjat rekvizitlari va holati (bekor qilingan bo'lsa ogohlantirish) -->
          <div v-if="store.loaded && store.meta" class="public-card px-3.5 py-3 lg:p-5">
            <div class="flex items-center justify-between gap-2">
              <h3 class="text-base font-semibold text-textColor0">
                {{ $t('publicPage.documentInfo') }}
              </h3>
              <!-- Kelishuvchilardagi bilan bir xil chip (UIStatus fig) -->
              <UIStatus
                v-if="store.meta.is_cancelled"
                class="shrink-0"
                :status="{ id: 4, name: $t('publicPage.cancelled') }"
                fig
                :tooltip="false"
              />
              <UIStatus
                v-else-if="store.meta.status?.name"
                class="shrink-0"
                :status="store.meta.status"
                fig
                :tooltip="false"
              />
            </div>
            <div
              v-if="store.meta.is_cancelled && store.meta.cancelled_by"
              class="mt-2 rounded-lg bg-danger/10 px-3 py-2 text-[13px] text-danger"
            >
              {{
                $t('publicPage.cancelledBy', {
                  number: store.meta.cancelled_by.number ?? '—',
                  date: fmtDate(store.meta.cancelled_by.date)
                })
              }}
            </div>
            <dl class="mt-2 flex flex-col gap-1.5 text-[13px] lg:text-sm">
              <div v-for="r in metaRows" :key="r.label" class="flex justify-between gap-3">
                <dt class="shrink-0 text-textColor2">{{ r.label }}</dt>
                <dd class="text-right font-medium text-textColor0">{{ r.value }}</dd>
              </div>
            </dl>
          </div>
          <!-- Kompyuterda ro'yxat panelda; telefonda — ekranning o'ng chetidagi qotgan tugma (pastda) -->
          <Confirmations v-if="isDesktop" />
        </aside>
      </div>
    </div>

    <!-- Telefon: ekranning o'ng chetiga yopishgan tugma — aylantirganda ham joyida, hujjat ustida turadi -->
    <Transition name="signers-tab">
      <button
        v-if="showTab"
        ref="tabRef"
        type="button"
        class="signers-tab fixed right-0 z-40 flex h-11 w-12 cursor-grab items-center justify-center rounded-l-full bg-primary pl-0.5 text-white active:cursor-grabbing"
        :style="{ top: (tabTop ?? -999) + 'px' }"
        :aria-label="$t('timesheetPage.verifiers')"
        @pointerdown="onTabDown"
        @pointermove="onTabMove"
        @pointerup="onTabUp"
        @pointercancel="onTabUp"
        @click="onTabClick"
      >
        <!-- Faqat ikonka (yozuv va son kerak emas — uning ma'nosi aria-label va oynaning sarlavhasida) -->
        <n-icon size="20"><Person24Filled /></n-icon>
      </button>
    </Transition>

    <!-- Telefon: kelishuvchilar o'ngdan suriladi (n-drawer o'z animatsiyasi bilan) -->
    <n-drawer v-model:show="signersOpen" placement="right" width="min(92vw, 420px)">
      <n-drawer-content :title="$t('timesheetPage.verifiers')" closable>
        <Confirmations bare />
      </n-drawer-content>
    </n-drawer>
  </div>
</template>

<style scoped>
  /* Imzolash sahifasidagi kabi: tepada brend rangidagi yumshoq «tuman», pastga qarab sahifa fonida yo'qoladi */
  .public-bg {
    background:
      radial-gradient(
        1200px 380px at 50% -60px,
        color-mix(in srgb, var(--color-primary) 16%, transparent),
        transparent 70%
      ),
      var(--color-surface-ground);
  }
  .public-card,
  :deep(.public-card) {
    border: 1px solid var(--color-surface-line);
    border-radius: 20px;
    background: var(--color-surface-section);
    box-shadow:
      0 1px 2px rgb(16 24 40 / 4%),
      0 12px 32px -12px rgb(16 24 40 / 18%);
  }
  .public-icon {
    display: flex;
    width: 60px;
    height: 60px;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
  }
  .public-icon.is-ok {
    width: 34px;
    height: 34px;
    color: var(--color-success);
    background: color-mix(in srgb, var(--color-success) 12%, transparent);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-success) 6%, transparent);
  }
  @media (min-width: 976px) {
    .public-icon.is-ok {
      width: 60px;
      height: 60px;
      box-shadow: 0 0 0 8px color-mix(in srgb, var(--color-success) 6%, transparent);
    }
  }
  .public-icon.is-bad {
    width: 76px;
    height: 76px;
    color: var(--color-danger);
    background: color-mix(in srgb, var(--color-danger) 12%, transparent);
    box-shadow: 0 0 0 10px color-mix(in srgb, var(--color-danger) 6%, transparent);
  }
  /* O'ng chetdagi «Kelishuvchilar» tugmasi — faqat ikonka, soya chap tomonga */
  .signers-tab {
    box-shadow: -6px 8px 24px -10px rgb(16 24 40 / 45%);
    touch-action: none; /* surishda sahifa aylanmasin */
    user-select: none;
  }
  .signers-tab-enter-active,
  .signers-tab-leave-active {
    transition:
      transform 0.25s ease,
      opacity 0.25s ease;
  }
  .signers-tab-enter-from,
  .signers-tab-leave-to {
    opacity: 0;
    transform: translateX(100%);
  }
</style>
