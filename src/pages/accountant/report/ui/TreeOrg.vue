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

  // Qidiruvda mos korxona va uning barcha ota-bo'linmalari ko'rinadi, mos
  // farzandi bor tugunlar avtomatik ochiladi.
  const query = computed(() => store.orgSearch?.trim().toLowerCase() || '')
  const matches = (node) =>
    !query.value || node.name?.toLowerCase().includes(query.value) || !!node.children?.some(matches)

  const flattenData = computed(() => {
    function flattenTreeWithLevel(tree, level = 0) {
      const result = []

      function traverse(nodes, currentLevel) {
        for (const node of nodes) {
          if (!matches(node)) continue
          const { children, ...rest } = node
          result.push({ ...rest, level: currentLevel, isHasChildren: !!children?.length })
          const isExpanded =
            store.expandSet.has(node.id) || (query.value && children?.some(matches))
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

  const isOpen = (item) =>
    store.expandSet.has(item.id) ||
    (!!query.value && !!findNode(store.structuresList, item.id)?.children?.some(matches))

  const findNode = (list, id) => {
    for (const n of list) {
      if (n.id === id) return n
      const f = n.children?.length ? findNode(n.children, id) : null
      if (f) return f
    }
    return null
  }

  const toggleExpand = (id) => {
    if (store.expandSet.has(id)) {
      store.expandSet.delete(id)
    } else {
      store.expandSet.add(id)
    }
  }

  // Butun daraxtdagi (yopiq/ochiq — barcha) korxona id'lari. «Hammasini belgilash»
  // faqat ko'rinib turganlar emas, BARCHA ichki korxonalarni ham qamraydi.
  const allTreeIds = computed(() => {
    const ids = []
    const walk = (nodes) => {
      for (const n of nodes) {
        ids.push(n.id)
        if (n.children?.length) walk(n.children)
      }
    }
    walk(store.structuresList)
    return ids
  })
  const allSelected = computed(
    () =>
      allTreeIds.value.length > 0 &&
      allTreeIds.value.every((id) => store.confirmSelected.includes(id))
  )
  const someSelected = computed(
    () =>
      !allSelected.value &&
      allTreeIds.value.some((id) => store.confirmSelected.includes(id))
  )
  const toggleAll = () => {
    if (allSelected.value) {
      store.setConfirmSelected(store.confirmSelected.filter((id) => !allTreeIds.value.includes(id)))
    } else {
      store.setConfirmSelected([...new Set([...store.confirmSelected, ...allTreeIds.value])])
    }
  }
  // Subtree: node + barcha avlodlari ID'lari (yopiq childlar ham)
  const collectSubtreeIds = (nodeId) => {
    const ids = []
    const walk = (node) => {
      ids.push(node.id)
      for (const c of node.children || []) walk(c)
    }
    const node = findNode(store.structuresList, nodeId)
    if (node) walk(node)
    return ids
  }

  // Node + barcha childlarini tanlash/olib tashlash (radio tugmasi uchun)
  const toggleSubtree = (item) => {
    const ids = collectSubtreeIds(item.id)
    const allIn = ids.every((id) => store.confirmSelected.includes(id))
    if (allIn) {
      store.setConfirmSelected(store.confirmSelected.filter((id) => !ids.includes(id)))
    } else {
      store.setConfirmSelected([...new Set([...store.confirmSelected, ...ids])])
    }
  }

  const isSubtreeSelected = (item) =>
    collectSubtreeIds(item.id).every((id) => store.confirmSelected.includes(id))
</script>

<template>
  <n-spin class="h-full" content-class="h-full" :show="store.structuresLoading">
    <div class="h-full overflow-auto">
      <n-table class="!border-t-0 sticky-table-header" :single-line="false" size="small">
        <thead>
          <tr>
            <th class="min-w-[40px] w-[40px] !text-center">
              <n-checkbox
                :checked="allSelected"
                :indeterminate="someSelected"
                @update:checked="toggleAll"
              />
            </th>
            <th class="min-w-[320px] !text-left">{{ $t('content.organization') }}</th>
            <th class="min-w-[76px] w-[76px] !text-center text-xs !whitespace-normal leading-tight">
              {{ $t('uploadReport.form.monthReport') }}
            </th>
            <th class="min-w-[76px] w-[76px] !text-center text-xs !whitespace-normal leading-tight">
              {{ $t('uploadReport.form.applicationFour') }}
            </th>
            <th class="min-w-[76px] w-[76px] !text-center text-xs !whitespace-normal leading-tight">
              {{ $t('uploadReport.form.applicationFive') }}
            </th>
            <th class="min-w-[76px] w-[76px] !text-center text-xs !whitespace-normal leading-tight">
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
              <td @click.stop="store.toggleConfirmSelect(item.id)">
                <n-checkbox
                  :checked="store.confirmSelected.includes(item.id)"
                ></n-checkbox>
              </td>
              <td
                @click="store.onChangeStructure(item)"
                class="!text-left select-none cursor-pointer relative !pr-[4px]"
              >
                <div :style="{ paddingLeft: item.level * 15 + 'px' }" class="flex items-center">
                  <div class="flex justify-end w-[40px] flex-shrink-0 cursor-pointer">
                    <n-icon
                      v-if="item.isHasChildren"
                      @click.stop="toggleExpand(item.id)"
                      :class="[isOpen(item) ? 'rotate-90' : 'rotate-0']"
                      class="transition-all"
                      size="18"
                    >
                      <ChevronRight12Regular />
                    </n-icon>
                    <n-icon size="20">
                      <template v-if="item.isHasChildren">
                        <FolderOpen24Filled v-if="isOpen(item)" class="text-[#a312df]" />
                        <Folder20Filled v-else class="text-[#a312df]" />
                      </template>
                      <DocumentBulletList24Filled v-else class="text-primary" />
                    </n-icon>
                  </div>
                  <span class="ml-2 leading-[1.2] text-sm flex-1 min-w-0 break-words">{{ ' ' + item.name }}</span>
                  <!-- Radio: parent korxonalar uchun — childlar bilan birga tanlash -->
                  <n-radio
                    v-if="item.isHasChildren"
                    :checked="isSubtreeSelected(item)"
                    :value="item.id"
                    @click.stop.prevent="toggleSubtree(item)"
                    class="flex-shrink-0 ml-1"
                  />
                  <span v-if="!item.uploadStatus" class="flex-shrink-0 ml-1">
                    <n-icon size="18" class="text-warning">
                      <LockClosed12Filled />
                    </n-icon>
                  </span>
                </div>
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
          <tr v-if="!flattenData.length && !store.structuresLoading">
            <td colspan="6" class="!py-10 !text-center text-sm text-textColor3">
              {{ $t('content.no-data') }}
            </td>
          </tr>
        </tbody>
      </n-table>
    </div>
  </n-spin>
</template>
