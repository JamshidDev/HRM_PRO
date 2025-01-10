<script setup>
import {useUniversityAdminStore} from "@/store/modules/index.js"
const store = useUniversityAdminStore()
import {UIDrawer} from "@/components/index.js"
import Table from "./ui/Table.vue"
import createForm from "./ui/createForm.vue"
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
