<script setup>
  import { UIUser, UIBadge, UITable } from '@/components/index.js'
  import { useDashboardStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global

  const store = useDashboardStore()

  function filterEvent() {
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
      minWidth: 200
    },
    {
      key: 'to',
      title: t('dashboardPage.medical.nextExamination'),
      minWidth: 100,
      width: 120
    }
  ])
</script>

<template>
  <UITable
    class="mt-4"
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
        :hide-tooltip="true"
        :data="{
          photo: row?.photo,
          lastName: row?.last_name,
          firstName: row?.first_name,
          middleName: row?.middle_name
        }"
      >
        <template #position>
          <span class="text-xs text-textColor3 w-full">{{ row?.position_name }}</span>
        </template>
      </UIUser>
    </template>

    <template #cell-to="{ row }">
      <UIBadge :show-icon="false" :label="row.to" />
    </template>
  </UITable>
</template>
