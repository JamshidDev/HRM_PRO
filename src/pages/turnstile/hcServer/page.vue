<script setup>
import {UIModal, UIPageContent} from "@/components/index.js"
import Filter from "./ui/Filter.vue"
import createForm from "./ui/CreateForm.vue"
import Table from "./ui/Table.vue"
import {useHcServerStore} from "@/store/modules/index.js"

const store = useHcServerStore()
</script>

<template>
<UIPageContent>
  <Filter/>
  <Table/>
  <UIModal
      :width="600"
      :visible="store.visible"
      @update:visible="(v)=>store.visible = v"
      :title="store.visibleType?$t('hcServer.createTitle') : $t('hcServer.updateTitle')"
  >
    <createForm/>
  </UIModal>

</UIPageContent>
</template>
