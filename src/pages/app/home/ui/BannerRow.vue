<script setup>
  /**
   * Figma "Frame 2147226629" (node 3257:112495) — 140px balandlikdagi 3 banner.
   *
   * Consumer uchun banner API'si yo'q; eng yaqin manba — bayram tabriknomalari
   * (`/v1/admin/holiday-greetings`, ro'yxatdagi `banner_url` maydoni). Ruxsat
   * yo'q yoki faol tabriknoma bo'lmasa qator butunlay chizilmaydi.
   */
  import { useHomeStore } from '@/store/modules/index.js'
  import { Utils } from '@/utils/index.js'

  const store = useHomeStore()

  // Maketda 3 ta banner — ko'proq kelsa birinchi uchtasi ko'rsatiladi.
  const items = computed(() => store.banners.slice(0, 3))
</script>

<template>
  <div v-if="items.length" class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    <div
      v-for="item in items"
      :key="item.id"
      class="h-[140px] overflow-hidden rounded-2xl bg-fig-bg-secondary"
    >
      <img
        :src="item.banner_url"
        :alt="item.name || ''"
        class="h-full w-full object-cover"
        @error="Utils.onImgError"
      />
    </div>
  </div>
</template>
