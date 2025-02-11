<script setup>
import ContractPage from "../contract/ContractPage.vue"
import CommandPage from "../command/CommandPage.vue"
import AdContractPage from "../adContract/AdContractPage.vue"
import {useDocumentStore, useCommandStore, useContractStore, useAdContractStore} from "@/store/modules/index.js"
import {UIOfficeApp} from "@/components/index.js"
import {useRoute, useRouter} from "vue-router"
import {AppPaths} from "@/utils/index.js"

const store = useDocumentStore()
const commandStore = useCommandStore()
const contractStore = useContractStore()
const adContractStore = useAdContractStore()
const officeAppRef = ref(null)

const route = useRoute()
const router = useRouter()

const onChange = ()=>{
  onChangeQuery(store.activeTab)
}

const openOffice = (id)=>{
  officeAppRef.value.openPdf(id, 'contracts')
}

const openCommand = (id)=>{
  officeAppRef.value.openPdf(id, 'commands')
}

const onChangeQuery = (tab)=>{
  store.activeTab = Number(tab)
  router.push({
    path:`${AppPaths.Hrm}${AppPaths.Document}`,
    query:{
      tab,
    }
  })

  if(store.activeTab === store.tabList[0].key){
    contractStore._index()
  }else if(store.activeTab === store.tabList[1].key){
    commandStore._index()
  }else if(store.activeTab === store.tabList[2].key){
    adContractStore._index()
  }
}

onMounted(()=>{
  onChangeQuery( route.query?.tab || store.activeTab)
})


</script>

<template>
  <n-tabs
      animated
      v-model:value="store.activeTab"
      @update:value="onChange"
      class="hidden-tab-header1 mt-10"
      type="card"
  >
    <n-tab-pane v-for="(item, idx) in store.tabList" :key="idx" :name="item.key" :tab="$t(item.name)">
      <template v-if="item.key === store.tabList[0].key">
        <ContractPage @openOffice="openOffice"/>
      </template>
      <template v-if="item.key === store.tabList[1].key">
       <CommandPage @openOffice="openCommand"/>
      </template>
      <template v-if="item.key === store.tabList[2].key">
        <AdContractPage/>
      </template>
    </n-tab-pane>
  </n-tabs>
  <UIOfficeApp ref="officeAppRef"/>
</template>