<script setup>
  import Table from './Table.vue'
  import { useDepartmentStore, useComponentStore } from '@stores'

  const store = useDepartmentStore()
  const componentStore = useComponentStore()

  const deepEv = (v) => {
    store.goDeep(v)
  }

  const onDelete = (v) => {
    store.elementId = v.id
    store._delete()
  }

  const onAdd = (v) => {
    componentStore._departments()
    store._level()
    store.resetForm()
    store.elementId = v.id
    store.parentElement = {
      name: v.name,
      id: v.id
    }
    store.payload.parent_id = v.id
    store.visibleType = true
    store.visible = true
  }

  const onEdit = (v) => {
    store.elementId = v.id
    componentStore._departments()
    store._level()
    store.payload.name = v.name
    store.payload.name_ru = v.name_ru
    store.payload.name_en = v.name_en
    store.payload.comment = v.comment
    store.payload.level = v.level.id
    store.showParent = Boolean(v.parent?.id)
    store.payload.parent_id = v.parent?.id

    store.visibleType = false
    store.visible = true
  }
</script>

<template>
  <n-tabs
    animated
    v-model:value="store.activeTab"
    class="hidden-tab-header1 mt-4 white-tab-header"
    type="card"
    closable
    @close="store.closeTab"
    :tab-class="'bg-white'"
  >
    <template v-for="(deep, idx) in store.tabList" :key="idx">
      <n-tab-pane :name="idx + 1" :tab="deep.name">
        <Table
          :parent-id="deep.parentId"
          :data="store.tabDataList[idx]"
          :deep="idx + 1"
          :loading="store.id"
          @on-deep="deepEv"
          @on-delete="onDelete"
          @on-edit="onEdit"
          @on-add="onAdd"
        />
      </n-tab-pane>
    </template>
  </n-tabs>
</template>
