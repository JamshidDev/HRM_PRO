<script setup>
import {ArrowDownload24Regular, ArrowSync20Filled} from '@vicons/fluent'
  import { UIPageContent, UIPageFilter, UIOfficeApp, UIYearMonth, UISelect } from '@/components/index.js'
  import { useStructureReportStore, useComponentStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import { getOneMonthAgoYearMonth } from '@utils'
  import GenerateModal from './ui/GenerateModal.vue'
  import ExcelDownloadModal from './ui/ExcelDownloadModal.vue'
  import GeneralExcelModal from './ui/GeneralExcelModal.vue'
  import ReportListTable from './ui/ReportListTable.vue'
  import ReportStatModal from './ui/ReportStatModal.vue'
  import AlertModal from './ui/AlertModal.vue'

  const store = useStructureReportStore()
  const componentStore = useComponentStore()
  const officeAppRef = ref(null)

  const onGenerate = () => {
    if (componentStore.structureList.length === 0) {
      componentStore._structures()
    }
    store.openModal()
  }

  const onSearch = () => {
    store.params.page = 1
    store._index()
  }

  const onFilter = () => {
    store.params.page = 1
    store._index()
    store._fetchReportsStat()
  }

  const onChangeStructure = (v) => {
    store.params.organizations = v
    onFilter()
  }

  const onDefaultOrganization = (v) => {
    store.params.organizations = v
  }

  const filterCount = computed(() => {
    return store.params.organizations.length
  })

  const notExistsCount = computed(() => {
    let count = 0
    const traverse = (nodes) => {
      for (const node of nodes) {
        if (!node.report_detail_exists) count++
        if (node.children?.length) traverse(node.children)
      }
    }
    traverse(store.statTree)
    return count
  })

  const resetFilter = () => {
    store.params.organizations = []
    onFilter()
  }

  const openReport = (id) => {
    officeAppRef.value.openPdf(id, Utils.documentModels.report)
  }

  const onShowFilter = (isOpen) => {
    if (!isOpen) return
    if (componentStore.structureList.length === 0) {
      componentStore._structures()
    }
  }

  onMounted(() => {
    if (!store.params.year || !store.params.month) {
      const oneMonthAgo = getOneMonthAgoYearMonth()
      store.params.year = store.params.year || oneMonthAgo.year
      store.params.month = store.params.month || oneMonthAgo.month
    }
    store._index()
    store._fetchReportsStat()
  })
</script>

<template>
  <UIPageContent>
    <UIPageFilter
      :show-filter-button="true"
      :show-add-button="true"
      :search-loading="store.loading"
      :filter-count="filterCount"
      v-model:search="store.params.search"
      :add-button-title="$t('structureReport.generate')"
      @onSearch="onSearch"
      @onAdd="onGenerate"
      @onClear="resetFilter"
      @show="onShowFilter"
    >
      <template #filterContent>
        <label class="text-xs text-gray-500 mb-1 font-medium">{{ $t('content.organization') }}</label>
        <UISelect
          :options="componentStore.structureList"
          :model-v="store.params.organizations"
          @defaultValue="onDefaultOrganization"
          @updateModel="onChangeStructure"
          :checked-val="store.structureCheck"
          @updateCheck="(v) => (store.structureCheck = v)"
          :loading="componentStore.structureLoading"
          v-model:search="componentStore.structureParams.search"
          @onSearch="componentStore._structures"
          @onSubmit="onFilter"
        />
      </template>
      <template #filterAction>
        <div class="max-w-[160px]">
          <UIYearMonth
            v-model:year="store.params.year"
            v-model:month="store.params.month"
            :clearable="false"
            @change="onFilter"
          />
        </div>
        <n-tooltip :delay="1500" placement="bottom" trigger="hover">
          <template #trigger>
            <n-button @click="store.statModalVisible = true" type="info">
              <span class="inline-flex items-center gap-1.5">
                {{ $t('structureReport.organizations') }}
                <span v-if="notExistsCount > 0" class="text-[11px] font-medium bg-white/20 rounded-full px-1.5 py-0.5">
                  {{ notExistsCount }}
                </span>
              </span>
            </n-button>
          </template>
          <span>{{ $t('structureReport.statTooltip') }}</span>
        </n-tooltip>

        <n-button @click="store.generalExcelModalVisible = true" type="success">
          <template #icon>
            <n-icon>
              <ArrowDownload24Regular />
            </n-icon>
          </template>
          {{ $t('structureReport.download') }}
        </n-button>
      </template>
    </UIPageFilter>

    <ReportListTable @openOffice="openReport" />

    <GenerateModal />
    <ExcelDownloadModal />
    <GeneralExcelModal />
    <ReportStatModal />
    <AlertModal />
    <UIOfficeApp ref="officeAppRef" />
  </UIPageContent>
</template>
