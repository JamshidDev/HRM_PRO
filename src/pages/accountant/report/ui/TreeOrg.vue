<script setup>
  import { useUploadReportStore } from '@/store/modules/index.js'
  import {
    ChevronRight12Regular,
    DocumentBulletList24Filled,
    Folder20Filled,
    FolderOpen24Filled,
    LockClosed12Filled
  } from '@vicons/fluent'
  import IndicatorStatus from './IndicatorStatus.vue'
  import { computed } from 'vue'
  const store = useUploadReportStore()

  const flattenData = computed(() => {
    function flattenTreeWithLevel(tree, level = 0) {
      const result = []

      function traverse(nodes, currentLevel) {
        for (const node of nodes) {
          const { children, ...rest } = node
          result.push({ ...rest, level: currentLevel, isHasChildren: !!children.length })
          const isExpanded = store.expandSet.has(node.id)
          if (isExpanded && children && children.length > 0) {
            traverse(children, currentLevel + 1)
          }
        }
      }
      traverse(tree, level)
      return result
    }
    return flattenTreeWithLevel(store.structuresList, 0)
  })

  const toggleExpand = (id) => {
    if (store.expandSet.has(id)) {
      store.expandSet.delete(id)
    } else {
      store.expandSet.add(id)
    }
  }
</script>

<template>
  <n-spin class="min-h-[400px]" :show="store.structuresLoading">
    <div class="h-[calc(100vh-200px)] overflow-auto">
      <n-table class="!border-t-0 sticky-table-header" :single-line="false" size="small">
        <thead>
          <tr>
            <th class="min-w-[40px] w-[40px] !text-center"></th>
            <th class="min-w-[400px] !text-center">{{ $t('content.organization') }}</th>
            <th class="min-w-[80px] w-[80px] !text-center text-xs">
              {{ $t('uploadReport.form.monthReport') }}
            </th>
            <th class="min-w-[80px] w-[80px] !text-center text-xs">
              {{ $t('uploadReport.form.applicationFour') }}
            </th>
            <th class="min-w-[80px] w-[80px] !text-center text-xs">
              {{ $t('uploadReport.form.applicationFive') }}
            </th>
            <th class="min-w-[80px] w-[80px] !text-center text-xs">
              {{ $t('uploadReport.form.INPSPayment') }}
            </th>
          </tr>
        </thead>

        <tbody>
          <template v-for="(item, idx) in flattenData" :key="idx">
            <tr
              class="hover-row"
              :class="[item.id === store.params.organization_id && 'selectedRow']"
            >
              <td @click="store.onChangeStructure(item)">
                <n-checkbox :checked="item.id === store.params.organization_id"></n-checkbox>
              </td>
              <td
                @dblclick="store.onChangeStructure(item)"
                class="!text-left select-none cursor-pointer relative !pr-[20px]"
              >
                <div :style="{ paddingLeft: item.level * 15 + 'px' }" class="flex items-start">
                  <div class="flex justify-end w-[40px] cursor-pointer">
                    <n-icon
                      v-if="item.isHasChildren"
                      @click="toggleExpand(item.id)"
                      :class="[store.expandSet.has(item.id) ? 'rotate-90' : 'rotate-0']"
                      class="transition-all"
                      size="18"
                    >
                      <ChevronRight12Regular />
                    </n-icon>
                    <n-icon size="20">
                      <template v-if="item.isHasChildren">
                        <FolderOpen24Filled
                          v-if="!store.expandSet.has(item.id)"
                          class="text-[#a312df]"
                        />
                        <Folder20Filled v-else class="text-[#a312df]" />
                      </template>
                      <DocumentBulletList24Filled v-else class="text-primary" />
                    </n-icon>
                  </div>
                  <span
                    class="ml-2 leading-[1.2] inline-block !text-wrap text-sm w-[calc(100%-40px)]"
                    >{{ ' ' + item.name }}</span
                  >
                </div>
                <span v-if="!item.uploadStatus" class="absolute right-[4px] top-[4px]">
                  <n-icon size="18" class="text-warning">
                    <LockClosed12Filled />
                  </n-icon>
                </span>
              </td>
              <td>
                <div class="flex justify-center w-full">
                  <IndicatorStatus
                    :status="item.uploadStats?.[0]?.confirmed"
                    :count="item.uploadStats?.[0]?.uploaded_count"
                  />
                </div>
              </td>
              <td>
                <div class="flex justify-center w-full">
                  <IndicatorStatus
                    :status="item.uploadStats?.[1]?.confirmed"
                    :count="item.uploadStats?.[1]?.uploaded_count"
                  />
                </div>
              </td>
              <td>
                <div class="flex justify-center w-full">
                  <IndicatorStatus
                    :status="item.uploadStats?.[2]?.confirmed"
                    :count="item.uploadStats?.[2]?.uploaded_count"
                  />
                </div>
              </td>
              <td>
                <div class="flex justify-center w-full">
                  <IndicatorStatus
                    :status="item.uploadStats?.[3]?.confirmed"
                    :count="item.uploadStats?.[3]?.uploaded_count"
                  />
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </n-table>
    </div>
  </n-spin>
</template>
