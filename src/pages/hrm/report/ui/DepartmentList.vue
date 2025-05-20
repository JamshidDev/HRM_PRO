<script setup>
import {useReport2Store} from "@/store/modules/index.js"
import PositionCard from "./PositionCard.vue"
import WorkerCard from "./WorkerCard.vue"
import Indicator from "./Indicator.vue"
import {AppFolder20Regular} from "@vicons/fluent"
const store = useReport2Store()

defineProps({
  data:{
    type:Object,
    default:[]
  }
})


const openConfirm = () => {
  store.confirmVisible = true
}
</script>

<template>
  <div
      @click="store.onChangeRadio(data)"
      :class="[!(data.id === store.selectedDepId) && 'hover:bg-surface/3 rounded']"
      class="grid grid-cols-12 border-b border-dashed border-surface-line py-1 w-full"
  >
    <div class="col-span-12 flex items-center">
      <div class="flex w-[calc(100%-200px)]">
        <n-radio
            :checked="data.id === store.selectedDepId"
        >
          {{data.name}}
        </n-radio>
      </div>
      <div class="w-[200px] flex items-center justify-end h-full gap-2 pr-2" >
        <n-button
            @click.stop="openConfirm"
            :loading="store.optimizationLoading"
            v-if="data.id === store.selectedDepId" size="tiny" secondary type="error">{{$t('report.form.optimization')}}
        <template #icon>
          <AppFolder20Regular/>
        </template>
        </n-button>
        <Indicator
            :data="data"
        />
      </div>
    </div>
    <div class="col-span-12" :class="[data.id === store.selectedDepId && 'mt-6 mb-3']">
      <n-collapse-transition :show="data.id === store.selectedDepId">
        <PositionCard v-if="store.byPosition"/>
        <WorkerCard v-else/>
      </n-collapse-transition>
    </div>
  </div>
</template>
