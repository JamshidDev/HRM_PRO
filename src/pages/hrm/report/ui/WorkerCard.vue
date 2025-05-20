<script setup>
import {useReport2Store} from "@/store/modules/index.js"
import Utils from "../../../../utils/Utils.js"
import Indicator from "@/pages/hrm/report/ui/Indicator.vue"
import IndicatorTitle from "@/pages/hrm/report/ui/IndicatorTitle.vue"
import {UIUser} from "@/components/index.js"

defineProps({
  bgFull:{
    type:Boolean,
    default:false
  }
})
const store = useReport2Store()
</script>

<template>
  <div
      @click.stop
      class="w-full min-h-[32px] relative py-2 pl-2 border-l-[3px] border-warning"
      :class="[bgFull? 'bg-warning/20' : 'bg-warning/5']"
  >
    <n-spin size="small" class="h-full" :show="store.workerLoading">
      <div class="flex justify-between px-2">
        <span class="text-warning mb-2 font-semibold"> {{$t('report.form.workers')}}</span>
        <div class="w-[200px] flex justify-end gap-2"><IndicatorTitle :is-worker="true"/></div>
      </div>

      <template v-for="(item, idx) in store.workerList" :key="idx">
        <div class="flex items-center border-b border-warning border-dashed py-2 hover:bg-warning/10">
          <div class="w-[calc(100%-200px)] flex items-center">
            <span class="inline-block pr-4 font-semibold">{{idx + 1}}</span>
            <UIUser
                :short="false"
                :data="{
                  photo:item.worker.photo,
                  position:item.worker.birthday,
                  lastName:item.worker.last_name,
                  firstName:item.worker.first_name,
                  middleName:item.worker.middle_name,
                }"
            />

          </div>
          <div class="w-[200px] flex items-center justify-end h-full gap-2 pr-2 h-full">
            <Indicator
                :is-worker="true"
                :data="item"
            />
          </div>
        </div>
      </template>
      <template v-if="store.workerList.length === 0 && !store.workerLoading">
        <span class="w-full text-center inline-block text-danger">{{$t('content.no-data')}}</span>
      </template>
    </n-spin>
  </div>
</template>

<style scoped>

</style>