<script setup>
  import { UITable, UIUser } from '@/components/index.js'
  import { Eye16Regular } from '@vicons/fluent'
  import i18n from '@/i18n/index.js'
  import UIHelper from '@/utils/UIHelper.js'
  import Utils from '@/utils/Utils.js'
  import { useKpiStore } from '@stores'

  const { t } = i18n.global
  const store = useKpiStore()

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  const columns = computed(() => [
    { key: 'worker', title: t('kpiPage.table.worker'), minWidth: 280 },
    { key: 'department', title: t('kpiPage.table.department'), minWidth: 220 },
    { key: 'position', title: t('kpiPage.table.position'), minWidth: 220 },
    { key: 'organization.name', title: t('kpiPage.table.organization'), minWidth: 240 }
  ])

  // "Ko'rish" — ko'rsatkichlar modali (ma'lumot tashqi tizimdan keladi).
  const actions = computed(() => [
    {
      key: Utils.ActionTypes.view,
      label: t('content.view'),
      icon: UIHelper.renderIcon(Eye16Regular),
      action: (row) => store._show(row)
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
    storage-key="hrm-kpi"
    @change-page="changePage"
  >
    <template #cell-worker="{ row }">
      <UIUser
        :short="false"
        :data="{
          photo: row?.photo,
          firstName: row?.first_name,
          middleName: row?.middle_name,
          lastName: row?.last_name,
          position: row?.pin
        }"
      />
    </template>
  </UITable>
</template>
