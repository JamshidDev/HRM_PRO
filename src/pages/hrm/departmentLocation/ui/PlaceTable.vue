<script setup>
  // Turniket lokatsiyalari: korxona doirasidagi qayta ishlatiladigan o'tish joylari; tahrir/o'chirish faqat egasida.
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
    LocationOff20Regular
  } from '@vicons/fluent'
  import CopyIcon from '@/assets/icons/copyIcon.svg'
  import i18n from '@/i18n/index.js'
  import PlaceViewModal from './PlaceViewModal.vue'

  const { t } = i18n.global
  const store = useDepartmentLocationStore()
  const accStore = useAccountStore()
  const canWrite = computed(() => accStore.checkPermission(accStore.pn.departmentLocationWrite))

  const viewId = ref(null)
  const viewVisible = ref(false)
  const onView = (row) => {
    viewId.value = row.id
    viewVisible.value = true
  }

  const changePage = (v) => {
    store.placeParams.page = v.page
    store.placeParams.per_page = v.per_page
    store._placeIndex()
  }

  const TYPE_CHIP = {
    area: 'bg-fig-chip-indigo text-fig-chip-indigo-text',
    point: 'bg-fig-chip-brand text-fig-chip-brand-text'
  }
  const typeOf = (row) => (row.geo_type ? 'area' : 'point')
  const coordsText = (row) => `${Number(row.lat).toFixed(6)}, ${Number(row.lng).toFixed(6)}`
  const copyCoords = (row) =>
    Utils.copyToClipboard(coordsText(row), () => $Toast.success(t('content.copied')))

  const columns = computed(() => [
    { key: 'name', title: t('departmentLocationPage.places.name'), minWidth: 200 },
    { key: 'geo_type', title: t('departmentLocationPage.table.geoType'), minWidth: 120 },
    { key: 'zone', title: t('departmentLocationPage.table.zone'), minWidth: 100 },
    { key: 'coords', title: t('departmentLocationPage.table.coords'), minWidth: 200 },
    {
      key: 'organization.name',
      title: t('departmentLocationPage.table.organization'),
      minWidth: 180
    },
    { key: 'attached', title: t('departmentLocationPage.places.attached'), minWidth: 160 },
    { key: 'owner', title: t('departmentLocationPage.places.owner'), minWidth: 160 }
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
      visible: (row) => row.can_edit,
      action: (row) => store.openPlaceModal(row)
    },
    {
      label: t('content.delete'),
      key: Utils.ActionTypes.delete,
      icon: UIHelper.renderIcon(Delete20Regular),
      visible: (row) => row.can_edit,
      action: (row) => store._deletePlace(row.id)
    }
  ])
</script>

<template>
  <div class="flex h-full flex-1 flex-col gap-3">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <span class="text-sm text-textColor3">{{ $t('departmentLocationPage.places.hint') }}</span>
      <n-button v-if="canWrite" type="primary" @click="store.openPlaceModal()">
        <template #icon>
          <n-icon><Add16Filled /></n-icon>
        </template>
        {{ $t('departmentLocationPage.places.add') }}
      </n-button>
    </div>

    <UITable
      class="flex-1"
      :columns="columns"
      :actions="actions"
      :data="store.placeList"
      :loading="store.placeLoading"
      :page="store.placeParams.page"
      :per-page="store.placeParams.per_page"
      :total="store.placeTotal"
      permission-prefix="department-location"
      @change-page="changePage"
    >
      <template #cell-name="{ row }">
        <n-ellipsis class="font-medium text-textColor0">{{ row.name }}</n-ellipsis>
      </template>

      <template #cell-geo_type="{ row }">
        <span class="dl-type" :class="TYPE_CHIP[typeOf(row)]">
          {{
            row.geo_type
              ? $t('departmentLocationPage.form.area')
              : $t('departmentLocationPage.form.coordinate')
          }}
        </span>
      </template>

      <template #cell-zone="{ row }">
        <span v-if="row.geo_type" class="text-textColor1">
          {{ $t('departmentLocationPage.pointsCount', { n: (row.polygon || []).length }) }}
        </span>
        <span v-else class="text-textColor1">{{ row.radius }} m</span>
      </template>

      <template #cell-coords="{ row }">
        <div class="flex min-w-0 items-center gap-1.5">
          <span class="truncate font-mono text-[13px] text-textColor1">{{ coordsText(row) }}</span>
          <n-icon
            size="16"
            class="shrink-0 cursor-pointer text-primary"
            :title="$t('departmentLocationPage.copyCoords')"
            @click.stop="copyCoords(row)"
          >
            <CopyIcon />
          </n-icon>
        </div>
      </template>

      <template #cell-attached="{ row }">
        <span v-if="!row.departments_count && !row.workers_count" class="text-textColor3">
          {{ $t('departmentLocationPage.places.notAttached') }}
        </span>
        <span v-else class="text-textColor1">
          {{
            $t('departmentLocationPage.places.attachedCount', {
              d: row.departments_count,
              w: row.workers_count
            })
          }}
        </span>
      </template>

      <template #cell-owner="{ row }">
        <n-ellipsis v-if="row.owner?.name" class="text-textColor1">{{ row.owner.name }}</n-ellipsis>
        <span v-else class="text-textColor3">—</span>
      </template>

      <template #empty>
        <div class="flex max-w-[360px] flex-col items-center gap-2 py-10 text-center">
          <span
            class="flex size-12 items-center justify-center rounded-2xl bg-fig-chip-amber text-fig-chip-amber-text"
          >
            <n-icon size="24"><LocationOff20Regular /></n-icon>
          </span>
          <span class="font-medium text-textColor0">{{
            $t('departmentLocationPage.places.empty')
          }}</span>
          <span class="text-sm text-textColor3">{{
            $t('departmentLocationPage.places.hint')
          }}</span>
        </div>
      </template>
    </UITable>

    <PlaceViewModal v-model:visible="viewVisible" :place-id="viewId" />
  </div>
</template>

<style scoped>
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
