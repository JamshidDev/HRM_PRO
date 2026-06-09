<script setup>
  import { UIModal, UIUpload } from '@/components/index.js'
  import { useComponentStore } from '@/store/modules/index.js'
  import validationRules from '@/utils/validationRules.js'
  import i18n from '@/i18n/index.js'
  import { Warning24Filled, DocumentCheckmark24Regular } from '@vicons/fluent'

  const { t } = i18n.global
  const componentStore = useComponentStore()
  const payload = ref({
    files: []
  })
  const formRef = ref(null)

  const onSubmit = () => {
    if (payload.value.files.length > 0) {
    } else {
      $Toast.warning(t('message.warning-data'))
    }
  }
</script>

<template>
  <UIModal :title="$t('content.confirmDocument')" v-model:visible="componentStore.fileVisible">
    <n-form
      ref="formRef"
      :model="payload"
      :rules="validationRules.commandFrom"
      class="flex flex-col gap-4"
    >
      <!-- Warning info block -->
      <div class="flex items-start gap-3 p-3 rounded-xl border border-danger/40 bg-danger/5">
        <n-icon size="20" class="text-danger mt-[1px] shrink-0">
          <Warning24Filled />
        </n-icon>
        <span class="text-sm text-danger leading-[1.5]">
          {{ $t('content.confirmDocumentWarning') }}
        </span>
      </div>

      <!-- File upload block -->
      <div class="flex flex-col gap-2 p-4 rounded-xl border border-surface-line bg-surface-ground/20">
        <div class="flex items-center gap-2 mb-1">
          <n-icon size="18" class="text-secondary">
            <DocumentCheckmark24Regular />
          </n-icon>
          <span class="text-sm font-medium text-secondary">{{ $t('content.attachFile') }}</span>
        </div>
        <UIUpload :multiple="false" v-model:files="payload.files" />
      </div>
    </n-form>

    <template #footer>
      <div class="grid grid-cols-2 gap-3 pt-2">
        <n-button @click="componentStore.fileVisible = false" type="error" ghost>
          {{ $t('content.close') }}
        </n-button>
        <n-button @click="onSubmit" :loading="componentStore.fileLoading" type="primary">
          {{ $t('content.confirm') }}
        </n-button>
      </div>
    </template>
  </UIModal>
</template>
