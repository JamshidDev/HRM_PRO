<script setup>
  // Mobil o'tishni ko'rish: kadr, xodim, ma'lumotlar va o'tish joyi (xaritada marker) — tartib bilan.
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
  const workerName = computed(() => Utils.combineFullName(props.event?.worker))
  const [date, time] = [0, 1].map((i) =>
    computed(() => props.event?.event_date_and_time?.split(' ')[i] ?? '—')
  )
  // Xarita oyna animatsiyasidan keyin chiziladi — aks holda o'lcham noto'g'ri olinib marker chetga suriladi.
  const mapReady = ref(false)
  watch(
    () => [visible.value, face.value?.id],
    ([open]) => {
      mapReady.value = false
      if (open) setTimeout(() => (mapReady.value = true), 300)
    },
    { immediate: true }
  )

  const similarity = computed(() =>
    face.value?.similarity != null ? Math.round(face.value.similarity * 100) : null
  )
</script>

<template>
  <UIModal v-model:visible="visible" :title="$t('content.view')" :width="500">
    <div v-if="face" class="flex flex-col gap-3">
      <!-- Tasdiqlangan kadr -->
      <div class="relative rounded-2xl overflow-hidden border border-surface-line bg-surface-ground">
        <n-image
          v-if="face.photo"
          :src="face.photo"
          :fallback-src="FALLBACK"
          width="100%"
          object-fit="cover"
          class="block w-full h-[200px]"
          :img-props="{ class: 'w-full h-full object-cover' }"
        />
        <div v-else class="h-[200px] flex items-center justify-center text-sm text-warning">
          {{ $t('departmentLocationPage.events.noPhoto') }}
        </div>
        <span class="absolute left-3 top-3 rounded-full bg-black/55 px-2.5 py-0.5 text-xs text-white">
          {{ $t('departmentLocationPage.events.livePhoto') }}
        </span>
      </div>

      <!-- Xodim -->
      <div class="flex items-center gap-3 rounded-xl border border-surface-line bg-surface-section px-3 py-2.5">
        <n-image
          v-if="face.ref_photo"
          :src="face.ref_photo"
          :fallback-src="FALLBACK"
          width="44"
          height="44"
          object-fit="cover"
          class="rounded-lg overflow-hidden shrink-0"
        />
        <div class="min-w-0 flex-1">
          <div class="text-sm font-semibold text-textColor0 truncate">{{ workerName }}</div>
          <div class="text-xs text-textColor3">{{ $t('departmentLocationPage.events.refPhoto') }}</div>
        </div>
        <n-tag
          v-if="similarity != null"
          size="small"
          round
          :type="similarity >= 90 ? 'success' : 'warning'"
        >
          {{ $t('departmentLocationPage.events.similarity') }}: {{ similarity }}%
        </n-tag>
      </div>

      <!-- Ma'lumotlar -->
      <div class="rounded-xl border border-surface-line bg-surface-section px-3 py-2">
        <div class="text-xs font-semibold uppercase tracking-wide text-textColor3 mb-1">
          {{ $t('departmentLocationPage.events.info') }}
        </div>
        <div class="mf-row">
          <span class="mf-label">{{ $t('content.date') }}</span>
          <span class="mf-value">{{ date }}</span>
        </div>
        <div class="mf-row">
          <span class="mf-label">{{ $t('content.time') }}</span>
          <span class="mf-value">{{ time }}</span>
        </div>
        <div class="mf-row">
          <span class="mf-label">{{ $t('departmentLocationPage.events.direction') }}</span>
          <n-tag size="small" round :type="event?.direction ? 'success' : 'error'">
            {{ event?.direction ? $t('departmentLocationPage.events.in') : $t('departmentLocationPage.events.out') }}
          </n-tag>
        </div>
        <div class="mf-row">
          <span class="mf-label">{{ $t('hcEvent.form.device') }}</span>
          <span class="mf-value">HR Rail</span>
        </div>
      </div>

      <!-- O'tish joyi -->
      <div class="rounded-xl border border-surface-line bg-surface-section overflow-hidden">
        <div class="px-3 pt-2">
          <div class="text-xs font-semibold uppercase tracking-wide text-textColor3 mb-1">
            {{ $t('departmentLocationPage.events.placeTitle') }}
          </div>
          <div class="flex items-center gap-2 py-1">
            <n-icon size="16" class="text-primary shrink-0"><Location20Filled /></n-icon>
            <span class="text-sm font-medium text-textColor0 truncate">{{ placeTitle }}</span>
            <n-tag v-if="sourceLabel && face.place_name" size="tiny" round>{{ sourceLabel }}</n-tag>
          </div>
          <div class="mf-row">
            <span class="mf-label">{{ $t('departmentLocationPage.events.coords') }}</span>
            <span class="mf-value">
              {{ hasCoords ? `${Number(face.lat).toFixed(6)}, ${Number(face.lng).toFixed(6)}` : '—' }}
            </span>
          </div>
          <div class="mf-row">
            <span class="mf-label">{{ $t('departmentLocationPage.events.accuracy') }}</span>
            <span class="mf-value">{{ face.accuracy != null ? `±${Math.round(face.accuracy)} m` : '—' }}</span>
          </div>
        </div>
        <div v-if="hasCoords" class="mf-map h-[160px] mt-2 border-t border-surface-line">
          <LocationMap
            v-if="mapReady"
            :key="face.id"
            readonly
            :lat="Number(face.lat)"
            :lng="Number(face.lng)"
            :radius="0"
            :polygon="[]"
            :geo-type="false"
          />
        </div>
        <div v-else class="px-3 pb-2 text-xs text-textColor3">
          {{ $t('departmentLocationPage.events.noCoords') }}
        </div>
      </div>
    </div>
  </UIModal>
</template>

<style scoped>
  .mf-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 4px 0;
    border-bottom: 1px solid var(--surface-line, rgba(0, 0, 0, 0.06));
    font-size: 14px;
  }
  .mf-row:last-child {
    border-bottom: 0;
  }
  .mf-label {
    color: var(--textColor3);
  }
  /* Kichik kartada xarita o'z balandligida — marker markazda turadi. */
  .mf-map :deep(.map-container) {
    min-height: 0;
  }
  .mf-map :deep(.location-map-wrapper) {
    border: 0;
    border-radius: 0;
  }
  .mf-value {
    color: var(--textColor0);
    text-align: right;
  }
</style>
