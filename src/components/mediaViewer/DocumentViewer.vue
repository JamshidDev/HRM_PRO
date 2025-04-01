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
<!--      <PDF :src="src" style="height: 90vh; max-height: 90vh" />-->
        <div class="w-full max-w-[1200px] mx-auto overflow-auto h-[90vh]">
          <PdfViewer :container="false"/>
        </div>
    </UIModal>
<!--  <div class="w-full max-w-[1440px] mx-auto overflow-auto">-->
<!--  </div>-->

</template>
<!--<script setup lang="ts">-->
<!--import PDF from "pdf-vue3";-->
<!--import {UIModal} from "@/components";-->

<!--defineEmits(['close'])-->

<!--defineProps({-->
<!--  src: {-->
<!--    type: String,-->
<!--    required: true-->
<!--  }-->
<!--})-->


<!--const visible = ref(true);-->

<!--</script>-->

<!--<template>-->
<!--  <UIModal :width="1000" title="" @update:visible="$emit('close')" v-model:visible="visible">-->
<!--    <PDF :src="src" style="height: 90vh; max-height: 90vh" />-->
<!--  </UIModal>-->
<!--</template>-->
