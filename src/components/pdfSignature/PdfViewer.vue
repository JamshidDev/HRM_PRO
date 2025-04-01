<script setup>
import {usePdfViewerStore} from "@/store/modules/index.js"
import * as pdfjsLib from 'pdfjs-dist';
pdfjsLib.GlobalWorkerOptions.workerSrc = "pdfjs-dist/build/pdf.worker.min.js"
const store = usePdfViewerStore()


defineProps({
  container:{
    type:Boolean,
    default:true,
  }
})
watch(()=>store.scale, async (v)=>{
  for (let pageNumber = 1; pageNumber <= store.totalPdfPage; pageNumber++) {
    await store.renderPdf(pageNumber)
  }
})


const loadPdf = async()=>{
  await store.loadPdf()
}




defineExpose({
  loadPdf
})


</script>

<template>
  <div class="w-full flex">
    <div
        ref="scrollElementRef"
        class="flex flex-col mx-auto overflow-y-auto relative pb-8"
        :style="{height:container?`calc(100vh - 50px)` : '100%' }">
      <div
          v-if="store.permissions?.qrcode"
          ref="dragElementRef"
          style="position: fixed"
          class="overflow-hidden w-[80px] h-[80px] border z-10 top-[100px] left-0 bg-white shadow cursor-pointer border-primary">
        <template v-if="store.qrCodeUrl">
          <img class="w-full h-full object-cover object-center pointer-events-none" :src="store.qrCodeUrl" alt="Not fount QRCode image">
        </template>
      </div>
      <div v-for="idx in store.totalPdfPage" :key="idx">
        <canvas class="border border-surface-line " :id="`pdfCanvas${idx}`"></canvas>
      </div>
    </div>
  </div>
</template>
