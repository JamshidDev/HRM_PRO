<script setup>
import {UIDrawer, UIPageContent, UIModal} from "@/components/index.js"
import TreeOrg from "./ui/TreeOrg.vue"
import Table from "./ui/Table.vue"
import ListItem from "./ui/ListItem.vue"
import createForm from "./ui/createForm.vue"
import Filter from "./ui/Filter.vue"
import {useUploadReportStore} from "@/store/modules/index.js"

const store = useUploadReportStore()


</script>

<template>
<UIPageContent>
<div class="w-full grid grid-cols-12">
  <div class="col-span-12 mb-4">
    <Filter/>
  </div>
    <div class="col-span-12 lg:col-span-6">
      <TreeOrg/>
    </div>
  <div class="col-span-12 lg:col-span-6 pl-2">
    <ListItem/>
    <Table/>
  </div>
  <div class="col-span-12">
    <UIModal
        :width="600"
        :visible="store.visible"
        @update:visible="(v)=>store.visible = v"
        :title="store.visibleType?$t('uploadReport.createTitle') : $t('uploadReport.updateTitle')"
    >
      <createForm/>
    </UIModal>
  </div>
</div>
</UIPageContent>
</template>
