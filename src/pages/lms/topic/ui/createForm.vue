<script setup>
import {UIStructure} from "@/components/index.js"
import validationRules from "@/utils/validationRules.js";
const formRef = ref(null)
import {useTopicStore, useComponentStore} from "@/store/modules/index.js";

const store = useTopicStore()
const componentStore = useComponentStore()

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

onMounted(()=>{
  componentStore._enumExam()
  componentStore._structures()
})


</script>

<template>
  <n-spin :show="store.showLoading">
    <n-form
        ref="formRef"
        :rules="validationRules.topicPage"
        :model="store.payload"
    >
      <div style="min-height:calc(100vh - 120px)">
        <n-form-item :label="$t(`content.name`)" path="name">
          <n-input
              type="text"
              :placeholder="$t(`content.enterField`)"
              v-model:value="store.payload.name"
          />
        </n-form-item>
        <n-form-item :label="$t(`content.type`)" path="type">
          <n-select
              v-model:value="store.payload.type"
              filterable
              :placeholder="$t(`content.choose`)"
              :options="componentStore.topicTypes"
              label-field="name"
              value-field="id"
              :loading="componentStore.enumExamLoading"
          />
        </n-form-item>
        <n-form-item :label="$t(`content.workplace`)" path="organizations">
          <UIStructure
              :modelV="store.payload.organizations"
              :checkedVal="store.structureCheck"
              @updateCheck="(v)=>store.structureCheck=v"
              @updateModel="(v)=>store.payload.organizations=v"
          />
        </n-form-item>
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
    </n-form>
  </n-spin>
</template>

<style scoped>

</style>