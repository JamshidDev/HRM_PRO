<script setup>
import validationRules from "@/utils/validationRules.js";
import {ArrowCircleRight20Regular, ArrowCircleLeft28Regular,DismissCircle28Regular, DocumentBulletList24Regular, CheckmarkCircle12Filled, DocumentRibbon28Regular} from "@vicons/fluent"
const formRef = ref(null)
import {useConfApplicationStore, useComponentStore} from "@/store/modules/index.js";
import ApplicationForm_3 from "@/pages/docFlow/confirmation/application/form/ApplicationForm_3.vue"
import ApplicationFinish from "@/pages/docFlow/confirmation/application/form/ApplicationFinish.vue"
import ApplicationForm_1 from "@/pages/docFlow/confirmation/application/form/ApplicationForm_1.vue"
import ApplicationForm_101 from "@/pages/docFlow/confirmation/application/form/ApplicationForm_101.vue"
import ApplicationForm_2 from "@/pages/docFlow/confirmation/application/form/ApplicationForm_2.vue"
import ApplicationForm_4 from "@/pages/docFlow/confirmation/application/form/ApplicationForm_4.vue"
import ApplicationForm_5 from "@/pages/docFlow/confirmation/application/form/ApplicationForm_5.vue"
import ApplicationForm_6 from "@/pages/docFlow/confirmation/application/form/ApplicationForm_6.vue"
import ApplicationForm_7 from "@/pages/docFlow/confirmation/application/form/ApplicationForm_7.vue"
import ApplicationForm_9 from "@/pages/docFlow/confirmation/application/form/ApplicationForm_9.vue"
import ApplicationForm_10 from "@/pages/docFlow/confirmation/application/form/ApplicationForm_10.vue"
import ApplicationForm_8 from "@/pages/docFlow/confirmation/application/form/ApplicationForm_8.vue"

const store = useConfApplicationStore()
const componentStore = useComponentStore()
const onSubmit = ()=>{
  formRef.value?.validate((error)=>{
    if(!error){
      if(store.activeTab === 101){
        store.activeTab = store.payload.type
        if(store.typeList.includes(store.payload.type) && !store.visibleType){
          componentStore._departmentPosition(store.department_id?.[0]?.id)
        }
        store.stepNumber = 2
      }else{

        if(store.visibleType){
          store._create()
        }else{
          store._update()
        }

      }
    }
  })
}


const applicationName  = computed(()=>{
  return componentStore.workerApplicationTypes.filter(v=>v.id === store.payload.type)?.[0]?.name
})

const goBack = ()=>{
  if(store.activeTab!==100){
    store.activeTab= 101
    store.stepNumber=1
  }else{
    store.activeTab= store.payload.type
    store.stepNumber=2
  }
}


</script>

<template>
  <n-form
      ref="formRef"
      :rules="validationRules.applicationPage"
      :model="store.payload"
  >
    <n-space vertical class="w-full mb-4 hidden! md:inline-block!">
      <n-steps :status="store.stepStatus" :current="store.stepNumber">
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
            :title="$t('applicationPage.step.stepOne')"
        />
        <n-step
            :title="$t('applicationPage.step.stepTwo')"
        />
        <n-step
            :title="$t('applicationPage.step.stepThree')"
        />
      </n-steps>
    </n-space>
    <div v-if="store.activeTab !==101 && store.activeTab !== 100"  class=" mb-4 flex gap-2 text-xs items-center px-2 py-1 border-dashed border-t border-surface-line justify-center">
      <span class="text-gray-400">{{$t('applicationPage.form.type')}}:</span>
      <span class="font-medium text-gray-500">{{applicationName}}</span>
    </div>
    <n-tabs animated v-model:value="store.activeTab" class="hidden-tab-header" type="segment">
      <n-tab-pane :name="store.tabList[0].id">
        <ApplicationForm_101/>
      </n-tab-pane>
      <n-tab-pane :name="store.tabList[1].id">
        <ApplicationFinish/>
      </n-tab-pane>
      <n-tab-pane :name="store.tabList[2].id">
        <ApplicationForm_3/>
      </n-tab-pane>
      <n-tab-pane :name="store.tabList[3].id">
        <ApplicationForm_4/>
      </n-tab-pane>
      <n-tab-pane :name="store.tabList[4].id">
        <ApplicationForm_1/>
      </n-tab-pane>
      <n-tab-pane :name="store.tabList[5].id">
        <ApplicationForm_2/>
      </n-tab-pane>
      <n-tab-pane :name="store.tabList[6].id">
        <ApplicationForm_5/>
      </n-tab-pane>
      <n-tab-pane :name="store.tabList[7].id">
        <ApplicationForm_6/>
      </n-tab-pane>
      <n-tab-pane :name="store.tabList[8].id">
        <ApplicationForm_7/>
      </n-tab-pane>
      <n-tab-pane :name="store.tabList[9].id">
        <ApplicationForm_9/>
      </n-tab-pane>
      <n-tab-pane :name="store.tabList[10].id">
        <ApplicationForm_10/>
      </n-tab-pane>
      <n-tab-pane :name="store.tabList[11].id">
        <ApplicationForm_8 />
      </n-tab-pane>


    </n-tabs>
    <div class="col-span-12 flex justify-center mb-4 mt-10">
      <div class="grid grid-cols-2 w-full gap-4">
        <div>
          <n-button
              v-if="store.activeTab !== 101 && store.activeTab !== 100"
              :loading="store.saveLoading"
              style="width: 100%"
              @click="goBack()"
              type="warning">
            <template #icon>
              <ArrowCircleLeft28Regular/>
            </template>
            {{$t('content.back')}}
          </n-button>
        </div>

        <div :class="store.activeTab === 101 && 'col-span-2'" >
          <n-button
              v-if="store.activeTab !== 100"
              :loading="store.saveLoading"
              style="width: 100%"
              @click="onSubmit"
              icon-placement="right"
              type="primary">
            <template #icon>
              <ArrowCircleRight20Regular/>
            </template>
            {{store.activeTab === 101? $t('content.next') : $t('content.send')}}
          </n-button>
        </div>
        <div class="col-span-2">
          <n-button
              v-if="store.activeTab === 100"
              style="width: 100%"
              @click="store.visible = false"
              type="error">
            <template #icon>
              <DismissCircle28Regular/>
            </template>
            {{$t('content.close')}}
          </n-button>
        </div>
      </div>
    </div>
  </n-form>
</template>

<style scoped>

</style>