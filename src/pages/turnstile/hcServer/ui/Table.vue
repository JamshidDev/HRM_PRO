<script setup>
  import { UIBadge, UIDateViewer, UIStatus, UITable } from '@/components/index.js'
  import i18n from '@/i18n/index.js'
  import { useHcServerStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import { ErrorCircle24Filled, Person12Filled, PersonAvailable20Filled } from '@vicons/fluent'

  const { t } = i18n.global
  const store = useHcServerStore()

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  const statusObj = {
    1: {
      name: t('content.process'),
      id: 1
    },
    2: {
      name: t('content.error'),
      id: 4
    },
    3: {
      name: t('content.success'),
      id: 3
    }
  }

  const showDetails = (row) => {
    store.elementId = row.id
    store.errorParams.page = 1
    store._showError()
    store.errorVisible = true
  }

  const columns = computed(() => [
    {
      key: 'name',
      title: t('hcServer.form.name'),
      minWidth: 260
    },
    {
      key: 'workers_count',
      title: t('hcServer.form.workers_count'),
      width: 140
    },
    {
      key: 'exported_count',
      title: t('hcServer.form.exported_count'),
      width: 140
    },
    {
      key: 'status',
      title: t('content.status'),
      width: 140
    },
    {
      key: 'error_workers_count',
      title: t('content.error'),
      width: 140,
      align: 'center'
    },
    {
      key: 'created_at',
      title: t('content.date'),
      width: 140
    }
  ])
</script>

<template>
  <UITable
    :columns="columns"
    :data="store.list"
    :loading="store.loading"
    :page="store.params.page"
    :per-page="store.params.per_page"
    :total="store.totalItems"
    storage-key="turnstile-hc-server"
    @change-page="changePage"
  >
    <template #cell-workers_count="{ row }">
      <UIBadge :type="Utils.colorTypes.info" :show-icon="true" :label="String(row?.workers_count)">
        <template #icon>
          <n-icon size="20" class="text-primary">
            <Person12Filled />
          </n-icon>
        </template>
      </UIBadge>
    </template>

    <template #cell-exported_count="{ row }">
      <UIBadge :type="Utils.colorTypes.success" :show-icon="true" :label="String(row?.exported_count)">
        <template #icon>
          <n-icon size="20" class="text-success">
            <PersonAvailable20Filled />
          </n-icon>
        </template>
      </UIBadge>
    </template>

    <template #cell-status="{ row }">
      <UIStatus :status="statusObj[row?.status]" />
    </template>

    <template #cell-error_workers_count="{ row }">
      <template v-if="row?.error_workers_count > 0">
        <n-button @click="showDetails(row)" type="error" secondary>
          <template #icon>
            <n-icon size="24" class="text-danger">
              <ErrorCircle24Filled />
            </n-icon>
          </template>
          {{ row?.error_workers_count }}
        </n-button>
      </template>
    </template>

    <template #cell-created_at="{ row }">
      <UIDateViewer :date="row?.created_at" />
    </template>
  </UITable>
</template>
