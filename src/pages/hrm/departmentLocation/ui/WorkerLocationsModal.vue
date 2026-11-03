<script setup>
  // Bitta xodimning o'tish joylari: ko'rish, tahrirlash, o'chirish, qo'shish.
  import { computed } from 'vue'
  import { UIModal } from '@/components/index.js'
  import { useDepartmentLocationStore } from '@/store/modules/index.js'
  import { useAccountStore } from '@/store/modules/app/accountStore.js'
  import Utils from '@/utils/Utils.js'
  import {
    Add16Filled,
    Edit16Regular,
    Delete16Regular,
    Location20Filled,
    Map20Filled,
    Person20Filled,
    CheckmarkCircle20Regular
  } from '@vicons/fluent'

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
    :title="$t('departmentLocationPage.tabs.locations')"
    :width="640"
  >
    <n-spin :show="store.workerLocationsLoading">
      <div class="flex flex-col gap-3">
        <!-- Worker Profile Header -->
        <div
          v-if="store.selectedWorker"
          class="flex items-center gap-3 p-3 rounded-xl bg-primary/10 border border-primary/20"
        >
          <div class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
            <n-icon size="20"><Person20Filled /></n-icon>
          </div>
          <div class="flex flex-col min-w-0">
            <span class="text-sm font-semibold text-textColor0 truncate leading-tight">
              {{ Utils.combineFullName(store.selectedWorker || {}) }}
            </span>
            <span class="text-xs text-textColor3 truncate mt-0.5">
              {{ store.selectedWorker.department?.name || store.selectedWorker.organization?.name || '' }}
            </span>
          </div>
        </div>

        <!-- Locations List -->
        <div class="flex flex-col gap-2">
          <div
            v-for="l in store.workerLocations"
            :key="l.id"
            class="group flex items-center gap-3 rounded-xl border border-surface-line bg-surface-section px-4 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all hover:border-primary/40 hover:shadow-sm"
          >
            <div
              class="flex size-9 shrink-0 items-center justify-center rounded-lg"
              :class="l.is_free ? 'bg-success/10 text-success' : l.geo_type ? 'bg-info/10 text-info' : 'bg-primary/10 text-primary'"
            >
              <n-icon size="18">
                <CheckmarkCircle20Regular v-if="l.is_free" />
                <Map20Filled v-else-if="l.geo_type" />
                <Location20Filled v-else />
              </n-icon>
            </div>

            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="font-medium text-textColor0 truncate text-sm">
                  {{ l.name || (l.is_free ? $t('departmentLocationPage.form.freeMode') : '—') }}
                </span>
                <n-tag v-if="l.is_free" size="small" round type="success" class="gap-1 font-medium">
                  <template #icon><n-icon size="12"><CheckmarkCircle20Regular /></n-icon></template>
                  {{ $t('departmentLocationPage.freeBadge') }}
                </n-tag>
                <n-tag v-else-if="l.geo_type" size="small" round type="info" class="gap-1 font-medium">
                  <template #icon><n-icon size="12"><Map20Filled /></n-icon></template>
                  {{ $t('departmentLocationPage.form.area') }}
                </n-tag>
                <n-tag v-else size="small" round :bordered="false" class="bg-primary/10 text-primary gap-1 font-medium">
                  <template #icon><n-icon size="12"><Location20Filled /></n-icon></template>
                  {{ $t('departmentLocationPage.form.coordinate') }}
                </n-tag>
              </div>
              <div class="text-xs text-textColor3 mt-0.5">
                {{ l.is_free ? $t('departmentLocationPage.form.freeModeHint') : shapeText(l) }}
              </div>
            </div>

            <div class="flex items-center gap-1">
              <n-button v-if="canWrite" size="small" quaternary circle @click="store.openWorkerEditModal(l)">
                <template #icon><n-icon size="16"><Edit16Regular /></n-icon></template>
              </n-button>
              <n-popconfirm v-if="canDelete" @positive-click="store._deleteWorkerLocation(l.id)">
                <template #trigger>
                  <n-button size="small" quaternary circle type="error" :loading="store.deleteLoading">
                    <template #icon><n-icon size="16"><Delete16Regular /></n-icon></template>
                  </n-button>
                </template>
                {{ $t('content.confirmDelete') }}
              </n-popconfirm>
            </div>
          </div>

          <!-- Empty state -->
          <div
            v-if="!store.workerLocationsLoading && store.workerLocations.length === 0"
            class="flex flex-col items-center justify-center py-10 px-4 rounded-xl border border-dashed border-surface-line bg-surface-section text-center"
          >
            <div class="flex size-12 items-center justify-center rounded-xl bg-surface-ground text-textColor3 mb-2">
              <n-icon size="24"><Location20Filled /></n-icon>
            </div>
            <p class="text-sm text-textColor3">
              {{ $t('departmentLocationPage.noLocation') }}
            </p>
          </div>

          <n-button
            v-if="canWrite"
            class="mt-2"
            type="primary"
            dashed
            round
            @click="store.openWorkerLocationModal(store.selectedWorker)"
          >
            <template #icon><n-icon><Add16Filled /></n-icon></template>
            {{ $t('content.add') }}
          </n-button>
        </div>
      </div>
    </n-spin>
  </UIModal>
</template>
