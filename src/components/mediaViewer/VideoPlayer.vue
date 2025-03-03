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
    <media-theme-yt class="w-full">
      <video
          slot="media"
          :src="src"
          playsinline
          crossorigin
      ></video>
    </media-theme-yt>
  </UIModal>

</template>