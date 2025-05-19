<script setup>
import {UIDrawer} from "@/components/index.js"
import Table from "./ui/Table.vue"
import createForm from "./ui/createFrom.vue"
import {useLanguageAdminStore} from "@/store/modules/admin/languageAdminStore.js"

const store = useLanguageAdminStore()

onMounted(()=>{
  store._index()
})
</script>

<template>
    <div>
      <Table/>
      <UIDrawer
          :visible="store.visible"
          @update:visible="(v)=>store.visible = v"
          :title="store.visibleType? $t('othersPage.language.createTitle') : $t('othersPage.language.updateTitle')"
      >
        <template #content>
          <createForm/>
        </template>
      </UIDrawer>
    </div>
</template>
