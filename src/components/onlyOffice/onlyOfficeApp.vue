<script setup>
import { DocumentEditor } from '@onlyoffice/document-editor-vue'
import {useOnlyOfficeStore} from "@/store/modules/index.js"
import Utils from "@/utils/Utils.js"
const store = useOnlyOfficeStore()
const officeRef = ref(null)


const baseConfig = store.config
baseConfig.editorConfig.callbackUrl = store.callBackUrl
const token = Utils.generateJwtToken(store.config, store.secret)
const config = { ...baseConfig, token}

watchEffect(()=>{
  console.log(store.config)
})

onMounted(()=>{
  const docEditor = new DocsAPI.DocEditor("docEditor", config)
  console.log(officeRef.value)
})

</script>

<template>
<div class="w-full h-full">
  <DocumentEditor
      ref="officeRef"
      width="100%"
      id="docEditor"
      :documentServerUrl="store.serverUrl"
      :config="config"
      :events_onDocumentReady="store._onDocumentReady"
      :onLoadComponentError="store._onLoadComponentError"

  />
</div>
</template>
