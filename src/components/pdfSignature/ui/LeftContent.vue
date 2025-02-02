<script setup>
import {usePdfViewerStore} from "@/store/modules/index.js"
import {History20Regular, ChevronUp48Filled} from "@vicons/fluent"
import Utils from "../../../utils/Utils.js"
const store = usePdfViewerStore()

const getHistory = ()=>{
  if(!store.show && store.document?.histories>0){
    store._history()
  }else{
    store.show = false
  }

}
</script>

<template>
  <div class="flex flex-col">
    <n-badge type="info" :value="store.show? 0 :store.document?.histories" class="w-full">
      <n-button  style="width:100%" @click="getHistory" :loading="store.historyLoading">
        <template #icon>
          <ChevronUp48Filled v-if="store.show" />
          <History20Regular v-else/>
        </template>
        {{store.show? $t('content.hide') : $t('documentPage.signature.history')}}
      </n-button>
    </n-badge>
    <n-collapse-transition :show="store.show" class="bg-surface-section p-2 rounded">
      <template v-for="(item, idx) in store.historyList" :key="idx">
        <div class="flex justify-between w-full py-1">
          <div class="flex gap-2">
            <n-avatar size="small" round :src="item.user.photo"/>
            <div class="flex items-center">
              <span class="text-[10px] text-gray-600">{{`${item.user.last_name}.${item.user.first_name[0]}`}}</span>
            </div>
          </div>
          <div class="flex flex-col justify-end">
            <span class="text-sm text-end">{{item.status.name}}</span>
            <span class="text-xs text-gray-500">{{Utils.timeWithMonth(item.created_at)}}</span>
          </div>
        </div>
      </template>
    </n-collapse-transition>
  </div>

</template>

<style scoped>

</style>