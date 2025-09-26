<script setup>
import {useExamVideoStore} from "@/store/modules/index.js"
import { useDraggable } from '@vueuse/core'
import { useTemplateRef } from 'vue'

const el = useTemplateRef('el')

const videoRef = ref(null)
const canvasRef = ref(null)




const { x, y, style } = useDraggable(el, {
  initialValue: { x:120, y:80},
})

const store = useExamVideoStore()

onMounted(()=>{
  store.videoRef = videoRef.value
  store.canvasRef = canvasRef.value
})


</script>

<template>
  <div class="grid grid-cols-12">
    <div v-show="store.showCanvas" class="overflow-hidden fixed border border-success w-[220px] cursor-move z-[9999] shadow-sm rounded-lg" ref="el" :style="style">
      <canvas  ref="canvasRef" width="220" height="200"></canvas>
    </div>
    <div class="col-span-12 flex justify-center">
      <video
          v-show="false"
          ref="videoRef"
          autoplay
          playsinline
          width="400" height="300" style="border:1px solid #ccc; border-radius:8px;"
      />
    </div>
  </div>

</template>