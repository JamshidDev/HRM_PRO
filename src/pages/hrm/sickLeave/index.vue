<script setup>
  import { UIDConfirm, UIModal } from '@/components/index.js'
  import { useSickLeaveStore } from '@/store/modules/index.js'
  import Filter from './ui/Filter.vue'
  import Table from './ui/Table.vue'
  import CreateForm from './ui/CreateForm.vue'
  import CloseForm from './ui/CloseForm.vue'
  import ViewModal from './ui/ViewModal.vue'

  const store = useSickLeaveStore()
  const createFormRef = ref(null)
  const closeFormRef = ref(null)

  onMounted(() => {
    store._index()
  })
</script>

<template>
  <div class="flex flex-1 flex-col gap-4 min-h-0">
    <Filter />
    <Table />

    <UIModal
      v-model:visible="store.visible"
      :title="store.visibleType ? $t('sickLeave.createTitle') : $t('sickLeave.updateTitle')"
      width="min(520px, calc(100vw - 32px))"
    >
      <CreateForm ref="createFormRef" />

      <template #footer>
        <div class="flex justify-end gap-2 px-4 pb-2">
          <n-button type="error" ghost class="w-[130px]" @click="store.visible = false">
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

    <UIModal
      v-model:visible="store.closeVisible"
      :title="$t('sickLeave.close.title')"
      width="min(480px, calc(100vw - 32px))"
    >
      <CloseForm ref="closeFormRef" />

      <template #footer>
        <div class="flex justify-end gap-2 px-4 pb-2">
          <n-button type="error" ghost class="w-[130px]" @click="store.closeVisible = false">
            {{ $t('content.cancel') }}
          </n-button>
          <n-button
            type="primary"
            class="w-[130px]"
            :loading="store.saveLoading"
            @click="closeFormRef?.submit()"
          >
            {{ $t('sickLeave.actions.close') }}
          </n-button>
        </div>
      </template>
    </UIModal>

    <UIModal
      v-model:visible="store.viewVisible"
      :title="$t('sickLeave.view.title')"
      width="min(480px, calc(100vw - 32px))"
    >
      <ViewModal />
    </UIModal>

    <UIDConfirm v-model:visible="store.deleteVisible">
      <template #icon><span></span></template>
      <div class="text-center pt-4">
        <p class="text-xl text-warning">{{ $t('sickLeave.delete.title') }}</p>
        <p class="text-sm text-secondary">{{ $t('sickLeave.delete.desc') }}</p>
      </div>
      <template #action>
        <div class="grid grid-cols-2 gap-2 select-none">
          <n-button secondary type="error" @click="store.deleteVisible = false">
            {{ $t('content.cancel') }}
          </n-button>
          <n-button :loading="store.saveLoading" type="primary" @click="store._delete">
            {{ $t('content.delete') }}
          </n-button>
        </div>
      </template>
    </UIDConfirm>
  </div>
</template>

<style scoped></style>
