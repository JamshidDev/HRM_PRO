<script setup>
  import { UIUser, UIBadge, UITable } from '@/components/index.js'
  import { useDashboardStore } from '@/store/modules/index.js'
  import { Utils } from '@utils'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global

  const store = useDashboardStore()

  function filterEvent() {
    store._index_detail()
  }

  onMounted(() => {
    if (!store.params.type) {
      store.params.type = 'ended'
    }
    if (!store.params.month) {
      store.params.month = new Date().getMonth() || 12
    }
    filterEvent()
  })

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    filterEvent()
  }

  const columns = computed(() => [
    {
      key: 'worker',
      title: t('content.worker'),
      minWidth: 200
    },
    {
      key: 'organization.name',
      title: t('content.organization'),
      minWidth: 100,
      width: 300
    },
    {
      key: 'from',
      title: t('content.from'),
      minWidth: 100,
      width: 140,
      align: 'center'
    },
    {
      key: 'to',
      title: t('content.to'),
      minWidth: 100,
      width: 140,
      align: 'center'
    },
    {
      key: 'status',
      title: t('content.status'),
      minWidth: 100,
      width: 140
    }
  ])
</script>

<template>
  <UITable
    :columns="columns"
    :data="store.detailData || []"
    :loading="store.detailLoading"
    :page="store.params.page"
    :per-page="store.params.per_page"
    :total="store.detailDataTotal"
    @change-page="changePage"
  >
    <template #cell-worker="{ row }">
      <UIUser
        :hide-tooltip="true"
        :short="false"
        :data="{
          photo: row?.worker?.photo,
          lastName: row?.worker?.last_name,
          firstName: row?.worker?.first_name,
          middleName: row?.worker?.middle_name,
          position: row?.type
        }"
      />
    </template>

    <template #cell-from="{ row }">
      <UIBadge v-if="row?.from" :show-icon="false" :label="row.from" />
    </template>

    <template #cell-to="{ row }">
      <UIBadge v-if="row?.to" :show-icon="false" :label="row.to" />
    </template>

    <template #cell-status="{ row }">
      <UIBadge
        v-if="row?.status"
        :show-icon="false"
        :label="row.status.name"
        :type="row.status.id === 'active' ? Utils.colorTypes.success : Utils.colorTypes.error"
      />
    </template>
  </UITable>
</template>
