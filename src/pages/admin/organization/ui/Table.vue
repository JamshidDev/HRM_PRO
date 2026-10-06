<script setup>
  import { useOrganizationStore, useComponentStore } from '@/store/modules/index.js'
  import { UITree, UIPagination } from '@/components/index.js'
  import { useDialog } from 'naive-ui'
  import { ChevronDoubleUp16Regular, LocalLanguage16Regular } from '@vicons/fluent'
  import i18n from '@/i18n/index.js'
  import { useAccountStore } from '@/store/modules/index.js'
  const accStore = useAccountStore()

  const store = useOrganizationStore()
  const componentStore = useComponentStore()
  const dialog = useDialog()
  const { t } = i18n.global
  const expandedKeys = ref([])

  const headerOption = [
    { name: t('content.nameUz'), id: 'uz' },
    { name: t('content.nameRu'), id: 'ru' },
    { name: t('content.nameEn'), id: 'en' }
  ]

  const changeHeaderLang = (v) => {
    store.headerLang = v
    expandedKeys.value = []
    store._index()
  }

  const onToggle = (key) => {
    const hasKey = expandedKeys.value.includes(key)
    if (hasKey) {
      expandedKeys.value = expandedKeys.value.filter((k) => !(k === key || k.startsWith(`${key}-`)))
    } else {
      expandedKeys.value.push(key)
    }
  }

  const onLoad = (v) => {
    if (!accStore.checkAction(accStore.pn.organizationsRead)) return
    store.elementId = v.id
    store.indexPath = v.index
    store.visibleType = true
    store._show()
  }

  const onChange = (v) => {
    if (!accStore.checkAction(accStore.pn.organizationsWrite)) return
    if (v.type === 'create') {
      createNested(v)
    } else if (v.type === 'delete') {
      onDelete(v)
    } else if (v.type === 'update') {
      onEdit(v)
    }
  }

  const createNested = (v) => {
    componentStore._organizationLevel()
    store.resetForm()
    store.elementId = v.id
    store.payload.parent_id = v.id
    store.nestedPath = v.index
    store.visibleType = true
    store.parentElement = {
      id: v.id,
      name: v.name
    }
    store.visible = true
  }

  const onDelete = (v) => {
    store.elementId = v.id
    dialog.info({
      title: t('content.confirm'),
      content: t('organizationPage.deleteContent'),
      positiveText: t('content.yes'),
      negativeText: t('content.no'),
      onPositiveClick: () => {
        store._delete()
      },
      onNegativeClick: () => {}
    })
  }

  const onEdit = (v) => {
    store.visibleType = false
    store.elementId = v.id
    store.parentElement = null
    componentStore._organizationLevel()
    componentStore._organizations()
    componentStore._allCities()
    store._show()
  }

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    expandedKeys.value = []
    store._index()
  }
</script>

<template>
  <div
    class="flex-1 min-h-0 flex flex-col overflow-hidden rounded-xl border border-surface-line bg-surface-section"
  >
    <div
      class="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-surface-line"
    >
      <div class="flex items-center gap-2">
        <span class="text-base font-semibold text-textColor0">{{ $t('organizationPage.name') }}</span>
        <span
          class="rounded-full bg-surface-ground px-2 py-0.5 text-xs font-medium text-secondary tabular-nums"
        >
          {{ store.totalItems }}
        </span>
      </div>
      <div class="ml-auto flex items-center gap-2">
        <Transition name="fade">
          <n-button v-if="expandedKeys.length" size="small" quaternary @click="expandedKeys = []">
            <template #icon>
              <n-icon><ChevronDoubleUp16Regular /></n-icon>
            </template>
            {{ $t('organizationPage.collapseAll') }}
          </n-button>
        </Transition>
        <n-select
          size="small"
          class="w-[160px]!"
          v-model:value="store.headerLang"
          :options="headerOption"
          value-field="id"
          label-field="name"
          @update:value="changeHeaderLang"
        >
          <template #arrow>
            <n-icon><LocalLanguage16Regular /></n-icon>
          </template>
        </n-select>
      </div>
    </div>

    <n-spin :show="store.loading" class="flex-1 min-h-0" content-class="h-full">
      <div class="h-full overflow-auto px-3 py-2 tree-scroll">
        <UITree
          v-if="store.list.length"
          :children="store.list"
          @on-load="onLoad"
          @on-change="onChange"
          @on-toggle="onToggle"
          :element-id="store.indexPath"
          :action-loading="store.deleteLoading"
          :action-loading-id="store.elementId"
          :expanded-keys="expandedKeys"
        />
        <n-empty v-else-if="!store.loading" class="py-16" :description="$t('content.no-data')" />
      </div>
    </n-spin>

    <div class="px-4 border-t border-surface-line">
      <UIPagination
        :page="store.params.page"
        :per_page="store.params.per_page"
        :total="store.totalItems"
        @change-page="changePage"
      />
    </div>
  </div>
</template>

<style scoped>
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.15s ease;
  }
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }

  .tree-scroll {
    scrollbar-width: thin;
  }
</style>
