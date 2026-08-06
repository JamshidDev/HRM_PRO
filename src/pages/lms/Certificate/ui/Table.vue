<script setup>
  import { UIStatus, UITable, UIUser } from '@/components/index.js'
  import { useAccountStore, useLmsCertificateStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'
  import UIHelper from '@/utils/UIHelper.js'
  import Utils from '@/utils/Utils.js'
  import { Delete20Regular, Eye16Regular } from '@vicons/fluent'

  const { t } = i18n.global
  const store = useLmsCertificateStore()
  const accStore = useAccountStore()
  const emits = defineEmits(['openOffice'])

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  const onDelete = (row) => {
    if (!accStore.checkAction(accStore.pn.lmsCertificateWrite)) return
    store.elementId = row.id
    store._delete()
  }

  const onOpen = (id) => {
    emits('openOffice', id)
  }

  const onView = (row) => {
    if (!accStore.checkAction(accStore.pn.lmsCertificateRead)) return
    store.elementId = row.id
    onOpen(row.id)
  }

  const columns = computed(() => [
    {
      key: 'worker',
      title: t('content.worker'),
      minWidth: 260
    },
    {
      key: 'number',
      title: t('confirmation.contract.form.number'),
      width: 100,
      align: 'center'
    },
    {
      key: 'start_exam_result',
      title: t('lmsCertificate.form.start_exam_result'),
      width: 140,
      align: 'center'
    },
    {
      key: 'end_exam_result',
      title: t('lmsCertificate.form.end_exam_result'),
      width: 140,
      align: 'center'
    },
    {
      key: 'organization.name',
      title: t('confirmation.contract.form.organization'),
      minWidth: 260
    },
    {
      key: 'confirmation',
      title: t('content.status'),
      width: 140
    },
    {
      key: 'generate',
      title: t('content.document'),
      width: 140
    },
    {
      key: 'cert_from',
      title: t('content.from'),
      width: 120
    },
    {
      key: 'cert_to',
      title: t('content.to'),
      width: 120
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
      action: onDelete,
      visible: store.canShowFilter
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
    storage-key="lms-certificate"
    @change-page="changePage"
  >
    <template #cell-worker="{ row }">
      <UIUser
        :short="false"
        :data="{
          photo: row.worker?.photo,
          lastName: row.worker?.last_name,
          firstName: row.worker?.first_name,
          middleName: row.worker?.middle_name,
          position: row?.position?.name
        }"
      />
    </template>

    <template #cell-number="{ row }">
      <div @click="onOpen(row.id)" class="flex justify-center">
        <n-button type="primary" class="font-medium" round dashed size="tiny">
          {{ row.serial + '-' + row?.number }}
        </n-button>
      </div>
    </template>

    <template #cell-start_exam_result="{ row }">
      <n-button class="!mx-auto !w-fit !block" size="tiny">{{ row.start_exam_result }}</n-button>
    </template>

    <template #cell-end_exam_result="{ row }">
      <n-button class="!mx-auto !w-fit !block" size="tiny">{{ row.end_exam_result }}</n-button>
    </template>

    <template #cell-confirmation="{ row }">
      <UIStatus :status="row?.confirmation" />
    </template>

    <template #cell-generate="{ row }">
      <UIStatus :status="Utils.documentStatus[row?.generate]" />
    </template>

    <template #cell-cert_from="{ row }">
      {{ Utils.timeOnlyDate(row?.cert_from) }}
    </template>

    <template #cell-cert_to="{ row }">
      {{ Utils.timeOnlyDate(row?.cert_to) }}
    </template>
  </UITable>
</template>
