<script setup>
import {DocumentTableCheckmark20Regular} from "@vicons/fluent"
import {useCommandStore, useComponentStore} from "@/store/modules/index.js"
import {NAvatar} from "naive-ui"
import Utils from "@/utils/Utils.js"
const store = useCommandStore()
const componentStore = useComponentStore()
const formRef = ref(null)
const confirmationList = ref([])

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


const onSubmit = ()=>{
  store._create()
  // formRef.value?.validate((error)=>{
  //   if(!error){
  //     store.saveLoading = true
  //     if(store.visibleType){
  //       store._create()
  //     }else{
  //       store._update()
  //     }
  //
  //   }
  // })
}

watchEffect(()=>{
  if(store.payload.director_id){
    store.payload.confirmations = store.payload.confirmations.filter(v=>v !==store.payload.director_id)
    confirmationList.value = componentStore.confirmationList.filter(v=>v.id !==store.payload.director_id)
  }
})

onMounted(()=>{
  componentStore._enumsAdmin()
})
</script>

<template>
  <div style="height:calc(100vh - 120px)" class="overflow-y-auto overflow-x-hidden ">
    <n-form
        ref="formRef"
        :model="store.payload"
        class="grid grid-cols-12 gap-x-4"
    >
      <template v-if="Boolean(store.payload.contract_id)">
        <div class="col-span-12 justify-center items-center flex pb-8">
          <n-button icon-placement="right" type="default">
            <template #icon>
              <DocumentTableCheckmark20Regular/>
            </template>
            {{$t('documentPage.command.form.byContract',{n:store.contractNumber})}}
          </n-button>
        </div>
      </template>

      <div class="col-span-3">
        <n-form-item :label="$t(`documentPage.command.form.command_number`)" path="command_number">
          <n-input
              class="w-full"
              type="text"
              :placeholder="$t(`content.enterField`)"
              v-model:value="store.payload.command_number"
          />
        </n-form-item>

      </div>
      <div class="col-span-3">
        <n-form-item :label="$t(`documentPage.command.form.command_date`)" path="command_date">
          <n-date-picker
              class="w-full"
              v-model:value="store.payload.command_date"
              type="date"
              :placeholder="$t(`content.choose`)"
          />
        </n-form-item>
      </div>
      <div class="col-span-6">
        <n-form-item :label="$t(`documentPage.command.form.type`)" path="type">
          <n-select
              v-model:value="store.payload.type"
              filterable
              :placeholder="$t(`content.choose`)"
              :options="componentStore.commandTypes"
              label-field="name"
              value-field="id"
              :loading="componentStore.enumLoading"
          />
        </n-form-item>
      </div>
      <div class="col-span-12 mt-4">
        <n-form-item :label="$t(`documentPage.command.form.director_id`)" path="director_id">
          <n-select
              @focus="onFocusConf"
              size="large"
              value-field="id"
              label-field="last_name"
              v-model:value="store.payload.director_id"
              :placeholder="$t(`content.choose`)"
              :options="componentStore.confirmationList"
              :loading="componentStore.confirmationLoading"
              :render-label="renderLabel"
              :render-tag="renderValue"
          />
        </n-form-item>
      </div>
      <div class="col-span-12 mt-4">
        <n-form-item :label="$t(`documentPage.command.form.confirm`)" path="director_id">
          <n-select
              :disabled="!store.payload.director_id"
              size="large"
              value-field="id"
              multiple
              v-model:value="store.payload.confirmations"
              :placeholder="$t(`content.choose`)"
              :options="confirmationList"
              :loading="componentStore.confirmationLoading"
              :render-label="renderLabel" />
        </n-form-item>
      </div>

    </n-form>
  </div>
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
</template>

<style scoped>

</style>