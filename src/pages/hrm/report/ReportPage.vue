<script setup>
import {UIPageContent, UIModal} from "@/components/index.js"
import Filter from "./ui/Filter.vue"
import Table from "./ui/Table.vue"
import CreateForm from "./ui/CreateForm.vue"
import {useReport2Store} from "@/store/modules/index.js"

const store = useReport2Store()
</script>

<template>
  <UIPageContent>
    <Filter/>
    <Table/>
    <UIModal
        :width="900"
        v-model:visible="store.visible"
        :title="$t('departmentPositionPage.updateTitle')"
    >
      <CreateForm/>
    </UIModal>
  </UIPageContent>
</template>
