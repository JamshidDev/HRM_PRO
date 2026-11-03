<script setup>
  /**
   * Bitta bo'limning o'tish joylari («Bo'limlar» → bo'lim → joylar).
   * Tepada breadcrumb (Bo'limlar › bo'lim nomi) va «Joylashuv qo'shish»; jadvalda faqat
   * kerakli ustunlar: nomi, turi, hudud (radius / nuqtalar soni), koordinata (nusxalanadi), aniqlik.
   * Bo'lim va tashkilot ustunlari olib tashlandi — ular breadcrumb'da ko'rinadi.
   */
  import { UITable } from '@/components/index.js'
  import { useDepartmentLocationStore } from '@/store/modules/index.js'
  import { useAccountStore } from '@/store/modules/app/accountStore.js'
  import Utils from '@/utils/Utils.js'
  import UIHelper from '@/utils/UIHelper.js'
  import {
    Add16Filled,
    Eye16Regular,
    Edit32Regular,
    Delete20Regular,
    ChevronRight16Regular,
    LocationOff20Regular
  } from '@vicons/fluent'
  import CopyIcon from '@/assets/icons/copyIcon.svg'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global

  const store = useDepartmentLocationStore()
  const accStore = useAccountStore()
  const canWrite = computed(() => accStore.checkPermission(accStore.pn.departmentLocationWrite))

  const department = computed(() => store.selectedDepartment)
  // Tashkilot: bo'limlar ro'yxatidan ochilganda — `organization.name`; joylar ro'yxatining
  // birinchi qatoridan ham olinadi (sahifa yangilanib bo'lim kelmay qolsa).
  const organizationName = computed(
    () => department.value?.organization?.name || store.locationList[0]?.organization?.name || ''
  )

  const hasTypeFilter = computed(
    () => store.locationParams.geo_type !== null || store.locationParams.is_free !== null
  )

  const onAdd = () => {
    if (department.value) store.openLocationModal(department.value)
  }

  const onView = (item) => {
    store.openViewModal(item)
  }

  const onEdit = (item) => {
    store.openEditModal(item)
  }

  const onDelete = (item) => {
    store.elementId = item.id
    store._delete()
  }

  const changePage = (v) => {
    store.locationParams.page = v.page
    store.locationParams.per_page = v.per_page
    store._locationIndex()
  }

  // Joy turi: erkin / hudud (polygon) / nuqta (marker + radius).
  const typeOf = (row) => (row.is_free ? 'free' : row.geo_type ? 'area' : 'point')
  const TYPE_CHIP = {
    free: 'bg-fig-chip-green text-fig-chip-green-text',
    area: 'bg-fig-chip-indigo text-fig-chip-indigo-text',
    point: 'bg-fig-chip-brand text-fig-chip-brand-text'
  }
  const typeLabel = (row) =>
    ({
      free: t('departmentLocationPage.freeBadge'),
      area: t('departmentLocationPage.form.area'),
      point: t('departmentLocationPage.form.coordinate')
    })[typeOf(row)]

  const coordsText = (row) =>
    row.lat == null || row.lng == null ? '' : `${Number(row.lat).toFixed(6)}, ${Number(row.lng).toFixed(6)}`

  // Loyihadagi umumiy nusxalash (ishchi profili bilan bir xil): `Utils.copyToClipboard` + toast.
  const copyCoords = (row) => {
    Utils.copyToClipboard(coordsText(row), () => $Toast.success(t('content.copied')))
  }

  // BACKEND: GET /v1/extra/department/locations qatorida yaratilgan sana (`created_at`) yo'q —
  // shuning uchun «Sana» ustuni olib tashlandi. Qo'shilsa, ustunni qaytarish mumkin.
  // Hamma ustun moslashuvchan (`minWidth`): ortiqcha joy ustunlar o'rtasida teng bo'linadi,
  // bitta ustun hammasini olib, orada katta bo'shliq qolmaydi.
  // «Hudud»: nuqtada — radius, polygonda — nuqtalar soni (polygonda radius ishlatilmaydi —
  // formada ham faqat nuqta rejimida so'raladi).
  const columns = computed(() => [
    { key: 'name', title: t('departmentLocationPage.table.name'), minWidth: 180 },
    { key: 'geo_type', title: t('departmentLocationPage.table.geoType'), minWidth: 130 },
    { key: 'zone', title: t('departmentLocationPage.table.zone'), minWidth: 110 },
    { key: 'coords', title: t('departmentLocationPage.table.coords'), minWidth: 200 },
    { key: 'accuracy_limit', title: t('departmentLocationPage.table.accuracy'), minWidth: 90 }
  ])

  const actions = computed(() => [
    {
      label: t('content.view'),
      key: Utils.ActionTypes.view,
      icon: UIHelper.renderIcon(Eye16Regular),
      action: onView
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
  <div class="flex h-full flex-1 flex-col gap-3">
    <!-- Breadcrumb: Bo'limlar › bo'lim nomi (tashkilot) + Joylashuv qo'shish -->
    <div class="flex flex-wrap items-center gap-x-3 gap-y-2">
      <nav class="flex min-w-0 flex-1 items-center gap-1.5 text-sm" aria-label="breadcrumb">
        <button type="button" class="dl-crumb" @click="store.backToDepartments()">
          {{ $t('departmentLocationPage.tabs.departments') }}
        </button>
        <n-icon size="14" class="shrink-0 text-textColor3"><ChevronRight16Regular /></n-icon>
        <div class="flex min-w-0 flex-col">
          <span class="truncate font-semibold text-textColor0">{{ department?.name || '—' }}</span>
          <span v-if="organizationName" class="truncate text-xs text-textColor3">{{ organizationName }}</span>
        </div>
      </nav>
      <n-button v-if="canWrite && department" type="primary" @click="onAdd">
        <template #icon>
          <n-icon><Add16Filled /></n-icon>
        </template>
        {{ $t('departmentLocationPage.addLocation') }}
      </n-button>
    </div>

    <UITable
      class="flex-1"
      :columns="columns"
      :actions="actions"
      :data="store.locationList"
      :loading="store.locationLoading"
      :page="store.locationParams.page"
      :per-page="store.locationParams.per_page"
      :total="store.locationTotalItems"
      permission-prefix="department-location"
      @change-page="changePage"
    >
      <template #cell-name="{ row }">
        <n-ellipsis v-if="row.name" class="text-textColor0">{{ row.name }}</n-ellipsis>
        <span v-else class="text-textColor3 italic">{{ $t('departmentLocationPage.unnamed') }}</span>
      </template>

      <template #cell-geo_type="{ row }">
        <span class="dl-type" :class="TYPE_CHIP[typeOf(row)]">{{ typeLabel(row) }}</span>
      </template>

      <!-- Hudud: nuqtada — radius, polygonda — nuqtalar soni, erkin rejimda yo'q -->
      <template #cell-zone="{ row }">
        <span v-if="typeOf(row) === 'free'" class="text-textColor3">—</span>
        <span v-else-if="typeOf(row) === 'area'" class="text-textColor1">
          {{ $t('departmentLocationPage.pointsCount', { n: (row.polygon || []).length }) }}
        </span>
        <span v-else class="text-textColor1">{{ row.radius }} m</span>
      </template>

      <template #cell-coords="{ row }">
        <span v-if="row.is_free || !coordsText(row)" class="text-textColor3">—</span>
        <!-- Jadvaldagi yagona bosiladigan element (Shahriyor so'rovi): koordinatani nusxalash -->
        <!-- Ko'rinishi ishchi profilidagi nusxalash ikonkasi bilan bir xil (`WorkerStatsGrid.vue`) -->
        <div v-else class="flex min-w-0 items-center gap-1.5">
          <span class="truncate font-mono text-[13px] text-textColor1">{{ coordsText(row) }}</span>
          <n-icon
            size="16"
            class="cursor-pointer text-primary shrink-0"
            :title="$t('departmentLocationPage.copyCoords')"
            @click.stop="copyCoords(row)"
          >
            <CopyIcon />
          </n-icon>
        </div>
      </template>

      <template #cell-accuracy_limit="{ row }">
        <span v-if="row.is_free" class="text-textColor3">—</span>
        <span v-else class="text-textColor1">{{ row.accuracy_limit }}</span>
      </template>

      <template #empty>
        <div class="flex max-w-[360px] flex-col items-center gap-2 py-10 text-center">
          <span class="flex size-12 items-center justify-center rounded-2xl bg-fig-chip-amber text-fig-chip-amber-text">
            <n-icon size="24"><LocationOff20Regular /></n-icon>
          </span>
          <span class="font-medium text-textColor0">
            {{ hasTypeFilter ? $t('departmentLocationPage.emptyFiltered') : $t('departmentLocationPage.emptyDepartment') }}
          </span>
          <span v-if="!hasTypeFilter" class="text-sm text-textColor3">
            {{ $t('departmentLocationPage.emptyDepartmentHint') }}
          </span>
          <n-button v-if="canWrite && department && !hasTypeFilter" class="mt-2" type="primary" @click="onAdd">
            <template #icon>
              <n-icon><Add16Filled /></n-icon>
            </template>
            {{ $t('departmentLocationPage.addLocation') }}
          </n-button>
        </div>
      </template>
    </UITable>
  </div>
</template>

<style scoped>
  .dl-crumb {
    flex-shrink: 0;
    border: 0;
    background: transparent;
    padding: 2px 4px;
    margin-left: -4px;
    border-radius: 6px;
    color: var(--primary-color);
    font-weight: 500;
    cursor: pointer;
  }

  .dl-crumb:hover,
  .dl-crumb:focus-visible {
    background: color-mix(in srgb, var(--primary-color) 10%, transparent);
    outline: none;
  }

  .dl-type {
    display: inline-flex;
    align-items: center;
    height: 24px;
    padding: 0 10px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 500;
    white-space: nowrap;
  }
</style>
