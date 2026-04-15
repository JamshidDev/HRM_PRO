<script setup>
  import { ref, watch, computed, getCurrentInstance } from 'vue'
  import { UIModal } from '@/components/index.js'
  import { useDepartmentLocationStore } from '@/store/modules/index.js'
  import LocationMap from './LocationMap.vue'

  const { proxy } = getCurrentInstance()
  const store = useDepartmentLocationStore()
  const mapRef = ref(null)
  const formRef = ref(null)

  // Validation rules
  const rules = computed(() => ({
    department_id: {
      required: true,
      type: 'number',
      message: proxy.$t('departmentLocationPage.validation.departmentRequired'),
      trigger: ['blur', 'change']
    },
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

      // Additional validation for polygon mode
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

  const onSearchDepartment = () => {
    store._departmentList()
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

  watch(() => store.visible, (val) => {
    if (val && store.departmentList.length === 0) {
      store._departmentList()
    }
  })
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
      <div class="flex flex-col lg:flex-row gap-6 h-full">
        <!-- Left side - Form -->
        <div class="w-full lg:w-[320px] shrink-0 flex flex-col gap-3">
          <n-form
          ref="formRef"
          :model="store.payload"
          :rules="rules"
          label-placement="top"
          size="medium"
          require-mark-placement="right-hanging"
        >
          <n-form-item :label="$t('departmentLocationPage.form.department')" path="department_id">
            <n-select
              v-model:value="store.payload.department_id"
              :options="store.departmentList"
              :loading="store.departmentLoading"
              label-field="name"
              value-field="id"
              filterable
              remote
              clearable
              size="large"
              :placeholder="$t('departmentLocationPage.form.department')"
              @search="(v) => { store.departmentParams.search = v; onSearchDepartment() }"
              :render-label="(option) => option.name + ' (' + (option.organization?.name || '') + ')'"
            />
          </n-form-item>

          <!-- Geo Type Card -->
          <div class="geo-type-card">
            <div class="flex items-center justify-between">
              <span class="text-gray-600">{{ $t('departmentLocationPage.form.geoType') }}</span>
              <n-switch v-model:value="store.payload.geo_type" size="medium">
                <template #checked>Polygon</template>
                <template #unchecked>Marker</template>
              </n-switch>
            </div>
          </div>

          <!-- Polygon info (when geo_type = true) -->
          <template v-if="store.payload.geo_type">
            <n-form-item :label="$t('departmentLocationPage.form.polygon')">
              <div class="flex items-center gap-2">
                <span
                  class="polygon-badge"
                  :class="{
                    'badge-success': store.payload.polygon.length >= 3,
                    'badge-warning': store.payload.polygon.length > 0 && store.payload.polygon.length < 3,
                    'badge-error': store.payload.polygon.length === 0
                  }"
                >
                  {{ store.payload.polygon.length }}
                </span>
                <span class="text-gray-600">
                  {{ $t('departmentLocationPage.form.points') }}
                  <template v-if="store.payload.polygon.length > 0 && store.payload.polygon.length < 3">
                    ({{ $t('departmentLocationPage.validation.minPoints') }})
                  </template>
                </span>
              </div>
            </n-form-item>
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
          <div class="grid grid-cols-2 gap-2">
            <n-form-item :label="$t('departmentLocationPage.form.lat')" path="lat">
              <n-input-number
                v-model:value="store.payload.lat"
                :precision="6"
                :step="0.000001"
                class="w-full"
                size="large"
              />
            </n-form-item>

            <n-form-item :label="$t('departmentLocationPage.form.lng')" path="lng">
              <n-input-number
                v-model:value="store.payload.lng"
                :precision="6"
                :step="0.000001"
                class="w-full"
                size="large"
              />
            </n-form-item>
          </div>

          <p v-if="store.payload.geo_type" class="text-xs text-gray-500 -mt-2 mb-2">
            {{ $t('departmentLocationPage.form.centerMarkerInfo') }}
          </p>

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
        <div class="flex gap-3 mt-auto pt-4 border-t">
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
.geo-type-card {
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  margin-bottom: 12px;
}

.polygon-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 28px;
  padding: 0 8px;
  border-radius: 14px;
  font-weight: 600;
  font-size: 14px;
}

.badge-success {
  background: #dcfce7;
  color: #16a34a;
}

.badge-warning {
  background: #fef3c7;
  color: #d97706;
}

.badge-error {
  background: #fee2e2;
  color: #dc2626;
}
</style>
