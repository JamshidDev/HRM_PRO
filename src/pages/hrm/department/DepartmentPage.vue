<script setup>
  import { UIModal, UIPageContent } from '@components'
  import { useDepartmentStore, useAccountStore } from '@stores'
  import { Filter, createForm, Table, Preview} from './ui'

  const accStore = useAccountStore()
  const store = useDepartmentStore()
  const createFormRef = ref(null)

  onMounted(() => {
    if (!accStore.checkAction(accStore.pn.hrDepartmentsRead)) return
    store._index()
  })

  const onSaved = () => {
    store.visible = false
    store.refreshNode(store.refreshTarget)
  }
</script>

<template>
  <UIPageContent>
    <Filter />
    <Table />
    <UIModal
      v-model:visible="store.visible"
      :title="
        store.visibleType ? $t('departmentPage.createTitle') : $t('departmentPage.updateTitle')
      "
      width="min(700px, calc(100vw - 32px))"
      height="min(85vh, 760px)"
    >
      <createForm ref="createFormRef" :callback="onSaved" />

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
    <Preview />
  </UIPageContent>
</template>
