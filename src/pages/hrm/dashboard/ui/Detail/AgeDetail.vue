<script setup>
  import { UIUser, UITable } from '@/components/index.js'
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
      minWidth: 200
    },
    {
      key: 'organization.name',
      title: t('content.organization'),
      minWidth: 100
    },
    {
      key: 'department.name',
      title: t('content.department'),
      minWidth: 100
    },
    {
      key: 'birthday',
      title: t('content.birthday'),
      width: 140,
      align: 'center'
    },
    {
      key: 'age',
      title: t('content.age'),
      width: 140,
      align: 'center'
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
          middleName: row?.worker?.middle_name
        }"
      >
        <template #position>
          <span class="text-xs text-textColor3 w-full">{{ row?.position?.name }}</span>
        </template>
      </UIUser>
    </template>

    <template #cell-birthday="{ row }">
      <n-button type="primary" dashed round size="small">{{ row.worker.birthday }}</n-button>
    </template>

    <template #cell-age="{ row }">
      <n-button circle size="small">{{ row.worker.age }}</n-button>
    </template>
  </UITable>
</template>
