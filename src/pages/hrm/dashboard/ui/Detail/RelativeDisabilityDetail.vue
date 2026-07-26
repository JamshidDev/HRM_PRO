<script setup>
  import { UIUser, UITable, UIBadge } from '@/components/index.js'
  import { useDashboardStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global

  const store = useDashboardStore()

  const filterEvent = () => {
    store._index_detail()
  }

  onMounted(() => {
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
      minWidth: 240
    },
    {
      key: 'relative',
      title: t('dashboardPage.disability.relative'),
      minWidth: 200
    },
    {
      key: 'organization.name',
      title: t('content.organization'),
      minWidth: 160
    },
    {
      key: 'level',
      title: t('dashboardPage.disability.groupTitle'),
      width: 80,
      align: 'center'
    },
    {
      key: 'number',
      title: t('dashboardPage.disability.number'),
      minWidth: 120
    },
    {
      key: 'from',
      title: t('dashboardPage.disability.fromDate'),
      minWidth: 120
    },
    {
      key: 'to',
      title: t('dashboardPage.disability.toDate'),
      minWidth: 120
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
        :short="false"
        :data="{
          photo: row?.worker?.photo,
          lastName: row?.worker?.last_name,
          firstName: row?.worker?.first_name,
          middleName: row?.worker?.middle_name,
        }"
      >
        <template #position>
          <span class="text-xs text-textColor3">{{ row?.position?.name }}</span>
        </template>
      </UIUser>
    </template>

    <template #cell-relative="{ row }">
      <div class="flex flex-col gap-0.5">
        <span class="text-[13px] font-medium text-textColor0">
          {{ row.relative.last_name }} {{ row.relative.first_name }}
        </span>
        <span class="text-xs text-textColor3">{{ row.relative.relative_name }}</span>
      </div>
    </template>

    <template #cell-level="{ row }">
      <n-tag type="warning" size="small" round>
        {{ row.level }}-{{ $t('dashboardPage.disability.group') }}
      </n-tag>
    </template>

    <template #cell-number="{ row }">
      <n-button dashed type="primary" round size="small">
        {{ row.number }}
      </n-button>
    </template>

    <template #cell-from="{ row }">
      <UIBadge :show-icon="false" :label="row.from" />
    </template>

    <template #cell-to="{ row }">
      <UIBadge v-if="row.to" :show-icon="false" :label="row.to" />
      <UIBadge v-else :show-icon="false" :label="$t('dashboardPage.disability.unlimited')" type="Error" />
    </template>
  </UITable>
</template>
