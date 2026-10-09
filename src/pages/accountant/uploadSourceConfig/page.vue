<script setup>
import { useUploadSourceConfigStore, useAccountStore } from '@/store/modules/index.js'
import { UIPageContent } from '@/components/index.js'
import {
  ChevronRight12Regular,
  Folder20Filled,
  FolderOpen24Filled,
  DocumentBulletList24Filled,
  Save24Regular,
  Delete24Regular
} from '@vicons/fluent'
import { useElementBounding, useMediaQuery, useResizeObserver, useWindowSize } from '@vueuse/core'

const store = useUploadSourceConfigStore()
const accStore = useAccountStore()

/* ── balandlik hisoblash (report/page.vue pattern) ── */
const headerRef = ref(null)
const bodyRef = ref(null)
const isDesktop = useMediaQuery('(min-width: 1024px)')
const { height: windowHeight } = useWindowSize()
const { top: bodyTop, update: updateBodyTop } = useElementBounding(bodyRef)
useResizeObserver(headerRef, () => updateBodyTop())
const bodyStyle = computed(() =>
  isDesktop.value ? { height: `${Math.max(480, windowHeight.value - bodyTop.value - 16)}px` } : {}
)

onMounted(() => {
  if (!accStore.checkPermission(accStore.pn.economistUploadSourceConfigRead)) return
  store._index()
})

/* ── daraxt qidiruv + flatten (report TreeOrg pattern) ── */
const query = computed(() => store.orgSearch?.trim().toLowerCase() || '')

const matches = (node) =>
  !query.value ||
  node.name?.toLowerCase().includes(query.value) ||
  (node.children || []).some(matches)

const isOpen = (id) =>
  store.expandedIds.includes(id) || (!!query.value)

const toggleExpand = (id) => {
  const idx = store.expandedIds.indexOf(id)
  if (idx >= 0) store.expandedIds.splice(idx, 1)
  else store.expandedIds.push(id)
}

const flattenData = computed(() => {
  const result = []
  const walk = (nodes, level) => {
    for (const node of nodes) {
      if (!matches(node)) continue
      const { children, ...rest } = node
      result.push({ ...rest, level, isHasChildren: !!(children?.length), children })
      if (isOpen(node.id) && children?.length) walk(children, level + 1)
    }
  }
  walk(store.tree, 0)
  return result
})

/* ── tanlash (checkbox) ── */
const allLeafIds = computed(() => {
  const ids = []
  const walk = (nodes) => {
    for (const n of nodes) {
      ids.push(n.id)
      if (n.children?.length) walk(n.children)
    }
  }
  walk(store.tree)
  return ids
})

const isSelected = (id) => store.selectedIds.includes(id)

// Node + barcha avlodlarini yig'adi (flattenData ichidagi item.children dan)
const collectSubtree = (item) => {
  const result = [item]
  const walk = (children) => {
    for (const c of children || []) {
      result.push(c)
      walk(c.children)
    }
  }
  walk(item.children)
  return result
}

// Yakka tanlash (checkbox)
const toggleRow = (item) => {
  const idx = store.selectedIds.indexOf(item.id)
  if (idx >= 0) {
    store.selectedIds.splice(idx, 1)
    store.selectedOrgs = store.selectedOrgs.filter((o) => o.id !== item.id)
  } else {
    store.selectedIds.push(item.id)
    store.selectedOrgs.push(item)
  }
  if (store.selectedOrgs.length === 1) {
    store.allowedSource = store.selectedOrgs[0].allowed_source ?? 3
  }
}

// Radio: node + barcha childlarini tanlash/olib tashlash
const toggleSubtree = (item) => {
  const subtree = collectSubtree(item)
  const subtreeIds = subtree.map((n) => n.id)
  const allIn = subtreeIds.every((id) => store.selectedIds.includes(id))
  if (allIn) {
    store.selectedIds = store.selectedIds.filter((id) => !subtreeIds.includes(id))
    store.selectedOrgs = store.selectedOrgs.filter((o) => !subtreeIds.includes(o.id))
  } else {
    for (const node of subtree) {
      if (!store.selectedIds.includes(node.id)) {
        store.selectedIds.push(node.id)
        store.selectedOrgs.push(node)
      }
    }
  }
}

const allSelected = computed(
  () => allLeafIds.value.length > 0 && allLeafIds.value.every((id) => store.selectedIds.includes(id))
)
const someSelected = computed(
  () => !allSelected.value && allLeafIds.value.some((id) => store.selectedIds.includes(id))
)
const toggleAll = () => {
  if (allSelected.value) {
    store.selectedIds = []
    store.selectedOrgs = []
  } else {
    // flatten tree to get all nodes with their data
    const all = []
    const walk = (nodes) => { for (const n of nodes) { all.push(n); if (n.children?.length) walk(n.children) } }
    walk(store.tree)
    store.selectedIds = all.map((n) => n.id)
    store.selectedOrgs = all
  }
}

/* ── badge ── */
const sourceBadge = (src) => ({
  label: src === 1 ? 'Excel' : src === 2 ? '1C' : 'Ikkalasi',
  cls: src === 1
    ? 'bg-green-100 text-green-700'
    : src === 2
    ? 'bg-purple-100 text-purple-700'
    : 'bg-gray-100 text-gray-500'
})

/* ── saqlash ── */
const leafSelected = computed(() => store.selectedOrgs.filter((o) => !o.group))

const onSave = () => store._upsert()
const onReset = () => store._delete()
</script>

<template>
  <UIPageContent>
    <div class="w-full flex flex-col">
      <div ref="headerRef" class="mb-3">
        <h2 class="text-base font-semibold text-textColor1">Yuklash manbasi cheklovi</h2>
      </div>

      <div ref="bodyRef" :style="bodyStyle" class="grid grid-cols-12 gap-3">

        <!-- Chap: jadval daraxt -->
        <div class="col-span-12 lg:col-span-7 h-[70vh] lg:h-full min-h-0 rounded-2xl bg-surface-section overflow-hidden flex flex-col">

          <!-- Qidiruv -->
          <div class="p-2 border-b border-surface-border">
            <n-input
              v-model:value="store.orgSearch"
              placeholder="Korxona qidiring..."
              clearable
              size="small"
            />
          </div>

          <!-- Jadval -->
          <div class="flex-1 overflow-auto">
            <n-spin :show="store.loading" class="h-full" content-class="h-full">
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
                    <th class="!text-left">Tashkilot</th>
                    <th class="min-w-[90px] w-[90px] !text-center text-xs">Manbasi</th>
                  </tr>
                </thead>
                <tbody>
                  <template v-for="(item, idx) in flattenData" :key="idx">
                    <tr class="hover-row" :class="{ selectedRow: isSelected(item.id) }">
                      <!-- Checkbox (yakka) -->
                      <td class="!text-center" @click.stop="toggleRow(item)">
                        <n-checkbox :checked="isSelected(item.id)" />
                      </td>

                      <!-- Korxona nomi -->
                      <td class="!text-left select-none cursor-pointer" @click="toggleRow(item)">
                        <div :style="{ paddingLeft: item.level * 15 + 'px' }" class="flex items-center">
                          <div class="flex justify-end w-[40px]">
                            <n-icon
                              v-if="item.isHasChildren"
                              @click.stop="toggleExpand(item.id)"
                              :class="isOpen(item.id) ? 'rotate-90' : 'rotate-0'"
                              class="transition-all cursor-pointer"
                              size="18"
                            >
                              <ChevronRight12Regular />
                            </n-icon>
                            <n-icon size="20">
                              <template v-if="item.isHasChildren">
                                <FolderOpen24Filled v-if="isOpen(item.id)" class="text-[#a312df]" />
                                <Folder20Filled v-else class="text-[#a312df]" />
                              </template>
                              <DocumentBulletList24Filled v-else class="text-primary" />
                            </n-icon>
                          </div>
                          <span class="ml-2 text-sm leading-tight flex-1">{{ item.name }}</span>
                          <!-- Radio: faqat parentlar uchun — childlar bilan birga tanlash -->
                          <n-radio
                            v-if="item.isHasChildren"
                            :checked="collectSubtree(item).every((n) => isSelected(n.id))"
                            :value="item.id"
                            @click.stop.prevent="toggleSubtree(item)"
                            class="flex-shrink-0"
                          />
                        </div>
                      </td>

                      <!-- Manba badge -->
                      <td class="!text-center">
                        <span
                          class="inline-block text-[10px] px-2 py-0.5 rounded-full font-medium"
                          :class="sourceBadge(item.allowed_source).cls"
                        >
                          {{ sourceBadge(item.allowed_source).label }}
                        </span>
                      </td>
                    </tr>
                  </template>
                  <tr v-if="!flattenData.length && !store.loading">
                    <td colspan="3" class="!py-10 !text-center text-sm text-textColor3">
                      Ma'lumot topilmadi
                    </td>
                  </tr>
                </tbody>
              </n-table>
            </n-spin>
          </div>
        </div>

        <!-- O'ng: config panel -->
        <div class="col-span-12 lg:col-span-5 flex flex-col">
          <div
            v-if="!store.selectedOrgs.length"
            class="rounded-2xl bg-surface-section p-6 flex items-center justify-center text-textColor3 text-sm h-32"
          >
            Chap daraxtdan korxona(lar) tanlang
          </div>

          <div v-else class="rounded-2xl bg-surface-section p-4 flex flex-col gap-4">

            <!-- Tanlangan -->
            <div>
              <div class="text-xs text-textColor3 mb-1">Tanlangan</div>
              <div class="text-sm font-semibold text-textColor1">{{ leafSelected.length }} ta korxona</div>
              <div v-if="leafSelected.length <= 3" class="mt-1 space-y-0.5">
                <div v-for="o in leafSelected" :key="o.id" class="text-xs text-textColor2 truncate">{{ o.name }}</div>
              </div>
            </div>

            <n-divider class="!my-0" />

            <!-- Yuklash manbasi -->
            <div>
              <div class="text-xs font-medium text-textColor3 mb-3">Yuklash manbasi</div>
              <div class="flex flex-col gap-3">
                <label
                  v-for="opt in [
                    { value: 3, label: 'Ikkalasi (default)', desc: 'Excel va 1C dan yuklash mumkin' },
                    { value: 1, label: 'Faqat Excel', desc: '1C dan yuklash bloklangan' },
                    { value: 2, label: 'Faqat 1C', desc: 'Excel yuklamasini bloklaydi' },
                  ]"
                  :key="opt.value"
                  class="flex items-start gap-2 cursor-pointer"
                  @click="store.allowedSource = opt.value"
                >
                  <n-radio
                    :checked="store.allowedSource === opt.value"
                    :value="opt.value"
                    class="mt-0.5 flex-shrink-0"
                  />
                  <div>
                    <div class="text-sm font-medium text-textColor1">{{ opt.label }}</div>
                    <div class="text-xs text-textColor3 mt-0.5">{{ opt.desc }}</div>
                  </div>
                </label>
              </div>
            </div>

            <n-divider class="!my-0" />

            <!-- Tugmalar -->
            <div class="flex gap-2">
              <n-button
                type="primary"
                :loading="store.saveLoading"
                :disabled="!leafSelected.length"
                @click="onSave"
                class="flex-1"
              >
                <template #icon><n-icon :component="Save24Regular" /></template>
                Saqlash
              </n-button>
              <n-button
                type="error"
                ghost
                :loading="store.deleteLoading"
                :disabled="!leafSelected.length"
                @click="onReset"
              >
                <template #icon><n-icon :component="Delete24Regular" /></template>
                Default
              </n-button>
            </div>

            <p class="text-xs text-textColor3">
              <span class="text-amber-600 font-medium">Default</span> — cheklov olib tashlanadi, "Ikkalasi"ga qaytadi.
            </p>
          </div>
        </div>

      </div>
    </div>
  </UIPageContent>
</template>
