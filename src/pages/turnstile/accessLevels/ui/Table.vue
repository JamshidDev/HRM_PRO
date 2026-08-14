<script setup>
  import { UITable } from '@/components/index.js'
  import i18n from '@/i18n/index.js'
  import { useAccountStore, useTurnstileHikCentralStore } from '@/store/modules/index.js'
  import UIHelper from '@/utils/UIHelper.js'
  import Utils from '@/utils/Utils.js'
  import { Edit32Regular } from '@vicons/fluent'

  const { t } = i18n.global
  const accStore = useAccountStore()
  const store = useTurnstileHikCentralStore()

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  const onEdit = (row) => {
    if (!accStore.checkAction(accStore.pn.turnstileAccessLevelsWrite)) return
    store.elementId = row.id
    store.depPayload.hik_central_department_id = row?.department?.id
    store.depPayload.devices = row?.devices?.map((v) => v.id)
    store.visible = true
  }

  const columns = computed(() => [
    {
      key: 'name',
      title: t('content.name'),
      minWidth: 200
    },
    {
      key: 'devices_count',
      title: t('turnstile.accessLevelPage.deviceCount'),
      width: 200
    },
    {
      key: 'hik_server',
      title: t('turnstile.accessLevelPage.server'),
      width: 200
    },
    {
      key: 'department.name',
      title: t('turnstile.hcWorkersPage.department'),
      width: 200
    },
    {
      key: 'devices',
      title: t('turnstile.hcWorkersPage.device'),
      minWidth: 260
    }
  ])

  const actions = computed(() => [
    {
      label: t('content.edit'),
      key: Utils.ActionTypes.edit,
      icon: UIHelper.renderIcon(Edit32Regular),
      action: onEdit
    }
  ])
</script>

<template>
  <UITable
    permission-prefix="turnstile-access-levels"
    :columns="columns"
    :actions="actions"
    :data="store.list"
    :loading="store.loading"
    :page="store.params.page"
    :per-page="store.params.per_page"
    :total="store.totalItems"
    storage-key="turnstile-access-levels"
    @change-page="changePage"
  >
    <template #cell-devices_count="{ row }">
      <n-button bordered size="small" circle dashed>{{ row.devices_count }}</n-button>
    </template>

    <template #[`cell-department.name`]="{ row }">
      <n-button v-if="row.department" size="tiny" type="primary" dashed border>
        {{ row.department?.name }}
      </n-button>
    </template>

    <template #cell-devices="{ row }">
      {{ row.description }}
      <p class="flex flex-wrap">
        <template v-for="device in row.devices" :key="device.id">
          <n-button
            :type="device.status === 1 ? 'success' : 'error'"
            class="mr-1! mt-[2px]!"
            size="tiny"
            dashed
            bordered
          >
            {{ device.name }}
            <template #icon>
              <span class="relative flex size-2">
                <span
                  :class="[device.status === 1 ? 'animate-ping bg-success/90' : 'bg-danger/90']"
                  class="absolute inline-flex h-full w-full rounded-full opacity-75"
                ></span>
                <span
                  :class="[device.status === 1 ? 'bg-success' : 'bg-danger']"
                  class="relative inline-flex size-2 rounded-full"
                ></span>
              </span>
            </template>
          </n-button>
        </template>
      </p>
    </template>
  </UITable>
</template>
