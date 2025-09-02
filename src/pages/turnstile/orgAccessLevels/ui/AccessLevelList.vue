<script setup>
import {useTurnstileHikCentralStore, useAccountStore} from "@/store/modules/index.js";
import {Save16Regular, Filter24Filled, Checkmark16Filled, DismissCircle32Filled} from "@vicons/fluent"
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



const onSearchEv = () => {
  let query =store.query?.toString()?.trim()?.toLowerCase()
  if(!Boolean(query)){
    store.accessLevels = store.originAccessLevels
  }else{
    store.accessLevels = store.originAccessLevels.filter(v=>v?.name?.toString()?.toLowerCase()?.includes(query))
  }
}
const onClearEv = ()=>{
  store.query = null
  onSearchEv()
}


const cancelChanges = ()=>{
  store.payload.access_levels = [...currOrgLevels.value]
}

const onCancelOrg = ()=>{
  store.payload.organization = []
  store.payload.access_levels = []
  store.accessLevels = store.originAccessLevels
}

const onSubmitLevels = ()=>{
  if(!accStore.checkAction(accStore.pn.turnstileOrganizationAccessLevelsWrite)) return
  store._attach_org_access_levels()
}

</script>
<template>
  <div class="flex flex-col gap-2">
    <div class="flex">
      <n-input
          clearable
          class="w-[calc(100%-200px)] skip-format"
          v-model:value="store.query"
          type="text"
          :placeholder="$t('content.search')"
          :on-keyup="onSearchEv"
          @clear="onClearEv"
      />
      <div class="w-[200px] px-4 flex gap-2">
        <n-button type="success" round secondary>
          {{store.payload.access_levels.length}}
          <template #icon>
            <Checkmark16Filled/>
          </template>
        </n-button>
        <n-button type="primary" round secondary>
          {{store.accessLevels.length}}
            <template #icon>
              <Filter24Filled/>
            </template>
        </n-button>
      </div>

    </div>
    <div class="h-[calc(100vh-244px)] overflow-auto">
      <div
          class="grid grid-cols-12 gap-2 overflow-auto p-1">
        <div v-for="(item, idx) in store.accessLevels"
             :key="idx"
             class="rounded-lg col-span-12 lg:col-span-6 px-2 py-1 hover:bg-blue-50 transition-all cursor-pointer flex gap-3 items-center bg-surface-section border-surface-line border"
             @click="toggleItem(item.id)"
        >
          <n-checkbox :checked="(()=>!!store.payload.access_levels.find(i=>i===item.id))()"/>
          <div>
            <p class="font-semibold text-textColor0">{{ item.name }}</p>
            <p class="text-xs text-textColor2">{{item.description}}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="flex gap-4 justify-between items-center bg-surface-section py-2 px-2 border border-surface-line rounded-lg">
     <div class="flex">
       <n-button @click="onCancelOrg" icon-placement="right" round type="warning" secondary v-if="store.payload.organization.length>0">
        <span class="line-clamp-1 max-w-[300px]! overflow-ellipsis">{{store.payload.organization[0].name}}</span>
         <template #icon>
           <DismissCircle32Filled/>
         </template>
       </n-button>
     </div>
      <div class="flex gap-2">
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

  </div>

</template>