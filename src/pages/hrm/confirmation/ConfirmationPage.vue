<script setup>
  import { UIModal, UIPageContent, UIPageFilter } from '@/components/index.js'
  import {
    useConfirmationStore,
    useComponentStore,
    useAccountStore
  } from '@/store/modules/index.js'
  import Table from './ui/Table.vue'
  import createFrom from './ui/createForm.vue'
  import Filter from './ui/Filter.vue'

  const store = useConfirmationStore()
  const compStore = useComponentStore()
  const accStore = useAccountStore()
  const createFormRef = ref(null)

  onMounted(() => {
    if (!accStore.checkAction(accStore.pn.hrConfirmationsRead)) return
    store._index()
  })

  onUnmounted(() => {
    compStore.clearCache()
  })
</script>

<template>
  <UIPageContent>
    <Filter />
    <!-- Majburiy kelishuvchilar yetishmasa yangi hujjatlar yaratilmaydi -->
    <n-alert
      v-if="store.missing.length"
      type="warning"
      class="mb-3 approvers-alert"
      :bordered="false"
    >
      <div class="text-[13px] font-medium leading-5">{{ $t('confirmationPage.missingTitle') }}</div>
      <div v-for="m in store.missing.slice(0, 5)" :key="m.organization.id" class="text-xs leading-5">
        <span v-if="store.missing.length > 1" class="font-medium">{{ m.organization.name }}: </span>
        {{ $t('confirmationPage.missingKinds', { kinds: m.kinds.map((k) => k.name).join(', ') }) }}
      </div>
      <div v-if="store.missing.length > 5" class="text-xs leading-5">
        {{ $t('confirmationPage.missingMore', { n: store.missing.length - 5 }) }}
      </div>
    </n-alert>
    <Table />
    <UIModal
      v-model:visible="store.visible"
      :title="
        store.visibleType ? $t('confirmationPage.createTitle') : $t('confirmationPage.updateTitle')
      "
      width="min(700px, calc(100vw - 32px))"
    >
      <createFrom ref="createFormRef" />

      <template #footer>
        <div class="flex justify-end gap-2 px-4 pb-2">
          <n-button type="error" ghost class="w-[130px]" @click="store.openVisible(false)">
            {{ $t('content.cancel') }}
          </n-button>
          <n-button
            type="primary"
            class="w-[130px]"
            :loading="store.saveLoading"
            @click="createFormRef?.submit()"
          >
            {{ $t('content.save') }}
          </n-button>
        </div>
      </template>
    </UIModal>
  </UIPageContent>
</template>

<style scoped>
  .approvers-alert {
    --n-padding: 8px 12px !important;
    --n-icon-size: 18px !important;
    --n-icon-margin: 9px 8px 0 12px !important;
  }
</style>
