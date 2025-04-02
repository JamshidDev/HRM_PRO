<script setup>
import {useOrganizationStore, useComponentStore} from "@/store/modules/index.js"
import {UITree, UIPagination} from "@/components/index.js"
import { useDialog, useMessage } from 'naive-ui'
import i18n from "@/i18n/index.js"

const store = useOrganizationStore()
const componentStore = useComponentStore()
const dialog = useDialog()
const message = useMessage()
const {t} = i18n.global







const onLoad = (v)=>{
  store.elementId = v.id
  store.indexPath = v.index
  store.visibleType = true
  store._show()
}

const onChange = (v)=>{
  if(v.type === 'create'){
    createNested(v)
  }else if(v.type === 'delete'){
    onDelete(v)
  }else if(v.type === 'update'){
    onEdit(v)
  }
}

const createNested = (v)=>{
  componentStore._organizationLevel()
  store.resetForm()
  store.elementId =v.id
  store.payload.parent_id =v.id
  store.nestedPath = v.index
  store.visibleType = true
  store.parentElement = {
    id:v.id,
    name:v.name
  }
  store.visible = true
}

const onDelete = (v)=>{
  store.elementId =v.id
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

const onEdit =(v)=>{
  store.visibleType=false
  store.elementId = v.id
  store.parentElement = null
  componentStore._organizationLevel()
  componentStore._organizations()
  componentStore._allCities()
  store._show()
}

const changePage =(v)=>{
  store.params.page = v.page
  store.params.per_page = v.per_page
  store._index()
}





</script>

<template>
  <div class="bg-surface-section p-4">
    <UITree
        :children="store.list"
        @on-load="onLoad"
        @on-change="onChange"
        :element-id="store.indexPath"
    />
    <UIPagination
        :page="store.params.page"
        :per_page="store.params.size"
        :total="store.totalItems"
        @change-page="changePage"
    />
  </div>


</template>