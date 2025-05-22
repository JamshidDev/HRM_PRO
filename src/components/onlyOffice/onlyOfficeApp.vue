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
const saveDocument = () => {
  console.log(officeRef.value)
  if (officeRef.value && officeRef.value.docEditor) {
    console.log(officeRef.value.docEditor)
    // officeRef.value.docEditor.forceSave()
    alert("Hujjat saqlashga yuborildi!")
  } else {
    alert("Hujjat muharriri hali yuklanmagan!")
  }
}

const onDocumentReady = () => {
  console.log('loaded...')
  console.log(officeRef.value.docEditor)
}

watch(
    () => officeRef.value,
    (newVal) => {
      console.log(newVal)
      if (newVal && newVal.docEditor) {
        docEditorInstance.value = newVal.docEditor
        console.log('docEditor tayyor:', docEditorInstance.value)
      }
    }
)


</script>

<template>
<div class="w-full h-full">
  <DocumentEditor
      ref="officeRef"
      width="100%"
      id="docEditor"
      :documentServerUrl="store.serverUrl"
      :config="config"
      :events_onDocumentReady="onDocumentReady"
      :onLoadComponentError="store._onLoadComponentError"

  />
</div>
</template>
