<script setup>
import {UIModal, UIPageContent} from "@/components/index.js"
import {usePensionerStore} from "@/store/modules/index.js"
import Filter from "./ui/Filter.vue"
import createForm from "./ui/createForm.vue"
import Table from "./ui/Table.vue"

const store = usePensionerStore()

onMounted(()=>{
  store._index()
})
</script>

<template>
<UIPageContent>
  <Filter/>
  <Table/>
  <UIModal
      width="1000px"
      :visible="store.visible"
      @update:visible="(v)=>store.visible = v"
      :title="store.visibleType? $t('pensioner.createTitle') : $t('pensioner.updateTitle')"
  >
    <createForm/>
  </UIModal>

</UIPageContent>
</template>
