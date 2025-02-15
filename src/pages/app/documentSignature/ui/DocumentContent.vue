<script setup>
import DocxViewer from "@/components/pdfSignature/ui/DocxViewer.vue"
import {usePdfViewerStore} from "@/store/modules/index.js"

const store = usePdfViewerStore()
const docxViewerRef = ref(null)

const openFile = (url)=>{
  docxViewerRef.value.openWord(url)
}

onMounted(()=>{
  const url = "http://192.168.82.90:9000/docflow/contracts/ec433403ab843de34c4e8839632c10ff.docx"
  openFile(store.documentUrl)
})

</script>

<template>
  <div class="w-full max-w-[1440px] mx-auto overflow-auto">
    <DocxViewer ref="docxViewerRef" :watermark="store.isSigned" />
  </div>

</template>