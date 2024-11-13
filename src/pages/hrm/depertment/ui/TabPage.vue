<script setup>
import Table from "./Table.vue"
import {useDepartmentStore, useComponentStore} from "@/store/modules/index.js"

const store = useDepartmentStore()
const componentStore = useComponentStore()


const deepEv = (v)=>{
  store.goDeep(v)
}

const onDelete = (v)=>{
  store.elementId = v.id
  store._delete()
}

const onAdd = (v)=>{
  componentStore._departments()
  store._level()
  store.resetForm()
  store.elementId = v.id
  store.parentElement ={
    name:v.name,
    id:v.id
  }
  store.payload.parent_id = v.id
  store.visibleType = true
  store.visible = true
}

const onEdit = (v)=>{
  store.elementId = v.id
  componentStore._departments()
  store._level()
  store.payload.name = v.name
  store.payload.level = v.level.id
  store.payload.parent_id = v.parent?.id

  store.visibleType = false
  store.visible = true
}
</script>

<template>
  <n-tabs
      animated
      v-model:value="store.activeTab"
      class="hidden-tab-header1 mt-10"
      type="card"
      closable
      @close="store.closeTab"
  >
    <template v-for="(deep, idx) in store.tabList" :key="idx">
      <n-tab-pane :name="(idx+1)" :tab="deep.name">
        <Table
            :parent-id="deep.parentId"
            :data="store.tabDataList[idx]"
            :deep="idx+1"
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

<style scoped>

</style>