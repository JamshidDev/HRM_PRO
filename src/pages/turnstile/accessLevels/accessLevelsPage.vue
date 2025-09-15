<script setup>
import {UIPageContent, UIPageFilter,UIModal} from "@/components/index.js"
import Table from "./ui/Table.vue"
import createForm from "./ui/createForm.vue"
import {useTurnstileHikCentralStore, useAccountStore} from "@/store/modules/index.js";
import {ArrowSync24Filled} from "@vicons/fluent"

const store = useTurnstileHikCentralStore()
const accStore = useAccountStore()

const onSearch = ()=>{
  if(!accStore.checkAction(accStore.pn.turnstileAccessLevelsRead)) return
  store.params.page = 1
  store._index()
}

const onSync = ()=>{
  if(!accStore.checkAction(accStore.pn.turnstileAccessLevelsWrite)) return
  store._sync()
}

onMounted(()=>{
  if(!accStore.checkAction(accStore.pn.turnstileAccessLevelsRead)) return
  store._index()
})
</script>

<template>
  <UIPageContent>
    <UIPageFilter
        :show-filter-button="false"
        :show-add-button="false"
        v-model:search="store.params.search"
        @onSearch="onSearch"
    >
      <template #filterAction>
        <n-button :loading="store.accessLevelsLoading" @click="onSync" type="primary">
                      <template #icon>
                        <ArrowSync24Filled/>
                      </template>
          {{$t('turnstile.accessLevelPage.sync')}}
        </n-button>
      </template>
    </UIPageFilter>
    <Table/>
    <UIModal
        :width="420"
        :visible="store.visible"
        @update:visible="(v)=>store.visible = v"
        :title="$t('content.edit')"
    >
      <createForm/>
    </UIModal>
  </UIPageContent>
</template>
