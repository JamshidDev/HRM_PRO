<script setup>
  import { DocumentEditor } from '@onlyoffice/document-editor-vue'
  import { useOnlyOfficeStore } from '@/store/modules/index.js'
  import { ErrorCircle20Regular } from '@vicons/fluent'
  const store = useOnlyOfficeStore()
  const officeRef = ref(null)

  // Token backend'da imzolanadi — DS siri brauzerga chiqmaydi.
  const config = ref(null)
  // Token kelmasa muharrir ochilmaydi: tokensiz config'ni OnlyOffice «Токен безопасности документа
  // имеет неправильный формат» deb rad etadi (DAS-14198) — o'rniga tushunarli xabar chiqadi.
  const tokenError = ref(false)
  onMounted(async () => {
    const baseConfig = JSON.parse(JSON.stringify(store.config))
    baseConfig.editorConfig.callbackUrl = store.callBackUrl
    // BACKEND: POST /v1/document/office-config-token dev'da 200 + `data.token: null` qaytaryapti
    // (2026-11-04, DAS-14198) — config imzolanmayapti, ehtimol OnlyOffice JWT siri sozlanmagan.
    // Token har doim qaytishi kerak; imzolab bo'lmasa 200 emas, xato qaytsin.
    const token = await $ApiService.documentService
      ._officeConfigToken({ data: { config: baseConfig } })
      .then((res) => res.data.data?.token)
      .catch(() => null)
    if (!token) {
      tokenError.value = true
      return
    }
    config.value = { ...baseConfig, token }
  })
</script>

<template>
  <div class="w-full h-full">
    <div
      v-if="tokenError"
      class="w-full h-full flex flex-col items-center justify-center gap-2 px-4 text-center"
    >
      <n-icon size="40" class="text-fig-text-red">
        <ErrorCircle20Regular />
      </n-icon>
      <div class="text-base font-semibold text-textColor1">
        {{ $t('onlyOfficeEditor.tokenError') }}
      </div>
      <div class="max-w-[420px] text-sm text-textColor3">
        {{ $t('onlyOfficeEditor.tokenErrorHint') }}
      </div>
    </div>
    <DocumentEditor
      v-else-if="config"
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
