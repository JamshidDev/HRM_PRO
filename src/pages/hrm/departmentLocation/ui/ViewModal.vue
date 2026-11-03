<script setup>
  import { computed } from 'vue'
  import { UIModal } from '@/components/index.js'
  import { useDepartmentLocationStore } from '@/store/modules/index.js'
  import LocationMap from './LocationMap.vue'
  import {
    Location20Filled,
    Map20Filled,
    Navigation20Regular,
    Circle20Regular,
    TargetArrow20Regular,
    CalendarLtr20Regular,
    Building20Regular,
    CheckmarkCircle20Regular
  } from '@vicons/fluent'
  import Utils from '@/utils/Utils.js'

  const store = useDepartmentLocationStore()
  const data = computed(() => store.viewData)
</script>

<template>
  <UIModal
    v-model:visible="store.viewVisible"
    :title="$t('departmentLocationPage.viewTitle')"
    :width="980"
    height="85vh"
  >
    <n-spin :show="store.viewLoading" content-class="h-full min-h-[300px]">
      <div v-if="data" class="flex flex-col lg:flex-row gap-5 h-full">
        <!-- Left side - Details -->
        <div class="w-full lg:w-[320px] shrink-0 flex flex-col gap-3.5 overflow-y-auto pr-1">
          <!-- Department card -->
          <div
            v-if="data.department"
            class="flex items-center gap-3 p-3.5 rounded-xl bg-primary/10 border border-primary/20"
          >
            <div class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
              <n-icon size="20"><Building20Regular /></n-icon>
            </div>
            <div class="flex flex-col min-w-0">
              <span class="text-sm font-semibold text-textColor0 line-clamp-2 leading-tight">
                {{ data.department.name }}
              </span>
              <span class="text-xs text-textColor3 line-clamp-1 mt-0.5">
                {{ data.department.organization_name }}
              </span>
            </div>
          </div>

          <!-- Info list card -->
          <div class="rounded-xl border border-surface-line bg-surface-section overflow-hidden divide-y divide-surface-line shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
            <!-- Joylashuv nomi -->
            <div class="flex items-center justify-between p-3 gap-3">
              <div class="flex items-center gap-2 text-xs text-textColor3">
                <n-icon size="15" class="text-primary shrink-0"><Location20Filled /></n-icon>
                <span>{{ $t('departmentLocationPage.form.name') }}</span>
              </div>
              <span class="text-sm font-semibold text-textColor0 text-right truncate">
                {{ data.name || '—' }}
              </span>
            </div>

            <!-- Geo type -->
            <div class="flex items-center justify-between p-3 gap-3">
              <div class="flex items-center gap-2 text-xs text-textColor3">
                <n-icon size="15" class="text-primary shrink-0"><Map20Filled /></n-icon>
                <span>{{ $t('departmentLocationPage.form.geoType') }}</span>
              </div>
              <div>
                <n-tag v-if="data.is_free" size="small" round type="success" class="gap-1 font-medium">
                  <template #icon><n-icon size="13"><CheckmarkCircle20Regular /></n-icon></template>
                  {{ $t('departmentLocationPage.form.freeMode') }}
                </n-tag>
                <n-tag
                  v-else-if="data.geo_type"
                  size="small"
                  round
                  type="info"
                  class="gap-1 font-medium"
                >
                  <template #icon><n-icon size="13"><Map20Filled /></n-icon></template>
                  {{ $t('departmentLocationPage.form.area') }}
                </n-tag>
                <n-tag
                  v-else
                  size="small"
                  round
                  :bordered="false"
                  class="bg-primary/10 text-primary gap-1 font-medium"
                >
                  <template #icon><n-icon size="13"><Location20Filled /></n-icon></template>
                  {{ $t('departmentLocationPage.form.coordinate') }}
                </n-tag>
              </div>
            </div>

            <!-- Erkin rejimda koordinata, radius va aniqlik yo'q -->
            <template v-if="!data.is_free">
              <!-- Lat -->
              <div class="flex items-center justify-between p-3 gap-3">
                <div class="flex items-center gap-2 text-xs text-textColor3">
                  <n-icon size="15" class="text-primary shrink-0"><Location20Filled /></n-icon>
                  <span>{{ $t('departmentLocationPage.form.lat') }}</span>
                </div>
                <span class="font-mono text-xs font-semibold text-textColor0 bg-surface-ground px-1.5 py-0.5 rounded">
                  {{ data.lat }}
                </span>
              </div>

              <!-- Lng -->
              <div class="flex items-center justify-between p-3 gap-3">
                <div class="flex items-center gap-2 text-xs text-textColor3">
                  <n-icon size="15" class="text-primary shrink-0"><Navigation20Regular /></n-icon>
                  <span>{{ $t('departmentLocationPage.form.lng') }}</span>
                </div>
                <span class="font-mono text-xs font-semibold text-textColor0 bg-surface-ground px-1.5 py-0.5 rounded">
                  {{ data.lng }}
                </span>
              </div>

              <!-- Radius (only marker mode) -->
              <div v-if="!data.geo_type" class="flex items-center justify-between p-3 gap-3">
                <div class="flex items-center gap-2 text-xs text-textColor3">
                  <n-icon size="15" class="text-primary shrink-0"><Circle20Regular /></n-icon>
                  <span>{{ $t('departmentLocationPage.form.radius') }}</span>
                </div>
                <n-tag size="small" round :bordered="false" class="font-mono text-xs bg-info/10 text-info font-medium">
                  {{ data.radius }} m
                </n-tag>
              </div>

              <!-- Accuracy -->
              <div class="flex items-center justify-between p-3 gap-3">
                <div class="flex items-center gap-2 text-xs text-textColor3">
                  <n-icon size="15" class="text-primary shrink-0"><TargetArrow20Regular /></n-icon>
                  <span>{{ $t('departmentLocationPage.form.accuracy') }}</span>
                </div>
                <span class="font-mono text-xs font-semibold text-textColor0">
                  {{ data.accuracy_limit }} m
                </span>
              </div>
            </template>

            <!-- Date -->
            <div class="flex items-center justify-between p-3 gap-3">
              <div class="flex items-center gap-2 text-xs text-textColor3">
                <n-icon size="15" class="text-primary shrink-0"><CalendarLtr20Regular /></n-icon>
                <span>{{ $t('content.date') }}</span>
              </div>
              <span class="text-xs text-textColor1 font-medium">
                {{ Utils.timeOnlyDate(data.create_at) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Right side - Map (readonly, full height) -->
        <div class="flex-1 h-full min-h-[420px] rounded-2xl overflow-hidden border border-surface-line bg-surface-ground">
          <div
            v-if="data.is_free"
            class="h-full flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-surface-line bg-surface-section text-center p-8 m-3"
          >
            <div class="flex size-16 items-center justify-center rounded-2xl bg-success/10 text-success">
              <n-icon size="36"><Location20Filled /></n-icon>
            </div>
            <span class="text-base font-semibold text-textColor0">{{ $t('departmentLocationPage.form.freeMode') }}</span>
            <span class="text-sm text-textColor3 max-w-[420px] leading-relaxed">{{ $t('departmentLocationPage.form.freeModeHint') }}</span>
          </div>
          <LocationMap
            v-else
            :key="data.id"
            :lat="data.lat"
            :lng="data.lng"
            :radius="data.radius"
            :polygon="data.polygon || []"
            :geo-type="data.geo_type"
            :readonly="true"
          />
        </div>
      </div>
    </n-spin>
  </UIModal>
</template>
