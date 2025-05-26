<script setup>
import validationRules from "@/utils/validationRules.js";
import {QrCode20Regular, ArrowCircleLeft20Regular, Copy20Regular} from "@vicons/fluent"
const formRef = ref(null)
import {useApplicationStore, useComponentStore} from "@/store/modules/index.js";
import {NAvatar} from "naive-ui"
import Utils from "@/utils/Utils.js"
import UIDepartment from "@/components/ui/UIDepartment.vue"
import i18n from "@/i18n/index.js"

const store = useApplicationStore()
const componentStore = useComponentStore()
const {t} = i18n.global
const onSubmit = ()=>{
  formRef.value?.validate((error)=>{
    if(!error){
      store.saveLoading = true
      if(store.visibleType){
        store._create()
      }else{
        store._update()
      }

    }
  })
}

const onFocusConf = ()=>{
  componentStore._confirmations()
}
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
const renderValue = ({option})=>{
  return [
    h(
        'div',
        {
          class:'flex gap-2 my-1 items-center'
        },`${option?.last_name} ${option?.first_name} ${option?.middle_name}`),
  ];
}


const onChangeDepartment = (v)=>{
  store.payload.department_id = v
  componentStore.departmentPositionList = []
  store.payload.department_position_id = null
  componentStore._departmentPosition(v[0].id)
}

const copyLink = ()=>{
  Utils.copyToClipboard(store.applicationLink, ()=>{
    $Toast.info(t('signature.copied'))
  })

}

onMounted(()=>{
    if(componentStore.applicationTypes.length === 0){
      componentStore._enums()
    }
})

</script>

<template>
  <n-form
      ref="formRef"
      :rules="validationRules.applicationPage"
      :model="store.payload"
  >
    <n-tabs animated v-model:value="store.activeTab" class="hidden-tab-header" type="segment">
      <n-tab-pane :name="store.tabList[0]">
        <div class="grid grid-cols-12 gap-x-4">
          <div class="col-span-12">
            <n-form-item :label="$t(`applicationPage.form.type`)" path="type">
              <n-select
                  v-model:value="store.payload.type"
                  filterable

                  :options="componentStore.workTypes"
                  label-field="name"
                  value-field="id"
                  :loading="componentStore.enumLoading"
              />
            </n-form-item>
          </div>
          <div class="col-span-12">
            <n-form-item :label="$t(`applicationPage.form.from_date`)" path="from_date">
              <n-date-picker
                  class="w-full"
                  v-model:value="store.payload.from_date"
                  type="date"

              />
            </n-form-item>
          </div>
          <template v-if="store.payload.type === 1">
            <div class="col-span-12 mr-3">
              <n-form-item :label="$t(`documentPage.form.department`)" path="department_id">
                <UIDepartment
                    :modelV="store.payload.department_id"
                    @updateModel="onChangeDepartment"
                    :checkedVal="store.departmentCheck"
                    @updateCheck="(v)=>store.departmentCheck=v"
                    :multiple="false"
                />
              </n-form-item>
            </div>
            <div class="col-span-12">
              <n-form-item :label="$t(`documentPage.form.position`)" path="department_position_id">
                <n-select
                    :disabled="!Boolean(store.payload.department_id.length>0)"
                    v-model:value="store.payload.department_position_id"
                    filterable
                    :options="componentStore.departmentPositionList"
                    label-field="name"
                    value-field="id"
                    :loading="componentStore.departmentPositionLoading"
                />
              </n-form-item>
            </div>
          </template>

          <div class="col-span-12">
            <n-form-item :label="$t(`applicationPage.form.director_id`)" path="director_id">
              <n-select
                  @focus="onFocusConf"
                  v-model:value="store.payload.director_id"

                  :options="componentStore.confirmationList"
                  :loading="componentStore.confirmationLoading"
                  :render-label="renderLabel"
                  :render-tag="renderValue"
                  label-field="last_name"
                  value-field="id"
              />
            </n-form-item>
          </div>

          <div class="col-span-12 flex justify-center mb-4 mt-10">
            <n-button
                :loading="store.saveLoading"
                style="width: 100%"
                @click="onSubmit"
                type="primary">
              <template #icon>
                <QrCode20Regular/>
              </template>
              {{$t('applicationPage.form.generateLink')}}
            </n-button>
          </div>
        </div>
      </n-tab-pane>
      <n-tab-pane :name="store.tabList[1]">
        <div class="grid grid-cols-12 gap-x-4">
          <div class="col-span-12">
            <div class="w-full border border-dashed border-surface-line
             rounded-md bg-surface-ground min-h-[100px] p-2 flex justify-center items-center text-gray-400
">
                {{store.applicationLink || $t('content.no-data')}}
            </div>
          </div>
          <div class="col-span-12 mt-6">
            <n-button
                style="width: 100%"
                @click="copyLink"
                type="primary">
              <template #icon>
                <Copy20Regular/>
              </template>
              {{$t('content.copy')}}
            </n-button>
          </div>
          <div class="col-span-12 mt-4 mb-6">
            <n-button
                @click="store.activeTab = 1"
                secondary
                style="width: 100%"
                type="error">
              <template #icon>
                <ArrowCircleLeft20Regular/>
              </template>
              {{$t('content.back')}}
            </n-button>
          </div>
        </div>
      </n-tab-pane>
    </n-tabs>


  </n-form>
</template>

<style scoped>

</style>