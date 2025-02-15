<script setup>
import ToolBar from "./ui/ToolBar.vue"
import DocumentContent from "./ui/DocumentContent.vue"
import SignatureBox from "./ui/SignatureBox.vue"
import ErrorMessage from "./ui/ErrorMessage.vue"
import {usePdfViewerStore} from "@/store/modules/index.js"
import {useRoute} from "vue-router"

const store = usePdfViewerStore()
const route = useRoute()

onMounted(()=>{
  store._checkSignature(route.query)
})

</script>




<template>
<div class="w-full flex-col bg-blue-50 pt-[100px] min-h-screen">
  <n-spin class="w-full" :show="store.checkLoading">
    <ToolBar/>
    <template v-if="store.documentUrl && !store.checkLoading">
      <DocumentContent/>
      <SignatureBox v-if="!store.isSigned"/>
    </template>
    <template v-else>
      <ErrorMessage v-if="!store.checkLoading"/>
    </template>

    <template #description>
      {{$t('content.checking')}}
    </template>
  </n-spin>


</div>
</template>
