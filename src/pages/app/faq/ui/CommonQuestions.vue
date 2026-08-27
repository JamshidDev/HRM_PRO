<script setup>
  /**
   * Figma "commonQuestions" — "Ko'p beriladigan savollar" bloki.
   *
   * Ikonka bo'lim (category) darajasida belgilanadi — bitta bo'limdagi barcha
   * savollar bir xil ikonka bilan chiziladi; mos ikonka bo'lmasa savol
   * belgisi (`question`) standart bo'lib qoladi.
   */
  import { UISegmentTabs } from '@/components/index.js'
  import QuestionIcon from '@/assets/icons/contact/question.svg'
  import LockIcon from '@/assets/icons/lock.svg'
  import UsersIcon from '@/assets/icons/contact/users.svg'
  import WalletIcon from '@/assets/icons/contact/wallet-alt.svg'
  import PlaneIcon from '@/assets/icons/contact/Plane-departure.svg'
  import ScanIcon from '@/assets/icons/contact/scan.svg'
  import ChevronDownIcon from '@/assets/icons/chevronDownBold.svg'
  import SupportIcon from '@/assets/icons/contact/support.svg'
  import HouseIcon from '@/assets/icons/contact/house.svg'
  import { AppPaths } from '@/utils/index.js'
  import i18n from '@/i18n/index.js'
  import questions from './questions.json'

  const router = useRouter()

  // `staff`/`salary` ikonalari sidebar'dagi "Kadrlar boshqaruvi" (HrManagement.svg)
  // va "Iqtisodchi" (Economist.svg) belgilarining nusxasi — asl fayllar boshqa
  // joyda ishlatilgani uchun ularga tegmasdan, shu yerda alohida nusxa saqlanadi.
  const CATEGORY_ICONS = {
    staff: UsersIcon,
    salary: WalletIcon,
    vacation: PlaneIcon,
    turnstile: ScanIcon,
    technical: LockIcon
  }

  const CATEGORY_IDS = ['staff', 'salary', 'vacation', 'turnstile', 'technical']

  const activeTab = ref('all')

  // Maketdagi to'liq bo'lim ro'yxati — savollar qaysi bo'limlarga tegishli
  // bo'lishidan qat'i nazar barchasi ko'rsatiladi.
  const tabs = computed(() => [
    { id: 'all', name: i18n.global.t('faqPage.tabs.all') },
    ...CATEGORY_IDS.map((id) => ({ id, name: i18n.global.t(`faqPage.tabs.${id}`) }))
  ])

  const filteredQuestions = computed(() =>
    activeTab.value === 'all'
      ? questions
      : questions.filter((item) => item.category === activeTab.value)
  )

  // Bir nechta savol bir vaqtda ochiq turishi mumkin — Set orqali kuzatiladi.
  // Boshlanishida hech biri ochiq emas.
  const openIds = ref(new Set())

  const toggle = (id) => {
    const next = new Set(openIds.value)
    next.has(id) ? next.delete(id) : next.add(id)
    openIds.value = next
  }

  const goContact = () => router.push(AppPaths.Contact)
</script>

<template>
  <div class="flex w-full flex-col gap-4">
    <UISegmentTabs v-model="activeTab" :tabs="tabs" />

    <div v-if="filteredQuestions.length" class="flex flex-col gap-3 rounded-2xl bg-fig-block p-4">
      <div
        v-for="item in filteredQuestions"
        :key="item.id"
        class="rounded-2xl bg-fig-bg-secondary p-4"
      >
        <button
          type="button"
          class="flex w-full cursor-pointer items-center gap-3 text-left"
          :aria-expanded="openIds.has(item.id)"
          @click="toggle(item.id)"
        >
          <span
            class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-fig-blue-100 text-fig-text-brand"
          >
            <span class="faq-item__icon flex h-5 w-5 items-center justify-center">
              <component :is="CATEGORY_ICONS[item.category] || QuestionIcon" />
            </span>
          </span>

          <span
            class="min-w-0 flex-1 text-[14px] leading-[18px] font-semibold text-fig-text-primary sm:text-[15px]"
          >
            {{ item.question }}
          </span>

          <span
            class="faq-item__chevron flex h-6 w-6 shrink-0 items-center justify-center text-fig-text-primary"
            :class="openIds.has(item.id) && 'faq-item__chevron--open'"
          >
            <ChevronDownIcon />
          </span>
        </button>

        <n-collapse-transition :show="openIds.has(item.id)">
          <p class="pt-2 pl-14 text-[14px] leading-5 text-fig-text-secondary">
            {{ item.answer }}
          </p>
        </n-collapse-transition>
      </div>
    </div>

    <p
      v-else
      class="rounded-2xl bg-fig-block p-4 text-center text-[14px] leading-5 text-fig-text-tertiary"
    >
      {{ $t('faqPage.empty') }}
    </p>

    <div class="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-fig-block p-4">
      <div class="flex items-center gap-3">
        <span
          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-fig-green-100 text-fig-green"
        >
          <span class="flex h-4 w-4 items-center justify-center"><SupportIcon /></span>
        </span>
        <div class="flex flex-col gap-0.5">
          <p class="text-[14px] leading-[18px] font-semibold text-fig-text-primary">
            {{ $t('faqPage.footer.title') }}
          </p>
          <p class="text-[12px] leading-4 text-fig-text-secondary">
            {{ $t('faqPage.footer.subtitle') }}
          </p>
        </div>
      </div>

      <button
        type="button"
        class="flex h-9 shrink-0 cursor-pointer items-center gap-2 rounded-lg bg-fig-bg-brand px-4 text-[14px] leading-[18px] font-medium text-white transition-opacity hover:opacity-90"
        @click="goContact"
      >
        <span class="flex h-[18px] w-[18px] shrink-0 items-center justify-center text-white">
          <HouseIcon />
        </span>
        {{ $t('faqPage.footer.action') }}
      </button>
    </div>
  </div>
</template>

<style scoped>
  /* Kategoriya ikonalari turli manbadan olingan (har xil o'lchamdagi
     width/height bilan) — svgo o'chirilgan (vite.config.js) bo'lgani uchun
     ular asl o'lchamida chiziladi. Bir xil ko'rinish uchun konteynerga
     to'ldiriladi. */
  .faq-item__icon :deep(svg) {
    width: 100%;
    height: 100%;
  }

  .faq-item__chevron {
    transition: transform 0.2s ease;
  }

  .faq-item__chevron--open {
    transform: rotate(180deg);
  }
</style>
