<script setup>
  import { Edit32Regular, Delete20Regular } from '@vicons/fluent'
  import { UITable, UIProfileSection, UIProfileEmpty, UIFileDownload } from '@/components/index.js'
  import { useWorkerPositionCertificateStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import UIHelper from '@/utils/UIHelper.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const store = useWorkerPositionCertificateStore()

  const onAdd = () => {
    store.visibleType = true
    store.resetForm()
    store.visible = true
  }

  const onEdit = (v) => {
    store.visibleType = false
    store.elementId = v.id
    // post_name muzlagan — tahrirda faqat ko'rsatiladi (read-only), yuborilmaydi.
    store.payload.post_name = v.post_name
    store.payload.number = v.number
    store.payload.issue_date = v.issue_date
    store.payload.expiry_date = v.expiry_date
    store.payload.extended_date = v.extended_date
    // verify/returned formada YO'Q — jadvalda ko'rsatiladi, tahrirda o'zgartirilmaydi.
    store.payload.file = v.file ? { name: v.file } : null
    store.visible = true
  }

  const onDelete = (v) => {
    store.elementId = v.id
    store._delete()
  }

  const columns = computed(() => [
    { key: 'post_name', title: t('workerPositionCertificatePage.form.postName'), minWidth: 220 },
    { key: 'number', title: t('workerPositionCertificatePage.form.number'), width: 120 },
    { key: 'issue_date', title: t('workerPositionCertificatePage.form.issueDate'), width: 130 },
    { key: 'expiry_date', title: t('workerPositionCertificatePage.form.expiryDate'), width: 130 },
    {
      key: 'extended_date',
      title: t('workerPositionCertificatePage.form.extendedDate'),
      width: 140
    },
    {
      key: 'verify',
      title: t('workerPositionCertificatePage.form.verify'),
      width: 100,
      align: 'center'
    },
    {
      key: 'returned',
      title: t('workerPositionCertificatePage.form.returned'),
      width: 110,
      align: 'center'
    },
    { key: 'file', title: t('content.file'), width: 90 }
  ])

  // Faqat o'z korxonasi guvohnomasi tahrirlanadi (backend `editable`)
  const actions = computed(() => [
    {
      label: t('content.edit'),
      key: Utils.ActionTypes.edit,
      icon: UIHelper.renderIcon(Edit32Regular),
      visible: (row) => Boolean(row.editable),
      action: onEdit
    },
    {
      label: t('content.delete'),
      key: Utils.ActionTypes.delete,
      icon: UIHelper.renderIcon(Delete20Regular),
      visible: (row) => Boolean(row.editable),
      action: onDelete
    }
  ])
</script>

<template>
  <UIProfileSection :title="$t('workerPositionCertificatePage.title')" @add="onAdd">
    <UITable
      auto-height
      :columns="columns"
      :actions="actions"
      :data="store.list"
      :loading="store.loading"
    >
      <template #empty><UIProfileEmpty /></template>

      <template #cell-issue_date="{ value }">{{ Utils.timeOnlyDate(value) }}</template>
      <template #cell-expiry_date="{ value }">{{ Utils.timeOnlyDate(value) }}</template>
      <template #cell-extended_date="{ value }">
        {{ value ? Utils.timeOnlyDate(value) : '—' }}
      </template>

      <template #cell-verify="{ value }">
        <n-tag :type="value ? 'success' : 'default'" size="small" round>
          {{ value ? $t('content.yes') : $t('content.no') }}
        </n-tag>
      </template>

      <template #cell-returned="{ value }">
        <n-tag :type="value ? 'warning' : 'default'" size="small" round>
          {{ value ? $t('content.yes') : $t('content.no') }}
        </n-tag>
      </template>

      <template #cell-file="{ row }">
        <UIFileDownload :file="row.file" />
      </template>
    </UITable>
  </UIProfileSection>
</template>
