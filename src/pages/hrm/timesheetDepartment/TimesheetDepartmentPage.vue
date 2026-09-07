<script setup>
  import { useTimesheetDepartmentStore, useAccountStore } from '@/store/modules'
  import Table from './ui/Table.vue'
  import Filter from './ui/Filter.vue'
  import ListModal from './ui/ListModal.vue'
  import TimesheetAssignForm from './ui/timesheetDepartmentForm.vue'
  import { UIDrawer, UIPageContent } from '@/components/index.js'

  const store = useTimesheetDepartmentStore()
  const formRef = ref(null)
  const accStore = useAccountStore()

  onMounted(() => {
    if (!accStore.checkAction(accStore.pn.hrTableRead)) return
    store.params.page = 1
    store.params.search = undefined
    store._index()
  })
</script>
<template>
  <UIPageContent>
    <Filter />
    <Table />
    <ListModal />
    <!-- «Qo'shish»: tabelchi + korxona + bo'limlar (bo'sh bo'limlar ro'yxati). -->
    <UIDrawer
      :title="
        store.formMode === 'attach'
          ? $t('timesheetWorkerPage.attach_department')
          : $t('timesheetWorkerPage.name')
      "
      v-model:visible="store.visible"
    >
      <template #content>
        <TimesheetAssignForm ref="formRef" with-worker />
      </template>
      <template #footer>
        <div class="grid w-full grid-cols-2 gap-2">
          <n-button type="error" ghost @click="formRef?.onCancel()">
            {{ $t('content.cancel') }}
          </n-button>
          <n-button type="primary" :loading="store.saveLoading" @click="formRef?.onSubmit()">
            {{ $t('content.save') }}
          </n-button>
        </div>
      </template>
    </UIDrawer>
  </UIPageContent>
</template>
