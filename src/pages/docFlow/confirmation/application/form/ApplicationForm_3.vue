<script setup>
import {ChevronRight12Regular} from "@vicons/fluent"
import {useConfApplicationStore} from "@/store/modules/index.js"
import Utils from "../../../../../utils/Utils.js"

const store = useConfApplicationStore()

watchEffect(()=>{
  if(store.vacationList.length>0){
    const data = store.vacationList[0]
    const date = new Date(data.period_to)
    store.payload.period_from =date.getTime()
    store.payload.period_to =new Date(date.setFullYear(date.getFullYear() +1)).getTime()
  }
})

const disabledPeriod = computed(()=>{
  return store.vacationList.length>0
})

onMounted(()=>{
  store._onActiveVacation(store.payload.worker_position_id || 1)
})
</script>

<template>
  <div class="grid grid-cols-12 gap-x-4">
    <div class="col-span-12">
      <div class="flex flex-col border-b border-surface-line mb-4 border-dashed transition-all" :class="store.vacationShow && 'border-t border-r border-l p-2 rounded-md' ">
        <div class="flex justify-between items-center w-full mb-4 cursor-pointer">
          <span @click="store.vacationShow =!store.vacationShow " class="text-primary">{{$t(`applicationPage.lastVacationTitle`)}}</span>
          <n-icon size="18" class="text-primary">
            <ChevronRight12Regular class="transition-all" :class="store.vacationShow && 'rotate-90'"/>
          </n-icon>
        </div>
        <n-collapse-transition :show="store.vacationShow">

          <div class="grid grid-cols-12 w-full">
            <template v-for="(item, idx) in store.vacationList" :key="idx">
              <div class="col-span-12 text-xs">
                <span class="mr-2">{{$t(`applicationPage.lastPeriod`)}}</span>
                <span class="font-medium">{{Utils.timeOnlyDate(item.period_from)}} - </span>
                <span class="font-medium">{{Utils.timeOnlyDate(item.period_to)}}</span>
              </div>
              <div class="col-span-12 text-xs">
                <span class="mr-2">{{$t(`applicationPage.lastPDate`)}} </span>
                <span class="font-medium">{{Utils.timeOnlyDate(item.from)}} - </span>
                <span class="font-medium">{{Utils.timeOnlyDate(item.to)}}</span>
              </div>
            </template>
          </div>
        </n-collapse-transition>
      </div>

    </div>
    <div class="col-span-6">
      <n-form-item :label="$t(`applicationPage.form.period_from`)" path="period_from">
        <n-date-picker
            :disabled="disabledPeriod"
            class="w-full"
            v-model:value="store.payload.period_from"
            type="date"
            :placeholder="$t(`content.choose`)"
        />
      </n-form-item>
    </div>
    <div class="col-span-6">
      <n-form-item :label="$t(`applicationPage.form.period_to`)" path="period_to">
        <n-date-picker
            :disabled="disabledPeriod"
            class="w-full"
            v-model:value="store.payload.period_to"
            type="date"
            :placeholder="$t(`content.choose`)"
        />
      </n-form-item>
    </div>

    <div class="col-span-6">
      <n-form-item :label="$t(`applicationPage.form.from`)" path="from">
        <n-date-picker
            class="w-full"
            v-model:value="store.payload.from"
            type="date"
            :placeholder="$t(`content.choose`)"
        />
      </n-form-item>
    </div>
    <div class="col-span-6">
      <n-form-item :label="$t(`applicationPage.form.to`)" path="to">
        <n-date-picker
            class="w-full"
            v-model:value="store.payload.to"
            type="date"
            :placeholder="$t(`content.choose`)"
        />
      </n-form-item>
    </div>

    <div class="col-span-12">
      <n-form-item :label="$t(`applicationPage.form.reason`)" path="reason">
          <n-input
              class="w-full"
              type="textarea"
              :placeholder="$t(`content.enterField`)"
              v-model:value="store.payload.reason"
          />
      </n-form-item>
    </div>
  </div>
</template>

<style scoped>

</style>