<script setup xmlns="http://www.w3.org/1999/html">
import 'player.style/yt';
import {UIModal} from "@/components/index.js"

defineProps({
  src: {
    type: String,
    required: true
  }
})

defineEmits(['close'])

const visible = ref(true);
onMounted(()=>{
  console.log("Mounted")
})
</script>

<template>
  <UIModal :width="1000" title="" @update:visible="$emit('close')" v-model:visible="visible">
    <div style="max-height: 90vh; height: 90vh;" class="flex justify-center">
      <media-theme-yt>
        <video
            slot="media"
            :src="src"
            playsinline
            crossorigin
            height="100"
            class="!h-full"
            autoplay
        ></video>
      </media-theme-yt>
    </div>
  </UIModal>

</template>