<script setup>
  import { Edit32Regular, Delete20Regular, ArrowSync16Regular, ArrowUndo16Regular } from '@vicons/fluent'
  import { UITable, UIProfileSection, UIProfileEmpty, UIFileDownload, UIChip, UIStatus } from '@/components/index.js'
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
    store.payload.verify = !!v.verify
    store.payload.returned = !!v.returned
    store.payload.file = v.file ? { name: v.file } : null
    store.visible = true
  }

  const onDelete = (v) => {
    store.elementId = v.id
    store._delete()
  }

  // Ixcham jadval: lavozim kesiladi («…»), to'liq matn va tafsilotlar — hover tooltip'da.
  // Hamma ustun qat'iy kenglikda — bo'sh joy ular orasida mutanosib bo'linadi («Lavozim» hammasini olmaydi).
  // «|» bilan sudrab o'zgartirish chegaralari: minWidth / maxWidth (lavozim — 1000px gacha).
  // Sanalar bitta «Muddati» ustuniga, tasdiq/qaytarish — bitta «Holati» chipiga yig'ilgan.
  const columns = computed(() => [
    { key: 'post_name', title: t('workerPositionCertificatePage.form.postName'), width: 400, minWidth: 260, maxWidth: 1000 },
    { key: 'number', title: t('workerPositionCertificatePage.form.numberShort'), width: 130, minWidth: 100, maxWidth: 220 },
    { key: 'period', title: t('workerPositionCertificatePage.form.period'), width: 210, minWidth: 180, maxWidth: 320 },
    { key: 'status', title: t('workerPositionCertificatePage.form.status'), width: 170, minWidth: 140, maxWidth: 260 },
    { key: 'file', title: t('content.file'), width: 100, minWidth: 80, maxWidth: 160 }
  ])

  // Muddat oxiri: uzaytirilgan bo'lsa — uzaytirilgan sana
  const endDate = (row) => row.extended_date || row.expiry_date

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

      <template #cell-post_name="{ row }">
        <n-tooltip placement="top-start" :style="{ maxWidth: '380px' }">
          <template #trigger>
            <span class="block truncate">{{ row.post_name }}</span>
          </template>
          <div class="font-semibold mb-1">{{ row.post_name }}</div>
          <div class="text-xs opacity-90 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5">
            <span>{{ $t('workerPositionCertificatePage.form.number') }}:</span>
            <span>{{ row.number || '—' }}</span>
            <span>{{ $t('workerPositionCertificatePage.form.issueDate') }}:</span>
            <span>{{ Utils.timeOnlyDate(row.issue_date) }}</span>
            <span>{{ $t('workerPositionCertificatePage.form.expiryDate') }}:</span>
            <span>{{ Utils.timeOnlyDate(row.expiry_date) }}</span>
            <template v-if="row.extended_date">
              <span>{{ $t('workerPositionCertificatePage.form.extendedDate') }}:</span>
              <span>{{ Utils.timeOnlyDate(row.extended_date) }}</span>
            </template>
          </div>
        </n-tooltip>
      </template>

      <template #cell-period="{ row }">
        <span class="inline-flex items-center gap-1 whitespace-nowrap">
          {{ Utils.timeOnlyDate(row.issue_date) }} – {{ Utils.timeOnlyDate(endDate(row)) }}
          <!-- Uzaytirilgan — kichik belgi, sana tafsiloti lavozim tooltip'ida -->
          <n-icon v-if="row.extended_date" :size="14" color="var(--primary-color)">
            <ArrowSync16Regular />
          </n-icon>
        </span>
      </template>

      <template #cell-status="{ row }">
        <UIChip v-if="row.returned" tone="warning" :icon="ArrowUndo16Regular">
          {{ $t('workerPositionCertificatePage.form.returned') }}
        </UIChip>
        <UIStatus
          v-else-if="row.verify"
          :status="{ id: 3, name: $t('workerPositionCertificatePage.form.verify') }"
        />
        <span v-else class="text-textColor3">—</span>
      </template>

      <template #cell-file="{ row }">
        <UIFileDownload :file="row.file" />
      </template>
    </UITable>
  </UIProfileSection>
</template>
