<script setup>
  /**
   * Figma "Paragraph" (node 3257:112511 / 3257:112539) — bosh sahifadagi
   * ro'yxat kartalarining umumiy qobig'i.
   *
   * `hrm/dashboard` dagi `FigPanel.vue` ga o'xshaydi, ammo maketda o'lchamlari
   * boshqacha (32px yumaloq chip, 16px karta padding'i, `bg-secondary` ichki
   * qatlamsiz), shuning uchun alohida komponent: dashboard kartalarini
   * o'zgartirmaslik uchun.
   */
  import patternUrl from '@/assets/icons/home/welcome-pattern.png'
  import ornamentUrl from '@/assets/icons/home/ornament.svg?url'

  defineProps({
    icon: {
      type: [Object, Function],
      default: null
    },
    title: String,
    // Chip foni va ikonka rangi — maketdagi tint tokenlari
    tintClass: {
      type: String,
      default: 'bg-fig-bg-brand-surface text-fig-text-brand'
    },
    // O'ngdagi "Batafsil ↗" havolasi — berilmasa chizilmaydi
    actionText: {
      type: String,
      default: null
    },
    /**
     * Maketda naqsh + bezak faqat "Yangiliklar" kartasida bor
     * (node 3257:112509/112510); "Online hodimlar" kartasi toza oq.
     */
    decorated: {
      type: Boolean,
      default: false
    },
    // Sarlavha va kontent orasi: maketda yangiliklarda 20px, online'da 24px
    gapClass: {
      type: String,
      default: 'gap-5'
    }
  })

  defineEmits(['action'])
</script>

<template>
  <div
    class="relative flex h-full flex-col overflow-hidden rounded-2xl bg-fig-block p-4"
    :class="gapClass"
  >
    <template v-if="decorated">
      <img :src="patternUrl" alt="" aria-hidden="true" class="home-panel__pattern" />
      <img :src="ornamentUrl" alt="" aria-hidden="true" class="home-panel__ornament" />
    </template>

    <div class="relative flex w-full shrink-0 items-center gap-2">
      <span
        v-if="icon"
        class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
        :class="tintClass"
      >
        <span class="flex h-5 w-5 items-center justify-center">
          <component :is="icon" />
        </span>
      </span>

      <p
        class="min-w-0 flex-1 truncate text-[14px] leading-[18px] font-medium text-fig-text-primary"
      >
        {{ title }}
      </p>

      <button
        v-if="actionText"
        type="button"
        class="shrink-0 cursor-pointer text-[12px] leading-4 whitespace-nowrap text-fig-text-brand transition-opacity hover:opacity-80"
        @click="$emit('action')"
      >
        {{ actionText }} ↗
      </button>
    </div>

    <!-- Maketda (node 3257:112545) kontent ustuni `justify-between`:
         yuqorida matn, pastda rasmlar. -->
    <div class="relative flex min-h-px flex-1 flex-col justify-between">
      <slot />
    </div>
  </div>
</template>

<style scoped>
  /* Maket: naqsh 1104x269, kartaning vertikal markazida, 4% shaffof */
  .home-panel__pattern {
    position: absolute;
    top: 50%;
    left: 0;
    width: 1104px;
    height: 269px;
    max-width: none;
    transform: translateY(-50%);
    object-fit: cover;
    opacity: 0.04;
    pointer-events: none;
  }

  /* Maket: 300x157 quti kartaning yuqori markazida, ichidagi rasm 90° burilgan.
     Shaffoflik SVG ning o'zida (4%) berilgan. */
  .home-panel__ornament {
    position: absolute;
    top: 0;
    left: 50%;
    width: 157px;
    height: 300px;
    max-width: none;
    transform: translate(-50%, -71.5px) rotate(90deg);
    pointer-events: none;
  }
</style>
