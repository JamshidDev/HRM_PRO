<script setup>
  import { Play24Filled, CheckmarkCircle16Filled } from '@vicons/fluent'
  import { formatDuration } from '../categories.js'

  defineProps({ guide: { type: Object, required: true } })
  defineEmits(['open'])
</script>

<template>
  <button
    type="button"
    class="group flex min-w-0 flex-col gap-3 rounded-2xl bg-fig-block p-2 text-left shadow-card transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-primary"
    @click="$emit('open', guide)"
  >
    <div class="relative aspect-video w-full overflow-hidden rounded-xl bg-fig-chip-brand">
      <img v-if="guide.poster_url" :src="guide.poster_url" alt="" class="h-full w-full object-cover transition group-hover:scale-[1.03]" loading="lazy" />
      <div v-else class="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/80 to-primary/40" />
      <span class="absolute inset-0 flex items-center justify-center">
        <span class="flex h-12 w-12 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition group-hover:scale-110 group-hover:bg-primary">
          <n-icon size="24"><Play24Filled /></n-icon>
        </span>
      </span>
      <span v-if="guide.duration" class="absolute right-2 bottom-2 rounded-md bg-black/70 px-1.5 py-0.5 text-[12px] font-semibold text-white">
        {{ formatDuration(guide.duration) }}
      </span>
      <span v-if="guide.is_new" class="absolute top-2 left-2 rounded-md bg-primary px-2 py-0.5 text-[11px] font-bold text-white">
        {{ $t('guidesPage.new') }}
      </span>
    </div>
    <div class="flex min-w-0 flex-col gap-1 px-1 pb-1">
      <p class="line-clamp-2 text-[15px] leading-5 font-semibold text-fig-text-primary">{{ guide.title }}</p>
      <div class="flex items-center gap-2 text-[13px] text-fig-text-secondary">
        <span class="truncate">{{ $t(`guidesPage.categories.${guide.category}`) }}</span>
        <span v-if="guide.is_viewed" class="flex shrink-0 items-center gap-1 text-fig-chip-green-text">
          <n-icon size="14"><CheckmarkCircle16Filled /></n-icon>{{ $t('guidesPage.viewed') }}
        </span>
      </div>
    </div>
  </button>
</template>
