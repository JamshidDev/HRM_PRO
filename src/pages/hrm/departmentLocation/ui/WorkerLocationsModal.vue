<script setup>
  /**
   * Bitta xodimning o'tish joylari: ko'rish, tahrirlash, o'chirish, qo'shish.
   * Oyna sarlavhasida — xodimning F.I.Sh.; har joy — alohida karta
   * (nomi, turi, hudud), «Xaritada ko'rish» bosilsa karta ichida kichik xarita ochiladi.
   */
  import { UIModal, UIDeleteConfirm } from '@/components/index.js'
  import { useDepartmentLocationStore } from '@/store/modules/index.js'
  import { useAccountStore } from '@/store/modules/app/accountStore.js'
  import {
    Add16Filled,
    Edit16Regular,
    Delete16Regular,
    Map20Regular,
    ChevronUp16Regular,
    LocationOff20Regular
  } from '@vicons/fluent'
  import i18n from '@/i18n/index.js'
  import LocationMap from './LocationMap.vue'

  const { t } = i18n.global
  const store = useDepartmentLocationStore()
  const accStore = useAccountStore()
  const canWrite = computed(() => accStore.checkPermission(accStore.pn.departmentLocationWrite))
  const canDelete = computed(() => accStore.checkPermission(accStore.pn.departmentLocationDelete))

  const worker = computed(() => store.selectedWorker || {})
  const workerName = computed(() =>
    [worker.value.last_name, worker.value.first_name, worker.value.middle_name].filter(Boolean).join(' ')
  )

  const typeOf = (l) => (l.is_free ? 'free' : l.geo_type ? 'area' : 'point')
  const TYPE_CHIP = {
    free: 'bg-fig-chip-green text-fig-chip-green-text',
    area: 'bg-fig-chip-indigo text-fig-chip-indigo-text',
    point: 'bg-fig-chip-brand text-fig-chip-brand-text'
  }
  const typeLabel = (l) =>
    ({
      free: t('departmentLocationPage.freeBadge'),
      area: t('departmentLocationPage.form.area'),
      point: t('departmentLocationPage.form.coordinate')
    })[typeOf(l)]

  // Hudud matni: nuqtada — koordinata va radius, polygonda — nuqtalar soni.
  const shapeText = (l) => {
    const type = typeOf(l)
    if (type === 'free') return t('departmentLocationPage.form.freeModeHint')
    if (type === 'area') return t('departmentLocationPage.pointsCount', { n: (l.polygon || []).length })
    return `${Number(l.lat).toFixed(5)}, ${Number(l.lng).toFixed(5)} · ${l.radius} m`
  }

  // Bir vaqtda bitta xarita ochiq turadi (Leaflet og'ir).
  // O'chirishni tasdiqlash: qaysi joylashuv o'chirilishi kutilmoqda (null — oyna yopiq).
  const pendingDeleteId = ref(null)
  const confirmVisible = computed({
    get: () => pendingDeleteId.value !== null,
    set: (v) => {
      if (!v) pendingDeleteId.value = null
    }
  })
  const onConfirmDelete = () => {
    const id = pendingDeleteId.value
    pendingDeleteId.value = null
    if (id !== null) store._deleteWorkerLocation(id)
  }

  const openMapId = ref(null)
  const toggleMap = (l) => {
    openMapId.value = openMapId.value === l.id ? null : l.id
  }
  watch(
    () => store.workerLocVisible,
    (v) => {
      if (!v) openMapId.value = null
    }
  )
</script>

<template>
  <UIModal
    v-model:visible="store.workerLocVisible"
    :title="workerName || '—'"
    :width="680"
  >
    <div class="flex flex-col gap-3">
      <n-spin :show="store.workerLocationsLoading">
        <div class="flex flex-col gap-2 min-h-[80px]">
          <div
            v-for="l in store.workerLocations"
            :key="l.id"
            class="rounded-2xl border border-surface-line bg-surface-section"
          >
            <div class="flex items-center gap-3 px-4 py-3">
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2">
                  <span class="truncate font-medium text-textColor0">
                    <template v-if="l.name">{{ l.name }}</template>
                    <span v-else class="italic text-textColor3">
                      {{ l.is_free ? $t('departmentLocationPage.form.freeMode') : $t('departmentLocationPage.unnamed') }}
                    </span>
                  </span>
                  <span class="dl-type shrink-0" :class="TYPE_CHIP[typeOf(l)]">{{ typeLabel(l) }}</span>
                </div>
                <div class="mt-0.5 truncate text-xs text-textColor3">{{ shapeText(l) }}</div>
              </div>

              <n-button
                v-if="!l.is_free && l.lat != null"
                size="small"
                quaternary
                @click="toggleMap(l)"
              >
                <template #icon>
                  <n-icon>
                    <ChevronUp16Regular v-if="openMapId === l.id" />
                    <Map20Regular v-else />
                  </n-icon>
                </template>
                <span class="hidden sm:inline">
                  {{ openMapId === l.id ? $t('departmentLocationPage.hideMap') : $t('departmentLocationPage.showMap') }}
                </span>
              </n-button>
              <n-tooltip v-if="canWrite">
                <template #trigger>
                  <n-button size="small" quaternary circle @click="store.openWorkerEditModal(l)">
                    <template #icon><n-icon><Edit16Regular /></n-icon></template>
                  </n-button>
                </template>
                {{ $t('content.edit') }}
              </n-tooltip>
              <n-button
                v-if="canDelete"
                size="small"
                quaternary
                circle
                type="error"
                :loading="store.deletingLocationId === l.id"
                :disabled="store.deletingLocationId !== null && store.deletingLocationId !== l.id"
                @click="pendingDeleteId = l.id"
              >
                <template #icon><n-icon><Delete16Regular /></n-icon></template>
              </n-button>
            </div>

            <!-- Kichik xarita (faqat ko'rish) -->
            <div v-if="openMapId === l.id" class="h-[300px] overflow-hidden rounded-b-2xl border-t border-surface-line">
              <LocationMap
                :key="l.id"
                :lat="l.lat"
                :lng="l.lng"
                :radius="l.radius"
                :polygon="l.polygon || []"
                :geo-type="l.geo_type === true"
                :readonly="true"
              />
            </div>
          </div>

          <!-- Bo'sh holat -->
          <div
            v-if="!store.workerLocationsLoading && store.workerLocations.length === 0"
            class="flex flex-col items-center gap-2 py-6 text-center"
          >
            <span class="flex size-11 items-center justify-center rounded-2xl bg-fig-chip-amber text-fig-chip-amber-text">
              <n-icon size="22"><LocationOff20Regular /></n-icon>
            </span>
            <span class="font-medium text-textColor0">{{ $t('departmentLocationPage.emptyWorker') }}</span>
          </div>
        </div>
      </n-spin>

      <n-button
        v-if="canWrite"
        dashed
        block
        @click="store.openWorkerLocationModal(store.selectedWorker)"
      >
        <template #icon><n-icon><Add16Filled /></n-icon></template>
        {{ $t('departmentLocationPage.addLocation') }}
      </n-button>
    </div>
  </UIModal>

  <!-- Jadvallardagi kabi umumiy tasdiqlash oynasi -->
  <UIDeleteConfirm v-model:visible="confirmVisible" @confirm="onConfirmDelete" />
</template>

<style scoped>
  .dl-type {
    display: inline-flex;
    align-items: center;
    height: 22px;
    padding: 0 8px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 500;
    white-space: nowrap;
  }
</style>
