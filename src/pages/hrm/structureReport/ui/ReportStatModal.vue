<script setup>
  import { UIModal, TreeData } from '@/components/index.js'
  import { useStructureReportStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'

  const store = useStructureReportStore()

  const modalSubtitle = computed(() => {
    const monthName = Utils.monthList.find((m) => m.id === store.params.month)?.name || ''
    return `${store.params.year}, ${monthName}`
  })

  const getCheckedNodes = (nodes) => {
    const result = []
    const traverse = (list) => {
      for (const node of list) {
        if (node.report_detail_exists) {
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
    <n-alert type="info" :bordered="false" class="mb-3">
      {{ $t('structureReport.statTooltip') }}
    </n-alert>
    <div class="overflow-auto" style="max-height: calc(85vh - 140px)">
      <n-spin :show="store.statLoading" content-class="min-h-[300px]">
        <TreeData
          :options="store.statTree"
          :model-v="checkedNodes"
          :checked-val="expandedIds"
          :multiple="true"
          :opened="true"
          :show-check="true"
          @updateModel="() => {}"
          @updateCheck="(v) => expandedIds = v"
        >
          <template #title="{ data }">
            <div class="flex items-center justify-between w-full pr-2">
              <span>{{ data.name }}</span>
              <n-checkbox :checked="data.report_detail_exists" />
            </div>
          </template>
        </TreeData>
      </n-spin>
    </div>
  </UIModal>
</template>
