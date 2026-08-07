<script setup>
  import { UIBadge, UITable, UIUser } from '@/components/index.js'
  import i18n from '@/i18n/index.js'
  import { useAccountStore, useTurnstileHikCentralWorkerStore } from '@/store/modules/index.js'
  import UIHelper from '@/utils/UIHelper.js'
  import Utils from '@/utils/Utils.js'
  import {
    AddSquareMultiple20Regular,
    ArrowSync24Filled,
    Delete20Regular,
    Edit32Regular,
    ErrorCircle24Filled,
    MoreHorizontal24Regular
  } from '@vicons/fluent'
  import AccessLevelModal from './AccessLevelModal.vue'

  const { t } = i18n.global

  const accStore = useAccountStore()
  const store = useTurnstileHikCentralWorkerStore()

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  const onEdit = (row) => {
    if (!accStore.checkAction(accStore.pn.turnstileHikCentralWorkersWrite)) return
    store.elementId = row.id
    store.resetEditPayload()
    store.resetForm()

    const existPerson = Boolean(row.hcpPerson)
    const photoId = row?.hcpPerson?.photo?.id

    store.payload.end_time = row?.hcpPerson?.to ? new Date(row.hcpPerson.to).getTime() : null
    store.payload.access_level_ids = []
    store.editPayload.id = row?.hcpPerson?.id || undefined
    store.editPayload.worker_id = row?.hcpPerson?.id ? undefined : row.id

    store.payload.worker_id = row?.id

    store.editVisible = true
    store._access_levels()

    store._workerAccessLevels(row.id, (data) => {
      store.payload.access_level_ids = data.map((level) => level.access_level_id) || []
    })

    store._worker_photos(() => {
      if (!existPerson) return
      store.payload.photo_index = store.photos.findIndex((x) => x.id == photoId)
      store.payload.photo_id = photoId
    })
  }

  const onDelete = (row) => {
    if (!accStore.checkAction(accStore.pn.turnstileHikCentralWorkersWrite)) return
    store.elementId = row.id
    store._delete()
  }

  // const checkDeviceExpiry = (date) => {
  //   const now = new Date()
  //   const expiryDate = new Date(date)
  //   if (now > expiryDate) return 'error'
  //   const oneMonthLater = new Date(now)
  //   oneMonthLater.setMonth(now.getMonth() + 1)
  //   if (expiryDate <= oneMonthLater) return 'warning'
  //   return 'primary'
  // }

  const onSelect = (row) => {
    store.accessLevelModalVisible = true
    store.moreAccessLevels = []
    store._workerAccessLevels(row.id)
    store.selectedWorker = row
  }

  const onRefreshAccessLevel = async (v) => {
    onRefresh(v)
  }

  const onRefresh = (v) => {
    store._onRefreshAcessLeves(v.id)
  }

  const onShowErrorEv = (worker_id, access_level_id) => {
    const params = {
      worker_id: worker_id || undefined,
      access_level_id: access_level_id || undefined
    }
    store._getErrors(params)
    store.errorVisible = true
  }

  const columns = computed(() => [
    {
      key: 'worker',
      title: t('content.fullName'),
      width: 400
    },
    {
      key: 'access_levels',
      title: t('turnstile.hcWorkersPage.access_levels'),
      minWidth: 500
    },
    {
      key: 'hcpPerson.to',
      title: t('content.expiryDate'),
      width: 140
    },
    {
      key: 'hcpPerson.updated_at',
      title: t('content.updatedAt'),
      width: 140
    },
    {
      key: 'errorMessage',
      title: t('content.error'),
      width: 100
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
    permission-prefix="turnstile-hik-central-workers"
    :columns="columns"
    :actions="actions"
    :data="store.list"
    :loading="store.loading"
    :page="store.params.page"
    :per-page="store.params.per_page"
    :total="store.totalItems"
    storage-key="turnstile-hc-workers"
    @change-page="changePage"
  >
    <template #cell-worker="{ row }">
      <UIUser
        :short="false"
        :data="{
          photo: row?.hcpPerson?.photo?.photo || row?.photo,
          lastName: row?.last_name,
          firstName: row?.first_name,
          middleName: row?.middle_name,
          position: row.post_name
        }"
      >
        <template #position>
          <div class="flex gap-1 text-xs text-secondary">
            <n-button
              class="!py-0 !h-[16px] !text-xs !select-all"
              secondary
              type="primary"
              size="tiny"
            >
              {{ row.card }}
            </n-button>

            <n-ellipsis tooltip>
              {{ row.post_name }}
            </n-ellipsis>
          </div>
        </template>
      </UIUser>
    </template>

    <template #cell-access_levels="{ row }">
      <div class="flex flex-wrap gap-2" v-if="row.hcpPerson">
        <template v-for="level in row.hcpPerson.access_levels.slice(0, 3)" :key="level.id">
          <n-button class="!px-1" dashed :type="level.type || 'default'">
            <div class="flex flex-col px-4 relative group overflow-hidden min-w-[100px]">
              <span class="font-semibold"> {{ level.name }}</span>
              <span
                @click.stop="onRefresh(level)"
                class="px-1 bottom-0 absolute w-full h-full text-success flex justify-center items-center gap-2 top-0 right-[-200px] group-hover:right-[4px] transition-all duration-300 z-[999] bg-surface-ground"
              >
                <n-icon size="16">
                  <ArrowSync24Filled />
                </n-icon>
                {{ $t('content.refresh') }}
              </span>
            </div>

            <template #icon>
              <n-icon size="19">
                <ErrorCircle24Filled
                  @click.stop="onShowErrorEv(undefined, level.id)"
                  v-if="level.type === 'error'"
                />
                <AddSquareMultiple20Regular v-else />
              </n-icon>
            </template>
          </n-button>
        </template>
        <n-button
          @click="onSelect(row)"
          round
          secondary
          v-if="row.hcpPerson.access_levels.length > 3"
        >
          <template #icon>
            <MoreHorizontal24Regular />
          </template>
        </n-button>
      </div>
    </template>

    <template #[`cell-hcpPerson.to`]="{ row }">
      <UIBadge
        v-if="row?.hcpPerson?.to"
        :show-icon="false"
        :label="Utils.timeOnlyDate(row?.hcpPerson?.to)"
      />
    </template>

    <template #[`cell-hcpPerson.updated_at`]="{ row }">
      {{ Utils.timeOnlyDate(row?.hcpPerson?.updated_at) }}
    </template>

    <template #cell-errorMessage="{ row }">
      <n-button
        @click="onShowErrorEv(row.id)"
        v-if="row.errorMessage"
        type="error"
        secondary
        size="small"
      >
        <template #icon>
          <n-icon size="24" class="text-danger">
            <ErrorCircle24Filled />
          </n-icon>
        </template>
        {{ $t('content.error') }}
      </n-button>
    </template>
  </UITable>

  <AccessLevelModal
    :visible="store.accessLevelModalVisible"
    @update:visible="(v) => (store.accessLevelModalVisible = v)"
    @refresh="onRefreshAccessLevel"
    :worker-name="`${store.selectedWorker?.first_name} ${store.selectedWorker?.last_name}`"
  />
</template>
