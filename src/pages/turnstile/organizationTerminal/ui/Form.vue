<script setup>
import validationRules from "@/utils/validationRules.js";
import {useComponentStore, useTurnstileOrganizationStore} from "@/store/modules/index.js";
import {UISelect} from "@/components/index.js";


const formRef = ref(null)
const store = useTurnstileOrganizationStore()
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

onMounted(() => {
  componentStore._turnstileTerminal()
  if(componentStore.structureList.length === 0){
    componentStore._structures()
  }
})


</script>

<template>
  <n-form
      ref="formRef"
      :model="store.payload"
      :rules="validationRules.common"
      class="h-full flex flex-col"
  >
    <n-form-item
        :label="$t(`content.workplace`)"
        path="organization_id"
        rule-path="requiredMultiSelectField"
    >
      <UISelect
          :options="componentStore.structureList"
          :modelV="store.payload.organization_id"
          @defaultValue="(v)=>store.payload.organization_id=v"
          @updateModel="(v)=>store.payload.organization_id=v"
          :checkedVal="store.structureCheck"
          @updateCheck="(v)=>store.structureCheck=v"
          :multiple="false"
          :loading="componentStore.structureLoading"
      />
    </n-form-item>
    <n-form-item
        :label="$t(`turnstile.terminalPage.title`)"
        path="terminals"
        rule-path="requiredMultiSelectField"
    >
      <n-select
          v-model:value="store.payload.terminals"
          :options="componentStore.turnstileTerminalList"
          :loading="componentStore.turnstileTerminalListLoading"
          value-field="id"
          label-field="name"
          filterable
          multiple
          :max-tag-count="2"
          tag
      >
      </n-select>
    </n-form-item>

    <div class="mt-auto">
      <n-button
          block
          :loading="store.saveLoading"
          type="primary"
          @click="onSubmit">
        {{ $t('content.save') }}
      </n-button>
    </div>
  </n-form>
</template>

<style scoped>

</style>