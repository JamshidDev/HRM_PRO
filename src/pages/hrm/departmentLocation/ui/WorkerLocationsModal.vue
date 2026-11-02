<script setup>
  // Bitta xodimning o'tish joylari: ko'rish, tahrirlash, o'chirish, qo'shish.
  import { UIModal } from '@/components/index.js'
  import { useDepartmentLocationStore } from '@/store/modules/index.js'
  import { useAccountStore } from '@/store/modules/app/accountStore.js'
  import Utils from '@/utils/Utils.js'
  import { Add16Filled, Edit16Regular, Delete16Regular } from '@vicons/fluent'

  const store = useDepartmentLocationStore()
  const accStore = useAccountStore()
  const canWrite = computed(() => accStore.checkPermission(accStore.pn.departmentLocationWrite))
  const canDelete = computed(() => accStore.checkPermission(accStore.pn.departmentLocationDelete))

  const shapeText = (l) => {
    if (l.is_free) return null
    if (l.geo_type) return `${(l.polygon || []).length} nuqta`
    return `${Number(l.lat).toFixed(5)}, ${Number(l.lng).toFixed(5)} · ${l.radius} m`
  }
</script>

<template>
  <UIModal
    v-model:visible="store.workerLocVisible"
    :title="Utils.combineFullName(store.selectedWorker || {})"
    :width="640"
  >
    <n-spin :show="store.workerLocationsLoading">
      <div class="flex flex-col gap-2">
        <div
          v-for="l in store.workerLocations"
          :key="l.id"
          class="flex items-center gap-3 rounded-xl border border-surface-line bg-surface-section px-4 py-3"
        >
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <span class="font-medium text-textColor0 truncate">
                {{ l.name || (l.is_free ? $t('departmentLocationPage.form.freeMode') : '—') }}
              </span>
              <n-tag v-if="l.is_free" size="small" round type="success">
                {{ $t('departmentLocationPage.freeBadge') }}
              </n-tag>
              <n-tag v-else size="small" round>
                {{ l.geo_type ? $t('departmentLocationPage.form.area') : $t('departmentLocationPage.form.coordinate') }}
              </n-tag>
            </div>
            <div class="text-xs text-textColor3 mt-0.5">
              {{ l.is_free ? $t('departmentLocationPage.form.freeModeHint') : shapeText(l) }}
            </div>
          </div>
          <n-button v-if="canWrite" size="small" quaternary circle @click="store.openWorkerEditModal(l)">
            <template #icon><n-icon><Edit16Regular /></n-icon></template>
          </n-button>
          <n-popconfirm v-if="canDelete" @positive-click="store._deleteWorkerLocation(l.id)">
            <template #trigger>
              <n-button size="small" quaternary circle type="error" :loading="store.deleteLoading">
                <template #icon><n-icon><Delete16Regular /></n-icon></template>
              </n-button>
            </template>
            {{ $t('content.confirmDelete') }}
          </n-popconfirm>
        </div>
        <div
          v-if="!store.workerLocationsLoading && store.workerLocations.length === 0"
          class="py-6 text-center text-textColor3"
        >
          {{ $t('departmentLocationPage.noLocation') }}
        </div>
        <n-button
          v-if="canWrite"
          class="mt-2"
          dashed
          @click="store.openWorkerLocationModal(store.selectedWorker)"
        >
          <template #icon><n-icon><Add16Filled /></n-icon></template>
          {{ $t('content.add') }}
        </n-button>
      </div>
    </n-spin>
  </UIModal>
</template>
