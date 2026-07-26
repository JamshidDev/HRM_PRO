<script setup>
  import { UIStatus, UITable, UIUser } from '@/components/index.js'
import i18n from '@/i18n/index.js'
import { useMedInspectionStore } from '@/store/modules/index.js'
import UIHelper from '@/utils/UIHelper.js'
import Utils from '@/utils/Utils.js'
import { Delete20Regular, Eye16Regular } from '@vicons/fluent'

  const { t } = i18n.global

  const store = useMedInspectionStore()

  const emits = defineEmits(['openEv'])

  const openDocument = (v) => {
    emits('openEv', v)
  }

  const onView = (row) => {
    openDocument(row.id)
  }

  const onDelete = (row) => {
    store.elementId = row.id
    store._delete()
  }

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  const columns = computed(() => [
    {
      key: 'worker',
      title: t('content.name'),
      minWidth: 200
    },
    {
      key: 'hospital',
      title: t('medInspection.form.hospital'),
      minWidth: 200
    },
    {
      key: 'status',
      title: t('medInspection.form.status'),
      width: 160
    },
    {
      key: 'start_date',
      title: t('medInspection.form.start_date'),
      width: 160
    },
    {
      key: 'confirmation',
      title: t('content.status'),
      width: 160
    },
    {
      key: 'generate',
      title: t('content.document'),
      width: 160
    }
  ])

  const actions = computed(() => [
    {
      label: t('content.view'),
      key: Utils.ActionTypes.view,
      icon: UIHelper.renderIcon(Eye16Regular),
      action: onView
    },
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
    storage-key="hrm-med-inspection"
    @change-page="changePage"
  >
    <template #cell-worker="{ row }">
      <UIUser
        :short="false"
        :data="{
          photo: row?.worker.photo,
          lastName: row?.worker.last_name,
          firstName: row?.worker.first_name,
          middleName: row?.worker.middle_name,
          position: row?.position
        }"
      />
    </template>

    <template #cell-hospital="{ row }">
      <span @click="openDocument(row.id)" class="cursor-pointer hover:underline hover:text-primary">
        {{ row?.polyclinic?.name }}
      </span>
    </template>

    <template #cell-status="{ row }">
      <UIStatus v-if="row?.status?.id" :status="row?.status" />
      <UIStatus v-else :status="Utils.documentStatus[2]" />
    </template>

    <template #cell-start_date="{ row }">
      {{ Utils.timeOnlyDate(row?.start_date) }}
    </template>

    <template #cell-confirmation="{ row }">
      <UIStatus :status="row.confirmation" />
    </template>

    <template #cell-generate="{ row }">
      <UIStatus :status="Utils.documentStatus[row?.generate]" />
    </template>
  </UITable>
</template>

<style scoped></style>
