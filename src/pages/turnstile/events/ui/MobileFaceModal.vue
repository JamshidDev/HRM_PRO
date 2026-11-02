<script setup>
  // Mobil o'tish tafsiloti: asosiy tasdiqlash kadri va o'tish joyi kartasi (xaritada marker).
  import { UIModal } from '@/components/index.js'
  import LocationMap from '@/pages/hrm/departmentLocation/ui/LocationMap.vue'
  import { Location20Filled } from '@vicons/fluent'
  import Utils from '@/utils/Utils.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const visible = defineModel('visible', { type: Boolean, default: false })
  // Hodisalar qatori: { worker, event_date_and_time, direction, mobile_face }.
  const props = defineProps({ event: { type: Object, default: null } })

  const face = computed(() => props.event?.mobile_face ?? null)
  // Fayl topilmasa buzilgan rasm belgisi o'rniga kulrang zaxira.
  const FALLBACK =
    'data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 4 4%22><rect width=%224%22 height=%224%22 fill=%22%23e5e7eb%22/></svg>'
  const sourceLabel = computed(() =>
    face.value?.place_source ? t(`departmentLocationPage.source.${face.value.place_source}`) : null
  )
  const placeTitle = computed(() => face.value?.place_name || sourceLabel.value || '—')
  const hasCoords = computed(() => face.value?.lat != null && face.value?.lng != null)

  const rows = computed(() => {
    const e = props.event
    if (!e) return []
    return [
      [t('content.worker'), Utils.combineFullName(e.worker)],
      [t('content.date'), e.event_date_and_time],
      [
        t('departmentLocationPage.events.direction'),
        e.direction ? t('departmentLocationPage.events.in') : t('departmentLocationPage.events.out')
      ]
    ]
  })
</script>

<template>
  <UIModal
    v-model:visible="visible"
    :title="$t('departmentLocationPage.events.detailTitle')"
    width="90%"
    height="85vh"
  >
    <div v-if="face" class="flex flex-col lg:flex-row gap-5 h-full">
      <!-- Asosiy tasdiqlash kadri -->
      <div class="w-full lg:w-[360px] shrink-0 flex flex-col gap-4">
        <div class="flex flex-col gap-1.5">
          <span class="text-xs text-textColor3">{{ $t('departmentLocationPage.events.livePhoto') }}</span>
          <n-image
            v-if="face.photo"
            :src="face.photo"
            :fallback-src="FALLBACK"
            width="100%"
            object-fit="cover"
            class="rounded-2xl overflow-hidden aspect-[3/4] bg-surface-ground"
          />
          <div
            v-else
            class="aspect-[3/4] rounded-2xl border border-dashed border-warning flex items-center justify-center text-center text-sm text-warning p-4"
          >
            {{ $t('departmentLocationPage.events.noPhoto') }}
          </div>
        </div>

        <div
          v-if="face.ref_photo || face.similarity != null"
          class="flex items-center gap-3 rounded-xl border border-surface-line bg-surface-section px-3 py-2"
        >
          <n-image
            v-if="face.ref_photo"
            :src="face.ref_photo"
            :fallback-src="FALLBACK"
            width="44"
            height="44"
            object-fit="cover"
            class="rounded-lg overflow-hidden shrink-0"
          />
          <div class="flex flex-col min-w-0">
            <span class="text-xs text-textColor3">{{ $t('departmentLocationPage.events.refPhoto') }}</span>
            <span v-if="face.similarity != null" class="text-sm font-medium text-textColor0">
              {{ $t('departmentLocationPage.events.similarity') }}: {{ Math.round(face.similarity * 100) }}%
            </span>
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <div v-for="[label, value] in rows" :key="label" class="flex justify-between gap-3 text-sm">
            <span class="text-textColor3">{{ label }}</span>
            <span class="text-textColor0 text-right">{{ value }}</span>
          </div>
        </div>
      </div>

      <!-- O'tish joyi kartasi: xaritada marker -->
      <div class="flex-1 min-h-[380px] lg:min-h-0 flex flex-col rounded-2xl border border-surface-line bg-surface-section overflow-hidden">
        <div class="flex items-start gap-3 px-4 py-3 border-b border-surface-line">
          <div class="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <n-icon size="18"><Location20Filled /></n-icon>
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <span class="text-sm font-semibold text-textColor0 truncate">{{ placeTitle }}</span>
              <n-tag v-if="sourceLabel && face.place_name" size="small" round>{{ sourceLabel }}</n-tag>
            </div>
            <div class="text-xs text-textColor3 mt-0.5">
              <template v-if="hasCoords">
                {{ Number(face.lat).toFixed(6) }}, {{ Number(face.lng).toFixed(6) }}
                <template v-if="face.accuracy != null">
                  · {{ $t('departmentLocationPage.events.accuracy') }} ±{{ Math.round(face.accuracy) }} m
                </template>
              </template>
              <template v-else>{{ $t('departmentLocationPage.events.noCoords') }}</template>
            </div>
          </div>
        </div>
        <div class="flex-1 min-h-[320px]">
          <LocationMap
            v-if="hasCoords"
            :key="face.id"
            readonly
            :lat="Number(face.lat)"
            :lng="Number(face.lng)"
            :radius="0"
            :polygon="[]"
            :geo-type="false"
          />
          <div v-else class="h-full flex items-center justify-center text-textColor3">
            {{ $t('departmentLocationPage.events.noCoords') }}
          </div>
        </div>
      </div>
    </div>
  </UIModal>
</template>
