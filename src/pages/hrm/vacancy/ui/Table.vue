<script setup>
  import { UIBadge, UITable } from '@/components/index.js'
  import i18n from '@/i18n/index.js'
  import { useAccountStore, useVacancyStore } from '@/store/modules/index.js'
  import UIHelper from '@/utils/UIHelper.js'
  import Utils from '@/utils/Utils.js'
  import {
    Delete20Regular,
    DocumentSearch20Regular,
    Edit32Regular,
    Eye20Regular
  } from '@vicons/fluent'
  import numeral from 'numeral'

  const { t } = i18n.global

  const store = useVacancyStore()
  const accStore = useAccountStore()

  const onEdit = (row) => {
    if (!accStore.checkAction(accStore.pn.hrPublicVacancyWrite)) return
    store.elementId = row.id
    store._show()
  }

  const onDelete = (row) => {
    if (!accStore.checkAction(accStore.pn.hrPublicVacancyWrite)) return
    store.elementId = row.id
    store._delete()
  }

  const onView = (row) => {
    if (!accStore.checkAction(accStore.pn.hrPublicVacancyRead)) return
    store.elementId = row.id
    store.openViewModal(row)
  }

  const onPreview = (row) => {
    if (!accStore.checkAction(accStore.pn.hrPublicVacancyRead)) return
    store.elementId = row.id
    store.openPreviewModal(row)
  }

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  const columns = computed(() => [
    {
      key: 'organization',
      title: t('content.organization'),
      minWidth: 150
    },
    {
      key: 'department_position',
      title: t('vacancy.form.department_position_id'),
      minWidth: 200
    },
    {
      key: 'rate',
      title: t('vacancy.form.rate'),
      width: 120,
      align: 'center'
    },
    {
      key: 'to',
      title: t('vacancy.form.to'),
      width: 160
    },
    {
      key: 'salary',
      title: t('departmentPositionPage.form.salary'),
      width: 120
    },
    {
      key: 'experience',
      title: t('vacancy.form.short_experience'),
      width: 120
    },
    {
      key: 'education.name',
      title: t('medWorker.form.education'),
      width: 120
    },
    {
      key: 'work_type.name',
      title: t('vacancy.form.work_type'),
      width: 120
    },
    {
      key: 'switch',
      title: t('vacancy.form.switch'),
      width: 80,
      align: 'center'
    },
    {
      key: 'applications_count',
      title: t('vacancy.form.applications_count'),
      width: 120,
      align: 'center'
    }
  ])

  const actions = computed(() => [
    {
      label: t('content.edit'),
      key: Utils.ActionTypes.edit,
      icon: UIHelper.renderIcon(Edit32Regular),
      action: onEdit
    },
    {
      label: t('content.delete'),
      key: Utils.ActionTypes.delete,
      icon: UIHelper.renderIcon(Delete20Regular),
      action: onDelete
    },
    {
      label: t('content.view'),
      key: Utils.ActionTypes.view,
      icon: UIHelper.renderIcon(Eye20Regular),
      action: onView
    },
    {
      label: t('vacancy.viewDetail'),
      key: 'preview',
      icon: UIHelper.renderIcon(DocumentSearch20Regular),
      action: onPreview
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
    storage-key="hrm-public-vacancy"
    @change-page="changePage"
  >
    <template #cell-organization="{ row }">
      <span class="text-sm font-medium">{{ row.organization?.name }}</span>
      <template v-if="row.organization?.group">
        <br />
        <n-tag size="tiny" type="warning" round>group</n-tag>
      </template>
    </template>

    <template #cell-department_position="{ row }">
      <span class="opacity-85">
        {{ row.position.name }}
      </span>
      <br />
      <span class="opacity-65 text-xs">
        {{ row.department.name }}
      </span>
    </template>

    <template #cell-rate="{ row }">
      <n-button size="small" type="primary" circle bordered dashed>
        {{ row.rate }}
      </n-button>
    </template>

    <template #cell-to="{ row }">
      <UIBadge
        :type="Utils.colorTypes.secondary"
        :show-icon="false"
        :label="Utils.timeOnlyDate(row.to)"
      />
    </template>

    <template #cell-salary="{ row }">
      {{ numeral(row.salary).format('0,0.0') }}
      <span class="text-textColor3 text-xs">{{ $t('content.sum') }}</span>
    </template>

    <template #cell-switch="{ row }">
      <n-switch
        v-model:value="row.status"
        :loading="store.switchLoading"
        @update:value="store._changePublic($event, row)"
      />
    </template>

    <template #cell-applications_count="{ row }">
      <n-button
        v-if="row.applications_count > 0"
        size="small"
        type="primary"
        circle
        bordered
        dashed
        @click="store.openViewModal(row)"
      >
        {{ row.applications_count }}
      </n-button>
      <span v-else></span>
    </template>
  </UITable>
</template>

<style scoped></style>
