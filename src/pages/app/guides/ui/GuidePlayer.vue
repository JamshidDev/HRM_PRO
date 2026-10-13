<script setup>
  import 'player.style/yt'
  import { UIModal } from '@/components/index.js'

  const props = defineProps({ guide: { type: Object, default: null } })
  const emit = defineEmits(['close'])
  const visible = computed({ get: () => !!props.guide, set: (v) => !v && emit('close') })
</script>

<template>
  <UIModal v-model:visible="visible" :width="1100" :title="guide?.title || ''">
    <div v-if="guide" class="flex flex-col gap-3">
      <div class="aspect-video w-full overflow-hidden rounded-xl bg-black">
        <media-theme-yt class="h-full w-full">
          <!-- eslint-disable-next-line vue/no-deprecated-slot-attribute -- media-chrome web-komponentining tabiiy slot'i -->
          <video slot="media" :src="guide.video_url" :poster="guide.poster_url || undefined" playsinline crossorigin autoplay class="h-full w-full"></video>
        </media-theme-yt>
      </div>
      <p v-if="guide.description" class="text-[14px] leading-5 text-fig-text-secondary">{{ guide.description }}</p>
    </div>
  </UIModal>
</template>
