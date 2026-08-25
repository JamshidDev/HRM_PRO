<script setup>
  /**
   * Figma "Paragraph" (node 3257:112511 / 3257:112539) — bosh sahifadagi
   * ro'yxat kartalarining umumiy qobig'i.
   *
   * `hrm/dashboard` dagi `FigPanel.vue` ga o'xshaydi, ammo maketda o'lchamlari
   * boshqacha (32px chip, 16px karta padding'i, `bg-secondary` ichki qatlamsiz),
   * shuning uchun alohida komponent: dashboard kartalarini o'zgartirmaslik uchun.
   */
  import patternUrl from '@/assets/icons/home/welcome-pattern.png'

  defineProps({
    icon: {
      type: [Object, Function],
      default: null
    },
    title: String,
    // Chip foni va ikonka rangi — maketdagi tint tokenlari
    tintClass: {
      type: String,
      default: 'bg-fig-blue-100 text-fig-text-brand'
    },
    // O'ngdagi "Batafsil ↗" havolasi — berilmasa chizilmaydi
    actionText: {
      type: String,
      default: null
    }
  })

  defineEmits(['action'])
</script>

<template>
  <div class="relative flex h-full flex-col gap-5 overflow-hidden rounded-2xl bg-fig-block p-4">
    <img
      :src="patternUrl"
      alt=""
      aria-hidden="true"
      class="pointer-events-none absolute top-1/2 left-0 h-[269px] w-[1104px] max-w-none -translate-y-1/2 object-cover opacity-[0.04]"
    />

    <div class="relative flex w-full shrink-0 items-center gap-2">
      <span
        v-if="icon"
        class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
        :class="tintClass"
      >
        <span class="flex h-5 w-5 items-center justify-center">
          <component :is="icon" />
        </span>
      </span>

      <p
        class="min-w-0 flex-1 truncate text-[14px] leading-[18px] font-medium text-fig-text-secondary"
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

    <div class="relative flex min-h-px flex-1 flex-col">
      <slot />
    </div>
  </div>
</template>
