<script setup>
  import { UITable, UIProfileSection, UIProfileEmpty, UIFileDownload } from '@/components/index.js'
  import { Edit32Regular, Delete20Regular } from '@vicons/fluent'
  import { useLanguageCertificateStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import UIHelper from '@/utils/UIHelper.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global

  const store = useLanguageCertificateStore()

  const onAdd = () => {
    store.visibleType = true
    store.resetForm()
    store.visible = true
  }

  const onEdit = (v) => {
    store.visibleType = false
    store.elementId = v.id
    store.payload.language_id = v.language?.id ?? null
    store.payload.certificate_type = v.certificate_type?.id ?? null
    store.payload.cefr_level = v.cefr_level
    store.payload.score = v.score
    store.payload.certificate_number = v.certificate_number
    store.payload.issue_date = v.issue_date
    store.payload.expiry_date = v.expiry_date
    store.payload.file = { name: v.file }
    store.visible = true
  }

  const onDelete = (v) => {
    store.elementId = v.id
    store._delete()
  }

  const onDownload = (v) => {
    window.open(v.file, '_blank')
  }

  const columns = computed(() => [
    {
      key: 'language.name',
      title: t('languageCertificatePage.form.language'),
      minWidth: 90
    },
    {
      key: 'certificate_type.name',
      title: t('languageCertificatePage.form.type'),
      minWidth: 160
    },
    {
      key: 'cefr_level',
      title: t('languageCertificatePage.form.cefr'),
      width: 120
    },
    {
      key: 'score',
      title: t('languageCertificatePage.form.score'),
      width: 120
    },
    {
      key: 'issue_date',
      title: t('languageCertificatePage.form.issueDate'),
      width: 120
    },
    {
      key: 'expiry_date',
      title: t('languageCertificatePage.form.expiryDate'),
      width: 120
    },
    {
      key: 'file',
      title: t('content.file'),
      width: 140
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
    }
  ])
</script>

<template>
  <UIProfileSection :title="$t('languageCertificatePage.title')" @add="onAdd">
    <UITable
      auto-height
      :columns="columns"
      :actions="actions"
      :data="store.list"
      :loading="store.loading"
    >
      <template #empty><UIProfileEmpty /></template>

      <template #cell-cefr_level="{ value }">
        <n-tag v-if="value" size="small" type="info" round>
          {{ value }}
        </n-tag>
      </template>

      <template #cell-issue_date="{ value }">
        <span class="text-sm">{{ Utils.timeOnlyDate(value) }}</span>
      </template>

      <template #cell-expiry_date="{ row }">
        <!-- Muddati tugaganini server hisoblaydi (is_expired). Bo'sh = muddatsiz. -->
        <n-tag v-if="row.is_expired" size="small" type="error" round>
          {{ Utils.timeOnlyDate(row.expiry_date) }}
        </n-tag>
        <span v-else-if="row.expiry_date" class="text-sm">{{
          Utils.timeOnlyDate(row.expiry_date)
        }}</span>
        <span v-else class="text-xs text-gray-400">
          {{ $t('languageCertificatePage.unlimited') }}
        </span>
      </template>

      <template #cell-file="{ row }">
        <UIFileDownload :file="row.file" />
      </template>
    </UITable>
  </UIProfileSection>
</template>

<style scoped></style>
