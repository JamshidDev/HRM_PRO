<script setup>
  /**
   * Figma "Story Container" (node 3257:112485) — 90×109 muqovalar qatori.
   *
   * Ma'lumot faqat admin CRUD endpoint'idan keladi (`/v1/admin/mobile-stories`);
   * xodimda ruxsat bo'lmasa `homeStore` ro'yxatni bo'sh qoldiradi va qator
   * butunlay chizilmaydi. Ko'rish oqimi (slayd pleyeri, "ko'rildi" belgisi)
   * uchun consumer API hali yo'q — muqovalar hozircha faqat ko'rsatiladi.
   */
  import { useHomeStore } from '@/store/modules/index.js'
  import { useAppSetting, Utils } from '@/utils/index.js'
  import i18n from '@/i18n/index.js'

  const store = useHomeStore()

  const coverOf = (story) => story.slides?.[0]?.url || useAppSetting.noAvailableImage

  const titleOf = (story) => {
    const title = story.title
    if (!title) return ''
    return title[i18n.global.locale] || Object.values(title).find(Boolean) || ''
  }
</script>

<template>
  <div v-if="store.stories.length" class="flex flex-wrap items-center gap-5">
    <div
      v-for="story in store.stories"
      :key="story.id"
      :title="titleOf(story)"
      class="h-[109px] w-[90px] shrink-0 overflow-hidden rounded-2xl border-[3px] border-fig-green-400 bg-fig-bg-brand-surface"
    >
      <img
        :src="coverOf(story)"
        alt=""
        class="h-full w-full object-cover"
        @error="Utils.onImgError"
      />
    </div>
  </div>
</template>
