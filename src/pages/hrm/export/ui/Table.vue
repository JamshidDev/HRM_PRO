<script setup>
  import { UIUser, UIStatus, UITable } from '@/components/index.js'
  import { useExportStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import { ArrowDownload24Regular } from '@vicons/fluent'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global

  const store = useExportStore()

  const columns = computed(() => [
    {
      key: 'worker',
      title: t('content.worker'),
      minWidth: 300
    },
    {
      key: 'type',
      title: t('content.type'),
      minWidth: 200
    },
    {
      key: 'status',
      title: t('content.status'),
      width: 120,
      align: 'center'
    },
    {
      key: 'created_at',
      title: t('content.created'),
      minWidth: 160
    },
    {
      key: 'updated_at',
      title: t('content.ended'),
      minWidth: 160
    },
    {
      key: 'action',
      title: t('content.action'),
      width: 50,
      align: 'center'
    }
  ])

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._tasks()
  }
</script>

<template>
  <UITable
    :columns="columns"
    :data="store.tasks"
    :loading="store.loading"
    :page="store.params.page"
    :per-page="store.params.per_page"
    :total="store.totalItems"
    @change-page="changePage"
  >
    <template #cell-worker="{ row }">
      <UIUser
        :hide-tooltip="true"
        :short="false"
        :data="{
          photo: row?.worker.photo,
          firstName: row?.worker.first_name,
          middleName: row?.worker.middle_name,
          lastName: row?.worker.last_name,
          position: row?.id
        }"
      >
      </UIUser>
    </template>

    <template #cell-type="{ row }">
      <n-badge v-if="!row.read_at" class="mb-[2px]" type="info" dot />
      {{ row.type }}
    </template>

    <template #cell-status="{ row }">
      <UIStatus size="tiny" :status="row.status" />
    </template>

    <template #cell-created_at="{ row }">
      {{ Utils.timeWithMonth(row.created_at) }}
    </template>

    <template #cell-updated_at="{ row }">
      {{ Utils.timeWithMonth(row.updated_at) }}
    </template>

    <template #cell-action="{ row }">
      <n-button
        v-if="row.file"
        type="primary"
        ghost
        size="small"
        tag="a"
        :href="row.file"
        target="_blank"
      >
        <template #icon>
          <n-icon :component="ArrowDownload24Regular" />
        </template>
      </n-button>
    </template>
  </UITable>
</template>

<style scoped></style>
