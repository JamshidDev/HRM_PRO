<script setup>
import {UIPageContent, UIPageFilter} from "@/components/index.js"
import Table from "./ui/Table.vue"
import {useWorkerProfileStore} from "@/store/modules/index.js"
const store = useWorkerProfileStore()

const onSearch = ()=>{
  store.userRoleParams.page = 1
  store._userRole()
}

onMounted(()=>{
  store._userRole()
})
</script>

<template>
<UIPageContent>
  <UIPageFilter
      :search-loading="store.userRoleLoading"
      v-model:search="store.userRoleParams.search"
      :show-add-button="false"
      @onSearch="onSearch"
  />
  <Table/>
</UIPageContent>
</template>
