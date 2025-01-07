<script setup>
import { DocumentEditor } from '@onlyoffice/document-editor-vue'
import { v4 as uuidv4 } from 'uuid'
import {useOnlyOfficeStore} from "@/store/modules/index.js"
import Utils from "@/utils/Utils.js"
const store = useOnlyOfficeStore()
const officeRef = ref(null)




// const config = computed(()=>{
//   const token = Utils.generateJwtToken(store.config, store.secret)
//   const baseConfig = store.config
//   return { ...baseConfig, token }
// })
const token = Utils.generateJwtToken(store.config, store.secret)
const baseConfig = store.config
const config = { ...baseConfig, token}

onMounted(()=>{
  const docEditor = new DocsAPI.DocEditor("placeholder", config)
  console.log(token)
})

</script>

<template>
<div class="w-full h-screen border border-red-600">
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
