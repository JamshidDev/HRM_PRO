<script setup>
  import { computed, onMounted } from 'vue'
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
      minWidth: 220
    },
    {
      key: 'fine',
      title: t('content.type'),
      minWidth: 100,
      width: 140
    },
    {
      key: 'organization.name',
      title: t('content.organization'),
      minWidth: 100,
      width: 300
    },
    {
      key: 'reason',
      title: t('incentive.form.reason'),
      minWidth: 100,
      width: 300
    },
    {
      key: 'number',
      title: t('content.number'),
      minWidth: 100,
      width: 100
    },
    {
      key: 'date',
      title: t('content.date'),
      minWidth: 100,
      width: 140
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
    <template #header-__index>{{ $t('content.number') }}</template>

    <template #cell-worker="{ row }">
      <UIUser
        :short="false"
        :hide-tooltip="true"
        :data="{
          photo: row?.worker_position?.worker.photo,
          lastName: row?.worker_position?.worker.last_name,
          firstName: row?.worker_position?.worker.first_name,
          middleName: row?.worker_position?.worker.middle_name
        }"
      >
        <template #position>
          <span class="text-xs text-textColor3 w-full">{{ row?.worker_position?.post_short_name }}</span>
        </template>
      </UIUser>
    </template>

    <template #cell-date="{ row }">
      <UIBadge :show-icon="false" :label="row.date" />
    </template>
  </UITable>
</template>
