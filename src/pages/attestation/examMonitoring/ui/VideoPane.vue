<script setup>
  import { Desktop16Regular, Video16Regular, VideoOff24Regular } from '@vicons/fluent'

  // Jonli oqim oynasi: oqim bo'lmasa holat belgisi va izohi ko'rsatiladi.
  const props = defineProps({
    stream: { type: Object, default: null },
    kind: { type: String, default: 'camera' }, // camera | screen
    title: { type: String, default: '' },
    enabled: { type: Boolean, default: true },
    disabledText: { type: String, default: '' },
    waitingText: { type: String, default: '' },
    connecting: { type: Boolean, default: false }
  })
  const videoRef = ref(null)
  watch(
    () => [props.stream, videoRef.value],
    ([s, el]) => {
      if (el) el.srcObject = s || null
    },
    { immediate: true }
  )
  const live = computed(() => props.enabled && !!props.stream)
</script>

<template>
  <div
    class="relative h-full min-h-[220px] flex flex-col rounded-2xl overflow-hidden border border-surface-line"
    :class="live ? 'bg-black' : 'bg-surface-ground-soft'"
  >
    <div class="absolute top-3 left-3 right-3 z-10 flex items-center justify-between gap-2">
      <span
        class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
        :class="live ? 'bg-black/60 text-white' : 'bg-surface-section text-fig-text-secondary'"
      >
        <n-icon size="14">
          <Desktop16Regular v-if="kind === 'screen'" />
          <Video16Regular v-else />
        </n-icon>
        {{ title }}
      </span>
      <span
        v-if="live"
        class="inline-flex items-center gap-1.5 rounded-full bg-fig-red px-2 py-0.5 text-[11px] font-semibold text-white"
      >
        <span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
        LIVE
      </span>
    </div>

    <video
      v-show="live"
      ref="videoRef"
      autoplay
      muted
      playsinline
      class="w-full h-full object-contain"
    ></video>

    <div
      v-if="!live"
      class="flex-1 flex flex-col items-center justify-center gap-3 p-6 text-center"
    >
      <n-spin v-if="enabled && connecting" size="medium" />
      <span
        v-else
        class="w-12 h-12 rounded-2xl flex items-center justify-center"
        :class="
          enabled
            ? 'bg-fig-chip-brand text-fig-chip-brand-text'
            : 'bg-fig-red-100 text-fig-text-red'
        "
      >
        <n-icon size="24"><VideoOff24Regular /></n-icon>
      </span>
      <p class="max-w-[320px] text-sm text-fig-text-secondary">
        {{ enabled ? waitingText : disabledText }}
      </p>
    </div>
  </div>
</template>
