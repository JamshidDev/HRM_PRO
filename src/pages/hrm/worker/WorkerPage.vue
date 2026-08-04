<script setup>
  import { UIModal, UIPageContent, UIDrawer } from '@/components/index.js'
  import { Dismiss24Regular } from '@vicons/fluent'
  import contractForm from '@/pages/docFlow/document/contract/contractForm.vue'
  import Table from './ui/Table.vue'
  import ExportForm from './ui/ExportForm.vue'
  import Filter from './ui/Filter.vue'
  import CheckWorker from './ui/CheckWorker.vue'
  import UserRolePage from './ui/UserRolePage.vue'
  import {
    useTimesheetDepartmentStore,
    useWorkerStore,
    useExportStore,
    useAccountStore
  } from '@/store/modules/index.js'
  import TimesheetAssignForm from '../timesheetDepartment/ui/timesheetDepartmentForm.vue'
  import router from '@/router/index.js'
  import { AppPaths } from '@/utils/index.js'

  const store = useWorkerStore()
  const accStore = useAccountStore()
  const exportStore = useExportStore()
  const timesheetDepartmentStore = useTimesheetDepartmentStore()

  const onSuccessEv = (id) => {
    store.visible = false
    router.push({ name: `${AppPaths.Contract.substring(1)}` })
  }

  const submitExportResume = (v) => {
    exportStore.resumePayload.passport = v
    exportStore._export_resume(store._params())
  }

  const onExportSubmit = () => {
    exportStore._export_workers(store._params())
  }

  onMounted(() => {
    if (!accStore.checkAction(accStore.pn.hrWorkersRead)) return
    store._index()
  })
</script>

<template>
  <UIPageContent>
    <Filter />
    <Table />
    <CheckWorker />
    <UIDrawer
      :title="$t('timesheet.assignUser')"
      :width="450"
      v-model:visible="timesheetDepartmentStore.visible"
    >
      <template #content>
        <TimesheetAssignForm />
      </template>
    </UIDrawer>
    <UIModal
      :title="store.visibleType ? $t('documentPage.createTitle') : $t('documentPage.updateTitle')"
      :width="1200"
      v-model:visible="store.visible"
    >
      <template #default>
        <contractForm :call-back="onSuccessEv" />
      </template>
    </UIModal>
    <UIModal
      :width="500"
      card-class="passport-modal-card"
      v-model:visible="exportStore.resumeModalVisible"
    >
      <template #header>
        <div class="passport-modal-header">
          <h3 class="passport-modal-title">{{ $t('exportPage.addPassport') }}</h3>
          <div class="passport-modal-close" @click="exportStore.resumeModalVisible = false">
            <n-icon size="16"><Dismiss24Regular /></n-icon>
          </div>
        </div>
      </template>
      <template #default>
        <n-spin :show="exportStore.exportResumeLoading">
          <div class="passport-modal-actions">
            <n-button
              v-fly-upload
              size="large"
              type="primary"
              @click="submitExportResume(true)"
            >
              {{ $t('exportPage.passportYes') }}
            </n-button>
            <n-button size="large" secondary @click="submitExportResume(false)">
              {{ $t('exportPage.passportNo') }}
            </n-button>
          </div>
        </n-spin>
      </template>
    </UIModal>
    <UIModal :width="1040" card-class="export-modal-card" v-model:visible="exportStore.visible">
      <template #header>
        <div class="export-modal-header">
          <h3 class="export-modal-title">{{ $t('exportPage.excelSettings') }}</h3>
          <div class="export-modal-header-actions">
            <n-button
              v-fly-upload
              type="success"
              :loading="exportStore.saveLoading"
              @click="onExportSubmit"
            >
              {{ $t('exportPage.exportAction') }}
            </n-button>
            <div class="export-modal-close" @click="exportStore.visible = false">
              <n-icon size="16"><Dismiss24Regular /></n-icon>
            </div>
          </div>
        </div>
      </template>
      <template #default>
        <ExportForm />
      </template>
    </UIModal>
    <!--    <UIModal :title="$t('workerRole.name')" :width="1200" v-model:visible="store.userRoleVisible">-->
    <!--      <template #default>-->
    <!--        <UserRolePage />-->
    <!--      </template>-->
    <!--    </UIModal>-->
  </UIPageContent>
</template>

<style scoped>
  :global(.passport-modal-card) {
    overflow: hidden;
    border-radius: 20px !important;
  }

  .passport-modal-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    padding: 20px;
    margin: -8px -8px 0;
    background: var(--surface-ground);
  }

  .passport-modal-title {
    margin: 0;
    color: var(--textColor0);
    font-size: 20px;
    font-weight: 700;
    line-height: 1.35;
  }

  .passport-modal-close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 999px;
    background: var(--surface-section);
    cursor: pointer;
    flex-shrink: 0;
    transition: background-color 0.2s ease;
  }

  .passport-modal-close:hover {
    background: var(--surface-line);
  }

  .passport-modal-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    padding-top: 20px;
  }

  .passport-modal-actions :deep(.n-button) {
    --n-height: 48px !important;
    --n-border-radius: 24px !important;
    font-weight: 600;
  }

  :global(.export-modal-card) {
    overflow: hidden;
    max-width: calc(100vw - 32px);
    border-radius: 20px !important;
  }

  .export-modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 20px 24px;
    margin: -8px -8px 0;
    background: var(--surface-ground);
  }

  .export-modal-title {
    margin: 0;
    color: var(--textColor0);
    font-size: 20px;
    font-weight: 700;
  }

  .export-modal-header-actions {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
  }

  .export-modal-close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 999px;
    background: var(--surface-section);
    cursor: pointer;
    flex-shrink: 0;
    transition: background-color 0.2s ease;
  }

  .export-modal-close:hover {
    background: var(--surface-line);
  }
</style>
