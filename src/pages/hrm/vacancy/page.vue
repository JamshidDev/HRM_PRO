<script setup>
import {UIModal, UIPageContent} from "@/components/index.js"
import Filter from "./ui/Filter.vue"
import Table from "./ui/Table.vue"
import createForm from "./ui/createForm.vue"
import {useVacancyStore} from "@/store/modules/index.js"

const store = useVacancyStore()


</script>

<template>
<UIPageContent>
  <Filter/>
  <Table/>
  <UIModal
      :width="1200"
      :visible="store.visible"
      @update:visible="(v)=>store.visible = v"
      :title="store.visibleType? $t('vacancy.createTitle') : $t('vacancy.updateTitle')"
  >
    <createForm/>
  </UIModal>
</UIPageContent>
</template>
