<script setup>
  import { UITable } from '@/components/index.js'
  import { useDepartmentLocationStore } from '@/store/modules/index.js'
  import { Add16Filled } from '@vicons/fluent'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global

  const store = useDepartmentLocationStore()

  const columns = computed(() => [
    {
      key: 'name',
      title: t('departmentLocationPage.table.department'),
      minWidth: 200
    },
    {
      key: 'organization.name',
      title: t('departmentLocationPage.table.organization'),
      minWidth: 150
    },
    {
      key: 'hasLocation',
      title: t('departmentLocationPage.table.hasLocation'),
      width: 120,
      align: 'center'
    },
    {
      key: 'addLocation',
      title: '',
      width: 120
    }
  ])

  const onOpenLocation = (item) => {
    store.openAttach(item)
  }

  const onAddLocation = (item) => {
    store.openLocationModal(item)
  }

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }
</script>

<template>
  <UITable
    :columns="columns"
    :data="store.list"
    :loading="store.loading"
    :page="store.params.page"
    :per-page="store.params.per_page"
    :total="store.totalItems"
    @change-page="changePage"
  >
    <template #cell-hasLocation="{ row }">
      <n-button v-if="row.location" size="small" @click="onOpenLocation(row)">
        {{ $t('content.view') }}
      </n-button>
    </template>

    <template #cell-addLocation="{ row }">
      <n-button size="small" secondary type="primary" @click="onAddLocation(row)">
        <template #icon>
          <n-icon>
            <Add16Filled />
          </n-icon>
        </template>
        {{ $t('content.add') }}
      </n-button>
    </template>
  </UITable>
</template>
