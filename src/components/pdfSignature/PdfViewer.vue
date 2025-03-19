<script setup>
import PdfSignature from "@/components/pdfSignature/PdfSignature.vue"
import { useDraggable, useScroll } from '@vueuse/core'
import {usePdfViewerStore} from "@/store/modules/index.js"
import * as pdfjsLib from 'pdfjs-dist';
pdfjsLib.GlobalWorkerOptions.workerSrc = "pdfjs-dist/build/pdf.worker.min.js"
const store = usePdfViewerStore()

const dragElementRef = ref(null)
const scrollElementRef = ref(null)
const pdfSignatureRef = ref(null)




watch(()=>store.scale, async (v)=>{
  for (let pageNumber = 1; pageNumber <= store.totalPdfPage; pageNumber++) {
    await store.renderPdf(pageNumber)
  }
})


const loadPdf = async(url)=>{
  await store.loadPdf()
  // store.pdfUrl = url
  // const pdfUrl = url+`?_=${new Date().getTime()}`
  // try{
  //   const pdf = await pdfjsLib.getDocument(pdfUrl).promise
  //   totalPages.value = pdf.numPages
  //   for (let pageNumber = 1; pageNumber <= totalPages.value; pageNumber++) {
  //     const page = await pdf.getPage(pageNumber);
  //     const scale = 1.2;
  //     const viewport = page.getViewport({ scale });
  //
  //     const canvas = document.querySelector(`#pdfCanvas${pageNumber}`);
  //     const context = canvas.getContext('2d');
  //     canvas.height = viewport.height;
  //     canvas.width = viewport.width;
  //
  //     const renderContext = {
  //       canvasContext: context,
  //       viewport: viewport,
  //     };
  //     await page.render(renderContext).promise
  //   }
  //
  // }catch (err){
  //   console.error('Error loading PDF:', err);
  // }
}




defineExpose({
  loadPdf
})


</script>

<template>
  <div class="w-full flex">
    <div ref="scrollElementRef" class="flex flex-col mx-auto overflow-y-auto relative pb-8" style="height: calc(100vh - 200px)">
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
    <PdfSignature ref="pdfSignatureRef" />
  </div>
</template>
