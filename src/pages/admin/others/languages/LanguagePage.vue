<script setup>
import {UIDrawer} from "@/components/index.js"
import Table from "./ui/Table.vue"
import createForm from "./ui/createFrom.vue"
import {useLanguageAdminStore} from "@/store/modules/admin/languageAdminStore.js"
import {useAccountStore} from "@/store/modules/index.js"
const accStore = useAccountStore()

const store = useLanguageAdminStore()

onMounted(()=>{
  if(!accStore.checkAction(accStore.pn.languagesRead)) return
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
