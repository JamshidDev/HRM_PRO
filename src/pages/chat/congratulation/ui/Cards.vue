<script setup>
  import { useCongratulationStore } from '@stores'
  import { Utils } from '@utils'
  import i18n from '@/i18n/index.js'

  import GiftIcon from '@/assets/icons/congratulation/gift.svg'
  import GiftDecor from '@/assets/icons/congratulation/gift-decor.svg'
  import SunIcon from '@/assets/icons/congratulation/sun.svg'
  import SunDecor from '@/assets/icons/congratulation/sun-decor.svg'
  import MedIcon from '@/assets/icons/congratulation/med.svg'
  import MedDecor from '@/assets/icons/congratulation/med-decor.svg'
  import PassportIcon from '@/assets/icons/congratulation/passport.svg'
  import PassportDecor from '@/assets/icons/congratulation/passport-decor.svg'
  import MobileIcon from '@/assets/icons/congratulation/mobile.svg'
  import MobileDecor from '@/assets/icons/congratulation/mobile-decor.svg'
  import TurnstileIcon from '@/assets/icons/congratulation/turnstile.svg'
  import TurnstileDecor from '@/assets/icons/congratulation/turnstile-decor.svg'

  const t = i18n.global.t
  const store = useCongratulationStore()

  // Tur id'si → maketdagi tint, ikonka va dekor. `rotate` faqat Turniket uchun —
  // maketda arrow-down-arrow-up 90° burilgan holda turadi.
  const cardTypes = {
    1: {
      box: 'bg-fig-blue-100',
      icon: GiftIcon,
      decor: GiftDecor,
      description: t('congratulation.description.birthday')
    },
    2: {
      box: 'bg-fig-amber-100',
      icon: SunIcon,
      decor: SunDecor,
      description: t('congratulation.description.vacation')
    },
    3: {
      box: 'bg-fig-green-100',
      icon: MedIcon,
      decor: MedDecor,
      description: t('congratulation.description.med')
    },
    4: {
      box: 'bg-fig-indigo-100',
      icon: PassportIcon,
      decor: PassportDecor,
      description: t('congratulation.description.passport')
    },
    5: {
      box: 'bg-fig-pink-100',
      icon: MobileIcon,
      decor: MobileDecor,
      description: t('congratulation.description.mobile')
    },
    6: {
      box: 'bg-fig-lime-100',
      icon: TurnstileIcon,
      decor: TurnstileDecor,
      rotate: true,
      description: t('congratulation.description.turnstile')
    }
  }

  const skeletonCount = 6

  onMounted(() => {
    store._dashboard()
  })
</script>

<template>
  <!-- Kartalar hali kelmagan bo'lsa umuman chizilmaydi — aks holda `UIPageContent`
       ning `gap-4` i bo'sh konteyner ustidan ortiqcha bo'shliq qoldiradi. -->
  <div v-if="store.dashboard.loading || store.dashboard.cards.length" class="flex flex-wrap gap-4">
    <template v-if="store.dashboard.loading && !store.dashboard.cards.length">
      <div
        v-for="i in skeletonCount"
        :key="`sk-${i}`"
        class="flex-1 min-w-[160px] rounded-2xl bg-surface-section pt-1.5 px-3 pb-3"
      >
        <n-skeleton height="20px" width="70%" round />
        <n-skeleton class="mt-2" height="24px" width="45%" round />
      </div>
    </template>

    <template v-else>
      <div
        v-for="item in store.dashboard.cards"
        :key="item.id"
        class="relative flex-1 min-w-[160px] overflow-hidden rounded-2xl bg-surface-section pt-1.5 px-1 pb-1"
      >
        <!-- maketdagi yuqori-o'ng burchakdagi 64px so'nuvchi dekor (karta chetidan qirqiladi) -->
        <span
          v-if="cardTypes[item.id]?.decor"
          aria-hidden="true"
          class="absolute top-3 right-0.5 size-16 flex items-center justify-center pointer-events-none select-none"
          :class="cardTypes[item.id]?.rotate && 'rotate-90'"
        >
          <component :is="cardTypes[item.id]?.decor" />
        </span>

        <div class="relative flex items-center gap-2 px-2">
          <span
            v-if="cardTypes[item.id]?.icon"
            class="shrink-0 rounded-full p-1"
            :class="cardTypes[item.id]?.box"
          >
            <span
              class="size-5 flex items-center justify-center"
              :class="cardTypes[item.id]?.rotate && 'rotate-90'"
            >
              <component :is="cardTypes[item.id]?.icon" />
            </span>
          </span>
          <n-tooltip v-if="cardTypes[item.id]?.description" placement="bottom" trigger="hover">
            <template #trigger>
              <p
                class="text-[14px] leading-[18px] font-medium text-fig-text-tertiary truncate cursor-default"
              >
                {{ item.type }}
              </p>
            </template>
            <span>{{ cardTypes[item.id]?.description }}</span>
          </n-tooltip>
          <p v-else class="text-[14px] leading-[18px] font-medium text-fig-text-tertiary truncate">
            {{ item.type }}
          </p>
        </div>

        <div class="relative px-2 mt-2">
          <p
            class="font-grotesk font-semibold text-[20px] leading-[24px] text-fig-text-primary whitespace-nowrap"
          >
            {{ Utils.formatNumberToMoney(item.count) || '0' }}
          </p>
        </div>
      </div>
    </template>
  </div>
</template>
