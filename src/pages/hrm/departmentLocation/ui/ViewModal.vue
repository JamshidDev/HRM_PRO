<script setup>
  /**
   * Bo'lim joylashuvini ko'rish. Chapda: bo'lim kartasi, ixcham ma'lumotlar (nomi, turi, hudud,
   * koordinata + nusxalash, aniqlik, sana) va pastda Tahrirlash / O'chirish
   * (ruxsat bo'yicha). O'ngda xarita (faqat ko'rish).
   */
  import { UIModal, UIDeleteConfirm } from '@/components/index.js'
  import { useDepartmentLocationStore } from '@/store/modules/index.js'
  import { useAccountStore } from '@/store/modules/app/accountStore.js'
  import LocationMap from './LocationMap.vue'
  import CopyIcon from '@/assets/icons/copyIcon.svg'
  import { Location20Filled, Edit16Regular, Delete16Regular } from '@vicons/fluent'
  import Utils from '@/utils/Utils.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const store = useDepartmentLocationStore()
  const accStore = useAccountStore()
  const canWrite = computed(() => accStore.checkPermission(accStore.pn.departmentLocationWrite))
  const canDelete = computed(() => accStore.checkPermission(accStore.pn.departmentLocationDelete))

  const data = computed(() => store.viewData)
  const row = computed(() => store.viewRow || {})

  // `_show` javobida bo'lim yo'q — jadval qatoridan olinadi.
  const departmentName = computed(() => row.value.department?.name || data.value?.department?.name || '')
  const organizationName = computed(
    () => row.value.organization?.name || data.value?.department?.organization_name || ''
  )

  const type = computed(() => (data.value?.is_free ? 'free' : data.value?.geo_type ? 'area' : 'point'))
  const TYPE_CHIP = {
    free: 'bg-fig-chip-green text-fig-chip-green-text',
    area: 'bg-fig-chip-indigo text-fig-chip-indigo-text',
    point: 'bg-fig-chip-brand text-fig-chip-brand-text'
  }
  const typeLabel = computed(
    () =>
      ({
        free: t('departmentLocationPage.freeBadge'),
        area: t('departmentLocationPage.form.area'),
        point: t('departmentLocationPage.form.coordinate')
      })[type.value]
  )
  const zoneText = computed(() => {
    if (type.value === 'area') return t('departmentLocationPage.pointsCount', { n: (data.value?.polygon || []).length })
    if (type.value === 'point') return `${data.value?.radius} m`
    return '—'
  })

  const coordsText = computed(() => {
    const d = data.value
    if (!d || d.is_free || d.lat == null || d.lng == null) return ''
    return `${Number(d.lat).toFixed(6)}, ${Number(d.lng).toFixed(6)}`
  })

  // Backend `created_at` qaytaradi (eski kod `create_at` ni o'qirdi — sana bo'sh chiqardi).
  const createdAt = computed(() => {
    const v = data.value?.created_at ?? data.value?.create_at
    return v ? Utils.timeOnlyDate(v) : '—'
  })

  const copyCoords = () => {
    Utils.copyToClipboard(coordsText.value, () => $Toast.success(t('content.copied')))
  }

  const onEdit = () => {
    const item = { ...row.value, id: data.value?.id ?? row.value.id }
    store.viewVisible = false
    store.openEditModal(item)
  }

  const confirmVisible = ref(false)
  const onConfirmDelete = () => {
    confirmVisible.value = false
    store.elementId = data.value?.id ?? row.value.id
    store._delete()
  }
</script>

<template>
  <UIModal
    v-model:visible="store.viewVisible"
    :title="$t('departmentLocationPage.viewTitle')"
    :width="1040"
    height="80vh"
  >
    <n-spin :show="store.viewLoading" class="h-full" content-class="h-full min-h-[200px]">
      <!-- Tor ekranda (< lg) ma'lumot va xarita ustma-ust, butun oyna aylanadi -->
      <div v-if="data" class="flex h-full flex-col gap-4 overflow-y-auto lg:flex-row lg:overflow-visible">
        <!-- Chap: ma'lumotlar -->
        <div class="flex w-full shrink-0 flex-col gap-3 lg:w-[300px] lg:min-h-0">
          <div class="flex flex-col gap-3 lg:flex-1 lg:min-h-0 lg:overflow-y-auto">
            <!-- Bo'lim -->
            <div v-if="departmentName" class="flex min-w-0 flex-col px-1">
              <span class="line-clamp-2 font-semibold leading-[1.3] text-textColor0">{{ departmentName }}</span>
              <span v-if="organizationName" class="truncate text-xs text-textColor3">{{ organizationName }}</span>
            </div>

            <!-- Ma'lumotlar -->
            <dl class="dl-info">
              <div class="dl-info__row">
                <dt>{{ $t('departmentLocationPage.table.name') }}</dt>
                <dd>
                  <span v-if="data.name">{{ data.name }}</span>
                  <span v-else class="italic text-textColor3">{{ $t('departmentLocationPage.unnamed') }}</span>
                </dd>
              </div>
              <div class="dl-info__row">
                <dt>{{ $t('departmentLocationPage.table.geoType') }}</dt>
                <dd><span class="dl-type" :class="TYPE_CHIP[type]">{{ typeLabel }}</span></dd>
              </div>
              <div v-if="type !== 'free'" class="dl-info__row">
                <dt>{{ $t('departmentLocationPage.table.zone') }}</dt>
                <dd>{{ zoneText }}</dd>
              </div>
              <div v-if="coordsText" class="dl-info__row">
                <dt>{{ $t('departmentLocationPage.table.coords') }}</dt>
                <dd class="flex items-center justify-end gap-1.5">
                  <span class="font-mono text-[12px]">{{ coordsText }}</span>
                  <n-icon
                    size="16"
                    class="cursor-pointer text-primary shrink-0"
                    :title="$t('departmentLocationPage.copyCoords')"
                    @click="copyCoords"
                  >
                    <CopyIcon />
                  </n-icon>
                </dd>
              </div>
              <div v-if="type !== 'free'" class="dl-info__row">
                <dt>{{ $t('departmentLocationPage.table.accuracy') }}</dt>
                <dd>{{ data.accuracy_limit ?? '—' }}</dd>
              </div>
              <div class="dl-info__row">
                <dt>{{ $t('content.date') }}</dt>
                <dd>{{ createdAt }}</dd>
              </div>
            </dl>
          </div>

          <!-- Amallar -->
          <div v-if="canWrite || canDelete" class="flex gap-3 pt-1">
            <n-button
              v-if="canDelete"
              class="flex-1"
              type="error"
              secondary
              :loading="store.deleteLoading"
              @click="confirmVisible = true"
            >
              <template #icon>
                <n-icon><Delete16Regular /></n-icon>
              </template>
              {{ $t('content.delete') }}
            </n-button>
            <n-button v-if="canWrite" class="flex-1" type="primary" @click="onEdit">
              <template #icon>
                <n-icon><Edit16Regular /></n-icon>
              </template>
              {{ $t('content.edit') }}
            </n-button>
          </div>
        </div>

        <!-- O'ng: xarita -->
        <div class="min-h-[360px] flex-1 lg:min-h-0">
          <div
            v-if="data.is_free"
            class="flex h-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-surface-line p-6 text-center"
          >
            <n-icon size="36" class="text-primary"><Location20Filled /></n-icon>
            <span class="font-medium text-textColor1">{{ $t('departmentLocationPage.form.freeMode') }}</span>
            <span class="max-w-[420px] text-sm text-textColor3">{{ $t('departmentLocationPage.form.freeModeHint') }}</span>
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

  <!-- Jadvallardagi kabi umumiy tasdiqlash oynasi -->
  <UIDeleteConfirm v-model:visible="confirmVisible" @confirm="onConfirmDelete" />
</template>

<style scoped>
  .dl-info {
    margin: 0;
    border: 1px solid var(--surface-line);
    border-radius: 14px;
    overflow: hidden;
  }

  .dl-info__row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    min-height: 40px;
    padding: 8px 12px;
    background: var(--surface-section);
  }

  .dl-info__row + .dl-info__row {
    border-top: 1px solid var(--surface-line);
  }

  .dl-info__row dt {
    flex-shrink: 0;
    color: var(--textColor3);
    font-size: 12px;
  }

  .dl-info__row dd {
    margin: 0;
    min-width: 0;
    color: var(--textColor0);
    font-size: 13px;
    font-weight: 500;
    text-align: right;
    overflow-wrap: anywhere;
  }

  .dl-type {
    display: inline-flex;
    align-items: center;
    height: 22px;
    padding: 0 8px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 500;
    white-space: nowrap;
  }
</style>
