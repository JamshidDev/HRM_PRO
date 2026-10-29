<script setup>
  import { ArrowUndo20Filled, TextClearFormatting24Regular, Save24Regular } from '@vicons/fluent'
  import { UIDrawSignature } from '@/components/index.js'
  import { usePdfViewerStore } from '@/store/modules/index.js'
  import { useRoute } from 'vue-router'
  import i18n from '@/i18n/index.js'

  const store = usePdfViewerStore()
  const signatureRef = ref(null)
  const route = useRoute()
  const { t } = i18n.global

  const clearSignature = () => {
    signatureRef.value.clearSignature()
  }

  const unDoSignature = () => {
    signatureRef.value.unDoSignature()
  }

  const confirmSignature = () => {
    const { isEmpty, data } = signatureRef.value.saveSignature()
    if (!isEmpty) {
      const payload = {
        key: data
      }
      store._confirmSignature(route.query, payload)
    } else {
      $Alert.validation(t('message.requiredSignature'))
    }
  }
</script>

<template>
  <div class="flex flex-col w-full relative pt-2">
    <UIDrawSignature class="mt-4" ref="signatureRef" />
    <div class="grid grid-cols-12 gap-2 sm:gap-4 mt-6">
      <div class="col-span-4">
        <n-button secondary @click="clearSignature" style="width: 100%" type="error">
          <template #icon>
            <TextClearFormatting24Regular />
          </template>
          {{ $t('content.clear') }}</n-button
        >
      </div>
      <div class="col-span-4">
        <n-button secondary @click="unDoSignature" style="width: 100%" type="warning">
          <template #icon>
            <ArrowUndo20Filled />
          </template>
          {{ $t('signature.undo') }}</n-button
        >
      </div>
      <div class="col-span-4">
        <n-button
          :loading="store.saveLoading"
          @click="confirmSignature"
          style="width: 100%"
          type="primary"
        >
          <template #icon>
            <Save24Regular />
          </template>
          {{ $t('content.confirm') }}</n-button
        >
      </div>
    </div>
  </div>
</template>
