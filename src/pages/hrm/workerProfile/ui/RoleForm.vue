<script setup>
import validationRules from "@/utils/validationRules.js";
import {UISelect} from "@/components/index.js"
const route = useRoute()
const formRef = ref(null)
import {useComponentStore, useWorkerProfileStore} from "@/store/modules/index.js"
import {useRoute} from "vue-router"

const store = useWorkerProfileStore()
const componentStore = useComponentStore()

const onSubmit = ()=>{
  formRef.value?.validate((error)=>{
    if(!error) {
      const id = route.query.id
      const data = {
        ...store.rolePayload,
        organization_id: store.rolePayload.organization_id[0].id,
      }
      store._storeRole(data, id)
    }
  })
}


onMounted(()=>{
  if(componentStore.roles.length === 0){
    componentStore._enums()
  }
  if(componentStore.structureList.length === 0){
    componentStore._structures()
  }
})


</script>

<template>
  <n-form
      ref="formRef"
      :rules="validationRules.roleForm"
      :model="store.rolePayload"
  >
    <div class="pb-[60px]">
      <n-form-item class="w-full" :label="$t(`documentPage.form.organization`)" path="organization_id">
        <UISelect
            :options="componentStore.structureList"
            :modelV="store.rolePayload.organization_id"
            @updateModel="(v)=>store.rolePayload.organization_id=v"
            :checkedVal="store.structureCheck"
            @updateCheck="(v)=>store.structureCheck=v"
            :loading="componentStore.structureLoading"
            :multiple="false"
        />

      </n-form-item>
      <n-form-item class="w-full" :label="$t(`content.role`)" path="role">
        <n-select
            v-model:value="store.rolePayload.role"
            filterable

            :options="componentStore.roles"
            :loading="componentStore.enumLoading"
            label-field="name"
            value-field="id"
        />
      </n-form-item>



    </div>

    <div class="grid grid-cols-2 gap-2">
      <n-button @click="()=>store.roleVisible=false" type="error" ghost>
        {{ $t('content.cancel') }}
      </n-button>
      <n-button
          @click="onSubmit"
          :loading="store.roleLoading"
          type="primary">
        {{ $t('content.save') }}
      </n-button>
    </div>
  </n-form>
</template>

<style scoped>

</style>