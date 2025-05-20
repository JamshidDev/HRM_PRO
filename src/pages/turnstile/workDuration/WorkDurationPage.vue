<script setup>
import {UIDrawer, UIModal, UIPageContent, UIPageFilter, UISelect} from "@/components/index.js"
import {useTurnstileWorkDurationStore, useAccountStore} from "@/store/modules/index.js";
import Table from "./ui/Table.vue"
import {useAppSetting} from "@/utils/index.js"
import WorkerCalendar from "./ui/WorkerCalendar.vue"
// import createForm from "./ui/createForm.vue"

const store = useTurnstileWorkDurationStore()
const accStore = useAccountStore()

const filterEvent = ()=>{
  store.params.page = 1
  store._index()
}

const onSearch = (v)=>{
  // if(!accStore.checkAction(accStore.pn.usersRead)) return
  store.params.page = 1
  store._index()
}

const clearParams = ()=>{
  for(let key in store.defaultParams){
    store.params[key] = store.defaultParams[key]
  }
  filterEvent()
}

onMounted(()=>{
  // if(!accStore.checkAction(accStore.pn.usersRead)) return
  filterEvent()
})
</script>

<template>
  <UIPageContent>
    <UIPageFilter
        @on-clear="clearParams"
        v-model:search="store.params.search"
        @on-search="onSearch"
        :search-loading="store.loading"
        :show-add-button="false"
    >
      <template #filterContent>
        <label class="mt-3 text-xs text-gray-500">{{ $t('content.from') }}</label>
        <n-date-picker
            class="mt-1"
            v-model:value="store.params.start"
            @update:value="filterEvent"
            type="date"
            :format="useAppSetting.datePicketFormat"
            clearable />
        <label class="mt-3 text-xs text-gray-500">{{ $t('content.to') }}</label>
        <n-date-picker
            class="mt-1"
            v-model:value="store.params.end"
            @update:value="filterEvent"
            :format="useAppSetting.datePicketFormat"
            type="date"
            clearable />
      </template>
    </UIPageFilter>
    <Table/>
    <UIModal
      :visible="!!store?.workerInstance"
      :width="1000"
      :title="$t('turnstile.workDurationPage.calendarTitle')">
        <WorkerCalendar />
    </UIModal>
<!--    <UIDrawer-->
<!--        :visible="store.visible"-->
<!--        @update:visible="(v)=>store.visible = v"-->
<!--        :title="store.visibleType? $t('userPage.createTitle') : $t('userPage.updateTitle')"-->
<!--    >-->
<!--      <template #content>-->
<!--        <createForm/>-->
<!--      </template>-->
<!--    </UIDrawer>-->
  </UIPageContent>
</template>