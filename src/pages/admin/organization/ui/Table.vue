<script setup>
  import { useOrganizationStore, useComponentStore } from '@/store/modules/index.js'
  import { UITree, UIPagination } from '@/components/index.js'
  import { useDialog } from 'naive-ui'
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
  <div class="rounded-xl border border-surface-line bg-surface-section p-4">
    <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
      <div class="flex items-center gap-2">
        <div class="h-2.5 w-2.5 rounded-full bg-primary"></div>
        <span class="text-sm font-medium text-textColor0">{{ $t('organizationPage.name') }}</span>
      </div>
      <div class="ml-auto flex w-full items-center justify-end gap-2 sm:w-auto">
        <n-select
          size="small"
          style="width: 200px"
          v-model:value="store.headerLang"
          :options="headerOption"
          value-field="id"
          label-field="name"
          @update:value="changeHeaderLang"
        />
        <span
          class="whitespace-nowrap rounded-md bg-surface-ground px-2 py-1 text-xs text-textColor0"
        >
          {{ $t('documentSetting.form.count', { n: store.totalItems }) }}
        </span>
      </div>
    </div>

    <n-spin :show="store.loading">
      <div class="min-h-[260px] rounded-lg border border-surface-line bg-surface-ground p-2">
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
        <n-empty v-else class="py-16" :description="$t('content.no-data')" />
      </div>
    </n-spin>

    <div class="mt-3">
      <UIPagination
        :page="store.params.page"
        :per_page="store.params.per_page"
        :total="store.totalItems"
        @change-page="changePage"
      />
    </div>
  </div>
</template>
