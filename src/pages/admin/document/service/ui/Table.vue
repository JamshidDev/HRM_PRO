<script setup>
import {useServiceOrgStore, useComponentStore} from "@/store/modules/index.js"
import {useAccountStore} from "@/store/modules/index.js"
const accStore = useAccountStore()

const store = useServiceOrgStore()
const componentStore = useComponentStore()


const onChange = (value,key)=>{
  if(!accStore.checkAction(accStore.pn.documentExamplesWrite)) return
  store._update({key, active:value})
}

onMounted(()=>{
  // componentStore._enumsAdmin()
})
</script>

<template>
  <div class="w-full">
    <n-spin v-model:show="store.loading">
      <template v-for="(item, idx) in componentStore.organizationServiceList" :key="idx">
        <div class="flex border border-surface-line mb-2 p-2 rounded-xl justify-between shadow">
          <div>{{item?.name}}</div>
          <div class="w-[40px]">
            <template v-if="item?.id === 'e-signature'">
              <n-switch
                  :disabled="!Boolean(store.elementId)"
                  v-model:value="store.payload.signatureVal"
                  @update:value="onChange($event,item?.id)"
                  :loading="store.saveLoading"
              />
            </template>
            <template v-else-if="item?.id === 'sms-service'">
              <n-switch
                  :disabled="!Boolean(store.elementId)"
                  v-model:value="store.payload.smsVal"
                  @update:value="onChange($event,item?.id)"
                  :loading="store.saveLoading"
              />
            </template>
          </div>
        </div>
      </template>
    </n-spin>


  </div>
</template>