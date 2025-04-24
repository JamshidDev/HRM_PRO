<script setup>
import {UIDrawer, UIPageContent} from "@/components/index.js"
import Table from "./ui/Table.vue"
import createFrom from "./ui/createForm.vue"
import Filter from "./ui/Filter.vue"
import {useDocumentArchiveStore} from "@/store/modules/index.js"

const store = useDocumentArchiveStore()


onMounted(()=>{
  store._index()
})
</script>

<template>
  <UIPageContent>
    <Filter/>
    <Table/>
    <UIDrawer
        :visible="store.visible"
        @update:visible="(v)=>store.visible = v"
        :title="store.visibleType? $t('documentArchive.createTitle') : $t('documentArchive.updateTitle')"

    >
      <template #content>
        <createFrom/>
      </template>
    </UIDrawer>
  </UIPageContent>

</template>