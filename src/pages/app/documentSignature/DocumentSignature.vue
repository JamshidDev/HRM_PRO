<script setup>
import ToolBar from "./ui/ToolBar.vue"
import Document from "./ui/Document.vue"
import PersonalForm from "./application/PersonalForm.vue"
import {usePdfViewerStore} from "@/store/modules/index.js"
import {useRoute} from "vue-router"
import Utils from "@/utils/Utils.js"
import ErrorMessage from "@/pages/app/documentSignature/ui/ErrorMessage.vue"

const store = usePdfViewerStore()
const route = useRoute()

onMounted(()=>{
  store.viewerStatus = route?.params?.status
  if(store.viewerStatus === Utils.viewerStatus.signatureDocument){
    store._checkSignature(route.query)
  }

})

</script>




<template>
<div class="w-full flex-col bg-blue-50 pt-[64px] min-h-screen">
  <n-spin class="w-full" :show="store.checkLoading">
    <ToolBar/>

    <template v-if="store.viewerStatus === Utils.viewerStatus.signatureDocument">
      <Document/>
    </template>
    <template v-if="store.viewerStatus === Utils.viewerStatus.applicationDocument">
      <PersonalForm/>
    </template>

    <template v-if="!store.checkLoading && store.errorMessage">
      <ErrorMessage/>
    </template>
    <template #description>
      {{$t('content.checking')}}
    </template>
  </n-spin>


</div>
</template>
