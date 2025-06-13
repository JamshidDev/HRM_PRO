<script setup>
import {UIDrawer, UIModal, UIPageContent, UIPageFilter} from "@/components/index.js"
import {useTurnstileWorkDurationStore, useAccountStore} from "@/store/modules/index.js";
import {ClockToolbox20Regular} from "@vicons/fluent"
import Table from "./ui/Table.vue"
import {useAppSetting} from "@/utils/index.js"
import WorkerCalendar from "./ui/WorkerCalendar.vue"
import LateComersList from "./ui/LateComersList.vue"
// import createForm from "./ui/createForm.vue"

const store = useTurnstileWorkDurationStore()
const accStore = useAccountStore()

const filterEvent = ()=>{
  if(!accStore.checkAction(accStore.pn.turnstileWorkDurationRead)) return
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
  filterEvent()
})
</script>

<template>
  <UIPageContent>
    <UIPageFilter
        @on-clear="clearParams"
        v-model:search="store.params.search"
        @on-search="filterEvent"
        :search-loading="store.loading"
        :show-add-button="false"
    >
      <template #filterAction>
        <n-button type="error" secondary @click="store.lateVisible=true">
          {{$t('turnstile.workDurationPage.latecomers')}}
          <template #icon>
            <ClockToolbox20Regular/>
          </template>
        </n-button>
      </template>
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
<!--    <n-modal-->
<!--        class="ui__modal-element"-->
<!--        :show="!!store?.workerInstance"-->
<!--    >-->
<!--      <WorkerCalendar />-->
<!--    </n-modal>-->
    <UIModal
      :visible="!!store?.workerInstance"
      :width="1000"
      :title="$t('turnstile.workDurationPage.calendarTitle')">
      <WorkerCalendar />
    </UIModal>
    <UIModal
        v-model:visible="store.lateVisible"
        :width="1400"
        :title="$t('turnstile.workDurationPage.lateTitle')">
      <LateComersList/>
    </UIModal>

  </UIPageContent>
</template>