<script setup>
import {ArrowCircleDown16Regular,Eye24Filled, StarEmphasis32Filled, EyeOff20Filled, DismissCircle32Filled} from "@vicons/fluent"
import {useComponentStore} from "@/store/modules/index.js"
import Utils from "../../../utils/Utils.js"
const store = useComponentStore()
const isHide = ref(true)


const maskString = (v)=>{
    const str = v.toString()
  if(str.length<2) return str
  return '*'.repeat(str.length - 2) + str.slice(-2);
}

</script>

<template>
  <div class="grid col-span-12 w-full">
    <div class="col-span-12 border-b border-surface-line flex gap-4 justify-between pb-2 pt-10 mb-6 ">

      <n-button text type="warning" icon-placement="right">
        <template #icon>
          <StarEmphasis32Filled/>
        </template>
        4.67</n-button>
      <div class="flex items-center gap-2">
        <n-button @click="isHide=!isHide" type="primary" secondary icon-placement="right">
          <template #icon>
            <EyeOff20Filled v-if="isHide"/>
            <Eye24Filled v-else/>
          </template>
        </n-button>
        <n-button
            type="primary"
            icon-placement="right"
            :loading="store.resumeLoading"
            @click="store._workerResume()"
        >
          <template #icon>
            <ArrowCircleDown16Regular/>
          </template>
          {{$t('content.downloadCV')}}
        </n-button>
        <n-button
            @click="store.previewVisible = false"
            secondary type="error" icon-placement="right">
          <template #icon>
            <DismissCircle32Filled/>
          </template>
          {{$t('content.close')}}
        </n-button>
      </div>
    </div>
    <template v-if="store.workerPreview">
      <div class="col-span-12 text-2xl text-primary font-bold mb-2 uppercase">
        {{Utils.combineFullName(store.workerPreview?.worker)}}
      </div>
      <div class="col-span-6 font-bold"><span class="font-normal text-gray-400">{{$t('workerView.general.passportJSHSHIR')}}</span>: {{isHide? Utils.maskText(store.workerPreview?.worker.pin, 3,4) : store.workerPreview?.worker.pin}}</div>
      <div class="col-span-6 font-bold"> <span class="font-normal text-gray-400">{{$t('workerView.general.phone')}}</span>: {{isHide? Utils.maskText(store.workerPreview?.worker.phones[0].phone, 2,2) : store.workerPreview?.worker.phones[0].phone}}	</div>
      <div class="col-span-6 font-bold"><span class="font-normal text-gray-400">{{$t('workerView.general.department')}}</span>: {{store.workerPreview?.department?.name}}	</div>
      <div class="col-span-6 font-bold"><span class="font-normal text-gray-400">{{$t('workerView.general.salary')}}</span>: {{isHide? Utils.maskText(store.workerPreview?.salary, 0,2) : store.workerPreview?.salary}} {{$t('content.sum')}}</div>
      <div class="col-span-12 font-bold"> <span class="font-normal text-gray-400">{{$t('workerView.general.position')}}</span>: {{store.workerPreview?.post_name}}	</div>
    </template>


  </div>
</template>

<style scoped>

</style>