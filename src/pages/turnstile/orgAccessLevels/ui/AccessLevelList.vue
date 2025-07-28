<script setup>
import {useTurnstileHikCentralStore, useAccountStore} from "@/store/modules/index.js";
import {Save16Regular} from "@vicons/fluent";
import isdeepequal from 'fast-deep-equal'
const store = useTurnstileHikCentralStore()
const accStore = useAccountStore()

const toggleItem = (v) => {
  if (store.payload.access_levels.find(i => i === v)){
    store.payload.access_levels = store.payload.access_levels.filter(i => i !== v)
  } else {
    store.payload.access_levels.push(v)
  }
}

const currOrgLevels = computed(() => {
  if(store.payload.organization.length){
   return  store.payload.organization[0].access_levels.map(i=>i.id)
  }
  return []
})


const cancelChanges = ()=>{
  store.payload.access_levels = [...currOrgLevels.value]
}

const onSubmitLevels = ()=>{
  if(!accStore.checkAction(accStore.pn.turnstileOrganizationAccessLevelsWrite)) return
  store._attach_org_access_levels()
}

</script>
<template>
  <div class="h-full flex flex-col gap-2">
    <div
        class="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-3 overflow-auto basis-auto grow grid-rows-[repeat(auto-fill,32px)] p-1">
      <div v-for="(item, idx) in store.accessLevels"
           :key="idx"
           class="rounded-lg px-2 hover:bg-blue-50 transition-all cursor-pointer flex gap-3 items-center bg-surface-section border-surface-line border"
           @click="toggleItem(item.id)"
      >
        <n-checkbox :checked="(()=>!!store.payload.access_levels.find(i=>i===item.id))()"/>
        <div>
          <p class="font-bold text-textColor0">{{ item.name }}</p>
          <p class="text-xs text-textColor2">{{item.description}}</p>
        </div>
      </div>
    </div>
    <div class="shrink-0 flex justify-end gap-3">
      <n-button
          class="md:hidden"
          type="error"
          @click="cancelChanges"
      >
        {{ $t('content.cancel') }}
      </n-button>
      <n-button
          :disabled="store.payload.organization.length === 0"
          type="primary"
          icon-placement="right"
          @click="onSubmitLevels"
          :loading="store.saveLoading"
      >
        <template #icon>
          <n-icon>
            <Save16Regular/>
          </n-icon>
        </template>
        {{ $t('content.save') }}
      </n-button>
    </div>

  </div>

</template>