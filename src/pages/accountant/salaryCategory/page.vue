<script setup>
import {UIModal, UIPageContent} from "@/components/index.js"
import {useSalaryCategoryStore} from "@/store/modules/index.js"
import Filter from "./ui/Filter.vue"
import createForm from "./ui/createForm.vue"
import Table from "./ui/Table.vue"
import TreeTable from "./ui/TreeTable.vue"
const store = useSalaryCategoryStore()

</script>

<template>
<UIPageContent>
  <Filter/>

  <n-tabs animated v-model:value="store.activeTab" class="hidden-tab-header" type="segment">
    <n-tab-pane :name="store.tabs[0].id">
      <Table/>
    </n-tab-pane>
    <n-tab-pane :name="store.tabs[1].id">
      <TreeTable/>
    </n-tab-pane>
  </n-tabs>
  <UIModal
      :width="'90%'"
      :visible="store.visible"
      @update:visible="(v)=>store.visible = v"
      :title="store.visibleType?$t('salaryCategory.createTitle') : $t('salaryCategory.updateTitle')"
  >
    <createForm/>
  </UIModal>
</UIPageContent>
</template>
