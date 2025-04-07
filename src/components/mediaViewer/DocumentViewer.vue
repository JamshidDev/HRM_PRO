<script setup>
import {usePdfViewerStore} from "@/store/modules/index.js"
import PdfViewer from "@/components/pdfSignature/PdfViewer.vue"
import {UIModal} from "@/components/index.js";

const store = usePdfViewerStore()

defineEmits(['close'])

const props = defineProps({
  src: {
    type: String,
    required: true
  }
})


const visible = ref(true);

onMounted(()=>{
  console.log("render pdf")
  store.pdfUrl = props.src
  store.loadPdf()
})

</script>

<template>
    <UIModal :width="1000" title="" @update:visible="$emit('close')" v-model:visible="visible">
        <div class="w-full max-w-[1200px] mx-auto overflow-auto h-[90vh]">
          <PdfViewer :container="false"/>
        </div>
    </UIModal>
</template>
