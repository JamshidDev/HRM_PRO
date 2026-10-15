<script setup>
  import { DocumentEditor } from '@onlyoffice/document-editor-vue'
  import { useOnlyOfficeStore } from '@/store/modules/index.js'
  const store = useOnlyOfficeStore()
  const officeRef = ref(null)

  // Token backend'da imzolanadi — DS siri brauzerga chiqmaydi.
  const config = ref(null)
  onMounted(async () => {
    const baseConfig = JSON.parse(JSON.stringify(store.config))
    baseConfig.editorConfig.callbackUrl = store.callBackUrl
    const res = await $ApiService.documentService._officeConfigToken({
      data: { config: baseConfig }
    })
    const token = res.data.data?.token
    config.value = token ? { ...baseConfig, token } : baseConfig
  })
</script>

<template>
  <div class="w-full h-full">
    <DocumentEditor
      v-if="config"
      ref="officeRef"
      width="100%"
      id="docEditor"
      :document-server-url="store.serverUrl"
      :config="config"
      :events_onDocumentReady="store._onDocumentReady"
      :on-load-component-error="store._onLoadComponentError"
    />
  </div>
</template>
