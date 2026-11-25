<script setup>
  /**
   * Figma "Story Container" (node 3257:112485) — 90×109 muqovalar qatori.
   *
   * Manba: `GET /v1/mobile/stories`. Server chop etilganlarini o'zi filtrlaydi
   * va tartiblaydi, `title`/`subtitle` ni `Accept-Language` bo'yicha tayyor
   * matn qilib beradi. Muqova — birinchi slayd (`slides[0].url`, MinIO
   * presigned havolasi).
   *
   * Muqovaga bosilganda to'liq ekran ko'ruvchisi ochiladi (`StoryViewer.vue`,
   * Figma node 4054:30039) va story `seen` deb belgilanadi.
   * Hoshiya: ko'rilmagan (`is_seen: false`) — yashil, ko'rilgan — kulrang.
   * Tartib — serverdan kelgani (admin'dagi «Tartib» maydoni bo'yicha).
   */
  import { useHomeStore } from '@/store/modules/index.js'
  import { useAppSetting, Utils } from '@/utils/index.js'

  const store = useHomeStore()

  const coverOf = (story) => {
    const slides = [...(story.slides ?? [])].sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
    return (
      slides.find((s) => s.media_type === 'image')?.url ||
      slides[0]?.url ||
      useAppSetting.noAvailableImage
    )
  }
</script>

<template>
  <!-- Maketda story'lar bitta qatorda. Tor ekranda ular ikkinchi qatorga
       sinib ketmasligi uchun qator gorizontal skroll qilinadi. -->
  <div
    v-if="store.stories.length"
    class="-mx-1 flex items-center gap-4 overflow-x-auto px-1 pb-1 sm:gap-5"
  >
    <div
      v-for="(story, index) in store.stories"
      :key="story.id"
      :title="story.title || ''"
      role="button"
      class="relative h-[109px] w-[90px] shrink-0 cursor-pointer overflow-hidden rounded-2xl border-[3px] bg-fig-blue-100 transition-[transform,border-color] hover:scale-[1.03]"
      :class="story.is_seen ? 'border-fig-br-secondary' : 'border-fig-green-400'"
      @click="store.openStory(index)"
    >
      <!-- Maket (3257:112486): fon `bg-brand-surface` (#d1e9ff), rasm 96px (111:135), vertikal markazda.
           Figma'da hoshiya ICHKARIDA va rasm ramkadan 3px chiqadi; CSS'da hoshiya tashqarida, shuning
           uchun -6px. -->
      <img
        :src="coverOf(story)"
        alt=""
        class="absolute top-1/2 -left-[6px] aspect-[111/135] w-[calc(100%+12px)] max-w-none -translate-y-1/2 object-cover"
        @error="Utils.onImgError"
      />
    </div>
  </div>
</template>
