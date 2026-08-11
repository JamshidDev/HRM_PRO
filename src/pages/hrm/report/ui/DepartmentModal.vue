<script setup>
  import DepartmentFrom from '@/pages/hrm/department/ui/createForm.vue'
  import { UIModal } from '@components'
  import { useDepartmentStore, useReport2Store } from '@stores'

  const store = useReport2Store()
  const dpStore = useDepartmentStore()
  const formRef = ref(null)

  const onSuccessEv = () => {
    store.department.visible = false
    store._getDepartment()
  }
</script>

<template>
  <UIModal
    :width="600"
    v-model:visible="store.department.visible"
    :title="$t(dpStore.visibleType ? 'departmentPage.createTitle' : 'departmentPage.updateTitle')"
  >
    <DepartmentFrom ref="formRef" :callback="onSuccessEv" />

    <template #footer>
      <div class="flex justify-end gap-2 px-4 pb-2">
        <n-button
          type="error"
          ghost
          class="w-[130px]"
          @click="store.department.visible = false"
        >
          {{ $t('content.cancel') }}
        </n-button>
        <n-button
          type="primary"
          class="w-[130px]"
          :loading="dpStore.saveLoading"
          @click="formRef?.submit()"
        >
          {{ $t('content.save') }}
        </n-button>
      </div>
    </template>
  </UIModal>
</template>
