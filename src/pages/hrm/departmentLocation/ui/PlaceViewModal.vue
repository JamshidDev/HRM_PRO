<script setup>
  // Turniket lokatsiyasi: xaritada joy va unga biriktirilgan bo'lim/xodimlar.
  import { UIModal } from '@/components/index.js'
  import LocationMap from './LocationMap.vue'

  const props = defineProps({
    visible: { type: Boolean, default: false },
    placeId: { type: Number, default: null }
  })
  const emit = defineEmits(['update:visible'])

  const loading = ref(false)
  const data = ref(null)

  watch(
    () => [props.visible, props.placeId],
    ([v, id]) => {
      if (!v || !id) return
      loading.value = true
      data.value = null
      $ApiService.departmentLocationService
        ._showPlace({ id })
        .then((res) => {
          data.value = res.data.data
        })
        .finally(() => {
          loading.value = false
        })
    },
    { immediate: true }
  )

  const workerName = (w) => [w.last_name, w.first_name, w.middle_name].filter(Boolean).join(' ')
</script>

<template>
  <UIModal
    :visible="visible"
    :title="data?.name || $t('departmentLocationPage.places.viewTitle')"
    width="90%"
    height="80vh"
    @update:visible="(v) => emit('update:visible', v)"
  >
    <n-spin :show="loading" class="h-full">
      <div v-if="data" class="flex h-full flex-col gap-5 lg:flex-row">
        <div class="flex w-full shrink-0 flex-col gap-4 overflow-y-auto lg:w-[340px]">
          <div class="flex flex-col gap-1">
            <span class="text-xs text-textColor3">{{
              $t('departmentLocationPage.places.departments')
            }}</span>
            <span v-if="!data.departments.length" class="text-sm text-textColor3">—</span>
            <span v-for="d in data.departments" :key="`d${d.id}`" class="text-sm text-textColor1">
              {{ d.department_name }}
            </span>
          </div>
          <div class="flex flex-col gap-1">
            <span class="text-xs text-textColor3">{{
              $t('departmentLocationPage.places.workers')
            }}</span>
            <span v-if="!data.workers.length" class="text-sm text-textColor3">—</span>
            <span v-for="w in data.workers" :key="`w${w.id}`" class="text-sm text-textColor1">
              {{ workerName(w) }}
            </span>
          </div>
        </div>
        <div class="min-h-[360px] flex-1">
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
