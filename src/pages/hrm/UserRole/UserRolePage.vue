<script setup>
import {UIPageContent, UIPageFilter} from "@/components/index.js"
import Table from "./ui/Table.vue"
import {useAccountStore, useWorkerProfileStore} from "@/store/modules/index.js"

const store = useWorkerProfileStore()
const accStore = useAccountStore()

const onSearch = ()=>{
  if(!accStore.checkAction(accStore.pn.hrUsersRead)) return
  store.userRoleParams.page = 1
  store._userRole()
}

onMounted(()=>{
  if(!accStore.checkAction(accStore.pn.hrUsersRead)) return
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
