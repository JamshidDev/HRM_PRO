<script setup>
  import { NoDataPicture, UIStatus, UITable, UIUser } from '@/components/index.js'
  import i18n from '@/i18n'
  import { useVacationScheduleStore } from '@/store/modules/index.js'
  import UIHelper from '@/utils/UIHelper.js'
  import Utils from '@/utils/Utils.js'
  import { useAccountStore } from '@stores'
  import { Delete20Regular, Edit32Regular, Eye16Regular } from '@vicons/fluent'

  const t = i18n.global.t

  const store = useVacationScheduleStore()
  const accStore = useAccountStore()

  // Hujjat yo'q: «Ko'rish» grafik ichini (to'liq ekranli drawer) ochadi.
  const onShow = (v) => {
    if (!accStore.checkAction(accStore.pn.hrVacationScheduleRead)) return
    store.openGrid(v.id)
  }

  // Sarlavha: sana, rahbar, kasaba uyushmasi, tuzuvchi.
  const onEdit = (v) => {
    if (!accStore.checkAction(accStore.pn.hrVacationScheduleWrite)) return
    store.elementId = v.id
    store.creator.list = [
      {
        id: v.creator.id,
        name: Utils.combineFullName(v.creator.worker),
        photo: v.creator.worker?.photo,
        position: v.creator.position
      }
    ]

    // Rahbar va kasaba raisi select'da nomi bilan ko'rinsin (ro'yxatda bo'lmasa ham).
    store.headerPeople = [v.director, v.tradeUnion].filter(Boolean).map((p) => ({
      id: p.id,
      photo: p.worker?.photo,
      last_name: p.worker?.last_name ?? '',
      first_name: p.worker?.first_name ?? '',
      middle_name: p.worker?.middle_name ?? '',
      fullName: Utils.combineFullName(p.worker),
      position: p.position
    }))
    store.payload.year = v.year
    store.payload.date = Utils.datePickerFormatter(v.date)
    store.payload.director_id = v?.director?.id
    store.payload.trade_union_id = v?.tradeUnion?.id
    store.payload.creator_id = v?.creator?.id
    store.visibleType = false
    store.visible = true
  }

  // Tasdiq oynasini UITable o'zi ko'rsatadi (matni — `deleteWarning`); bu yerga tasdiqlangandan keyin keladi.
  const onDelete = (v) => {
    if (!accStore.checkAction(accStore.pn.hrVacationScheduleDelete)) return
    store.elementId = v.id
    store._delete()
  }

  const deleteWarning = (row) =>
    row
      ? t('vacationSchedule.deleteConfirm', {
          year: row.year,
          organization: row.organization?.name || ''
        })
      : null

  // Ism qismlari — `undefined` matn bo'lib chiqmasligi uchun bo'sh qator.
  const person = (p) => ({
    photo: p?.worker?.photo,
    firstName: p?.worker?.first_name ?? '',
    middleName: p?.worker?.middle_name ?? '',
    lastName: p?.worker?.last_name ?? ''
  })

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  // Muhimlik tartibida: qaysi yil, qaysi tashkilot, qachon, qaysi holatda — keyin imzolovchilar.
  const columns = computed(() => [
    { key: 'year', title: t('content.year'), minWidth: 80 },
    { key: 'organization.name', title: t('content.organization'), minWidth: 240 },
    { key: 'date', title: t('vacationSchedule.form.to_date'), minWidth: 120 },
    { key: 'confirmation', title: t('content.status'), minWidth: 140 },
    { key: 'director', title: t('documentPage.command.form.director_id'), minWidth: 180 },
    { key: 'tradeUnion', title: t('vacationSchedule.form.tradeUnion'), minWidth: 180 },
    { key: 'creator', title: t('vacationSchedule.grid.creator'), minWidth: 180 }
  ])

  const actions = computed(() => [
    {
      label: t('content.view'),
      key: Utils.ActionTypes.view,
      icon: UIHelper.renderIcon(Eye16Regular),
      action: onShow
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
    permission-prefix="hr-vacation-schedule"
    :columns="columns"
    :actions="actions"
    :delete-warning="deleteWarning"
    :data="store.list"
    :loading="store.loading"
    :page="store.params.page"
    :per-page="store.params.per_page"
    :total="store.totalItems"
    storage-key="hrm-vacation-schedule-v2"
    @change-page="changePage"
  >
    <!-- Qidiruv/filtrsiz bo'sh bo'lsa — «topilmadi» emas, «hali yaratilmagan» -->
    <template #empty>
      <NoDataPicture
        :title="store.searched ? null : $t('vacationSchedule.empty')"
        :hint="store.searched ? null : $t('vacationSchedule.emptyHint')"
      />
    </template>

    <template #cell-year="{ row }">
      <span class="font-semibold text-textColor0">{{ row.year }}</span>
    </template>

    <template #[`cell-organization.name`]="{ row }">
      <span class="text-textColor1">{{ row.organization?.name }}</span>
    </template>

    <template #cell-date="{ row }">
      <span class="tabular-nums text-textColor1">{{ Utils.timeOnlyDate(row.date) }}</span>
    </template>

    <template #cell-confirmation="{ row }">
      <UIStatus v-if="row.confirmation" fig :tooltip="false" :status="row.confirmation" />
    </template>

    <template #cell-director="{ row }">
      <UIUser :data="person(row.director)" short />
    </template>

    <template #cell-tradeUnion="{ row }">
      <UIUser :data="person(row.tradeUnion)" short />
    </template>

    <template #cell-creator="{ row }">
      <UIUser :data="person(row.creator)" short />
    </template>
  </UITable>
</template>
