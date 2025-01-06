<script setup>
import { DocumentEditor } from '@onlyoffice/document-editor-vue'
import { v4 as uuidv4 } from 'uuid'
import {useOnlyOfficeStore} from "@/store/modules/index.js"
import Utils from "@/utils/Utils.js"
const store = useOnlyOfficeStore()




// const config = computed(()=>{
//   const token = Utils.generateJwtToken(store.config, store.secret)
//   const baseConfig = store.config
//   return { ...baseConfig, token }
// })
const token = Utils.generateJwtToken(store.config, store.secret)
const baseConfig = store.config
const config = { ...baseConfig, token}

</script>

<template>
<div class="w-full h-screen">
  <DocumentEditor
      width="100%"
      id="docEditor"
      :documentServerUrl="store.serverUrl"
      :config="config"
      :events_onDocumentReady="store._onDocumentReady"
      :onLoadComponentError="store._onLoadComponentError"
  />
</div>
</template>
