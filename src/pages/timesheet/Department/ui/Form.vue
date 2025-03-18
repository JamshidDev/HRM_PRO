<script setup>
import validationRules from "@/utils/validationRules.js";
import {useComponentStore, useUserDepartmentStore} from "@/store/modules/index.js";
import {UIStructure, UIUser} from "@/components/index.js";
import { Delete20Filled, ArrowUndo16Filled} from '@vicons/fluent'

const formRef = ref(null)
const store = useUserDepartmentStore()
const componentStore = useComponentStore()

const onSubmit = ()=>{
  console.log(store.payload.worker_positions)
  formRef.value?.validate((error)=>{
    if(!error) {
      store._attach()
    }
  })
}


onMounted(()=>{
  componentStore._workers()
  if(componentStore.structureList.length === 0){
    componentStore._structures()
  }
})

const changeOrgs = (v)=>{
  console.log(v)
  store.payload.organizations=v
  componentStore._workers({org_ids: v.map(i=>i.id).join(',')})
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

</script>

<template>
    <n-form
        ref="formRef"
        :model="store.payload"
        class="h-full flex flex-col"
    >
      <n-form-item :label="$t(`content.organization`)" path="organizations">
        <UIStructure
            :modelV="store.payload.organizations"
            :checkedVal="store.structureCheck"
            @updateCheck="(v)=>store.structureCheck=v"
            @updateModel="changeOrgs"
        />
      </n-form-item>
      <n-form-item :label="$t(`userDepartmentPage.staff`)" path="worker_positions">
        <n-select
            multiple
            v-model:value="store.payload.worker_positions"
            @update-value="console.log"
            filterable
            :placeholder="$t(`content.choose`)"
            :options="componentStore.workerList"
            label-field="name"
            value-field="id"
            :render-label="workerRenderLabel"
            :render-tag="workerRenderValue"
            :loading="componentStore.workerLoading"
        />
      </n-form-item>
      <div class="grid gap-2 grid-cols-[repeat(auto-fill,minmax(260px,1fr))]">
        <div class="flex justify-between items-center border border-surface-line p-1 rounded-md" v-for="(worker, idx) in store.prev_workers" :key="idx">
          <UIUser
              :round-avatar="false"
              :data="{
                  photo: worker.photo,
                  lastName: worker.last_name,
                  firstName: worker.first_name,
                  middleName: worker.middle_name,
                }"
              :short="false"
          />
          <n-button round size="small" tertiary v-if="!store.payload.deattach_workers.includes(worker.id)" type="error" @click="store.payload.deattach_workers.push(worker.id)">
            <template #icon>
              <n-icon :component="Delete20Filled" />
            </template>
          </n-button>
          <n-button round size="small" v-else type="warning" tertiary @click="store.payload.deattach_workers = store.payload.deattach_workers.filter(i=>i!=worker.id)">
            <template #icon>
              <n-icon :component="ArrowUndo16Filled" />
            </template>
          </n-button>
        </div>
      </div>
      <div class="mt-auto">
        <n-button
            block
            @click="onSubmit"
            :loading="store.saveLoading"
            type="primary"
        >
          {{ $t('content.save') }}
        </n-button>
      </div>
    </n-form>



</template>

<style scoped>

</style>