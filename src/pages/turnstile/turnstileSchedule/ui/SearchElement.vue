
<script setup>
import {PeopleSearch24Regular, Dismiss24Filled} from "@vicons/fluent"
import {useTurnstileScheduleStore} from "@/store/modules/index.js"
import {useDebounce} from "@/utils/index.js"

const store = useTurnstileScheduleStore()
const debounceIndex = useDebounce(store._searchWorker)

const searchEvent = ()=>{
  debounceIndex()
}

const onClose = ()=>{
  store.activeSearch=false
  if(store.workerParams.search){
    store.workerParams.search = null
    debounceIndex()
  }
}

onUnmounted(()=>{
  debounceIndex?.cancel()
})
</script>
<template>
  <div class="flex items-center gap-3 w-full overflow-hidden h-full px-2">
    <Transition name="slide" mode="out-in">
      <div v-if="store.activeSearch" class="flex gap-2 justify-between items-center w-full">
        <n-input
            :on-keyup="searchEvent"
            @paste="searchEvent"
            type="text"
            v-model:value="store.workerParams.search"
            :placeholder="$t('content.search')"
        />
        <div @click="onClose" class="p-2 bg-surface-ground w-[32px] h-[32px] rounded-lg flex justify-center items-center cursor-pointer">
          <n-icon size="24" class="text-secondary" >
            <Dismiss24Filled/>
          </n-icon>
        </div>

      </div>
      <div v-else class="flex justify-between items-center w-full">
        <span class="font-bold">{{$t('schedule.form.workerList')}}</span>
        <div  @click="store.activeSearch=true" class="p-2 bg-surface-ground w-[32px] h-[32px] rounded-lg flex justify-center items-center cursor-pointer">
          <n-icon size="24" class="text-secondary" >
            <PeopleSearch24Regular/>
          </n-icon>
        </div>

      </div>
    </Transition>
  </div>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.2s ease;
}

.slide-enter-from {
  opacity: 0;
  transform: translateY(-100%);
}

.slide-leave-to {
  opacity: 0;
  transform: translateY(100%);
}
</style>