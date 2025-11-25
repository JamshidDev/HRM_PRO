<script setup>
import {useComponentStore, useContractStore} from "@/store/modules/index.js"
import {NAvatar} from "naive-ui"
import Utils from "@/utils/Utils.js"
import {useAppSetting} from "@/utils/index.js"
import UIHelper from "@/utils/UIHelper.js"

const store = useContractStore()
const componentStore = useComponentStore()
const confirmationList = ref([])

const showVacationDay = computed(()=>{
  return ![2].includes(store.payload.type)
})

const renderLabel = (option)=>{
  return [
    h(
        'div',
        {
          class:'flex gap-2 my-1 items-center'
        },[
          h(NAvatar,
              {
                class:'',
                src:option.photo,
                'fallback-src':Utils.noAvailableImage,
              },),
          h('div',{ class:'flex flex-col'}, [
            h('div',{ class:'text-xs font-medium text-gray-500'},`${option.last_name}.${option.last_name[0]}.${option.middle_name[0]}`),
            h('div',{ class:'text-xs text-gray-400'},option.position),
          ])
        ]
    ),
  ];
}

watchEffect(()=>{
  if(store.payload.director_id){
    store.payload.confirmations = store.payload.confirmations.filter(v=>v !==store.payload.director_id)
    confirmationList.value = componentStore.confirmationList.filter(v=>v.id !==store.payload.director_id)
  }
})

const onChange = (v)=>{
  if(v ===6){
    store.payload.temporary_worker_id = null
    const id = store.payload.organization_id[0].id
    store._vacationWorkers(id)
  }

}
</script>

<template>
  <div class="grid grid-cols-12 gap-x-4">
    <div v-if="showVacationDay" class="col-span-12 pt-4 flex justify-center gap-2 items-center relative">
      <n-divider dashed title-placement="left" class="w-full">
        <div class="flex items-center gap-3">
          <n-switch v-model:value="store.payload.command_status" />
          <span class="text-primary font-medium">{{$t(`documentPage.form.command_status`)}}</span>
        </div>

      </n-divider>
    </div>
    <div
        v-if="store.payload.command_status"
        class="col-span-12 border border-dashed p-2 bg-surface-ground rounded-xl border-surface-line">
      <div class="grid grid-cols-12 gap-x-4">
        <div class="col-span-12 md:col-span-6" >
          <n-form-item :label="$t(`documentPage.form.command_type`)" path="command_type">
            <n-select
                :disabled="!Boolean(store.payload.type)"
                v-model:value="store.payload.command_type"
                filterable
                :options="componentStore.commandTypeList"
                label-field="name"
                value-field="id"
                :loading="componentStore.commandTypeLoading"
                @update:value="onChange"
                clearable
            />
          </n-form-item>
        </div>
        <div class="col-span-12 md:col-span-3">
          <n-form-item :label="$t(`documentPage.command.form.command_number`)" path="command_number">
            <n-input
                class="w-full"
                type="text"
                v-model:value="store.payload.command_number"
            />
          </n-form-item>

        </div>
        <div class="col-span-12 md:col-span-3">
          <n-form-item :label="$t(`documentPage.command.form.command_date`)" path="command_date">
            <n-date-picker
                class="w-full"
                v-model:value="store.payload.command_date"
                type="date"

                :format="useAppSetting.datePicketFormat"
            />
          </n-form-item>
        </div>
        <div v-if="store.payload.command_type === 6" class="col-span-12">
          <n-form-item :label="$t(`applicationPage.form.temporarily_absent`)" path="temporary_worker_id">
            <n-select
                v-model:value="store.payload.temporary_worker_id"
                :options="store.vacationWorkers"
                :loading="store.vacationLoading"
                :render-label="UIHelper.selectRender.label"
                :render-tag="UIHelper.selectRender.value"
                value-field="id"
                label-field="id"
            />
          </n-form-item>
        </div>
        <div class="col-span-12">
          <n-form-item :label="$t(`documentPage.command.form.confirm`)" path="director_id">
            <n-select
                size="large"
                value-field="id"
                multiple
                v-model:value="store.payload.confirmations"
                :options="confirmationList"
                :loading="componentStore.confirmationLoading"
                :render-label="renderLabel" />
          </n-form-item>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>