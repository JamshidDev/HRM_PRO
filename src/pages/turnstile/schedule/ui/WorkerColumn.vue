<script setup>
import {ErrorCircle16Filled, Timer12Regular, ScanCamera48Regular, Copy16Regular} from "@vicons/fluent"
import {UIMenuButton} from "@/components/index.js"
import Utils from "@/utils/Utils.js"
import {useScheduleTableStore} from "@/store/modules/index.js"

const store = useScheduleTableStore()

const props = defineProps({
  worker:{
    type: Object,
    required: true
  }
})

const onSelect = (v)=>{
  store.elementId = v.data.id
  const data = v.data

  if(v.key === Utils.ActionTypes.attachment){
    store._resetGrandpaPayload()
    store.grandPayload.is_turnstile = data.canRecognize || false
    store.grandPayload.grandToReport = !data.canRecognize || false
    if(data.canRecognize){
      store.grandPayload.start_minute = data.turnstileStartTime
      store.grandPayload.end_minute = data.turnstileEndTime
    }
    store.grandVisible = true
  }else if(v.key === Utils.ActionTypes.verifier){
    store.selectedDays = v.data.days
    store.selectedWorkerId = v.data.id
    store.attachWorkerParams.page = 1
    store._attachWorkers()
    store.multipleAttachVisible = true
  }
}
</script>

<template>
    <div class="w-full flex">
      <n-tooltip
          placement="top"
          trigger="hover"
      >
        <template #trigger>
          <n-icon   size="26" class="mr-2 cursor-pointer" :class="[worker.canRecognize? 'text-success':'text-warning']">
            <ScanCamera48Regular v-if="worker.canRecognize"/>
            <ErrorCircle16Filled v-else/>
          </n-icon>
        </template>

        <span v-if="!worker.canRecognize">{{$t('shiftType.form.turnstileUnActive')}}</span>
        <span v-else>
          {{$t('shiftType.form.turnstileActive')}}  {{worker.turnstileStartTime}}/{{worker.turnstileEndTime}}
        </span>

      </n-tooltip>
      <div class="flex flex-col w-[calc(100%-50px)] mr-1">
        <span class="leading-[1.2] text-textColor2 font-medium text-xs line-clamp-1">{{ worker?.fullName }}</span>
        <span class="leading-[1.2] text-textColor3 text-xs line-clamp-1">{{ worker?.position }}</span>
      </div>
      <UIMenuButton
          :data="worker"
          @selectEv="onSelect"
          :show-delete="false"
          :extra-options="[
                {
                  label: $t('shiftType.form.addFacility'),
                  key: Utils.ActionTypes.attachment,
                  icon: Timer12Regular,
                  visible:true,
                },
                {
                  label: $t('content.copy'),
                  key: Utils.ActionTypes.verifier,
                  icon: Copy16Regular,
                  visible:true,
                },
                ]"
      />
    </div>
</template>
