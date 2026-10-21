<script setup>
  import { ArrowDownload20Regular, Dismiss20Regular } from '@vicons/fluent'
  import { formatFileSize } from './format.js'
  import {
    isImageLoaded,
    imageSrcFor,
    imageProgress,
    downloadImage,
    cancelImage,
    finishImage
  } from './imageCache.js'

  // Telegram uslubidagi rasm: avval shaffof joy + ⬇; bosilsa ✕ va aylana progress (bekor qilish mumkin);
  // yuklangach rasm silliq paydo bo'ladi. Suhbat pufagida ham, profil "Rasmlar" to'rida ham (tile) ishlatiladi.
  const props = defineProps({
    message: { type: Object, required: true },
    isOwn: { type: Boolean, default: false },
    // Profil to'ri: kvadrat katak, rasm to'liq qoplaydi
    tile: { type: Boolean, default: false }
  })
  const emit = defineEmits(['open'])

  const loaded = computed(() => isImageLoaded(props.message, props.isOwn))
  const progress = computed(() => imageProgress.get(props.message.id))
  const busy = computed(() => progress.value !== undefined)
  const src = computed(() => imageSrcFor(props.message))
  // Rasm haqiqatda chizildimi (shungacha joy egallovchi ko'rinadi)
  const ready = ref(false)
  watch(src, () => {
    ready.value = false
  })

  const onLoad = () => {
    ready.value = true
    finishImage(props.message.id)
  }

  const onClick = () => {
    if (busy.value) cancelImage(props.message.id)
    else if (!loaded.value) downloadImage(props.message)
    else if (ready.value) emit('open')
  }

  // Haqiqiy shakl: backend o'lchamni qaytarsa — pufak rasmning nisbatida (uzun rasm — uzun),
  // yuklanmasdan oldin ham. O'lcham bo'lmasa (eski xabarlar) — rasm o'zi chizilgach o'lchamini oladi.
  const MAX_W = 280
  const MAX_H = 320
  const MIN_SIDE = 90
  const box = computed(() => {
    const w = Number(props.message.width)
    const h = Number(props.message.height)
    if (props.tile || !w || !h) return null
    const scale = Math.min(MAX_W / w, MAX_H / h, 1)
    return {
      width: `${Math.max(MIN_SIDE, Math.round(w * scale))}px`,
      height: `${Math.max(MIN_SIDE, Math.round(h * scale))}px`
    }
  })

  // Progress halqasi (r=21 → uzunligi ≈ 131.9)
  const RING = 2 * Math.PI * 21
  const ringOffset = computed(() => (progress.value > 0 ? RING * (1 - progress.value) : RING * 0.75))
</script>

<template>
  <div
    class="chat-image relative max-w-full cursor-pointer overflow-hidden"
    :class="tile ? 'h-full w-full' : !box && 'max-w-[280px]'"
    :style="box"
    @click.stop="onClick"
  >
    <!-- Joy egallovchi: xira kichik nusxa (bo'lsa) yoki shaffof qatlam — aniq rang yo'q -->
    <div
      v-if="!ready"
      class="img-ph overflow-hidden"
      :class="tile || box ? 'absolute inset-0' : 'h-[180px] w-[240px] max-w-full'"
    >
      <img
        v-if="message.thumb"
        :src="message.thumb"
        alt=""
        aria-hidden="true"
        class="h-full w-full scale-110 object-cover blur-md"
      />
    </div>
    <img
      v-if="loaded"
      :src="src"
      :alt="message.fileName"
      class="transition-opacity duration-300"
      :class="[
        tile || box
          ? 'absolute inset-0 h-full w-full object-cover'
          : 'block max-h-[320px] w-full max-w-[280px] object-cover',
        !tile && !box && !ready && 'absolute inset-0 h-full',
        ready ? 'opacity-100' : 'opacity-0'
      ]"
      @load="onLoad"
      @error="onLoad"
    />

    <!-- Hajm (yuklanmagan paytda, chap tepada) -->
    <span
      v-if="!loaded && !tile && message.fileSize"
      class="absolute left-2 top-2 rounded-full bg-black/45 px-1.5 py-0.5 text-[11px] leading-4 text-white"
    >
      {{ formatFileSize(message.fileSize) }}
    </span>

    <!-- Markazdagi tugma: ⬇ yuklash / ✕ bekor qilish (atrofida progress) -->
    <Transition name="img-btn">
      <span
        v-if="!loaded || busy"
        class="img-btn absolute left-1/2 top-1/2 flex items-center justify-center rounded-full text-white"
        :class="tile ? 'size-9' : 'size-12'"
        role="button"
        :aria-label="busy ? $t('content.cancel') : $t('content.download')"
      >
        <svg v-if="busy" class="img-ring absolute inset-0" :class="progress < 0 && 'is-spinning'" viewBox="0 0 48 48">
          <circle
            cx="24"
            cy="24"
            r="21"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            :stroke-dasharray="RING"
            :stroke-dashoffset="ringOffset"
          />
        </svg>
        <n-icon :size="tile ? 18 : 22">
          <Dismiss20Regular v-if="busy" />
          <ArrowDownload20Regular v-else />
        </n-icon>
      </span>
    </Transition>
  </div>
</template>

<style scoped>
  /* Yuklanmagan rasm o'rni: aniq rang emas — har ikki mavzuda ham ishlaydigan shaffof kulrang */
  .img-ph {
    background: rgba(127, 127, 127, 0.22);
  }
  .img-btn {
    background: rgba(0, 0, 0, 0.45);
    transform: translate(-50%, -50%);
    backdrop-filter: blur(2px);
    transition:
      background-color 0.2s ease,
      transform 0.2s ease,
      opacity 0.2s ease;
  }
  .chat-image:hover .img-btn {
    background: rgba(0, 0, 0, 0.55);
  }
  .img-ring {
    transform: rotate(-90deg);
  }
  .img-ring circle {
    transition: stroke-dashoffset 0.2s linear;
  }
  /* Foiz noma'lum bo'lsa — halqa aylanadi */
  .img-ring.is-spinning {
    animation: img-ring-spin 0.9s linear infinite;
  }
  @keyframes img-ring-spin {
    from {
      transform: rotate(-90deg);
    }
    to {
      transform: rotate(270deg);
    }
  }
  .img-btn-enter-from,
  .img-btn-leave-to {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.7);
  }
</style>
