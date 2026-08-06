<script setup>
  import { CodeCircle20Regular, DismissCircle24Regular } from '@vicons/fluent'
  import { UITable, UIUser } from '@/components/index.js'
  import { useActionLogStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global

  const descriptionType = (desc) => {
    if (desc === 'created') return 'info'
    if (desc === 'updated') return 'warning'
    if (desc === 'deleted') return 'error'
    return 'default'
  }

  const store = useActionLogStore()

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._getActionLog()
  }

  const openCode = (id) => {
    store.activeCol = id
  }

  const columns = computed(() => [
    {
      key: 'causer',
      title: t('actionLog.table.owner'),
      width: 300
    },
    {
      key: 'description',
      title: t('actionLog.table.status'),
      width: 200,
      align: 'center'
    },
    {
      key: 'properties',
      title: t('actionLog.table.detail'),
      minWidth: 200
    },
    {
      key: 'created_at',
      title: t('content.date'),
      width: 120,
      align: 'center'
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
    storage-key="admin-action-log"
    @change-page="changePage"
  >
    <template #cell-causer="{ row }">
      <UIUser
        :data="{
          photo: row?.causer?.worker?.photo,
          lastName: row?.causer?.worker?.last_name,
          firstName: row?.causer?.worker?.first_name,
          middleName: row?.causer?.worker?.middle_name,
          position: row?.causer?.worker?.role?.name
        }"
      />
    </template>

    <template #cell-description="{ row }">
      <div class="flex justify-center">
        <n-tag :type="descriptionType(row.description)" size="small" round>
          {{ $t(`actionLog.status.${row.description}`) }}
        </n-tag>
      </div>
    </template>

    <template #cell-properties="{ row }">
      <div class="flex items-center justify-between">
        <span class="truncate w-full max-w-[400px] pb-1">
          {{ store.activeCol === row.id ? ' ' : row?.properties }}
        </span>
        <n-icon
          v-if="store.activeCol === row.id"
          @click="openCode(null)"
          size="24"
          class="text-danger font-bold cursor-pointer"
        >
          <DismissCircle24Regular />
        </n-icon>
        <n-icon
          v-else
          @click="openCode(row.id)"
          size="24"
          class="text-primary font-bold cursor-pointer"
        >
          <CodeCircle20Regular />
        </n-icon>
      </div>

      <n-collapse-transition
        class="text-xs bg-dark text-white rounded-xl shadow p-2 max-w-full overflow-x-auto"
        :show="store.activeCol === row.id"
      >
        <pre class="whitespace-pre-wrap break-all">{{ row }}</pre>
      </n-collapse-transition>
    </template>

    <template #cell-created_at="{ row }">
      <div class="w-full text-center">{{ Utils.timeWithMonth(row?.created_at) }}</div>
    </template>
  </UITable>
</template>
