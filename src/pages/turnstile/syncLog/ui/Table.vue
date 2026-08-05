<script setup>
  import { UIBadge, UIStatus, UITable, UIUser } from '@/components/index.js'
  import i18n from '@/i18n/index.js'
  import { useAccountStore, useSyncLogStore } from '@/store/modules/index.js'
  import UIHelper from '@/utils/UIHelper.js'
  import Utils from '@/utils/Utils.js'
  import {
    CellularWarning20Regular,
    Desktop24Filled,
    ErrorCircle24Filled,
    Eye16Regular,
    PersonAvailable20Filled
  } from '@vicons/fluent'

  const { t } = i18n.global
  const store = useSyncLogStore()
  const accStore = useAccountStore()

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  const onView = (row) => {
    if (!accStore.checkAction(accStore.pn.turnstileHikCentralSyncWrite)) return
    store.elementId = row.id
    store._show()
    store.visible = true
  }

  const onOfflineDevices = (row) => {
    if (!accStore.checkAction(accStore.pn.turnstileHikCentralSyncWrite)) return
    store.elementId = row.id
    store._offlineDeviceList()
    store.offlineDeviceVisible = true
  }

  const isActionable = (row) => row.type.name !== 'Foydalanuvchi'

  const statusObj = {
    1: {
      name: t('content.process'),
      id: 1
    },
    2: {
      name: t('content.error'),
      id: 4
    },
    3: {
      name: t('content.success'),
      id: 3
    }
  }

  const columns = computed(() => [
    {
      key: 'created_at',
      title: t('syncLog.form.startedTime'),
      minWidth: 300
    },
    {
      key: 'updated_at',
      title: t('syncLog.form.finishedTime'),
      minWidth: 300
    },
    {
      key: 'type',
      title: t('content.type'),
      minWidth: 260
    },
    {
      key: 'status',
      title: t('content.status'),
      width: 180
    },
    {
      key: 'sync_events_count',
      title: t('hcServer.form.exported_count'),
      width: 180
    },
    {
      key: 'error',
      title: t('content.error'),
      width: 180
    }
  ])

  const actions = computed(() => [
    {
      label: t('content.view'),
      key: Utils.ActionTypes.view,
      icon: UIHelper.renderIcon(Eye16Regular),
      action: onView,
      visible: isActionable
    },
    {
      label: t('syncLog.offlineDevices'),
      key: Utils.ActionTypes.confirm,
      icon: UIHelper.renderIcon(CellularWarning20Regular),
      action: onOfflineDevices,
      visible: isActionable
    }
  ])
</script>

<template>
  <UITable
    :columns="columns"
    :actions="actions"
    :data="store.list"
    :loading="store.loading"
    :page="store.params.page"
    :per-page="store.params.per_page"
    :total="store.totalItems"
    storage-key="turnstile-sync-log"
    @change-page="changePage"
  >
    <template #cell-created_at="{ row }">
      <div class="flex flex-col">
        <div class="leading-[1.2] font-medium">{{ Utils.timeWithMonth(row.created_at) }}</div>
        <div class="text-secondary">
          {{ Utils.timeOnlyDate(row.type.id === 2 ? row.day : null) }}
        </div>
      </div>
    </template>

    <template #cell-updated_at="{ row }">
      <div class="flex flex-col">
        <div class="leading-[1.2] font-medium">{{ Utils.timeWithMonth(row.updated_at) }}</div>
      </div>
      {{ row?.sync_datetime?.split(' ')?.[1] }}
    </template>

    <template #cell-type="{ row }">
      <div
        v-if="row?.type?.id === 1"
        class="flex items-center gap-x-2 bg-surface-ground/60 rounded-lg px-2 w-[200px] mx-auto"
      >
        <div
          class="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center shrink-0"
        >
          <n-icon size="16" class="text-primary">
            <Desktop24Filled />
          </n-icon>
        </div>
        <div class="flex flex-col" style="width: calc(100% - 42px)">
          <span class="text-sm text-textColor2 line-clamp-1 w-full leading-[1.2]">{{
            $t('syncLog.form.administrator')
          }}</span>
          <span class="text-xs text-textColor3 line-clamp-1 w-full">{{
            $t('syncLog.form.system')
          }}</span>
        </div>
      </div>
      <template v-else>
        <UIUser
          class="mx-auto bg-surface-ground/60 rounded-lg px-2 small-avatar"
          :data="{
            photo: row?.user?.worker.photo,
            firstName: row?.user?.worker.first_name,
            middleName: row?.user?.worker.middle_name,
            lastName: row?.user?.worker.last_name,
            position: row?.user?.worker.id
          }"
        />
      </template>
    </template>

    <template #cell-status="{ row }">
      <UIStatus :status="statusObj[row?.status]" />
    </template>

    <template #cell-sync_events_count="{ row }">
      <div v-if="row?.sync_events_count > 0">
        <UIBadge
          :type="Utils.colorTypes.success"
          :show-icon="true"
          :label="String(row?.sync_events_count)"
        >
          <template #icon>
            <n-icon size="20" class="text-success">
              <PersonAvailable20Filled />
            </n-icon>
          </template>
        </UIBadge>
      </div>
    </template>

    <template #cell-error="{ row }">
      <div class="flex">
        <template v-if="row?.error">
          <n-popover trigger="click">
            <template #trigger>
              <n-button type="error" secondary size="small">
                <template #icon>
                  <n-icon size="24" class="text-danger">
                    <ErrorCircle24Filled />
                  </n-icon>
                </template>
                {{ $t('content.error') }}
              </n-button>
            </template>
            <div class="w-[200px] h-[260px] overflow-y-auto text-danger">
              {{ row.error }}
            </div>
          </n-popover>
        </template>
      </div>
    </template>
  </UITable>
</template>

<style scoped>
  .small-avatar :deep(.n-avatar) {
    width: 32px !important;
    height: 32px !important;
    font-size: 14px !important;
  }
</style>
