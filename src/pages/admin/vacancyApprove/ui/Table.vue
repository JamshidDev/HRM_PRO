<script setup>
  import { UIChip, UITable } from '@/components/index.js'
  import { useVacancyApproveStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'
  import Utils from '@/utils/Utils.js'
  import UIHelper from '@/utils/UIHelper.js'
  import { Delete20Regular } from '@vicons/fluent'

  const { t } = i18n.global
  const store = useVacancyApproveStore()

  const onDelete = (row) => {
    store._delete(row.id)
  }

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  const columns = computed(() => [
    {
      key: 'from',
      title: t('vacancyApprovePage.from')
    },
    {
      key: 'to',
      title: t('vacancyApprovePage.to')
    }
  ])

  const actions = computed(() => [
    {
      label: t('content.delete'),
      key: Utils.ActionTypes.delete,
      icon: UIHelper.renderIcon(Delete20Regular),
      action: onDelete
    }
  ])
</script>

<template>
  <UITable
    :columns="columns"
    :actions="actions"
    :data="store.list"
    :loading="store.loading"
    :page="store.params.page"
    :per-page="store.params.per_page"
    :total="store.totalItems"
    @change-page="changePage"
  >
    <template #cell-from="{ row }">
      <div class="flex items-center gap-1">
        <span class="text-sm font-medium">{{ row.from?.name }}</span>
        <UIChip v-if="row.from?.group" tone="warning" compact>group</UIChip>
      </div>
    </template>

    <template #cell-to="{ row }">
      <div class="flex items-center gap-1">
        <span class="text-sm font-medium">{{ row.to?.name }}</span>
        <UIChip v-if="row.to?.group" tone="warning" compact>group</UIChip>
      </div>
    </template>
  </UITable>
</template>
