<script setup>
import {Edit20Filled} from "@vicons/fluent"
import {useReport2Store} from "@/store/modules/index.js"
import WorkerCard from "./WorkerCard.vue"
const store = useReport2Store()
import Indicator from "./Indicator.vue"
import IndicatorTitle from "@/pages/hrm/report/ui/IndicatorTitle.vue"
import {useAccountStore} from "@/store/modules/index.js"
const accStore = useAccountStore()


const onEdit = (item)=>{
  if(!accStore.checkAction(accStore.pn.hrReportWrite)) return
  store.onEdit(item)
}
</script>


<template>
  <div
      @click.stop
      class="w-full min-h-[32px] relative py-2 pl-2 border-l-[3px] border-success bg-success/5"
  >
    <n-spin size="small" class="h-full" :show="store.positionLoading">
      <div class="flex justify-between px-2">
        <span class="text-success mb-2 font-semibold"> {{$t('report.form.position')}}</span>
        <div class="w-[200px] flex justify-end gap-2"><IndicatorTitle/></div>
      </div>

      <template v-for="(item, idx) in store.positionList" :key="idx">
        <div
            @click.stop="store.onChangePosRadio(item)"
            :class="[!(item?.id === store.selectedPosId) && 'hover:bg-success/10']"
            class="flex gap-4 border-b border-success border-dashed py-2"
        >
          <div class="w-[calc(100%-260px)] text-wrap flex">
            <span class="inline-block pr-4 font-semibold">{{idx + 1}}</span>
            <n-radio
                :checked="item?.id === store.selectedPosId"
            >
              {{item?.position?.name}}
            </n-radio>
          </div>
          <div class="w-[260px] flex items-center justify-between h-full gap-2 pr-2">
            <n-button
                @click.stop="()=>onEdit(item)"
                size="tiny" type="primary" secondary>{{$t('content.edit')}}
              <template #icon>
                <Edit20Filled/>
              </template>
            </n-button>
            <Indicator

                :data="item"
            />
          </div>

        </div>
        <div class="w-full ">
          <n-collapse-transition :show="item.id === store.selectedPosId">
            <WorkerCard class="mt-2" :bg-full="true"/>
          </n-collapse-transition>
        </div>
      </template>

      <template v-if="store.positionList.length === 0 && !store.positionLoading">
        <span class="w-full text-center inline-block text-danger">{{$t('content.no-data')}}</span>
      </template>
    </n-spin>
  </div>
</template>

