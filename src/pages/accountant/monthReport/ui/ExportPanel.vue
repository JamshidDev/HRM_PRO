<script setup>
import {ArrowSync12Filled, ArrowCircleDown48Regular, ArrowLeft28Filled} from "@vicons/fluent"
import {useComponentStore, useMonthReportStore} from "@/store/modules/index.js"
import Utils from "@/utils/Utils.js"
import {UISelect, UINSelect} from "@/components/index.js"
import validationRules from "@/utils/validationRules.js"
import ValidationRules from "@/utils/validationRules.js"

const store = useMonthReportStore()
const componentStore = useComponentStore()
const formRef = ref(null)

const onChange = (v)=>{
  store.exportParams.organizations = v
}



const onSubmit = ()=>{
  if(store.exportType === 2){
    formRef.value?.validate((error)=>{
      if(!error){
        const data = {
          ...store.exportParams,
          organizations:store.exportParams.organizations.map(v=>v.id).toString() || undefined,
          type:store.exportParams.byOrganization? 'organizations' : 'workers',
          byOrganization:undefined
        }
        store._exportWithCode(data)
      }
    })
  }else{
    const prams = {
      year:store.exportParams.year,
      month:store.exportParams.month,
      organizations:store.exportParams.organizations.map(v=>v.id).toString() || undefined,
    }
    store._exportMultiple(prams)
  }

}

const onSelect = (type)=>{
  store.exportType = type
  store.activeTab = 2
}

onMounted(()=>{
  store.exportParams.year = store.params.year
  store.exportParams.month = store.params.month
  if(componentStore.structureList.length === 0){
    componentStore._structures()
  }

  if(store.codeList.length === 0){
    store._enum()
  }
})
</script>

<template>
  <n-tabs animated v-model:value="store.activeTab" class="hidden-tab-header" type="segment">
    <n-tab-pane :name="store.tabList[0]">
      <div class="w-full rounded-lg flex flex-col gap-4 mb-6">
        <n-button @click="onSelect(1)" size="large" secondary type="success" class="w-full!">
          <template #icon>
            <ArrowCircleDown48Regular/>
          </template>
          {{$t('monthReport.tab.multipleSalary')}}</n-button>
        <n-button @click="onSelect(2)"  size="large" secondary type="success" class="w-full!">
          <template #icon>
            <ArrowCircleDown48Regular/>
          </template>
          {{$t('monthReport.tab.exportWithCode')}}</n-button>
      </div>
    </n-tab-pane>
    <n-tab-pane :name="store.tabList[1]">
      <n-button @click="store.activeTab=1" size="tiny" class="mb-4!">
        <template #icon>
          <ArrowLeft28Filled/>
        </template>
        {{$t('content.back')}}</n-button>
      <n-form
          ref="formRef"
          :rules="validationRules.common"
          class="w-full grid grid-cols-12 gap-4"
          :model="store.exportParams"
      >
        <div class="col-span-12">
          <label class="mt-3 text-xs text-gray-500 mb-1 font-medium">{{$t('actionLog.table.structure')}}</label>
          <UISelect
              :options="componentStore.structureList"
              :modelV="store.exportParams.organizations"
              @defaultValue="(v)=>store.exportParams.organizations=v"
              @updateModel="onChange"
              :checkedVal="store.structureCheck"
              @updateCheck="(v)=>store.structureCheck=v"
              :loading="componentStore.structureLoading"
              v-model:search="componentStore.structureParams.search"
              @onSearch="componentStore._structures"
          />
        </div>
        <div class="col-span-6">
          <label class="text-xs mt-3 text-gray-500 mb-1 font-medium">{{$t('content.year')}}</label>
          <n-select
              class="w-full"
              v-model:value="store.params.year"
              :options="Utils.yearList"
              label-field="name"
              value-field="id"
          />
        </div>
        <div class="col-span-6">
          <label class="text-xs mt-3 text-gray-500 mb-1 font-medium">{{$t('content.month')}}</label>
          <n-select
              class="w-full"
              v-model:value="store.exportParams.month"
              :options="Utils.monthList"
              label-field="name"
              value-field="id"
          />
        </div>
        <template v-if="store.exportType>1">
          <div class="col-span-12 border border-surface-line rounded-lg py-1 px-2 flex justify-between items-center ">
            <span class="text-primary"> {{$t(store.exportParams.byOrganization? 'monthReport.form.organizations' : 'monthReport.form.workers')}}</span>
            <span
                @click="store.exportParams.byOrganization = !store.exportParams.byOrganization"
                class="bg-surface-ground p-1 rounded-lg flex justify-center items-center cursor-pointer">
      <n-icon size="18" class="text-secondary">
        <ArrowSync12Filled/>
      </n-icon>
    </span>

          </div>
          <n-form-item
              class="col-span-12"
              :label="$t(`monthReport.form.code`)"
              path="codes"
              :rule-path="ValidationRules.rulesNames.requiredMultiSelectField"
          >
            <UINSelect
                :multiple-search="true"
                multiple
                v-model:value="store.exportParams.codes"
                value-field="id"
                :max-tag-count="1"
                :options="store.codeList"
                :loading="store.enumLoading"
            />

          </n-form-item>
        </template>
        <template v-else>
          <div class="col-span-12 border border-surface-line bg-surface-ground px-4 py-2 text-sm rounded-lg text-secondary mb-4!">
            {{$t('monthReport.tab.multipleSalary')}}
          </div>
        </template>

        <div class="col-span-12 flex justify-center mb-4">
          <n-button :loading="store.showLoading" @click="onSubmit" type="success" class="w-[200px]!">{{$t('content.download')}}</n-button>
        </div>

      </n-form>
    </n-tab-pane>
  </n-tabs>
</template>
