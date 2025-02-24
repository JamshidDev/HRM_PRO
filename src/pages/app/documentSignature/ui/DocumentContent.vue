<script setup>
import DocxViewer from "@/components/pdfSignature/ui/DocxViewer.vue"
import {usePdfViewerStore} from "@/store/modules/index.js"

const store = usePdfViewerStore()
const docxViewerRef = ref(null)

const openFile = (url)=>{
  docxViewerRef.value.openWord(url)
}

onMounted(()=>{
  openFile(store.documentUrl)
})

</script>

<template>
  <div class="w-full max-w-[1440px] mx-auto overflow-auto">
    <DocxViewer ref="docxViewerRef" :watermark="store.isSigned" />
  </div>

</template>