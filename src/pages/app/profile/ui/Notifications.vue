<script setup>
  import { UIPageFilter, UITable, UIUser, UIStatus } from '@/components/index.js'
  import Utils from '@/utils/Utils.js'
  import { ArrowDownload24Regular, ArrowSync16Regular } from '@vicons/fluent'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global

  // Placeholder state — wire up to the real endpoint/store when it's ready.
  const search = ref(null)
  const loading = ref(false)
  const page = ref(1)
  const perPage = ref(15)
  const data = ref([])
  const total = ref(0)

  const columns = computed(() => [
    {
      key: 'worker',
      title: t('content.worker'),
      minWidth: 260
    },
    {
      key: 'type',
      title: t('content.type'),
      minWidth: 180
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
      width: 60,
      align: 'center'
    }
  ])

  const changePage = (v) => {
    page.value = v.page
    perPage.value = v.per_page
  }
</script>

<template>
  <div class="flex flex-col gap-3">
    <UIPageFilter v-model:search="search" :search-loading="loading" :show-add-button="false">
      <template #filterAction>
        <n-button class="notif-refresh-button" type="primary" ghost :loading="loading">
          {{ $t('content.refresh') }}
          <template #icon>
            <n-icon>
              <ArrowSync16Regular />
            </n-icon>
          </template>
        </n-button>
      </template>
    </UIPageFilter>

    <UITable
      :columns="columns"
      :data="data"
      :loading="loading"
      :page="page"
      :per-page="perPage"
      :total="total"
      @change-page="changePage"
    >
      <template #cell-worker="{ row }">
        <UIUser
          :hide-tooltip="true"
          :short="false"
          :data="{
            photo: row?.worker?.photo,
            firstName: row?.worker?.first_name,
            middleName: row?.worker?.middle_name,
            lastName: row?.worker?.last_name,
            position: row?.id
          }"
        />
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
  </div>
</template>

<style scoped>
  .notif-refresh-button {
    --n-height: 32px !important;
    --n-border-radius: 8px !important;
    --n-padding: 0 16px !important;
    font-weight: 600;
  }
</style>
