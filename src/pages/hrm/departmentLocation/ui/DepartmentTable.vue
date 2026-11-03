<script setup>
  import { UITable, UIHighlight } from '@/components/index.js'
  import { useDepartmentLocationStore } from '@/store/modules/index.js'
  import { useAccountStore } from '@/store/modules/app/accountStore.js'
  import { Add16Filled, Eye16Regular } from '@vicons/fluent'
  import UIHelper from '@/utils/UIHelper.js'
  import Utils from '@/utils/Utils.js'
  import i18n from '@/i18n/index.js'
  import LocationCountChip from './LocationCountChip.vue'

  const { t } = i18n.global

  const store = useDepartmentLocationStore()
  const accStore = useAccountStore()

  const canWrite = computed(() => accStore.checkPermission(accStore.pn.departmentLocationWrite))

  // BACKEND: GET /v1/extra/department/list qatorida joy faqat `location: true/false` bo'lib keladi —
  // soni yo'q, shuning uchun jadvalda «Joy bor» yoziladi. `locations_count` (soni) va `free`
  // (bo'limda erkin rejimli joy bormi) qo'shilsa, chipda «3 ta joylashuv» va «Erkin» chiqadi.
  // Eski shakllar (`locations` massivi / `location` obyekti) ham qo'llab-quvvatlanadi.
  const locationCount = (row) => {
    if (typeof row?.locations_count === 'number') return row.locations_count
    if (Array.isArray(row?.locations)) return row.locations.length
    return null
  }
  const hasLocation = (row) => {
    const n = locationCount(row)
    return n !== null ? n > 0 : Boolean(row?.location)
  }

  const onOpenLocation = (row) => {
    store.openAttach(row)
  }

  const onAddLocation = (row) => {
    store.openLocationModal(row)
  }

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  const columns = computed(() => [
    {
      key: 'name',
      title: t('departmentLocationPage.table.department'),
      minWidth: 240
    },
    {
      key: 'organization.name',
      title: t('departmentLocationPage.table.organization'),
      minWidth: 200
    },
    {
      key: 'locations',
      title: t('departmentLocationPage.table.hasLocation'),
      minWidth: 200
    }
  ])

  // O'chirish bu yerda yo'q: bo'limda bir nechta joy bo'lishi mumkin — kerakli joy
  // «Ko'rish» → joylar ro'yxatida o'chiriladi (u yerda tasdiqlash oynasi bor).
  const actions = computed(() => [
    {
      label: t('content.view'),
      key: Utils.ActionTypes.view,
      icon: UIHelper.renderIcon(Eye16Regular),
      visible: (row) => hasLocation(row),
      action: onOpenLocation
    },
    {
      label: t('departmentLocationPage.addLocation'),
      key: 'add',
      icon: UIHelper.renderIcon(Add16Filled),
      disabled: !canWrite.value,
      action: onAddLocation
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
    permission-prefix="department-location"
    @change-page="changePage"
  >
    <template #cell-name="{ row }">
      <div class="flex min-w-0 flex-col">
        <span class="truncate text-textColor0">
          <UIHighlight :text="row.name" :query="store.params.search" />
        </span>
        <span v-if="row.level?.name" class="truncate text-xs text-textColor3">{{ row.level.name }}</span>
      </div>
    </template>
    <template #cell-locations="{ row }">
      <LocationCountChip
        :count="locationCount(row)"
        :has="hasLocation(row)"
        :free="Boolean(row.free)"
      />
    </template>
  </UITable>
</template>
