<script setup>
import { UIPageContent, UIPageFilter, UIDrawer} from "@/components/index.js"
import Table from "./ui/Table.vue"
import Form from "./ui/Form.vue"

import {useUserDepartmentStore} from "@/store/modules";

const store = useUserDepartmentStore()

const onSearch = ()=>{
  store.params.page = 1
  store._index()
}

onMounted(()=>{
  store.params.page = 1
  store.params.search = null
  store._index()
})

</script>

<template>
  <UIPageContent>
    <UIPageFilter
        v-model:search="store.params.search"
        @onSearch="onSearch"
        :show-filter-button="false"
        :show-add-button="false"
    />
    <Table/>
    <UIDrawer
        :width="600"
        :visible="store.visible"
        @update:visible="(v)=>store.visible = v"
        :title="$t('userDepartmentPage.attached_users')"
    >
      <template #content>
        <Form/>
      </template>
    </UIDrawer>
  </UIPageContent>
</template>
