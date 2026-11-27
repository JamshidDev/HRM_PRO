<script setup>
  import { safeUrl } from '@/utils/sanitize.js'
  import { UIChip, UIStatus, UITable, UIUser } from '@/components/index.js'
  import i18n from '@/i18n/index.js'
  import { useAccountStore, useMedStore } from '@/store/modules/index.js'
  import UIHelper from '@/utils/UIHelper.js'
  import Utils from '@/utils/Utils.js'
  import { Delete20Regular, DocumentPdf24Regular, Edit32Regular, Info16Regular } from '@vicons/fluent'

  const { t } = i18n.global

  const store = useMedStore()
  const accStore = useAccountStore()

  const onEdit = (v) => {
    if (!accStore.checkAction(accStore.pn.hrMedWrite)) return
    store.resetForm()
    store.elementId = v.id
    store.visibleType = false
    store.visible = true
    store._show((v) => {
      store.payload.from = Utils.datePickerFormatter(v.from)
      store.payload.to = Utils.datePickerFormatter(v.to)
      store.payload.comment = v.comment
      store.payload.status = v.status.id
      if (v?.file) {
        store.payload.file = [
          {
            id: 1,
            name: Utils.fileNameFromUrl(v?.file),
            file: null
          }
        ]
      }

      store.activeTab = 1
      store.payload.organization_id = [v.organization]
    })
  }

  const onDelete = (v) => {
    if (!accStore.checkAction(accStore.pn.hrMedWrite)) return
    store.elementId = v.id
    store._delete()
  }

  // Fayl — ilova ichidagi ko'rish oynasida (yangi tabda emas), boshqa sahifalardagi kabi.
  const onViewFile = (row) => {
    const url = safeUrl(row.file)
    if (!url) return
    const ext = url.split('?')[0].split('.').pop().toLowerCase()
    window.$MediaViewer.showMediaViewer(url, ext, { title: Utils.fileNameFromUrl(row.file) })
  }

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  // `days` — backend hisoblaydi: manfiy = ko'rik muddati o'tgan, musbat = qolgan kunlar.
  const SOON_DAYS = 30
  const isExpired = (row) => Number(row?.days) < 0
  const daysLabel = (row) => {
    const n = Math.abs(Number(row?.days) || 0)
    return isExpired(row) ? t('medPage.form.daysOverdue', { n }) : t('medPage.form.daysLeft', { n })
  }
  // «Holati» ⓘ matni: muddati o'tganda — asl xulosa; izoh bo'lsa — izoh.
  const statusHint = (row) =>
    [
      isExpired(row) && row.status?.name && t('medPage.form.conclusion', { name: row.status.name }),
      row.comment && `${t('medPage.form.comment')}: ${row.comment}`
    ].filter(Boolean)

  const daysClass = (row) => {
    if (isExpired(row)) return 'text-fig-text-red'
    return Number(row?.days) <= SOON_DAYS ? 'text-fig-chip-amber-text' : 'text-textColor1'
  }

  // Tartib: kim → qayerda → xulosa → muddat → necha kun qoldi. Izoh — «Holati» yonidagi ⓘ hover'da.
  // Hamma ustun qat'iy kenglikda — bo'sh joy proporsional taqsimlanadi (bitta moslashuvchan ustun
  // butun bo'sh joyni olib cho'zilib ketmasin). Fayl — qatordagi amallar menyusida.
  const columns = computed(() => [
    {
      key: 'worker',
      title: t('confirmationPage.table.worker'),
      width: 300,
      minWidth: 220,
      maxWidth: 520
    },
    { key: 'organization.name', title: t('medPage.form.organization'), width: 240 },
    { key: 'status', title: t('medPage.form.status'), width: 170 },
    { key: 'period', title: t('medPage.form.expiry'), width: 210 },
    { key: 'days', title: t('date.day'), width: 200 }
  ])

  const actions = computed(() => [
    {
      label: t('content.file'),
      key: 'file',
      icon: UIHelper.renderIcon(DocumentPdf24Regular),
      visible: (row) => !!row?.file,
      action: onViewFile
    },
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
  <UITable
    permission-prefix="hr-med"
    :columns="columns"
    :actions="actions"
    :data="store.list"
    :loading="store.loading"
    :page="store.params.page"
    :per-page="store.params.per_page"
    :total="store.totalItems"
    storage-key="hrm-med-v4"
    @change-page="changePage"
  >
    <template #cell-worker="{ row }">
      <div class="min-w-0">
        <UIUser
          :data="{
            photo: row?.worker.photo,
            firstName: row?.worker.first_name,
            middleName: row?.worker.middle_name,
            lastName: row?.worker.last_name,
            position: row?.position
          }"
        />
      </div>
    </template>

    <template #cell-status="{ row }">
      <!-- Muddati o'tgan ko'rik: shifokor xulosasi (masalan «Sog'lom») endi amal qilmaydi — holat «Muddati o'tgan»,
           xulosa ⓘ hover'da (DAS-14226). Izoh (faqat «Yaroqsiz» da yoziladi) ham shu ⓘ da. Bitta qator. -->
      <div class="flex items-center gap-1.5">
        <UIStatus
          v-if="isExpired(row)"
          :status="{ name: $t('medPage.form.expired'), id: 7 }"
        />
        <UIStatus v-else :status="{ name: row.status?.name, id: row.status?.id === 1 ? 6 : 8 }" />
        <n-tooltip v-if="statusHint(row).length" :style="{ maxWidth: '360px' }">
          <template #trigger>
            <n-icon size="16" class="shrink-0 cursor-help text-fig-text-tertiary">
              <Info16Regular />
            </n-icon>
          </template>
          <div v-for="(line, i) in statusHint(row)" :key="i">{{ line }}</div>
        </n-tooltip>
      </div>
    </template>

    <!-- Kun — oddiy matn (Muddati ustunidagi sanalar kabi), rang: o'tgan qizil, ≤30 kun sariq.
         Ta'tildagi xodim — kun ustida ko'k chip (eski joyi) «… gacha ta'tilda» (foydalanuvchilar so'radi: kulrang matn ko'rinmasdi). -->
    <template #cell-days="{ row }">
      <div class="flex flex-col items-start gap-1 leading-tight">
        <UIChip
          v-if="row.vacation"
          tone="brand"
          :label="`${Utils.timeOnlyDate(row.vacation)} ${$t('medPage.form.onVacation')}`"
        />
        <span class="whitespace-nowrap tabular-nums font-medium" :class="daysClass(row)">
          {{ daysLabel(row) }}
        </span>
      </div>
    </template>

    <!-- «qachondan – qachongacha» bitta qatorda, oddiy matn (Guvohnomalar jadvalidagi kabi) -->
    <template #cell-period="{ row }">
      <span class="whitespace-nowrap tabular-nums text-textColor1">
        {{ [Utils.timeOnlyDate(row.from), Utils.timeOnlyDate(row.to)].filter(Boolean).join(' – ') }}
      </span>
    </template>
  </UITable>
</template>
