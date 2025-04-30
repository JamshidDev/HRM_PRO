<script setup>
import {ArrowCircleDown16Regular,Eye24Filled, StarEmphasis32Filled,
  EyeOff20Filled, DismissCircle32Filled, Copy16Regular, List20Filled} from "@vicons/fluent"
import {useComponentStore} from "@/store/modules/index.js"
import Utils from "../../../utils/Utils.js"
import i18n from "@/i18n/index.js"
const {t} = i18n.global
const store = useComponentStore()
const isHide = ref(true)

const onCopy = ()=>{
  $Toast.info(t('message.successDone'))
}

</script>

<template>
  <div class="grid col-span-12 w-full">
    <div class="col-span-12 border-b border-surface-line flex gap-4 justify-between pb-2 pt-10 mb-6 ">
      <div class="flex flex-wrap gap-4 items-center">
        <n-button
            type="tertiary"
            size="small"
            class="inline-block md:!hidden"
            @click="store.panelVisible=true"
        >
          <template #icon>
            <n-icon>
              <List20Filled/>
            </n-icon>
          </template>
        </n-button>
        <n-button text type="warning" icon-placement="right">
          <template #icon>
            <StarEmphasis32Filled/>
          </template>
          4.67</n-button>
      </div>



      <div class="flex flex-wrap items-center gap-2 justify-end md:justify-start">
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
      <div class="col-span-12 md:col-span-6 font-bold items-center flex"><span class="font-normal text-gray-400">{{$t('workerView.general.passportJSHSHIR')}}</span>: {{isHide? Utils.maskText(store.workerPreview?.worker.pin, 3,4,) : store.workerPreview?.worker.pin}}
        <n-icon
            @click="Utils.copyToClipboard(store.workerPreview?.worker.pin,onCopy)"
            size="24"
            class="cursor-pointer ml-2">
          <Copy16Regular/>
        </n-icon>
      </div>
      <div class="col-span-12 md:col-span-6 font-bold items-center flex"> <span class="font-normal text-gray-400">{{$t('workerView.general.phone')}}</span>: {{isHide? Utils.maskText(store.workerPreview?.worker.phones[0].phone, 2,2) : Utils.formatPhoneWithMask(store.workerPreview?.worker.phones[0].phone, '## ### ## ##')}}
        <n-icon
            @click="Utils.copyToClipboard(store.workerPreview?.worker.phones[0].phone,onCopy)"
            size="24"
            class="cursor-pointer ml-2">
          <Copy16Regular/>
        </n-icon>
      </div>
      <div class="col-span-12 md:col-span-6 font-bold"><span class="font-normal text-gray-400">{{$t('workerView.general.department')}}</span>: {{store.workerPreview?.department?.name}}	</div>
      <div class="col-span-12 md:col-span-6 font-bold"><span class="font-normal text-gray-400">{{$t('workerView.general.salary')}}</span>: {{isHide? Utils.maskText(store.workerPreview?.salary, 0,2) : Utils.formatNumberToMoney(store.workerPreview?.salary)}} {{$t('content.sum')}}</div>
      <div class="col-span-12 font-bold"> <span class="font-normal text-gray-400">{{$t('workerView.general.position')}}</span>: {{store.workerPreview?.post_name}}	</div>
    </template>


  </div>
</template>

<style scoped>

</style>