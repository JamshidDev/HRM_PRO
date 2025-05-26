<script setup>
import {UIAutoComplete, UISelect, UIUpload} from "@/components/index.js"
import validationRules from "@/utils/validationRules.js";
const formRef = ref(null)
import {useMedStore, useComponentStore} from "@/store/modules/index.js";
import {useAppSetting} from "@/utils/index.js"
import Utils from "@/utils/Utils.js"

const store = useMedStore()
const componentStore = useComponentStore()

const onSubmit = ()=>{
  formRef.value?.validate((error)=>{
    if(!error){
      store.saveLoading = true
      const fromData = new FormData()
      fromData.append('from', Utils.timeToZone(store.payload.from))
      fromData.append('to', Utils.timeToZone(store.payload.to))
      fromData.append('status', store.payload.status)
      if(store.payload.comment){
        fromData.append('comment',store.payload.comment)
      }

      store.payload.file.forEach((v)=>{
        if(v.file){
          fromData.append('file', v.file)
        }

      })

      if(store.activeTab === 1){
        fromData.append('worker_position_id',store.payload.worker_position_id)
        fromData.append('organization_id', store.payload.organization_id[0].id)
      }else{
        fromData.append('worker_id',store.payload.pin)
      }

      if(store.visibleType){

        store._create(fromData)
      }else{
        store._update(fromData)
      }

    }
  })
}

const onChangeStructure = (v)=>{
  store.payload.organization_id=v
  if(v.length>0){
    componentStore.workerList = []
    store.workers = []
    componentStore.workerParams.organization_id= v[0].id
    componentStore._workers()
  }
}

const onDeleteFile = (v)=>{
  store.payload.file = []
}



const workerRenderLabel = (option)=>{
  return [
    h('div',{ class:'flex flex-col pt-2'}, [
      h('div',{ class:'text-xs font-medium text-gray-500'},option.name),
      h('div',{ class:'text-xs text-primary'},option.position),
    ])
  ];
}
const workerRenderValue = ({option})=>{
  return [
    h('div',{ class:'flex flex-col'}, [
      h('div',{ class:'text-sm font-medium text-gray-500'},option.name),
    ])
  ];
}

const getStatus = ()=>{
  if(componentStore.medStatus.length === 0){
    componentStore._enums()
  }
}

onMounted(()=>{
  if(componentStore.structureList.length === 0){
    componentStore._structures()
  }
})


</script>

<template>
  <n-form
      ref="formRef"
      :rules="validationRules.medFrom"
      :model="store.payload"
  >
    <n-spin class="w-full" :show="store.showLoading">
      <div style="min-height:calc(100vh - 120px)">
        <n-tabs v-model:value="store.activeTab" type="segment" animated>

          <template v-for="(item,index) in store.tabs">
            <n-tab-pane :name="item.id" :tab="$t(item.name)">
              <template v-if="item.id === store.tabs[0].id">

                <n-form-item class="w-full mr-4" :label="$t(`documentPage.form.organization`)" path="organization_id">
                  <UISelect
                      :options="componentStore.structureList"
                      :modelV="store.payload.organization_id"
                      @defaultValue="(v)=>store.payload.organization_id=v"
                      @updateModel="onChangeStructure"
                      :checkedVal="store.structureCheck"
                      @updateCheck="(v)=>store.structureCheck=v"
                      v-model:search="componentStore.structureParams.search"
                      @onSearch="componentStore._structures"
                      :loading="componentStore.structureLoading"
                      :multiple="false"
                      :auto-select="true"
                  />
                </n-form-item>
                <n-form-item class="w-full " :label="$t(`documentPage.form.worker`)" path="worker_position_id">
                  <n-select
                      :disabled="store.payload.organization_id.length === 0"
                      v-model:value="store.payload.worker_position_id"
                      filterable
                      :options="componentStore.workerList"
                      label-field="name"
                      value-field="id"
                      :render-label="workerRenderLabel"
                      :render-tag="workerRenderValue"
                      :loading="componentStore.workerLoading"
                      @scroll="componentStore.onScrollWorker"
                      @search="componentStore.onSearchWorker"
                      :default-value="'Jamshid'"
                  />
                </n-form-item>
              </template>
              <template v-if="item.id === store.tabs[1].id">
                <UIAutoComplete class="mb-10"  v-model:pin="store.payload.pin" />
              </template>
            </n-tab-pane>
          </template>

        </n-tabs>
        <n-form-item :label="$t(`medPage.form.status`)" path="status">
          <n-select
              v-model:value="store.payload.status"

              :options="componentStore.medStatus"
              :loading="componentStore.enumExamLoading"
              label-field="name"
              value-field="id"
              @focus="getStatus"
          />
        </n-form-item>
        <n-form-item
            v-if="store.payload.status === 2"
            :label="$t(`medPage.form.comment`)"
            path="comment">
          <n-input
              rows="2"
              type="textarea"

              v-model:value="store.payload.comment"
          />
        </n-form-item>
        <n-form-item
            :label="$t(`medPage.form.from`)"
            path="from">
          <n-date-picker
              class="w-full"
              v-model:value="store.payload.from"
              type="date"

              :format="useAppSetting.datePicketFormat"
          />
        </n-form-item>
        <n-form-item
            :label="$t(`medPage.form.to`)"
            path="to">
          <n-date-picker
              class="w-full"
              v-model:value="store.payload.to"
              type="date"

              :format="useAppSetting.datePicketFormat"
              :is-date-disabled="(v)=>Utils.disablePasteDate(v,store.payload.from)"
          />
        </n-form-item>
        <n-form-item :label="$t(`medPage.form.file`)" path="file">
          <UIUpload
              :multiple="false"
              v-model:files="store.payload.file"
              :accept="'.pdf'"
              @onDelete="onDeleteFile"
          />
        </n-form-item>

      </div>
    </n-spin>

    <div class="grid grid-cols-2 gap-2">
      <n-button @click="store.openVisible(false)" type="error" ghost>
        {{$t('content.cancel')}}
      </n-button>
      <n-button
          @click="onSubmit"
          :loading="store.saveLoading"
          type="primary">
        {{$t('content.save')}}
      </n-button>
    </div>
  </n-form>
</template>

<style scoped>

</style>