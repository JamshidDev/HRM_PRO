<script setup>
import {useSignatureStore} from "@/store/modules/index.js"
import Utils from "@/utils/Utils.js"
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
      <div class="flex flex-col w-full max-h-[400px] overflow-y-auto">
        <template v-for="(key, idx) in store.allKeys" :key="idx">
          <div
              @click="store._accepted(idx, activeCallback)"
              class="grid grid-cols-12 gap-y-2 w-full bg-gray-50 mb-2 border border-gray-200 rounded px-4 py-4 cursor-pointer hover:bg-gray-200 shadow-none  transition-all">
            <div class="col-span-12 font-bold text-lg mb-1 text-gray-800">{{key?.fullName}}</div>

            <div class="col-span-4 font-bold">
              <span class="text-xs font-normal block text-gray-400">{{$t('signature.pinfl')}}</span>
              <span class="text-xs block font-medium">{{key?.pinfl}}</span>
            </div>
            <div class="col-span-4 font-bold">
              <span class="text-xs font-normal block text-gray-400">{{$t('signature.inn')}}</span>
              <span class="text-xs block font-medium">{{key?.inn}}</span>
            </div>
            <div class="col-span-4 font-bold">
              <span class="text-xs font-normal block text-gray-400">{{$t('signature.keyType')}}</span>
              <span class="text-primary text-xs block font-medium">{{$t(key?.key_type)}}</span>
            </div>
            <div class="col-span-4 font-bold">
              <span class="text-xs font-normal block text-gray-400">{{$t('signature.certificate')}}</span>
              <span class="text-xs block font-medium">{{key?.certificate}}</span>
            </div>
            <div class="col-span-4 font-bold">
              <span class="text-xs font-normal block text-gray-400">{{$t('signature.validDate')}}</span>
              <span class="text-xs block font-medium">{{Utils.timeWithMonth(key?.validDate)}}</span>
            </div>

          </div>
        </template>
      </div>

    </n-card>
  </n-modal>
</template>
