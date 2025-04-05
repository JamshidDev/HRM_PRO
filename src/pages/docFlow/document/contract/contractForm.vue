
<script setup>
import {ArrowCircleLeft20Regular, ArrowCircleRight32Regular} from "@vicons/fluent"
import validationRules from "@/utils/validationRules.js";
import {useContractStore, useComponentStore} from "@/store/modules/index.js";
import {CheckmarkCircle12Filled, DocumentBulletList24Regular} from "@vicons/fluent"
import ContractForm_1 from "@/pages/docFlow/document/contract/ui/ContractForm_1.vue"
import ContractForm_2 from "@/pages/docFlow/document/contract/ui/ContractForm_2.vue"
import ContractForm_3 from "@/pages/docFlow/document/contract/ui/ContractForm_3.vue"
import ContractForm_4 from "@/pages/docFlow/document/contract/ui/ContractForm_4.vue"

const store = useContractStore()
const componentStore = useComponentStore()
const formRef = ref(null)

const props = defineProps({
  callBack:{
    type:Function,
    default:null,
  },
})

const onSubmit = ()=>{
  formRef.value?.validate((error)=>{
    if(!error){
      if(store.activeTab === 2 && store.payload.type ===2){
        // store.activeTab = store.payload.type ===2? 4:3
        // store.stepNumber = store.payload.type ===2? 4:3
        store.saveLoading = true
        store._create(props.callBack)
      }
      else if(store.activeTab === 3){
        store.saveLoading = true
        store._create()
      }
      else{
        store.activeTab++
        store.stepNumber++
      }
    }
  })
}

const goBack = ()=>{
    store.activeTab --
  store.stepNumber --
}

onMounted(()=>{
  if(componentStore.groupList.length===0){
    componentStore._enums()
  }
  componentStore._scheduleList()
})

</script>

<template>




  <n-form
      ref="formRef"
      :rules="validationRules.contractFrom"
      :model="store.payload"
  >
    <n-space vertical class="w-full mb-4">
      <n-steps :status="store.st" :current="store.stepNumber">
        <template #finish-icon>
          <n-icon>
            <CheckmarkCircle12Filled />
          </n-icon>
        </template>
        <template #error-icon>
          <n-icon>
            <DocumentBulletList24Regular />
          </n-icon>
        </template>
        <n-step
            :title="$t('contractPage.step.stepOne')"
        />
        <n-step
            :title="$t('contractPage.step.stepTwo')"
        />
        <n-step
            :title="$t('contractPage.step.stepThree')"
        />
        <n-step
            :title="$t('contractPage.step.stepFour')"
        />
      </n-steps>
    </n-space>

    <div style="height:calc(100vh - 160px)" class="overflow-y-auto overflow-x-hidden pb-12">
      <n-tabs animated v-model:value="store.activeTab" class="hidden-tab-header" type="segment">
        <n-tab-pane :name="store.tabList[0].id">
          <ContractForm_1/>
        </n-tab-pane>
        <n-tab-pane :name="store.tabList[1].id">
          <ContractForm_2/>
        </n-tab-pane>
        <n-tab-pane :name="store.tabList[2].id">
          <ContractForm_3/>
        </n-tab-pane>
        <n-tab-pane :name="store.tabList[3].id">
          <ContractForm_4/>
        </n-tab-pane>
      </n-tabs>
    </div>

    <div class="grid gap-2" :class="[(store.activeTab ===1 || store.activeTab ===4)? 'grid-cols-1' : 'grid-cols-2']">
      <n-button
          v-if="store.activeTab !== 1 && store.activeTab !== 4"
          @click="goBack()"
          type="error"
          :loading="store.saveLoading"
          ghost
      >
        <template #icon>
          <ArrowCircleLeft20Regular/>
        </template>
        {{$t('content.back')}}
      </n-button>
      <n-button
          v-if="store.activeTab !== 4"
          @click="onSubmit"
          :loading="store.saveLoading"
          type="primary">

        <template #icon>
          <ArrowCircleRight32Regular/>
        </template>

        {{$t('content.next')}}
      </n-button>
    </div>
  </n-form>
</template>

<style scoped>

</style>