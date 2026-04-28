<script setup>
  import { UIModal, TreeData } from '@/components/index.js'
  import { useStructureReportStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'

  const store = useStructureReportStore()

  const modalSubtitle = computed(() => {
    const monthName = Utils.monthList.find((m) => m.id === store.params.month)?.name || ''
    return `${store.params.year}, ${monthName}`
  })

  // Barcha leaf childlari report_for_period ga ega bo'lsa true
  const allChildrenHaveReport = (node) => {
    if (node.children && node.children.length > 0) {
      return node.children.every((child) => allChildrenHaveReport(child))
    }
    return !!node.report_for_period
  }

  // Tasdiqlash holatiga qarab checkbox style
  const checkboxStyle = (node) => {
    if (!node.report_for_period) return {}
    const isApproved = node.report_for_period.confirmation === 3
    const color = isApproved ? '#18a058' : '#f0a020'
    return {
      '--n-color-checked': color,
      '--n-border-checked': `1px solid ${color}`,
      '--n-border-focus': `1px solid ${color}`,
      '--n-box-shadow-focus': `0 0 0 2px ${color}33`
    }
  }

  const getCheckedNodes = (nodes) => {
    const result = []
    const traverse = (list) => {
      for (const node of list) {
        if (node.report_for_period) {
          result.push({ id: node.id, name: node.name })
        }
        if (node.children && node.children.length > 0) {
          traverse(node.children)
        }
      }
    }
    traverse(nodes)
    return result
  }

  const checkedNodes = computed(() => getCheckedNodes(store.statTree))
  const expandedIds = ref([])

  watch(() => store.statModalVisible, (v) => {
    if (v) {
      store.statTree = []
      nextTick(() => {
        store._fetchReportsStat()
      })
    }
  })
</script>

<template>
  <UIModal
    v-model:visible="store.statModalVisible"
    :width="700"
    height="85vh"
    :title="$t('structureReport.stat')"
  >
    <template #header-title>
      {{ $t('structureReport.organizations') }}
      <span class="text-sm text-gray-400 font-normal ml-2">{{ modalSubtitle }}</span>
    </template>
    <div class="mb-3 border border-surface-line rounded-lg px-3 py-2">
      <div class="flex flex-wrap gap-3 text-xs">
          <div class="flex items-center gap-1.5">
            <span class="w-3.5 h-3.5 rounded-sm flex-shrink-0" style="background:#f0a020"></span>
            <span>{{ $t('structureReport.statLegendProcess') }}</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-3.5 h-3.5 rounded-sm flex-shrink-0" style="background:#18a058"></span>
            <span>{{ $t('structureReport.statLegendApproved') }}</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-3.5 h-3.5 rounded-sm border border-gray-300 flex-shrink-0 bg-white"></span>
            <span>{{ $t('structureReport.statLegendEmpty') }}</span>
          </div>
      </div>
    </div>
    <div class="overflow-auto" style="max-height: calc(85vh - 140px)">
      <n-spin :show="store.statLoading" content-class="min-h-[300px]">
        <TreeData
          :options="store.statTree"
          :model-v="checkedNodes"
          :checked-val="expandedIds"
          :multiple="true"
          :opened="true"
          :show-check="true"
          :check-style="checkboxStyle"
          @updateModel="() => {}"
          @updateCheck="(v) => expandedIds = v"
        >
          <template #title="{ data }">
            <div class="flex items-center justify-between w-full pr-2">
              <span>{{ data.name }}</span>
              <n-checkbox :checked="allChildrenHaveReport(data)" />
            </div>
          </template>
        </TreeData>
      </n-spin>
    </div>
  </UIModal>
</template>
