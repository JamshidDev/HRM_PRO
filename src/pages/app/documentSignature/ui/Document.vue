<script setup>
import {usePdfViewerStore} from "@/store/modules/index.js"
import DocumentContent from "@/pages/app/documentSignature/ui/DocumentContent.vue"
import SignatureBox from "@/pages/app/documentSignature/ui/SignatureBox.vue"
import ErrorMessage from "@/pages/app/documentSignature/ui/ErrorMessage.vue"

const store = usePdfViewerStore()
</script>

<template>
<div>
  <template v-if="store.documentUrl && !store.checkLoading">
    <DocumentContent/>
    <SignatureBox v-if="!store.isSigned"/>
  </template>
</div>
</template>

<style scoped>

</style>