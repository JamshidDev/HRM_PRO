<script setup>
  import { ref, computed, watch, getCurrentInstance } from 'vue'
  import { UIModal } from '@/components/index.js'
  import { useComponentStore, useDepartmentLocationStore } from '@/store/modules/index.js'
  import LocationMap from './LocationMap.vue'
  import {
    Map20Filled,
    Dismiss16Regular,
    Location20Filled,
    Person20Filled,
    Building20Regular,
    CheckmarkCircle20Regular,
    Warning20Regular
  } from '@vicons/fluent'

  const { proxy } = getCurrentInstance()
  const store = useDepartmentLocationStore()
  const componentStore = useComponentStore()

  // Bo'lim jadval qatoridan emas, jadval sarlavhasidagi "+" orqali ochilganda
  // oldindan tanlanmagan bo'ladi — shunda uni shu formaning o'zida tanlaymiz.
  const needDepartment = computed(
    () => store.target === 'department' && store.visibleType && !store.selectedDepartment
  )
  const isWorker = computed(() => store.target === 'worker')
  const isFree = computed(() => store.payload.is_free === true)
  const workerName = computed(() =>
    [store.selectedWorker?.last_name, store.selectedWorker?.first_name, store.selectedWorker?.middle_name]
      .filter(Boolean)
      .join(' ')
  )

  watch(
    () => store.visible,
    (v) => {
      if (v && needDepartment.value && componentStore.departmentList.length === 0) {
        componentStore._departments()
      }
    }
  )

  const mapRef = ref(null)
  const formRef = ref(null)

  // Rejim almashganda eski (endi majburiy bo'lmagan) maydon xatolari qolmasin.
  watch(
    () => store.payload.is_free,
    () => formRef.value?.restoreValidation()
  )

  const rules = computed(() => ({
    department_id: {
      required: needDepartment.value,
      // `type: 'number'` emas: backend id'ni satr sifatida ham qaytarishi mumkin.
      validator: (_rule, value) => value !== null && value !== undefined && value !== '',
      message: proxy.$t('departmentLocationPage.validation.departmentRequired'),
      trigger: ['blur', 'change']
    },
    name: {
      required: !isFree.value,
      validator: (_rule, value) => isFree.value || !!value?.trim(),
      message: proxy.$t('departmentLocationPage.validation.nameRequired'),
      trigger: ['blur', 'input']
    },
    lat: {
      required: !isFree.value,
      type: 'number',
      message: proxy.$t('departmentLocationPage.validation.markerRequired'),
      trigger: ['blur', 'change']
    },
    lng: {
      required: !isFree.value,
      type: 'number',
      message: proxy.$t('departmentLocationPage.validation.markerRequired'),
      trigger: ['blur', 'change']
    },
    radius: {
      required: !isFree.value,
      type: 'number',
      message: proxy.$t('departmentLocationPage.validation.radiusRequired'),
      trigger: ['blur', 'change']
    },
    accuracy_limit: {
      required: !isFree.value && !isWorker.value,
      type: 'number',
      message: proxy.$t('departmentLocationPage.validation.accuracyRequired'),
      trigger: ['blur', 'change']
    }
  }))

  const onSubmit = () => {
    formRef.value?.validate((errors) => {
      if (errors) {
        return
      }

      if (!isFree.value && store.payload.geo_type) {
        if (!store.payload.polygon || store.payload.polygon.length < 3) {
          window.$message?.warning(proxy.$t('departmentLocationPage.validation.polygonRequired'))
          return
        }
      }

      if (store.visibleType) {
        store._create()
      } else {
        store._update()
      }
    })
  }

  const onCancel = () => {
    store.visible = false
  }

  const updateLat = (val) => {
    store.payload.lat = val
  }

  const updateLng = (val) => {
    store.payload.lng = val
  }

  const updatePolygon = (val) => {
    store.payload.polygon = val
  }

  const clearPolygon = () => {
    store.payload.polygon = []
    store.payload.lat = null
    store.payload.lng = null
    if (mapRef.value) {
      mapRef.value.clearPolygon()
    }
  }
</script>

<template>
  <UIModal
    v-model:visible="store.visible"
    :title="
      store.visibleType
        ? $t('departmentLocationPage.createTitle')
        : $t('departmentLocationPage.updateTitle')
    "
    width="95%"
    height="90vh"
  >
    <n-spin :show="store.showLoading" class="h-full">
      <div class="flex flex-col lg:flex-row gap-5 h-full">
        <!-- Left side - Form column with pinned actions -->
        <div class="w-full lg:w-[360px] shrink-0 flex flex-col h-full min-h-0">
          <!-- Scrollable fields area -->
          <div class="flex-1 overflow-y-auto pr-1 flex flex-col gap-3">
            <!-- Tanlangan xodim kartasi -->
            <div
              v-if="isWorker && store.selectedWorker"
              class="flex items-center gap-3 p-3 rounded-xl bg-primary/10 border border-primary/20"
            >
              <div class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
                <n-icon size="20"><Person20Filled /></n-icon>
              </div>
              <div class="flex flex-col min-w-0">
                <span class="text-sm font-semibold text-textColor0 truncate leading-tight">{{ workerName }}</span>
                <span class="text-xs text-textColor3 truncate mt-0.5">{{ store.selectedWorker.organization?.name }}</span>
              </div>
            </div>

            <!-- Tanlangan bo'lim kartasi -->
            <div
              v-if="!isWorker && store.selectedDepartment"
              class="flex items-center gap-3 p-3 rounded-xl bg-primary/10 border border-primary/20"
            >
              <div class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
                <n-icon size="20"><Building20Regular /></n-icon>
              </div>
              <div class="flex flex-col min-w-0">
                <span class="text-sm font-semibold text-textColor0 truncate leading-tight">{{ store.selectedDepartment.name }}</span>
                <span class="text-xs text-textColor3 truncate mt-0.5">{{ store.selectedDepartment.organization?.name }}</span>
              </div>
            </div>

            <n-form
              ref="formRef"
              :model="store.payload"
              :rules="rules"
              label-placement="top"
              size="medium"
              require-mark-placement="right-hanging"
              class="flex flex-col gap-2.5"
            >
              <!-- Bo'lim tanlash (faqat bo'lim oldindan berilmaganda) -->
              <n-form-item
                v-if="needDepartment"
                :label="$t('departmentLocationPage.form.department')"
                path="department_id"
                class="!mb-1"
              >
                <n-select
                  v-model:value="store.payload.department_id"
                  :options="componentStore.departmentList"
                  :loading="componentStore.departmentLoading"
                  :placeholder="$t('departmentLocationPage.form.department')"
                  label-field="name"
                  value-field="id"
                  filterable
                  remote
                  clearable
                  size="large"
                  @search="componentStore._onSearchDepartment"
                  @scroll="componentStore._onScrollDepartment"
                  @update:show="componentStore.onOpenDepartmentEv"
                />
              </n-form-item>

              <!-- O'tish joyi nomi: mobil ilovada shu nom bilan chiqadi -->
              <n-form-item
                v-if="!isFree"
                :label="$t('departmentLocationPage.form.name')"
                path="name"
                class="!mb-1"
              >
                <n-input
                  v-model:value="store.payload.name"
                  :placeholder="$t('departmentLocationPage.form.namePlaceholder')"
                  :maxlength="255"
                  clearable
                  size="large"
                />
              </n-form-item>

              <!-- Erkin rejim: hudud cheklovi yo'q, faqat koordinata yoziladi -->
              <div class="rounded-xl border border-surface-line bg-surface-section p-3 transition-all">
                <div class="flex items-center justify-between gap-3">
                  <div class="flex flex-col">
                    <span class="text-sm font-medium text-textColor0">{{ $t('departmentLocationPage.form.freeMode') }}</span>
                    <span class="text-xs text-textColor3 leading-relaxed">{{ $t('departmentLocationPage.form.freeModeHint') }}</span>
                  </div>
                  <n-switch v-model:value="store.payload.is_free" size="medium" />
                </div>
              </div>

              <template v-if="!isFree">
                <!-- Geo Type Card -->
                <div class="rounded-xl border border-surface-line bg-surface-section p-3">
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-medium text-textColor1">{{ $t('departmentLocationPage.form.geoType') }}</span>
                    <n-switch v-model:value="store.payload.geo_type" size="medium">
                      <template #checked>{{ $t('departmentLocationPage.form.area') }}</template>
                      <template #unchecked>{{ $t('departmentLocationPage.form.coordinate') }}</template>
                    </n-switch>
                  </div>
                </div>

                <!-- Polygon status banner (when geo_type = true) -->
                <template v-if="store.payload.geo_type">
                  <div
                    class="rounded-xl border p-3 transition-all"
                    :class="{
                      'bg-success/10 border-success/30': store.payload.polygon.length >= 3,
                      'bg-warning/10 border-warning/30': store.payload.polygon.length > 0 && store.payload.polygon.length < 3,
                      'bg-danger/10 border-danger/30': store.payload.polygon.length === 0
                    }"
                  >
                    <div class="flex items-center justify-between gap-2">
                      <div class="flex items-center gap-2.5 min-w-0">
                        <div
                          class="flex size-8 shrink-0 items-center justify-center rounded-lg"
                          :class="{
                            'bg-success/20 text-success': store.payload.polygon.length >= 3,
                            'bg-warning/20 text-warning': store.payload.polygon.length > 0 && store.payload.polygon.length < 3,
                            'bg-danger/20 text-danger': store.payload.polygon.length === 0
                          }"
                        >
                          <n-icon size="16">
                            <CheckmarkCircle20Regular v-if="store.payload.polygon.length >= 3" />
                            <Warning20Regular v-else-if="store.payload.polygon.length > 0" />
                            <Map20Filled v-else />
                          </n-icon>
                        </div>
                        <div class="flex flex-col min-w-0">
                          <span class="text-xs font-semibold text-textColor0">{{ $t('departmentLocationPage.form.area') }}</span>
                          <span class="text-xs text-textColor3 truncate">
                            <template v-if="store.payload.polygon.length === 0">
                              {{ $t('departmentLocationPage.form.noPolygon') }}
                            </template>
                            <template v-else-if="store.payload.polygon.length < 3">
                              {{ $t('departmentLocationPage.validation.minPoints') }}
                            </template>
                            <template v-else>
                              {{ $t('departmentLocationPage.form.polygonReady') }} ({{ store.payload.polygon.length }})
                            </template>
                          </span>
                        </div>
                      </div>
                      <n-button
                        v-if="store.payload.polygon.length > 0"
                        size="tiny"
                        secondary
                        type="error"
                        round
                        @click="clearPolygon"
                      >
                        <template #icon>
                          <n-icon size="14">
                            <Dismiss16Regular />
                          </n-icon>
                        </template>
                      </n-button>
                    </div>
                  </div>
                </template>

                <!-- Radius (only for marker mode) -->
                <n-form-item
                  v-if="!store.payload.geo_type"
                  :label="$t('departmentLocationPage.form.radius')"
                  path="radius"
                  class="!mb-1"
                >
                  <n-input-number
                    v-model:value="store.payload.radius"
                    :min="1"
                    :max="5000"
                    class="w-full"
                    size="large"
                  >
                    <template #suffix>m</template>
                  </n-input-number>
                </n-form-item>

                <!-- Lat/Lng fields (both modes) -->
                <div class="rounded-xl border border-surface-line bg-surface-section p-3">
                  <div class="text-xs font-medium text-textColor3 mb-2 flex items-center gap-1.5">
                    <n-icon size="14" class="text-primary"><Location20Filled /></n-icon>
                    <span>{{ $t('departmentLocationPage.form.coordinate') }}</span>
                  </div>
                  <div class="grid grid-cols-2 gap-2">
                    <n-form-item :label="$t('departmentLocationPage.form.lat')" path="lat" :show-feedback="false" class="!mb-0">
                      <n-input-number
                        v-model:value="store.payload.lat"
                        :precision="6"
                        :step="0.000001"
                        class="w-full"
                        size="medium"
                      />
                    </n-form-item>

                    <n-form-item :label="$t('departmentLocationPage.form.lng')" path="lng" :show-feedback="false" class="!mb-0">
                      <n-input-number
                        v-model:value="store.payload.lng"
                        :precision="6"
                        :step="0.000001"
                        class="w-full"
                        size="medium"
                      />
                    </n-form-item>
                  </div>
                </div>

                <!-- Accuracy limit -->
                <n-form-item
                  v-if="!isWorker"
                  :label="$t('departmentLocationPage.form.accuracy')"
                  path="accuracy_limit"
                  class="!mb-1"
                >
                  <n-input-number
                    v-model:value="store.payload.accuracy_limit"
                    :min="1"
                    :max="100"
                    class="w-full"
                    size="large"
                  >
                    <template #suffix>m</template>
                  </n-input-number>
                </n-form-item>
              </template>
            </n-form>
          </div>

          <!-- Pinned Action buttons (always visible) -->
          <div class="flex items-center gap-3 pt-3 border-t border-surface-line shrink-0 mt-2 bg-surface-section">
            <n-button size="large" class="flex-1" round @click="onCancel">
              {{ $t('content.cancel') }}
            </n-button>
            <n-button type="primary" size="large" class="flex-1 shadow-sm" round :loading="store.saveLoading" @click="onSubmit">
              {{ $t('content.save') }}
            </n-button>
          </div>
        </div>

        <!-- Right side - Map -->
        <div class="flex-1 h-full min-h-[420px] rounded-2xl overflow-hidden border border-surface-line bg-surface-ground">
          <div
            v-if="isFree"
            class="h-full flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-surface-line bg-surface-section text-center p-8 m-3"
          >
            <div class="flex size-16 items-center justify-center rounded-2xl bg-success/10 text-success">
              <n-icon size="36"><Location20Filled /></n-icon>
            </div>
            <span class="text-base font-semibold text-textColor0">{{ $t('departmentLocationPage.form.freeMode') }}</span>
            <span class="text-sm text-textColor3 max-w-[420px] leading-relaxed">{{ $t('departmentLocationPage.form.freeModeHint') }}</span>
          </div>
          <LocationMap
            v-else-if="!store.showLoading"
            ref="mapRef"
            :key="store.elementId"
            :lat="store.payload.lat"
            :lng="store.payload.lng"
            :radius="store.payload.radius"
            :polygon="store.payload.polygon"
            :geo-type="store.payload.geo_type"
            @update:lat="updateLat"
            @update:lng="updateLng"
            @update:polygon="updatePolygon"
          />
        </div>
      </div>
    </n-spin>
  </UIModal>
</template>
