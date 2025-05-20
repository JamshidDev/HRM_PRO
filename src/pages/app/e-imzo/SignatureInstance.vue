<script setup>
import {useSignatureStore} from "@/store/modules/index.js"
import {UsbStick24Filled} from "@vicons/fluent"
import Utils from "@/utils/Utils.js"
import {useAppSetting} from "@/utils/index.js"
const store = useSignatureStore()




const activeCallback = computed(()=>{
  if(store.signatureType === store.signatureTypes.auth) return store._auth
  if(store.signatureType === store.signatureTypes.contract) return store._contract
})




onMounted(async ()=>{
  // window.onload = await store._initialSignature
})
</script>

<template>
  <n-modal v-model:show="store.visible">
    <n-card
        style="width:700px"
        :bordered="false"
        size="huge"
        role="dialog"
        aria-modal="true"
        class="bg-surface-section"
    >
      <n-spin :show="store.loading" class="min-h-[100px]">
        <div class="flex flex-col w-full max-h-[400px] overflow-y-auto">
          <div
              @click="store._accepted(useAppSetting.signatureUseType.idCard, activeCallback)"
              class="flex mb-2 justify-center gap-2 items-center bg-gray-50 border border-surface-line rounded-lg min-h-[60px]"
              :class="[store.usbVisible? 'cursor-pointer' : 'cursor-not-allowed ']"
          >
            <n-icon size="28"
                    :class="[store.usbVisible? 'text-success' : 'text-textColor3']"
            >
              <UsbStick24Filled/>
            </n-icon>
            <span
                class="font-semibold uppercase text-lg"
                :class="[store.usbVisible? 'text-success' : 'text-textColor3 line-through']"
            >{{$t('content.loginByUsb')}}</span>
          </div>
          <template v-for="(key, idx) in store.allKeys" :key="idx">
            <div
                @click="store._accepted(idx, activeCallback)"
                class="hover:bg-primary/3 grid grid-cols-12 gap-y-2 w-full bg-gray-50 mb-2 border border-surface-line rounded-sm px-4 py-4 cursor-pointer shadow-none  transition-all">
              <div class="col-span-12 font-bold text-lg mb-1 text-textColor0">{{key?.fullName}}</div>

              <div class="col-span-4 font-bold">
                <span class="text-xs font-normal block text-textColor3">{{$t('signature.pinfl')}}</span>
                <span class="text-xs block font-semibold text-textColor2">{{key?.pinfl}}</span>
              </div>
              <div class="col-span-4 font-bold">
                <span class="text-xs font-normal block text-textColor3">{{$t('signature.inn')}}</span>
                <span class="text-xs block font-semibold text-textColor2">{{key?.inn}}</span>
              </div>
              <div class="col-span-4 font-bold">
                <span class="text-xs font-normal block text-textColor3">{{$t('signature.keyType')}}</span>
                <span class="text-primary text-xs block font-semibold">{{$t(key?.key_type)}}</span>
              </div>
              <div class="col-span-4 font-bold">
                <span class="text-xs font-normal block text-textColor3">{{$t('signature.certificate')}}</span>
                <span class="text-xs block font-semibold text-textColor2">{{key?.certificate}}</span>
              </div>
              <div class="col-span-4 font-bold">
                <span class="text-xs font-normal block text-textColor3">{{$t('signature.validDate')}}</span>
                <span class="text-xs block font-semibold text-textColor2">{{Utils.timeWithMonth(key?.validDate)}}</span>
              </div>

            </div>
          </template>
        </div>
      </n-spin>

    </n-card>
  </n-modal>
</template>
