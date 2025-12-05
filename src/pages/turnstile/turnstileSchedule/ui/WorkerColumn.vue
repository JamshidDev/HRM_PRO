<script setup>
import {ErrorCircle16Filled, Timer12Regular, ScanCamera48Regular, ArrowSync12Filled} from "@vicons/fluent"
import {UIMenuButton} from "@/components/index.js"
import Utils from "@/utils/Utils.js"
import {useTurnstileScheduleStore} from "@/store/modules/index.js"

const store = useTurnstileScheduleStore()

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
  }
  else if(v.key === Utils.ActionTypes.edit){
      store._checkFactOfWorker(v.data.id)
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
                  label: $t('shiftType.form.checkFactOfWorkTime'),
                  key: Utils.ActionTypes.edit,
                  icon: ArrowSync12Filled,
                  visible:true,
                },
                ]"
      />
    </div>
</template>
