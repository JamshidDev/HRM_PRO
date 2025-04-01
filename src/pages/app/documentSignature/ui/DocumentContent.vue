<script setup>
import {usePdfViewerStore} from "@/store/modules/index.js"
import PdfViewer from "@/components/pdfSignature/PdfViewer.vue"

const store = usePdfViewerStore()

onMounted(()=>{
  console.log("render pdf")
  store.loadPdf()
})

</script>

<template>
  <div class="w-full max-w-[1440px] mx-auto overflow-auto">
    <PdfViewer :container="false"/>
  </div>

</template>