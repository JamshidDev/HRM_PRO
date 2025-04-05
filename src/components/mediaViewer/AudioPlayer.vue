<script setup xmlns="http://www.w3.org/1999/html">
import 'player.style/tailwind-audio';
import { Dismiss12Filled } from '@vicons/fluent'
defineProps({
  src: {
    type: String,
    required: true
  }
})

defineEmits(['close'])

</script>

<template>
  <div class="absolute right-5 bottom-5 rounded-md bg-surface-section">
    <div class="relative flex pt-7">
      <div class="p-1">
        <media-theme-tailwind-audio>
          <audio
              slot="media"
              :src="src"
              playsinline
              crossorigin
              autoplay
          ></audio>
        </media-theme-tailwind-audio>
      </div>
      <div class="absolute right-1 top-1">
        <n-button size="tiny" type="error" round circle tertiary @click="$emit('close')">
          <template #icon>
            <n-icon :component="Dismiss12Filled" />
          </template>
        </n-button>
      </div>
    </div>

   </div>

</template>