<script setup>
  // Korxonani yopish / qayta ochish — asos (izoh yoki fayl) bilan.
  import { UIModal } from '@/components/index.js'
  import { useOrganizationStore } from '@/store/modules/index.js'
  import BasisFields from './BasisFields.vue'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const store = useOrganizationStore()

  const isClose = computed(() => store.basis.mode === 'close')
  const canSubmit = computed(() => !!(store.basis.comment?.trim() || store.basis.file))
</script>

<template>
  <UIModal
    v-model:visible="store.basis.visible"
    :width="520"
    :title="t(isClose ? 'organizationPage.closeTitle' : 'organizationPage.reopenTitle')"
  >
    <div class="flex flex-col gap-3">
      <div class="rounded-xl bg-surface-ground px-3 py-2">
        <div class="text-xs text-textColor3">{{ t('organizationPage.selectedOrg') }}</div>
        <div class="text-sm font-semibold text-textColor0">{{ store.basis.name }}</div>
      </div>
      <div v-if="isClose" class="text-xs leading-5 text-textColor2">
        {{ t('organizationPage.closeHint') }}
      </div>
      <BasisFields
        v-model:comment="store.basis.comment"
        v-model:file="store.basis.file"
        v-model:file-name="store.basis.fileName"
      />
      <div class="grid grid-cols-2 gap-2 pt-1">
        <n-button @click="store.basis.visible = false">{{ t('content.cancel') }}</n-button>
        <n-button
          :type="isClose ? 'error' : 'primary'"
          :disabled="!canSubmit"
          :loading="store.basis.loading"
          @click="store._basisSubmit()"
        >
          {{ t(isClose ? 'organizationPage.close' : 'organizationPage.reopen') }}
        </n-button>
      </div>
    </div>
  </UIModal>
</template>
