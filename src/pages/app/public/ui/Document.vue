<script setup>
import PdfViewer from "@/components/pdfSignature/PdfViewer.vue";
import {usePublicStore} from "@/store/modules/index.js"
const store = usePublicStore()
</script>

<template>
  <n-spin :show="store.loading" class="min-h-[300px]">
    <PdfViewer :container="false"/>
    <template v-if="!store.isExist && !store.loading">
      <h3 class="text-secondary text-xl text-center font-medium mt-10 opacity-60">{{$t('publicPage.invalidDocument')}}</h3>
    </template>
  </n-spin>

</template>
