<script setup>
  import { useComponentStore } from '@/store/modules/index.js'
  import { UIModal, UISelect } from '@/components/index.js'
  import { ArrowDownload24Regular } from '@vicons/fluent'
  import { useMessage } from 'naive-ui'
  import { useAppSetting } from '@/utils/AppSetting.js'
  import Utils from '@/utils/Utils.js'
  import i18n from '@/i18n/index.js'

  const componentStore = useComponentStore()
  const message = useMessage()
  const { t } = i18n.global

  const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

  const showModal = ref(false)
  const loading = ref(false)

  // Forma holati
  const orgs = ref([]) // UISelect modelV — tanlangan korxona obyektlari {id, name}
  const orgChecked = ref([]) // daraxt ochilish holati
  const dateFrom = ref(null) // timestamp (n-date-picker)
  const dateTo = ref(null)
  const startTime = ref('09:00') // n-time-picker formatted-value ("HH:mm")

  // Korxona daraxtini lazy-load qilamiz (integrationClients bilan bir xil naqsh).
  const loadStructure = () => {
    if (componentStore.structureList.length === 0) componentStore._structures()
  }

  const openModal = () => {
    orgs.value = []
    orgChecked.value = []
    dateFrom.value = null
    dateTo.value = null
    startTime.value = '09:00'
    loadStructure()
    showModal.value = true
  }

  // n-date-picker LOKAL yarim tunni timestamp qaytaradi — UTC'ga o'tkazmasdan
  // lokal YYYY-MM-DD olamiz (Asia/Tashkent'da kun siljib ketmasin).
  const fmtDate = (ts) => {
    const d = new Date(ts)
    const p = (n) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
  }

  const download = () => {
    if (orgs.value.length === 0)
      return message.error(t('lateWorkersReport.validation.organizations'))
    if (!dateFrom.value || !dateTo.value)
      return message.error(t('lateWorkersReport.validation.period'))
    if (dateTo.value < dateFrom.value)
      return message.error(t('lateWorkersReport.validation.dateOrder'))
    if (!startTime.value) return message.error(t('lateWorkersReport.validation.startTime'))

    const from = fmtDate(dateFrom.value)
    const to = fmtDate(dateTo.value)
    loading.value = true
    $ApiService.lateWorkersReportService
      ._lateWorkersExport({
        params: {
          from,
          to,
          start_time: startTime.value,
          organizations: orgs.value.map((o) => o.id).join(',')
        }
      })
      .then((res) => {
        Utils.blobFileDownload(res.data, XLSX_MIME, `kech_qoluvchilar_${from}_${to}.xlsx`)
        message.success(t('lateWorkersReport.downloaded'))
        showModal.value = false
      })
      .catch(() => message.error(t('lateWorkersReport.failed')))
      .finally(() => {
        loading.value = false
      })
  }
</script>

<template>
  <div class="p-4">
    <!-- Bosh kartochka + tugma (bosilsa modal ochiladi) -->
    <div class="bg-surface-card border border-surface-line rounded-xl p-6 max-w-2xl">
      <h2 class="text-lg font-semibold text-textColor0">{{ $t('lateWorkersReport.title') }}</h2>
      <p class="text-sm text-textColor3 mt-1 mb-4">{{ $t('lateWorkersReport.subtitle') }}</p>
      <n-button type="primary" @click="openModal">
        <template #icon><n-icon><ArrowDownload24Regular /></n-icon></template>
        {{ $t('lateWorkersReport.createButton') }}
      </n-button>
    </div>

    <!-- Forma modali -->
    <UIModal v-model:visible="showModal" :title="$t('lateWorkersReport.modalTitle')" width="560">
      <div class="py-1 flex flex-col gap-4">
        <!-- Korxonalar (daraxt select) -->
        <div>
          <label class="text-xs text-textColor3 mb-1 block">
            {{ $t('lateWorkersReport.organizations') }}
          </label>
          <UISelect
            :options="componentStore.structureList"
            :modelV="orgs"
            :checkedVal="orgChecked"
            :multiple="true"
            :loading="componentStore.structureLoading"
            v-model:search="componentStore.structureParams.search"
            @updateModel="(v) => (orgs = v)"
            @updateCheck="(v) => (orgChecked = v)"
            @onSearch="componentStore._structures"
          />
        </div>

        <!-- Davr: boshlanish / tugash -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-xs text-textColor3 mb-1 block">{{ $t('lateWorkersReport.from') }}</label>
            <n-date-picker
              v-model:value="dateFrom"
              type="date"
              clearable
              class="w-full"
              :format="useAppSetting.datePicketFormat"
              :placeholder="$t('lateWorkersReport.from')"
            />
          </div>
          <div>
            <label class="text-xs text-textColor3 mb-1 block">{{ $t('lateWorkersReport.to') }}</label>
            <n-date-picker
              v-model:value="dateTo"
              type="date"
              clearable
              class="w-full"
              :format="useAppSetting.datePicketFormat"
              :placeholder="$t('lateWorkersReport.to')"
            />
          </div>
        </div>

        <!-- Ish boshlanish vaqti -->
        <div>
          <label class="text-xs text-textColor3 mb-1 block">{{ $t('lateWorkersReport.startTime') }}</label>
          <n-time-picker
            v-model:formatted-value="startTime"
            format="HH:mm"
            class="w-full"
            :placeholder="$t('lateWorkersReport.startTime')"
          />
        </div>
      </div>

      <template #footer>
        <div class="grid grid-cols-2 gap-3 pt-2">
          <n-button @click="showModal = false" :disabled="loading" type="error" ghost>
            {{ $t('content.cancel') }}
          </n-button>
          <n-button type="primary" :loading="loading" @click="download">
            <template #icon><n-icon><ArrowDownload24Regular /></n-icon></template>
            {{ $t('lateWorkersReport.download') }}
          </n-button>
        </div>
      </template>
    </UIModal>
  </div>
</template>
