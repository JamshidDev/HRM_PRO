<script setup>
  /**
   * Figma "Welcome" (node 3257:112471) — salomlashuv kartasi.
   *
   * F.I.Sh + "Xush kelibsiz!", o'ngda ob-havo va shahar chiplari, pastda
   * story muqovalari. Kartaning markazida maketdagi xira naqsh (4% shaffof).
   */
  import { useAccountStore, useHomeStore } from '@/store/modules/index.js'
  import StoryRow from './StoryRow.vue'
  import SunIcon from '@/assets/icons/home/sun.svg'
  import LocationPinIcon from '@/assets/icons/home/location-pin.svg'
  import patternUrl from '@/assets/icons/home/welcome-pattern.png'

  const accountStore = useAccountStore()
  const homeStore = useHomeStore()
</script>

<template>
  <div class="relative h-full overflow-hidden rounded-2xl bg-fig-block p-4">
    <!-- Maketdagi naqsh: kartaning markazida, 4% shaffoflik bilan -->
    <img
      :src="patternUrl"
      alt=""
      aria-hidden="true"
      class="pointer-events-none absolute top-1/2 left-0 h-[269px] w-[1104px] max-w-none -translate-y-1/2 object-cover opacity-[0.04]"
    />

    <div class="relative flex h-full flex-col gap-5">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex min-w-0 flex-col gap-0.5">
          <p class="truncate text-[16px] leading-6 text-fig-text-secondary">
            {{ accountStore.fullName }}
          </p>
          <p class="text-[24px] leading-[30px] font-semibold text-fig-text-primary">
            {{ $t('homePage.welcome') }}
          </p>
        </div>

        <div class="flex shrink-0 items-center gap-3">
          <!-- Ob-havo Open-Meteo'dan keladi; xato bo'lsa chip chizilmaydi -->
          <div
            v-if="homeStore.weather"
            class="flex items-center gap-1 rounded-full bg-fig-bg-tertiary px-3 py-2"
          >
            <span class="flex h-[18px] w-[18px] shrink-0 items-center justify-center">
              <SunIcon />
            </span>
            <span
              class="text-[14px] leading-[18px] font-semibold whitespace-nowrap text-fig-text-secondary"
            >
              {{ homeStore.weather.min > 0 ? '+' : '' }}{{ homeStore.weather.min }}° -
              {{ homeStore.weather.max > 0 ? '+' : '' }}{{ homeStore.weather.max }}°
            </span>
          </div>

          <div
            v-if="homeStore.weather"
            class="flex items-center gap-1.5 rounded-full bg-fig-bg-tertiary px-3 py-2"
          >
            <span class="flex h-[18px] w-[18px] shrink-0 items-center justify-center">
              <LocationPinIcon />
            </span>
            <span
              class="text-[14px] leading-[18px] font-semibold whitespace-nowrap text-fig-text-secondary"
            >
              {{ homeStore.weather.city }}
            </span>
          </div>
        </div>
      </div>

      <StoryRow />
    </div>
  </div>
</template>
