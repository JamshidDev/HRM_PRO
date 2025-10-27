<script setup>
import {UIModal, UIPageContent} from "@/components/index.js"
import Filter from "./ui/Filter.vue"
import Table from "./ui/Table.vue"
import createForm from "./ui/createForm.vue"
import {useWorkerImageStore} from "@/store/modules/index.js"

const store = useWorkerImageStore()

onMounted(()=>{
  store._index()
})
</script>

<template>
<UIPageContent>
  <Filter/>
  <Table/>
  <UIModal
      :width="600"
      :visible="store.visible"
      @update:visible="(v)=>store.visible = v"
      :title="$t('content.view') "
  >
    <template #default>
      <createForm/>
    </template>
  </UIModal>
</UIPageContent>
</template>
