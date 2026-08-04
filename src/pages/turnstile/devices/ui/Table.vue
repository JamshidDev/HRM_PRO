<script setup>
  import { UIOnlineOffline, UITable } from '@/components/index.js'
  import { useAccountStore, useDevicesStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'
  import UIHelper from '@/utils/UIHelper.js'
  import Utils from '@/utils/Utils.js'
  import { CheckmarkCircle12Filled, Delete20Regular, Edit32Regular } from '@vicons/fluent'

  const { t } = i18n.global
  const accStore = useAccountStore()
  const store = useDevicesStore()

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  const onEdit = (row) => {
    if (!accStore.checkAction(accStore.pn.turnstileDevicesWrite)) return
    store.elementId = row.id

    store.payload.name = row.name
    store.payload.ip_address = row.ip_address
    store.payload.mac_address = row.mac_address
    store.payload.device_id = row.device_id
    store.payload.device_code = row.device_code
    store.payload.organization_id = row.organization_id ? [row.organization_id] : []

    store.payload.log = row.log
    store.payload.config = row.config
    store.payload.upload_workers = row.upload_workers

    store.payload.contract_number = row.contract_number
    store.payload.contract_date = row.contract_date ? new Date(row.contract_date).getTime() : null

    store.isAdmin = accStore.checkPermission(accStore.pn.admin) || false

    store.visible = true
    store.visibleType = false
  }

  const onDelete = (row) => {
    if (!accStore.checkAction(accStore.pn.turnstileDevicesWrite)) return
    store.elementId = row.id
    store._delete()
  }

  const columns = computed(() => [
    {
      key: 'name',
      title: t('content.name'),
      minWidth: 260
    },
    {
      key: 'status',
      title: t('devices.status'),
      width: 120
    },
    {
      key: 'organization_id.code',
      title: t('content.organization'),
      width: 120
    },
    {
      key: 'log',
      title: t('devices.log'),
      width: 80
    },
    {
      key: 'config',
      title: t('devices.config'),
      width: 80
    },
    {
      key: 'upload_workers',
      title: t('devices.upload_workers'),
      width: 80
    },
    {
      key: 'ip_address',
      title: t('devices.ipAddress'),
      width: 140
    },
    {
      key: 'mac_address',
      title: t('devices.macAddress'),
      width: 140
    },
    {
      key: 'device_code',
      title: t('devices.device_code'),
      width: 120
    },
    {
      key: 'serial_number',
      title: t('devices.serialNumber'),
      width: 120
    },
    {
      key: 'updated_at',
      title: t('content.updatedAt'),
      width: 120
    }
  ])

  const actions = computed(() => [
    {
      label: t('content.edit'),
      key: Utils.ActionTypes.edit,
      icon: UIHelper.renderIcon(Edit32Regular),
      action: onEdit
    },
    {
      label: t('content.delete'),
      key: Utils.ActionTypes.delete,
      icon: UIHelper.renderIcon(Delete20Regular),
      action: onDelete
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
    storage-key="turnstile-devices"
    @change-page="changePage"
  >
    <template #cell-name="{ row }">
      <span class="font-medium">{{ row.name }}</span>
    </template>

    <template #cell-status="{ row }">
      <UIOnlineOffline
        :status="row.status"
        :text="$t(row.status ? 'devices.online' : 'devices.offline')"
      />
    </template>

    <template #[`cell-organization_id.code`]="{ row }">
      <n-tooltip trigger="hover">
        <template #trigger>
          <p class="text-sm cursor-pointer">{{ row?.organization_id?.code }}</p>
        </template>
        {{ row?.organization_id?.name }}
      </n-tooltip>
    </template>

    <template #cell-log="{ row }">
      <n-icon size="26" :class="[row.log ? 'text-success' : 'text-secondary']">
        <CheckmarkCircle12Filled v-if="row.log" />
      </n-icon>
    </template>

    <template #cell-config="{ row }">
      <n-icon size="26" :class="[row.config ? 'text-success' : 'text-secondary']">
        <CheckmarkCircle12Filled v-if="row.config" />
      </n-icon>
    </template>

    <template #cell-upload_workers="{ row }">
      <n-icon size="26" :class="[row.upload_workers ? 'text-success' : 'text-secondary']">
        <CheckmarkCircle12Filled v-if="row.upload_workers" />
      </n-icon>
    </template>

    <template #cell-serial_number="{ row }">
      <n-tooltip trigger="hover">
        <template #trigger>
          <p
            class="text-sm overflow-hidden text-nowrap text-ellipsis !w-[120px] !max-w-[120px] cursor-pointer"
          >
            {{ row.serial_number }}
          </p>
        </template>
        {{ row.serial_number }}
      </n-tooltip>
    </template>

    <template #cell-updated_at="{ row }">
      <p class="leading-[1.2] text-xs">{{ Utils.timeWithMonth(row.updated_at) }}</p>
    </template>
  </UITable>
</template>
