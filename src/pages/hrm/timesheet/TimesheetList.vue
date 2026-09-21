<script setup>
  import { UIPageContent, UIPageFilter, UIModal, UIDrawer, UIDConfirm } from '@/components/index.js'
  import Table from './ui/Table.vue'
  import Form from './ui/Form.vue'
  import Timesheet from './ui/Timesheet.vue'
  import Filter from './ui/Filter.vue'
  import ConfirmationForm from './ui/ConfirmationForm.vue'
  import {
    ArrowUndo20Filled,
    CheckmarkCircle24Filled,
    LockClosed20Filled,
    PeopleTeam24Filled,
    Send24Regular
  } from '@vicons/fluent'

  const confirmationFormRef = ref(null)

  import {
    useAccountStore,
    useTimesheetConfirmStore,
    useTimesheetStore,
    useTimesheetWorkerStore
  } from '@/store/modules'

  const store = useTimesheetStore()
  const timesheetDepartmentStore = useTimesheetWorkerStore()
  const confirmationStore = useTimesheetConfirmStore()
  const accStore = useAccountStore()

  onMounted(() => {
    if (!accStore.checkAction(accStore.pn.hrTableRead)) return
    store.params.page = 1
    store.params.search = null
    store._index()
  })
</script>

<template>
  <UIPageContent>
    <Filter />
    <Table />
    <UIModal
      :width="420"
      v-model:visible="store.visible"
      :title="store.visibleType ? $t('timesheetPage.create') : $t('timesheetPage.update')"
    >
      <Form />
    </UIModal>
    <UIDrawer
      :width="400"
      v-model:visible="confirmationStore.visible"
      :title="$t('timesheetPage.verifiers')"
    >
      <template #content>
        <ConfirmationForm ref="confirmationFormRef" />
      </template>
      <template #footer>
        <div class="grid grid-cols-2 gap-2">
          <n-button ghost type="error" @click="confirmationStore.visible = false">
            {{ $t('content.cancel') }}
          </n-button>
          <n-button
            :loading="confirmationStore.saveLoading"
            type="primary"
            @click="confirmationFormRef?.submit()"
          >
            {{ $t('content.save') }}
          </n-button>
        </div>
      </template>
    </UIDrawer>
    <!-- HR tasdig'i — oqibatlari ochiq yozilgan, chunki bu amal tabelni
         to'ldirish uchun yopadi va faqat rad etish orqali qaytariladi. -->
    <UIDConfirm v-model:visible="store.sendVisible">
      <template #icon>
        <div class="ts-send-head">
          <div class="ts-send-badge">
            <n-icon :component="Send24Regular" size="30" />
          </div>
          <p class="ts-send-title">{{ $t('timesheetPage.sendWarning.title') }}</p>
          <p class="ts-send-sub">{{ $t('timesheetPage.sendWarning.desc') }}</p>
        </div>
      </template>

      <ul class="ts-send-list">
        <li class="ts-send-item is-brand">
          <n-icon :component="PeopleTeam24Filled" size="18" />
          <span>{{ $t('timesheetPage.sendWarning.p1') }}</span>
        </li>
        <li class="ts-send-item is-red">
          <n-icon :component="LockClosed20Filled" size="18" />
          <span>{{ $t('timesheetPage.sendWarning.p2') }}</span>
        </li>
        <li class="ts-send-item is-amber">
          <n-icon :component="ArrowUndo20Filled" size="18" />
          <span>{{ $t('timesheetPage.sendWarning.p3') }}</span>
        </li>
        <li class="ts-send-item is-green">
          <n-icon :component="CheckmarkCircle24Filled" size="18" />
          <span>{{ $t('timesheetPage.sendWarning.p4') }}</span>
        </li>
      </ul>
      <p class="ts-send-req">{{ $t('timesheetPage.sendWarning.req') }}</p>

      <template #action>
        <div class="grid grid-cols-2 gap-2 select-none">
          <n-button secondary type="error" @click="store.sendVisible = false">
            {{ $t('content.cancel') }}
          </n-button>
          <n-button :loading="store.saveLoading" type="primary" @click="store._send">
            <template #icon>
              <n-icon :component="Send24Regular" />
            </template>
            {{ $t('content.confirm') }}
          </n-button>
        </div>
      </template>
    </UIDConfirm>
    <n-drawer height="100vh" v-model:show="timesheetDepartmentStore.visible" placement="bottom">
      <Timesheet />
    </n-drawer>
  </UIPageContent>
</template>

<style lang="scss" scoped>
  .ts-send-head {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 24px 24px 4px;
    text-align: center;
  }

  .ts-send-badge {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    color: var(--fig-icon-brand);
    background: color-mix(in srgb, var(--fig-icon-brand) 14%, transparent);
  }

  .ts-send-title {
    font-size: 17px;
    font-weight: 600;
    color: var(--fig-text-primary);
  }

  .ts-send-sub {
    font-size: 13px;
    color: var(--fig-text-muted);
  }

  .ts-send-req {
    margin-top: 10px;
    font-size: 12px;
    text-align: center;
    color: var(--fig-text-muted);
  }

  .ts-send-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 8px;
  }

  .ts-send-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 10px 12px;
    font-size: 13px;
    line-height: 1.45;
    color: var(--fig-text-secondary);
    border-radius: 10px;
    border: 1px solid transparent;

    .n-icon {
      flex-shrink: 0;
      margin-top: 1px;
    }
  }

  .ts-send-item.is-brand {
    color: var(--fig-text-brand);
    border-color: color-mix(in srgb, var(--fig-icon-brand) 28%, transparent);
    background: color-mix(in srgb, var(--fig-icon-brand) 8%, transparent);
  }

  .ts-send-item.is-red {
    color: var(--fig-text-red);
    border-color: color-mix(in srgb, var(--fig-icon-red) 28%, transparent);
    background: color-mix(in srgb, var(--fig-icon-red) 8%, transparent);
  }

  .ts-send-item.is-amber {
    color: var(--fig-icon-amber);
    border-color: color-mix(in srgb, var(--fig-icon-amber) 30%, transparent);
    background: color-mix(in srgb, var(--fig-icon-amber) 10%, transparent);
  }

  .ts-send-item.is-green {
    color: var(--fig-text-green);
    border-color: color-mix(in srgb, var(--fig-icon-green) 28%, transparent);
    background: color-mix(in srgb, var(--fig-icon-green) 8%, transparent);
  }
</style>
