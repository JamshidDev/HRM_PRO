<script setup>
  import { UISelect } from '@/components/index.js'
  import { useComponentStore, useDepartmentStore, useReport2Store } from '@/store/modules/index.js'
  import { useAccountStore } from '@/store/modules/index.js'
  import { AddCircle24Regular, ArrowDownload24Regular } from '@vicons/fluent'
  import i18n from '@/i18n/index.js'
  const accStore = useAccountStore()
  const { proxy } = getCurrentInstance()
  const staffingButtonRef = ref(null)

  const componentStore = useComponentStore()
  const store = useReport2Store()
  const { t } = i18n.global
  const dpStore = useDepartmentStore()

  const selectedOrg = computed(() => store.department.params.organization_id?.[0] || null)

  const orgStats = computed(() => {
    const org = selectedOrg.value
    if (!org) return []
    return [
      { label: t('report.tooltip.P'), value: org.rate, cls: 'text-fig-text-primary' },
      {
        label: t('report.tooltip.F'),
        value: org.real_rate,
        cls: org.real_rate > org.rate ? 'text-fig-text-red' : 'text-fig-text-primary'
      }
    ]
  })

  const onChangeOrg = (v) => {
    store.department.params.organization_id = v
    store.department.list = []
    if (!accStore.checkAction(accStore.pn.hrReportRead)) return
    if (v.length === 0) return
    store._getDepartment()
  }

  // Tashkilot bitta bo'lsa UISelect uni avtomatik tanlaydi. Watch har safar
  // options o'zgarganda qayta chaqiradi — o'sha tashkilot allaqachon tanlangan
  // bo'lsa bo'linmalar qayta yuklanmasin.
  const onDefaultEv = (list) => {
    if (selectedOrg.value?.id === list?.[0]?.id) return
    onChangeOrg([list[0]])
  }

  const onSearch = () => {
    store._fetchStructure()
  }

  const addDepartment = () => {
    store.department.visible = true
    dpStore.visibleType = true
    dpStore._level()
    componentStore._departments()
    dpStore.resetForm()
  }

  const exportStaffing = () => {
    if (!accStore.checkAction(accStore.pn.hrReportStaffingExport)) return
    const organizationId = selectedOrg.value?.id
    if (!organizationId) return
    const element = staffingButtonRef.value?.$el || staffingButtonRef.value
    if (element) proxy.$flyUpload(element)
    store._exportStaffing(organizationId)
  }

  onMounted(() => {
    store._fetchStructure()
  })
</script>

<template>
  <div
    class="w-full bg-surface-section rounded-[20px] p-3 flex flex-col md:flex-row md:items-end gap-3"
  >
    <!-- Tashkilot select'i o'ng chetda: desktopda `order-last` bilan oxiriga
         o'tadi, mobilda esa birinchi bo'lib qoladi. -->
    <div class="w-full md:w-[360px] shrink-0 md:order-last" :class="{ 'md:ml-auto': !selectedOrg }">
      <label class="block text-xs text-gray-500 mb-1 font-medium">
        {{ $t('content.organization') }}
      </label>
      <UISelect
        placement="bottom-end"
        clearable
        :multiple="false"
        :options="store.structure.list"
        :loading="store.structure.loading"
        :model-v="store.department.params.organization_id"
        :checked-val="store.structure.cache"
        :placeholder="$t('content.choose')"
        v-model:search="store.structure.params.search"
        @updateModel="onChangeOrg"
        @defaultValue="onDefaultEv"
        @updateCheck="(v) => (store.structure.cache = v)"
        @onSearch="onSearch"
        @onSubmit="onSearch"
      >
        <template #label="{ data }">
          <div class="flex items-center justify-between w-full pl-1 pt-1">
            <div class="leading-[1.1]">{{ data.name }}</div>
            <div class="shrink-0 w-[80px] grid grid-cols-2 gap-1 pr-2">
              <n-button
                :type="data.rate > data.real_rate ? 'success' : 'default'"
                class="!text-[10px]"
                size="tiny"
                secondary
                >{{ data.rate }}</n-button
              >
              <n-button
                :type="data.real_rate > data.rate ? 'error' : 'default'"
                class="!text-[10px]"
                size="tiny"
                secondary
                >{{ data.real_rate }}</n-button
              >
            </div>
          </div>
        </template>
      </UISelect>
    </div>

    <template v-if="selectedOrg">
      <!-- Tashkilot bo'yicha jami Plan/Fakt: bitta guruhda, ajratgich bilan.
           Fakt plandan oshsa qizil bo'ladi. -->
      <div
        class="flex items-center self-start md:self-auto h-[34px] rounded-xl border border-table-border divide-x divide-table-border"
      >
        <div
          v-for="item in orgStats"
          :key="item.label"
          class="flex items-center gap-2 h-full px-3.5"
        >
          <span class="text-xs text-fig-text-tertiary">{{ item.label }}</span>
          <span class="text-sm font-semibold tabular-nums" :class="item.cls">
            {{ item.value ?? 0 }}
          </span>
        </div>
      </div>

      <div class="flex flex-wrap gap-2 md:ml-auto">
        <n-button
          v-if="accStore.checkPermission(accStore.pn.hrReportStaffingExport)"
          ref="staffingButtonRef"
          :loading="store.staffingExportLoading"
          @click="exportStaffing"
          type="success"
          secondary
        >
          <template #icon>
            <n-icon><ArrowDownload24Regular /></n-icon>
          </template>
          {{ $t('report.staffingExport') }}
        </n-button>
        <n-button @click="addDepartment" type="primary">
          <template #icon>
            <n-icon><AddCircle24Regular /></n-icon>
          </template>
          {{ $t('report.addDepartment') }}
        </n-button>
      </div>
    </template>
  </div>
</template>
