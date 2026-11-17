<script setup>
  import { UIModal } from '@/components/index.js'
  import { useMedStore } from '@/store/modules/index.js'
  import { ArrowDownload24Regular } from '@vicons/fluent'

  const visible = defineModel('visible', { type: Boolean, default: false })

  const store = useMedStore()
  const { proxy } = getCurrentInstance()

  const MONTH_KEYS = [
    'january',
    'february',
    'march',
    'april',
    'may',
    'june',
    'july',
    'august',
    'september',
    'october',
    'november',
    'december'
  ]

  const year = ref(new Date().getFullYear() + 1)
  const meta = ref(null)
  const metaLoading = ref(false)
  const exportLoading = ref(false)
  const downloadBtnRef = ref(null)

  const thisYear = new Date().getFullYear()
  const yearOptions = Array.from({ length: 5 }, (_, i) => {
    const y = thisYear - 1 + i
    return { label: String(y), value: y }
  })

  // Ro'yxat filtridagi korxona va bo'limlar asosida.
  const params = computed(() => ({
    year: year.value,
    organizations: store.params.organizations.map((v) => v.id).toString() || undefined,
    departments: store.params.departments.toString() || undefined
  }))

  const orgNames = computed(() => store.params.organizations.map((v) => v.name).join(', '))
  const activeMonths = computed(() => (meta.value?.months || []).filter((m) => m.count))

  const loadMeta = () => {
    meta.value = null
    metaLoading.value = true
    $ApiService.medService
      ._scheduleMeta({ params: params.value })
      .then((res) => {
        meta.value = res.data.data
      })
      .finally(() => {
        metaLoading.value = false
      })
  }

  watch(year, loadMeta)
  watch(visible, (v) => v && loadMeta())

  const onDownload = () => {
    if (!meta.value?.total) return
    exportLoading.value = true
    $ApiService.medService
      ._scheduleExport({ params: params.value })
      .then((res) => {
        const btnEl = downloadBtnRef.value?.$el || downloadBtnRef.value
        proxy.$flyUpload?.(btnEl)
        window.$message?.success(res.data?.message)
        visible.value = false
      })
      .finally(() => {
        exportLoading.value = false
      })
  }
</script>

<template>
  <UIModal
    v-model:visible="visible"
    :title="$t('medPage.schedule.title')"
    width="min(520px, calc(100vw - 32px))"
  >
    <div class="flex flex-col gap-4 p-1">
      <div class="rounded-xl border border-gray-200 p-3 text-sm dark:border-gray-700">
        <div class="text-gray-500">{{ $t('medPage.schedule.organization') }}</div>
        <div class="font-medium">{{ orgNames || $t('medPage.schedule.allOrgs') }}</div>
        <div v-if="store.params.departments.length" class="mt-1 text-gray-500">
          {{ $t('medPage.schedule.departments', { n: store.params.departments.length }) }}
        </div>
      </div>

      <div>
        <label>{{ $t('medPage.schedule.year') }}</label>
        <n-select v-model:value="year" :options="yearOptions" />
      </div>

      <n-spin :show="metaLoading">
        <div
          class="min-h-[64px] rounded-xl border border-gray-200 p-3 text-sm dark:border-gray-700"
        >
          <template v-if="meta">
            <div v-if="!meta.total" class="text-gray-500">{{ $t('medPage.schedule.empty') }}</div>
            <template v-else>
              <div class="mb-2 font-semibold">
                {{ $t('medPage.schedule.total', { n: meta.total }) }}
              </div>
              <div class="flex flex-wrap gap-1.5">
                <n-tag
                  v-for="m in activeMonths"
                  :key="m.month"
                  size="small"
                  round
                  :bordered="false"
                >
                  {{ $t(`month.${MONTH_KEYS[m.month - 1]}`) }}: {{ m.count }}
                </n-tag>
              </div>
            </template>
          </template>
        </div>
      </n-spin>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2 px-4 pb-2">
        <n-button type="error" ghost class="w-[130px]" @click="visible = false">
          {{ $t('content.cancel') }}
        </n-button>
        <n-button
          ref="downloadBtnRef"
          type="primary"
          :disabled="!meta?.total"
          :loading="exportLoading"
          @click="onDownload"
        >
          {{ $t('medPage.schedule.download') }}
          <template #icon>
            <n-icon><ArrowDownload24Regular /></n-icon>
          </template>
        </n-button>
      </div>
    </template>
  </UIModal>
</template>
