<script setup>
  /**
   * Joylashuv qo'shish / tahrirlash (bo'lim yoki xodim uchun).
   * Chapda forma: kim uchun → joylashuv turi (Aylana | Hudud | Erkin rejim) → nomi → turiga oid
   * parametrlar (radius / hudud) → koordinata → aniqlik. O'ngda xarita.
   */
  import { ref, computed, watch, getCurrentInstance, h } from 'vue'
  import { UIModal, UISegmentTabs, UISelect, UIDepartmentSelect } from '@/components/index.js'
  import { useComponentStore, useDepartmentLocationStore } from '@/store/modules/index.js'
  import LocationMap from './LocationMap.vue'
  import { Dismiss16Regular, Location20Filled, Map20Filled } from '@vicons/fluent'

  const { proxy } = getCurrentInstance()
  const store = useDepartmentLocationStore()
  const componentStore = useComponentStore()

  // Bo'lim jadval qatoridan emas, jadval sarlavhasidagi "+" orqali ochilganda
  // oldindan tanlanmagan bo'ladi — shunda uni shu formaning o'zida tanlaymiz.
  const needDepartment = computed(
    () => store.target === 'department' && store.visibleType && !store.selectedDepartment
  )
  const isWorker = computed(() => store.target === 'worker')
  // Turniket lokatsiyasining o'zi (ro'yxat tabi) — erkin rejim va aniqlik yo'q, korxona tanlanadi.
  const isPlace = computed(() => store.target === 'place')
  const isFree = computed(() => !isPlace.value && store.payload.is_free === true)
  // Ro'yxatdan tanlangan joy — shakl o'zgartirilmaydi, xaritada faqat ko'rinadi.
  const isExisting = computed(() => !isPlace.value && !isFree.value && store.payload.source === 'existing')
  const isArea = computed(() => !isFree.value && store.payload.geo_type === true)
  const sourceTabs = computed(() => [
    { id: 'existing', name: proxy.$t('departmentLocationPage.form.sourceExisting') },
    { id: 'new', name: proxy.$t('departmentLocationPage.form.sourceNew') }
  ])
  const source = computed({
    get: () => store.payload.source,
    set: (v) => {
      store.payload.source = v
      // Yangi joy bo'sh boshlanadi — tanlangan joy nomi takrorlanmasin.
      if (v === 'new') {
        store.payload.name = null
        store.payload.lat = null
        store.payload.lng = null
        store.payload.polygon = []
        store.payload.geo_type = false
      } else if (store.payload.place_id) {
        store.selectPlace(store.payload.place_id)
      }
    }
  })
  const placeSelectOptions = computed(() =>
    store.placeOptions.map((p) => ({
      label: p.name,
      value: p.id,
      hint: p.geo_type
        ? proxy.$t('departmentLocationPage.pointsCount', { n: p.polygon?.length ?? 0 })
        : `${p.radius} m`
    }))
  )
  const renderPlaceLabel = (o) =>
    h('div', { class: 'flex items-center justify-between gap-3 w-full py-0.5' }, [
      h('span', { class: 'truncate' }, o.label),
      h('span', { class: 'shrink-0 text-xs text-textColor3' }, o.hint)
    ])
  let placeTimer = null
  const onPlaceSearch = (q) => {
    clearTimeout(placeTimer)
    placeTimer = setTimeout(() => store._placeOptions(q), 350)
  }
  // Bo'lim formaning o'zida tanlanganda — shu korxona joylari.
  watch(
    () => store.payload.department_id,
    (v, old) => {
      if (store.visible && store.target === 'department' && v !== old) store._placeOptions()
    }
  )
  const placeOrg = ref([])
  const placeOrgCheck = ref([])
  const onChangePlaceOrg = (v) => {
    placeOrg.value = v
    store.payload.organization_id = v?.[0]?.id ?? null
  }
  const workerName = computed(() =>
    [store.selectedWorker?.last_name, store.selectedWorker?.first_name, store.selectedWorker?.middle_name]
      .filter(Boolean)
      .join(' ')
  )

  // Kim uchun: xodim yoki bo'lim (sarlavha ostidagi karta)
  const target = computed(() => {
    if (isWorker.value && store.selectedWorker) {
      return { title: workerName.value, subtitle: store.selectedWorker.organization?.name }
    }
    if (!isWorker.value && store.selectedDepartment) {
      return {
        title: store.selectedDepartment.name,
        subtitle: store.selectedDepartment.organization?.name
      }
    }
    return null
  })

  // Joylashuv turi: Aylana | Hudud (`geo_type`). Erkin rejim — alohida switch, tablar ostida;
  // yoqilganda tablar o'chiq turadi (hudud cheklovi yo'q).
  const modeTabs = computed(() => [
    { id: 'circle', name: proxy.$t('departmentLocationPage.form.coordinate'), disabled: isFree.value },
    { id: 'area', name: proxy.$t('departmentLocationPage.form.area'), disabled: isFree.value }
  ])
  const geoMode = computed({
    get: () => (store.payload.geo_type ? 'area' : 'circle'),
    set: (v) => {
      store.payload.geo_type = v === 'area'
    }
  })
  // Formaning qaysi qismi ko'rinadi: erkin / aylana / hudud
  const mode = computed(() => (isFree.value ? 'free' : geoMode.value))
  const modeHint = computed(() =>
    geoMode.value === 'area'
      ? proxy.$t('departmentLocationPage.form.modeHintArea')
      : proxy.$t('departmentLocationPage.form.modeHintCircle')
  )

  // Koordinata xatosi Lat va Lng ostida bitta qator bo'lib chiqadi (saqlashga urinilgandan keyin).
  const submitTried = ref(false)
  const coordsError = computed(
    () =>
      submitTried.value &&
      !isFree.value &&
      !isExisting.value &&
      (store.payload.lat == null || store.payload.lng == null)
  )
  watch(
    () => store.visible,
    (v) => {
      if (v) submitTried.value = false
    }
  )

  const formOrg = ref([])
  const formOrgCheck = ref([])
  const onChangeFormOrg = (v) => {
    formOrg.value = v
    store.payload.department_id = null
  }

  watch(
    () => store.visible,
    (v) => {
      if (v && isPlace.value) {
        placeOrg.value = store.payload.organization_id
          ? [{ id: store.payload.organization_id, name: store.payload.organization_name }]
          : []
        placeOrgCheck.value = []
        if (componentStore.structureList.length === 0) componentStore._structures()
      }
      if (!v || !needDepartment.value) return
      // Bo'lim daraxti korxona bo'yicha — filtrdagi korxona oldindan qo'yiladi.
      formOrg.value = [...(store.params.organizations ?? [])]
      formOrgCheck.value = []
      if (componentStore.structureList.length === 0) componentStore._structures()
    }
  )

  const mapRef = ref(null)
  const formRef = ref(null)

  // Rejim almashganda eski (endi majburiy bo'lmagan) maydon xatolari qolmasin.
  watch(
    () => [store.payload.is_free, store.payload.geo_type, store.payload.source],
    () => formRef.value?.restoreValidation()
  )

  const polygonCount = computed(() => store.payload.polygon?.length ?? 0)
  const polygonState = computed(() =>
    polygonCount.value >= 3 ? 'ready' : polygonCount.value > 0 ? 'partial' : 'empty'
  )

  const rules = computed(() => ({
    department_id: {
      required: needDepartment.value,
      // `type: 'number'` emas: backend id'ni satr sifatida ham qaytarishi mumkin.
      validator: (_rule, value) => !needDepartment.value || (value !== null && value !== undefined && value !== ''),
      message: proxy.$t('departmentLocationPage.validation.departmentRequired'),
      trigger: ['blur', 'change']
    },
    organization_id: {
      required: isPlace.value,
      validator: (_rule, value) => !isPlace.value || !!value,
      message: proxy.$t('departmentLocationPage.validation.organizationRequired'),
      trigger: ['blur', 'change']
    },
    place_id: {
      required: isExisting.value,
      validator: (_rule, value) => !isExisting.value || !!value,
      message: proxy.$t('departmentLocationPage.validation.placeRequired'),
      trigger: ['blur', 'change']
    },
    name: {
      required: !isFree.value && !isExisting.value,
      validator: (_rule, value) => isFree.value || isExisting.value || !!value?.trim(),
      message: proxy.$t('departmentLocationPage.validation.nameRequired'),
      trigger: ['blur', 'input']
    },
    lat: {
      required: !isFree.value && !isExisting.value,
      type: 'number',
      message: proxy.$t('departmentLocationPage.validation.markerRequired'),
      trigger: ['blur', 'change']
    },
    lng: {
      required: !isFree.value && !isExisting.value,
      type: 'number',
      message: proxy.$t('departmentLocationPage.validation.markerRequired'),
      trigger: ['blur', 'change']
    },
    radius: {
      required: !isFree.value && !isExisting.value && !isArea.value,
      type: 'number',
      message: proxy.$t('departmentLocationPage.validation.radiusRequired'),
      trigger: ['blur', 'change']
    },
    // Hudud kamida 3 nuqta — xato endi forma ichida (ilgari tepada qalqib chiquvchi xabar edi).
    polygon: {
      key: 'polygon',
      required: isArea.value && !isExisting.value,
      validator: () => !isArea.value || isExisting.value || polygonCount.value >= 3,
      message: proxy.$t('departmentLocationPage.validation.polygonRequired'),
      trigger: ['change']
    },
    accuracy_limit: {
      required: !isFree.value && !isWorker.value && !isPlace.value,
      type: 'number',
      message: proxy.$t('departmentLocationPage.validation.accuracyRequired'),
      trigger: ['blur', 'change']
    }
  }))

  // Hudud chizilgach — xato darhol yo'qolsin.
  watch(polygonCount, (n) => {
    if (n >= 3) formRef.value?.validate(() => {}, (rule) => rule?.key === 'polygon').catch(() => {})
  })

  const onSubmit = () => {
    submitTried.value = true
    formRef.value?.validate((errors) => {
      if (errors) return
      if (store.visibleType) store._create()
      else store._update()
    })
  }

  const onCancel = () => {
    store.visible = false
  }

  const updateLat = (val) => {
    if (isExisting.value) return
    store.payload.lat = val
  }

  const updateLng = (val) => {
    if (isExisting.value) return
    store.payload.lng = val
  }

  const updatePolygon = (val) => {
    if (isExisting.value) return
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

  const RADIUS_MAX_SLIDER = 2000
</script>

<template>
  <UIModal
    v-model:visible="store.visible"
    :title="
      isPlace
        ? store.visibleType
          ? $t('departmentLocationPage.places.createTitle')
          : $t('departmentLocationPage.places.updateTitle')
        : store.visibleType
          ? $t('departmentLocationPage.createTitle')
          : $t('departmentLocationPage.updateTitle')
    "
    width="95%"
    height="90vh"
  >
    <n-spin :show="store.showLoading" class="h-full">
      <!-- Tor ekranda (< lg) forma va xarita ustma-ust, butun oyna aylanadi; keng ekranda — yonma-yon,
           faqat forma ichida aylanadi -->
      <div class="flex flex-col lg:flex-row gap-5 h-full overflow-y-auto lg:overflow-visible">
        <!-- Chap: forma -->
        <div class="w-full lg:w-[360px] shrink-0 flex flex-col lg:min-h-0">
          <div class="lg:flex-1 lg:min-h-0 lg:overflow-y-auto pr-1 flex flex-col gap-4">
            <!-- Kim uchun -->
            <div v-if="target" class="flex min-w-0 flex-col px-1">
              <span class="line-clamp-2 font-semibold leading-[1.3] text-textColor0">{{ target.title }}</span>
              <span v-if="target.subtitle" class="truncate text-xs text-textColor3">{{ target.subtitle }}</span>
            </div>

            <n-form
              ref="formRef"
              :model="store.payload"
              :rules="rules"
              label-placement="top"
              size="medium"
              require-mark-placement="right-hanging"
            >
              <!-- Bo'lim tanlash (faqat bo'lim oldindan berilmaganda) -->
              <n-form-item
                v-if="needDepartment"
                :label="$t('departmentLocationPage.form.department')"
                path="department_id"
              >
                <div class="flex w-full flex-col gap-2">
                  <UISelect
                    :options="componentStore.structureList"
                    :modelV="formOrg"
                    @defaultValue="(v) => (formOrg = v)"
                    @updateModel="onChangeFormOrg"
                    :checkedVal="formOrgCheck"
                    @updateCheck="(v) => (formOrgCheck = v)"
                    :loading="componentStore.structureLoading"
                    v-model:search="componentStore.structureParams.search"
                    @onSearch="componentStore._structures"
                    :multiple="false"
                  />
                  <UIDepartmentSelect
                    v-model="store.payload.department_id"
                    :organization="formOrg"
                    :placeholder="$t('departmentLocationPage.form.department')"
                  />
                </div>
              </n-form-item>

              <!-- Turniket lokatsiyasi korxonasi (ro'yxat tabidan yaratilganda) -->
              <n-form-item
                v-if="isPlace"
                :label="$t('departmentLocationPage.places.organization')"
                path="organization_id"
              >
                <UISelect
                  :options="componentStore.structureList"
                  :modelV="placeOrg"
                  @defaultValue="(v) => (placeOrg = v)"
                  @updateModel="onChangePlaceOrg"
                  :checkedVal="placeOrgCheck"
                  @updateCheck="(v) => (placeOrgCheck = v)"
                  :loading="componentStore.structureLoading"
                  v-model:search="componentStore.structureParams.search"
                  @onSearch="componentStore._structures"
                  :multiple="false"
                  :disabled="!store.visibleType"
                />
              </n-form-item>

              <!-- Erkin rejim: hudud cheklovi yo'q, faqat koordinata va yuz rasmi yoziladi -->
              <div v-if="!isPlace" class="dl-free mb-4">
                <div class="flex min-w-0 flex-col">
                  <span class="font-medium text-textColor1">{{ $t('departmentLocationPage.form.freeMode') }}</span>
                  <span class="text-xs leading-4 text-textColor3">{{ $t('departmentLocationPage.form.freeModeHint') }}</span>
                </div>
                <n-switch v-model:value="store.payload.is_free" />
              </div>

              <!-- Joy: turniket lokatsiyalari ro'yxatidan yoki yangi (ro'yxatga ham qo'shiladi) -->
              <n-form-item
                v-if="!isPlace && !isFree"
                :label="$t('departmentLocationPage.form.source')"
                :show-feedback="false"
              >
                <div class="flex w-full flex-col gap-2">
                  <UISegmentTabs v-model="source" :tabs="sourceTabs" />
                  <span class="text-xs leading-4 text-textColor3">
                    {{
                      isExisting
                        ? $t('departmentLocationPage.form.sourceExistingHint')
                        : $t('departmentLocationPage.form.sourceNewHint')
                    }}
                  </span>
                </div>
              </n-form-item>

              <n-form-item
                v-if="isExisting"
                class="mt-4"
                :label="$t('departmentLocationPage.form.place')"
                path="place_id"
              >
                <n-select
                  :value="store.payload.place_id"
                  :options="placeSelectOptions"
                  :loading="store.placeOptionsLoading"
                  :render-label="renderPlaceLabel"
                  :placeholder="$t('departmentLocationPage.form.placePlaceholder')"
                  filterable
                  remote
                  clearable
                  @search="onPlaceSearch"
                  @update:value="(v) => store.selectPlace(v)"
                />
              </n-form-item>

              <!-- Joylashuv turi: Aylana | Hudud -->
              <n-form-item
                v-if="!isFree && !isExisting"
                :class="!isPlace && 'mt-4'"
                :label="$t('departmentLocationPage.form.geoType')"
                :show-feedback="false"
              >
                <div class="flex w-full flex-col gap-2">
                  <UISegmentTabs v-model="geoMode" :tabs="modeTabs" />
                  <span class="text-xs leading-4 text-textColor3">{{ modeHint }}</span>
                </div>
              </n-form-item>

              <!-- O'tish joyi nomi: mobil ilovada shu nom bilan chiqadi -->
              <n-form-item
                v-if="!isFree && !isExisting"
                class="mt-4"
                :label="$t('departmentLocationPage.form.name')"
                path="name"
              >
                <n-input
                  v-model:value="store.payload.name"
                  :placeholder="$t('departmentLocationPage.form.namePlaceholder')"
                  :maxlength="255"
                  clearable
                />
              </n-form-item>

              <!-- Aylana: radius (slayder + son) -->
              <n-form-item
                v-if="mode === 'circle' && !isExisting"
                :label="$t('departmentLocationPage.form.radius')"
                path="radius"
              >
                <div class="flex w-full items-center gap-3">
                  <n-slider
                    class="flex-1"
                    :value="Math.min(store.payload.radius ?? 0, RADIUS_MAX_SLIDER)"
                    :min="10"
                    :max="RADIUS_MAX_SLIDER"
                    :step="10"
                    :tooltip="false"
                    @update:value="(v) => (store.payload.radius = v)"
                  />
                  <n-input-number
                    v-model:value="store.payload.radius"
                    :min="1"
                    :max="5000"
                    :show-button="false"
                    class="w-[110px] shrink-0"
                  >
                    <template #suffix>m</template>
                  </n-input-number>
                </div>
              </n-form-item>

              <!-- Hudud: holati va qanday chiziladi -->
              <n-form-item v-if="mode === 'area' && !isExisting" :label="$t('departmentLocationPage.form.area')" path="polygon">
                <div class="flex w-full flex-col gap-2">
                  <div class="dl-polygon" :class="`dl-polygon--${polygonState}`">
                    <span class="dl-polygon__icon">
                      <n-icon size="18"><Map20Filled /></n-icon>
                    </span>
                    <div class="flex min-w-0 flex-1 flex-col">
                      <span class="text-sm font-medium text-textColor0">
                        {{
                          polygonState === 'ready'
                            ? $t('departmentLocationPage.form.polygonReady')
                            : $t('departmentLocationPage.form.noPolygon')
                        }}
                      </span>
                      <span class="text-xs text-textColor3">
                        {{ $t('departmentLocationPage.pointsCount', { n: polygonCount }) }}
                      </span>
                    </div>
                    <n-tooltip v-if="polygonCount > 0">
                      <template #trigger>
                        <n-button size="small" quaternary circle type="error" @click="clearPolygon">
                          <template #icon>
                            <n-icon size="16"><Dismiss16Regular /></n-icon>
                          </template>
                        </n-button>
                      </template>
                      {{ $t('departmentLocationPage.map.clearPolygon') }}
                    </n-tooltip>
                  </div>
                  <span class="text-xs leading-4 text-textColor3">{{ $t('departmentLocationPage.form.polygonSteps') }}</span>
                </div>
              </n-form-item>

              <!-- Koordinata: aylanada — markaz nuqtasi, hududda — avtomatik markaz (markerni surish mumkin) -->
              <template v-if="!isFree && !isExisting">
                <!-- Ikkalasi ham `show-feedback=false` (bir xil balandlik, yonma-yon tekis turadi);
                     xato matni pastda bitta qator bo'lib chiqadi -->
                <div class="grid grid-cols-2 items-start gap-3">
                  <n-form-item :label="$t('departmentLocationPage.form.lat')" path="lat" :show-feedback="false">
                    <n-input-number
                      v-model:value="store.payload.lat"
                      :precision="6"
                      :step="0.000001"
                      :show-button="false"
                      class="w-full"
                    />
                  </n-form-item>
                  <n-form-item :label="$t('departmentLocationPage.form.lng')" path="lng" :show-feedback="false">
                    <n-input-number
                      v-model:value="store.payload.lng"
                      :precision="6"
                      :step="0.000001"
                      :show-button="false"
                      class="w-full"
                    />
                  </n-form-item>
                </div>
                <p class="mt-1 mb-4 min-h-4 text-xs leading-4" :class="coordsError ? 'text-danger' : 'text-textColor3'">
                  <template v-if="coordsError">{{ $t('departmentLocationPage.validation.markerRequired') }}</template>
                  <template v-else-if="mode === 'area'">{{ $t('departmentLocationPage.form.centerMarkerInfo') }}</template>
                </p>
              </template>

              <n-form-item
                v-if="!isFree && !isWorker && !isPlace"
                :label="$t('departmentLocationPage.form.accuracy')"
                path="accuracy_limit"
              >
                <n-input-number
                  v-model:value="store.payload.accuracy_limit"
                  :min="1"
                  :max="100"
                  class="w-full"
                />
              </n-form-item>
            </n-form>
          </div>

          <!-- Tugmalar: forma uzun bo'lsa ham doim pastda ko'rinadi -->
          <div class="flex gap-3 pt-4">
            <n-button class="flex-1" @click="onCancel">
              {{ $t('content.cancel') }}
            </n-button>
            <n-button type="primary" class="flex-1" :loading="store.saveLoading" @click="onSubmit">
              {{ $t('content.save') }}
            </n-button>
          </div>
        </div>

        <!-- O'ng: xarita -->
        <div class="flex-1 min-h-[400px] lg:min-h-0">
          <div
            v-if="isFree"
            class="h-full flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-surface-line text-center p-6"
          >
            <n-icon size="36" class="text-primary"><Location20Filled /></n-icon>
            <span class="font-medium text-textColor1">{{ $t('departmentLocationPage.form.freeMode') }}</span>
            <span class="text-sm text-textColor3 max-w-[420px]">{{ $t('departmentLocationPage.form.freeModeHint') }}</span>
          </div>
          <LocationMap
            v-else-if="!store.showLoading"
            ref="mapRef"
            :key="`${store.elementId}-${isExisting ? store.payload.place_id : 'edit'}`"
            :readonly="isExisting"
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
  /* Erkin rejim kartasi (eski switch ko'rinishi, ranglar tokenlarda) */
  .dl-free {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 12px;
    border: 1px solid var(--surface-line);
    border-radius: 12px;
  }

  /* Hudud holati: tayyor — yashil, qisman — sariq, yo'q — neytral (xato emas: hali chizilmagan) */
  .dl-polygon {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 10px;
    border-radius: 12px;
    border: 1px solid var(--surface-line);
    background: var(--surface-section);
  }

  .dl-polygon__icon {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: var(--fig-bg-disable);
    color: var(--fig-text-tertiary);
  }

  .dl-polygon--ready .dl-polygon__icon {
    background: var(--fig-chip-green-bg);
    color: var(--fig-chip-green-text);
  }

  .dl-polygon--partial .dl-polygon__icon {
    background: var(--fig-chip-amber-bg);
    color: var(--fig-chip-amber-text);
  }
</style>
