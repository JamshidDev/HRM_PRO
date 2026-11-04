<script setup>
  // Mobil o'tishni ko'rish: kim/qachon, ikki rasmni solishtirish va o'tish joyi (xaritada aniqlik aylanasi).
  import { UIModal } from '@/components/index.js'
  import LocationMap from '@/pages/hrm/departmentLocation/ui/LocationMap.vue'
  import {
    ArrowCircleDownRight20Regular,
    ArrowCircleUpLeft20Regular,
    CheckmarkCircle20Filled,
    ErrorCircle20Filled,
    ImageOff20Regular,
    Info20Filled,
    Warning20Filled,
    Location20Filled
  } from '@vicons/fluent'
  import CopyIcon from '@/assets/icons/copyIcon.svg'
  import Utils from '@/utils/Utils.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const visible = defineModel('visible', { type: Boolean, default: false })
  // Hodisalar qatori: { worker, event_date_and_time, direction, mobile_face }.
  const props = defineProps({ event: { type: Object, default: null } })

  const face = computed(() => props.event?.mobile_face ?? null)
  const workerName = computed(() => Utils.combineFullName(props.event?.worker))
  // Qisqa satr: «03.11.2026 · 11:00:14 · HR Rail ilovasi».
  const whenLine = computed(() => {
    const at = props.event?.event_date_and_time
    return [Utils.timeOnlyDate(at), Utils.timeOnlySecond(at), t('departmentLocationPage.events.appName')]
      .filter(Boolean)
      .join(' · ')
  })

  // --- Rasmlar: yonma-yon, bir xil o'lchamda. Fayl ochilmasa — «Rasm yo'q» (bo'sh kulrang quti emas).
  const broken = reactive({ photo: false, ref_photo: false })
  const photos = computed(() =>
    [
      { key: 'photo', label: t('departmentLocationPage.events.livePhoto') },
      { key: 'ref_photo', label: t('departmentLocationPage.events.refPhoto') }
    ].map((p) => ({ ...p, src: broken[p.key] ? null : face.value?.[p.key] || null }))
  )

  // O'xshashlik chegaralari: 90%+ mos, 70–89% solishtirib ko'rish kerak, <70% boshqa odam bo'lishi mumkin.
  // Frontend tanlovi — backend jamoasi hozircha muhim emas dedi (2026-11-04); kerak bo'lsa shu yerda o'zgartiriladi.
  const similarity = computed(() =>
    face.value?.similarity != null ? Math.round(face.value.similarity * 100) : null
  )
  const match = computed(() => {
    const s = similarity.value
    const m = (cls, icon, key) => ({ cls, icon, text: t(`departmentLocationPage.events.${key}`) })
    if (s == null) return m('bg-surface-ground text-textColor3', Info20Filled, 'matchUnknown')
    if (s >= 90) return m('bg-success/10 text-success', CheckmarkCircle20Filled, 'matchHigh')
    if (s >= 70) return m('bg-warning/10 text-warning', Warning20Filled, 'matchMid')
    return m('bg-danger/10 text-danger', ErrorCircle20Filled, 'matchLow')
  })

  // --- O'tish joyi: nomi + turi, turini oddiy tilda tushuntiruvchi izoh.
  const source = computed(() => face.value?.place_source || null)
  const sourceLabel = computed(() => (source.value ? t(`departmentLocationPage.source.${source.value}`) : null))
  const placeTitle = computed(
    () => face.value?.place_name || sourceLabel.value || t('departmentLocationPage.events.placeUnknown')
  )
  const placeHint = computed(() =>
    source.value ? t(`departmentLocationPage.events.placeHint.${source.value}`) : null
  )
  const hasCoords = computed(() => face.value?.lat != null && face.value?.lng != null)
  const coordsText = computed(() =>
    hasCoords.value ? `${Number(face.value.lat).toFixed(6)}, ${Number(face.value.lng).toFixed(6)}` : ''
  )
  const copyCoords = () => Utils.copyToClipboard(coordsText.value, () => $Toast.success(t('content.copied')))

  // GPS aniqligi: ≤20 m aniq, ≤50 m o'rtacha, undan ko'p — joy taxminiy.
  const accuracy = computed(() => (face.value?.accuracy != null ? Math.round(face.value.accuracy) : null))
  const accuracyLevel = computed(() => {
    const a = accuracy.value
    if (a == null) return null
    if (a <= 20) return { cls: 'text-success', text: t('departmentLocationPage.events.accuracyGood') }
    if (a <= 50) return { cls: 'text-warning', text: t('departmentLocationPage.events.accuracyMid') }
    return { cls: 'text-danger', text: t('departmentLocationPage.events.accuracyLow') }
  })

  // Xarita oyna animatsiyasidan keyin chiziladi — aks holda o'lcham noto'g'ri olinib marker chetga suriladi.
  const mapReady = ref(false)
  watch(
    () => [visible.value, face.value?.id],
    ([open]) => {
      broken.photo = false
      broken.ref_photo = false
      mapReady.value = false
      if (open) setTimeout(() => (mapReady.value = true), 300)
    },
    { immediate: true }
  )
</script>

<template>
  <UIModal v-model:visible="visible" :title="$t('departmentLocationPage.events.detailTitle')" :width="500">
    <div v-if="face" class="flex flex-col gap-3">
      <!-- Kim, qachon, qayerdan: oddiy matn (kartasiz) -->
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <div class="text-base font-semibold text-textColor0 truncate">{{ workerName }}</div>
          <div class="text-xs text-textColor3 mt-0.5">{{ whenLine }}</div>
        </div>
        <n-tag round :type="event?.direction ? 'primary' : 'error'" :bordered="false" class="shrink-0">
          <template #icon>
            <n-icon>
              <ArrowCircleDownRight20Regular v-if="event?.direction" />
              <ArrowCircleUpLeft20Regular v-else />
            </n-icon>
          </template>
          {{ event?.direction ? $t('departmentLocationPage.events.in') : $t('departmentLocationPage.events.out') }}
        </n-tag>
      </div>

      <!-- Rasmlarni solishtirish: tasdiqlangan rasm | rasmiy rasm -->
      <div class="grid grid-cols-2 gap-3">
        <div v-for="p in photos" :key="p.key" class="flex flex-col gap-1.5">
          <div class="mf-photo aspect-square rounded-2xl overflow-hidden border border-surface-line bg-surface-ground">
            <n-image
              v-if="p.src"
              :src="p.src"
              object-fit="cover"
              class="block w-full h-full"
              :img-props="{ class: 'w-full h-full object-cover' }"
              @error="broken[p.key] = true"
            />
            <div v-else class="h-full flex flex-col items-center justify-center gap-1.5 text-textColor3">
              <n-icon size="28"><ImageOff20Regular /></n-icon>
              <span class="text-xs">{{ $t('departmentLocationPage.events.noPhoto') }}</span>
            </div>
          </div>
          <span class="text-xs text-textColor3 text-center">{{ p.label }}</span>
        </div>
      </div>

      <!-- O'xshashlik holati: rang + ikonka + oddiy izoh -->
      <div class="flex items-center gap-2 rounded-xl px-3 py-2 text-[13px]" :class="match.cls">
        <n-icon size="18" class="shrink-0"><component :is="match.icon" /></n-icon>
        <span class="font-medium text-textColor0">{{ match.text }}</span>
        <span v-if="similarity != null" class="ml-auto shrink-0 font-semibold">{{ similarity }}%</span>
      </div>

      <!-- O'tish joyi -->
      <div class="rounded-xl border border-surface-line bg-surface-section overflow-hidden">
        <div class="px-3 pt-2" :class="hasCoords ? 'pb-1' : 'pb-2.5'">
          <div class="text-xs font-semibold uppercase tracking-wide text-textColor3 mb-1">
            {{ $t('departmentLocationPage.events.placeTitle') }}
          </div>
          <div class="flex items-center gap-2">
            <n-icon size="16" class="text-primary shrink-0"><Location20Filled /></n-icon>
            <span class="text-sm font-medium text-textColor0 truncate">{{ placeTitle }}</span>
            <n-tag v-if="sourceLabel && face.place_name" size="tiny" round>{{ sourceLabel }}</n-tag>
          </div>
          <div v-if="placeHint" class="text-xs text-textColor3 mt-0.5 pl-6">{{ placeHint }}</div>

          <template v-if="hasCoords">
            <div class="mf-row mt-1">
              <span class="mf-label">{{ $t('departmentLocationPage.events.coords') }}</span>
              <span class="flex items-center gap-1.5">
                <span class="mf-value font-mono text-[13px]">{{ coordsText }}</span>
                <n-icon
                  size="16"
                  class="cursor-pointer text-primary shrink-0"
                  :title="$t('departmentLocationPage.copyCoords')"
                  @click="copyCoords"
                >
                  <CopyIcon />
                </n-icon>
              </span>
            </div>
            <div v-if="accuracy != null" class="mf-row">
              <span class="mf-label">{{ $t('departmentLocationPage.events.accuracy') }}</span>
              <span class="mf-value">
                ±{{ accuracy }} m
                <span :class="accuracyLevel.cls">· {{ accuracyLevel.text }}</span>
              </span>
            </div>
          </template>
          <div v-else class="text-xs text-textColor3 mt-1 pl-6">
            {{ $t('departmentLocationPage.events.noCoords') }}
          </div>
        </div>

        <template v-if="hasCoords">
          <div class="mf-map h-[200px] border-t border-surface-line">
            <LocationMap
              v-if="mapReady"
              :key="face.id"
              readonly
              :lat="Number(face.lat)"
              :lng="Number(face.lng)"
              :radius="accuracy ?? 0"
              :polygon="[]"
              :geo-type="false"
            />
          </div>
          <div v-if="accuracy" class="px-3 py-1.5 text-xs text-textColor3 border-t border-surface-line">
            {{ $t('departmentLocationPage.events.accuracyHint') }}
          </div>
        </template>
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
  .mf-value {
    color: var(--textColor0);
    text-align: right;
  }
  /* n-image ichidagi o'rab oluvchi div ham katakni to'ldirsin. */
  .mf-photo :deep(.n-image) {
    display: block;
    width: 100%;
    height: 100%;
  }
  /* Kichik kartada xarita o'z balandligida — marker markazda turadi. */
  .mf-map :deep(.map-container) {
    min-height: 0;
  }
  .mf-map :deep(.location-map-wrapper) {
    border: 0;
    border-radius: 0;
  }
</style>
