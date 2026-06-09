<script setup>
  import { ref, computed, getCurrentInstance } from 'vue'
  import { UIModal } from '@/components/index.js'
  import { useDepartmentLocationStore } from '@/store/modules/index.js'
  import LocationMap from './LocationMap.vue'
  import { Map20Filled, Dismiss16Regular, Location20Filled } from '@vicons/fluent'

  const { proxy } = getCurrentInstance()
  const store = useDepartmentLocationStore()

  const mapRef = ref(null)
  const formRef = ref(null)

  const rules = computed(() => ({
    lat: {
      required: true,
      type: 'number',
      message: proxy.$t('departmentLocationPage.validation.markerRequired'),
      trigger: ['blur', 'change']
    },
    lng: {
      required: true,
      type: 'number',
      message: proxy.$t('departmentLocationPage.validation.markerRequired'),
      trigger: ['blur', 'change']
    },
    radius: {
      required: true,
      type: 'number',
      message: proxy.$t('departmentLocationPage.validation.radiusRequired'),
      trigger: ['blur', 'change']
    },
    accuracy_limit: {
      required: true,
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

      if (store.payload.geo_type) {
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
    :title="$t('departmentLocationPage.attachTitle')"
    width="95%"
    height="90vh"
  >
    <n-spin :show="store.showLoading" class="h-full">
      <div class="flex flex-col lg:flex-row gap-6 h-full">
        <!-- Left side - Form -->
        <div class="w-full lg:w-[320px] shrink-0 flex flex-col gap-3">
          <!-- Selected Department Card -->
          <div class="department-card" v-if="store.selectedDepartment">
            <div class="flex items-center gap-3">
              <div class="department-card__icon">
                <n-icon size="20">
                  <Location20Filled />
                </n-icon>
              </div>
              <div class="flex flex-col">
                <span class="department-card__title">{{ store.selectedDepartment.name }}</span>
                <span class="department-card__subtitle">{{ store.selectedDepartment.organization?.name }}</span>
              </div>
            </div>
          </div>

          <n-form
            ref="formRef"
            :model="store.payload"
            :rules="rules"
            label-placement="top"
            size="medium"
            require-mark-placement="right-hanging"
          >
            <!-- Geo Type Card -->
            <div class="geo-type-card">
              <div class="flex items-center justify-between">
                <span class="text-gray-600">{{ $t('departmentLocationPage.form.geoType') }}</span>
                <n-switch v-model:value="store.payload.geo_type" size="medium">
                  <template #checked>{{ $t('departmentLocationPage.form.area') }}</template>
                  <template #unchecked>{{ $t('departmentLocationPage.form.coordinate') }}</template>
                </n-switch>
              </div>
            </div>

            <!-- Polygon info (when geo_type = true) -->
            <template v-if="store.payload.geo_type">
              <div
                class="polygon-card"
                :class="{
                  'polygon-card--success': store.payload.polygon.length >= 3,
                  'polygon-card--warning': store.payload.polygon.length > 0 && store.payload.polygon.length < 3,
                  'polygon-card--error': store.payload.polygon.length === 0
                }"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <div class="polygon-card__icon">
                      <n-icon size="18">
                        <Map20Filled />
                      </n-icon>
                    </div>
                    <div class="flex flex-col">
                      <span class="polygon-card__title">{{ $t('departmentLocationPage.form.area') }}</span>
                      <span class="polygon-card__subtitle">
                        <template v-if="store.payload.polygon.length === 0">
                          {{ $t('departmentLocationPage.form.noPolygon') }}
                        </template>
                        <template v-else-if="store.payload.polygon.length < 3">
                          {{ $t('departmentLocationPage.validation.minPoints') }}
                        </template>
                        <template v-else>
                          {{ $t('departmentLocationPage.form.polygonReady') }}
                        </template>
                      </span>
                    </div>
                  </div>
                  <n-button
                    v-if="store.payload.polygon.length > 0"
                    size="tiny"
                    secondary
                    type="error"
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
            <n-form-item v-if="!store.payload.geo_type" :label="$t('departmentLocationPage.form.radius')" path="radius">
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
            <div class="coordinates-card">
              <div class="grid grid-cols-2 gap-2">
                <n-form-item :label="$t('departmentLocationPage.form.lat')" path="lat" :show-feedback="false">
                  <n-input-number
                    v-model:value="store.payload.lat"
                    :precision="6"
                    :step="0.000001"
                    class="w-full"
                    size="medium"
                  />
                </n-form-item>

                <n-form-item :label="$t('departmentLocationPage.form.lng')" path="lng" :show-feedback="false">
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

            <n-form-item :label="$t('departmentLocationPage.form.accuracy')" path="accuracy_limit">
              <n-input-number
                v-model:value="store.payload.accuracy_limit"
                :min="1"
                :max="100"
                class="w-full"
                size="large"
              />
            </n-form-item>
          </n-form>

          <!-- Action buttons -->
          <div class="flex gap-3 mt-auto pt-4">
            <n-button size="large" class="flex-1" @click="onCancel">
              {{ $t('content.cancel') }}
            </n-button>
            <n-button type="primary" size="large" class="flex-1" :loading="store.saveLoading" @click="onSubmit">
              {{ $t('content.save') }}
            </n-button>
          </div>
        </div>

        <!-- Right side - Map -->
        <div class="flex-1 min-h-[400px] lg:min-h-0">
          <LocationMap
            v-if="!store.showLoading"
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

<style scoped>
.department-card {
  padding: 12px 14px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 1px solid #bae6fd;
  border-radius: 8px;
  margin-bottom: 12px;
}

.department-card__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: #0ea5e9;
  color: white;
}

.department-card__title {
  font-weight: 600;
  font-size: 14px;
  color: #0c4a6e;
  line-height: 1.3;
}

.department-card__subtitle {
  font-size: 12px;
  color: #0369a1;
  line-height: 1.3;
}

.geo-type-card {
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  margin-bottom: 12px;
}

.coordinates-card {
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  margin-bottom: 8px;
}

.polygon-card {
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid;
  margin-bottom: 8px;
}

.polygon-card--success {
  background: #f0fdf4;
  border-color: #86efac;
}

.polygon-card--warning {
  background: #fffbeb;
  border-color: #fcd34d;
}

.polygon-card--error {
  background: #fef2f2;
  border-color: #fca5a5;
}

.polygon-card__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
}

.polygon-card--success .polygon-card__icon {
  background: #dcfce7;
  color: #16a34a;
}

.polygon-card--warning .polygon-card__icon {
  background: #fef3c7;
  color: #d97706;
}

.polygon-card--error .polygon-card__icon {
  background: #fee2e2;
  color: #dc2626;
}

.polygon-card__title {
  font-weight: 600;
  font-size: 13px;
  color: #374151;
  line-height: 1.2;
}

.polygon-card__subtitle {
  font-size: 11px;
  color: #6b7280;
  line-height: 1.2;
}
</style>
