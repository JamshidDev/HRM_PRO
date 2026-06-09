<script setup>
  import { UIModal, UIBadge } from '@/components/index.js'
  import { useDepartmentLocationStore } from '@/store/modules/index.js'
  import LocationMap from './LocationMap.vue'
  import {
    Location20Filled,
    Map20Filled,
    Navigation20Regular,
    Circle20Regular,
    TargetArrow20Regular,
    CalendarLtr20Regular,
    Building20Regular
  } from '@vicons/fluent'
  import Utils from '@/utils/Utils.js'

  const store = useDepartmentLocationStore()
  const data = computed(() => store.viewData)
</script>

<template>
  <UIModal
    v-model:visible="store.viewVisible"
    :title="$t('departmentLocationPage.viewTitle')"
    :width="960"
    height="80vh"
  >
    <n-spin :show="store.viewLoading" content-class="min-h-[200px]">
      <div v-if="data" class="flex flex-col lg:flex-row gap-4" style="height: calc(80vh - 80px)">

        <!-- Left side -->
        <div class="w-full lg:w-[300px] shrink-0 flex flex-col gap-3 overflow-y-auto">

          <!-- Department card -->
          <div v-if="data.department" class="rounded-xl border border-surface-line bg-surface-50 p-4 flex flex-col gap-3">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
                <n-icon size="20" color="white">
                  <Building20Regular />
                </n-icon>
              </div>
              <div class="flex flex-col min-w-0">
                <span class="text-sm font-semibold text-textColor0 line-clamp-2 leading-[1.3]">
                  {{ data.department.name }}
                </span>
                <span class="text-xs text-textColor3 line-clamp-1 leading-[1.3] mt-0.5">
                  {{ data.department.organization_name }}
                </span>
              </div>
            </div>
          </div>

          <!-- Info cards -->
          <div class="rounded-xl border border-surface-line overflow-hidden">

                    <!-- Geo type -->
            <div class="info-row border-b border-surface-line">
              <div class="info-label-col">
                <n-icon size="15" class="shrink-0"><Map20Filled /></n-icon>
                <span>{{ $t('departmentLocationPage.form.geoType') }}</span>
              </div>
              <div class="info-value-col">
                <UIBadge
                  class="!w-auto"
                  :show-icon="false"
                  :label="data.geo_type ? $t('departmentLocationPage.form.area') : $t('departmentLocationPage.form.coordinate')"
                  :type="data.geo_type ? Utils.colorTypes.dark : Utils.colorTypes.primary"
                />
              </div>
            </div>

            <!-- Lat -->
            <div class="info-row border-b border-surface-line">
              <div class="info-label-col">
                <n-icon size="15" class="shrink-0"><Location20Filled /></n-icon>
                <span>{{ $t('departmentLocationPage.form.lat') }}</span>
              </div>
              <span class="info-value-col">{{ data.lat }}</span>
            </div>

            <!-- Lng -->
            <div class="info-row border-b border-surface-line">
              <div class="info-label-col">
                <n-icon size="15" class="shrink-0"><Navigation20Regular /></n-icon>
                <span>{{ $t('departmentLocationPage.form.lng') }}</span>
              </div>
              <span class="info-value-col">{{ data.lng }}</span>
            </div>

            <!-- Radius (only marker mode) -->
            <div v-if="!data.geo_type" class="info-row border-b border-surface-line">
              <div class="info-label-col">
                <n-icon size="15" class="shrink-0"><Circle20Regular /></n-icon>
                <span>{{ $t('departmentLocationPage.form.radius') }}</span>
              </div>
              <div class="info-value-col">
                <UIBadge
                  class="!w-auto"
                  :show-icon="false"
                  :label="data.radius + ' m'"
                  :type="Utils.colorTypes.info"
                />
              </div>
            </div>

            <!-- Accuracy -->
            <div class="info-row border-b border-surface-line">
              <div class="info-label-col">
                <n-icon size="15" class="shrink-0"><TargetArrow20Regular /></n-icon>
                <span>{{ $t('departmentLocationPage.form.accuracy') }}</span>
              </div>
              <span class="info-value-col">{{ data.accuracy_limit }}</span>
            </div>

            <!-- Date -->
            <div class="info-row">
              <div class="info-label-col">
                <n-icon size="15" class="shrink-0"><CalendarLtr20Regular /></n-icon>
                <span>{{ $t('content.date') }}</span>
              </div>
              <span class="info-value-col">{{ Utils.timeOnlyDate(data.create_at) }}</span>
            </div>

          </div>
        </div>

        <!-- Right side - Map (readonly) -->
        <div class="flex-1 h-full">
          <LocationMap
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

<style scoped>
.info-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  padding: 9px 14px;
  background: white;
  gap: 8px;
}

.info-label-col {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--n-text-color-3, #9ca3af);
  font-size: 12px;
  white-space: nowrap;
}

.info-value-col {
  font-size: 13px;
  font-weight: 500;
  color: var(--n-text-color, #1f2937);
  text-align: right;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}
</style>
