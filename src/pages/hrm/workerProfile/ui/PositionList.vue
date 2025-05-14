<script setup>
import {Edit20Regular} from "@vicons/fluent"
import {useComponentStore, useWorkerProfileStore} from "@/store/modules/index.js"
import Utils from "../../../../utils/Utils.js"
import {UIModal} from "@/components/index.js"
import AdContractForm from "@/pages/docFlow/document/adContract/adContractForm.vue"
import CommandForm from "@/pages/docFlow/document/command/CommandForm.vue"
import editFrom from "./editFrom.vue"

const store = useWorkerProfileStore()
const componentStore = useComponentStore()
const workers = ref([])
const organization = ref([])

const onSuccessEv = (v)=>{
  store.positionVisible = false
}

const onOpen = (v)=>{
  organization.value = [v.organization]
  const worker = v.contract.worker
  workers.value = [
    {
      name:worker.last_name + ' '+worker.first_name+' '+worker.middle_name,
      position:v.position?.name,
      id:v.id,
      contractTypeId:v.contract.type.id,
      model:Utils.documentModels.adContract,
    }
  ]
  store.positionVisible = true
}


const onOpenCommand = (v)=>{
  const worker = v.contract.worker
  workers.value = [
    {
      name:worker.last_name + ' '+worker.first_name+' '+worker.middle_name,
      position:v.position?.name,
      id:v.id,
      contractTypeId:v.contract.type.id,
      model:Utils.documentModels.adContract,
    }
  ]
  store.commandVisible = true
}

const onEdit = (v)=>{
  store.positionId = v.id
  store.editVisible = true
  store.editPayload.rank = v.rank
  store.editPayload.salary = v.salary?.toString()
  store.editPayload.group = v.group
  store.editPayload.rate = v.rate
  store.editPayload.type = v.type?.id
  store.editPayload.contract_number =v.contract?.number
  store.editPayload.contract_date = Utils.datePickerFormatter(v.contract?.contract_date)

  componentStore.departmentList = []
  componentStore.departmentPositionList = []
  store.editPayload.organization_id = []
  store.editPayload.department_id = []
  store.editPayload.department_position_id = null


}

</script>

<template>
<div>
  <span class=" font-medium block mb-2">{{$t('workerProfile.position.title')}}</span>
  <div v-for="(item, idx) in store.positionList" :key="idx" class="grid grid-cols-12 w-full border border-dashed border-surface-line rounded-lg mb-4">
    <div class="col-span-12 md:col-span-9 flex-col flex">
      <div class="grid grid-cols-12">
        <div class="col-span-12 p-2 border-b  md:border-r border-dashed border-surface-line">
          <div class="grid grid-cols-12">
            <div class="col-span-12 md:col-span-6">
              <span class="font-semibold">{{$t('workerProfile.position.contractType')}}</span> -  <span class="font-medium text-danger mr-4">{{item.contract.type.name}}</span>
            </div>

            <div class="col-span-12">
              <span class="font-semibold">{{$t('workerProfile.position.position')}}</span> -  <span class="font-medium text-primary">{{item.post_name}}</span>
            </div>
          </div>

        </div>
        <div class="col-span-12 md:col-span-6 border-b md:border-r border-dashed border-surface-line p-2">
          <span class="font-semibold">{{$t('workerProfile.position.contractToDate')}}</span> -  <span class="font-medium mr-4">{{Utils.timeOnlyDate(item.contract.contract_to_date)}}</span>
        </div>
        <div class="col-span-12 md:col-span-6 border-b md:border-r border-dashed border-surface-line p-2">
          <span class="font-semibold">{{$t('workerProfile.position.positionDate')}}</span> -  <span class="font-medium mr-4">{{Utils.timeOnlyDate(item.position_date)}}</span>
        </div>
        <div class="col-span-12 md:col-span-6 border-b md:border-r border-dashed border-surface-line p-2">
          <span class="font-semibold">{{$t('workerProfile.position.contractNumber')}}</span> -  <span class="font-medium mr-4">{{item.contract.number}}</span>
        </div>
        <div class="col-span-12 md:col-span-6 border-b md:border-r border-dashed border-surface-line p-2">
          <span class="font-semibold">{{$t('workerProfile.position.contractDate')}}</span> -  <span class="font-medium  mr-4">{{Utils.timeOnlyDate(item.contract.contract_date)}}</span>
        </div>
        <div class="col-span-12 md:col-span-4 border-b md:border-r md:border-b-0 border-dashed border-surface-line p-2">
          {{$t('workerProfile.personal.positionGroup')}} - <span class="font-bold  text-success">{{item.group}}</span>
        </div>
        <div class="col-span-12 md:col-span-4 border-b md:border-r md:border-b-0 border-dashed border-surface-line p-2">
          {{$t('workerProfile.personal.positionRank')}} - <span class="font-bold  text-warning">{{item.rank}}</span>
        </div>
        <div class="col-span-12 md:col-span-4 border-b md:border-r md:border-b-0 border-dashed border-surface-line p-2">
          {{$t('workerProfile.personal.positionRate')}} - <span class="font-bold text-danger">{{item.rate}}</span>
        </div>
      </div>
    </div>
    <div class="col-span-12 md:col-span-3 flex flex-col-reverse gap-y-2 p-2 ">
      <n-button
          @click="onEdit(item)"
          size="small"
          type="success"
          secondary
      >
        <template #icon>
          <Edit20Regular/>
        </template>
        {{$t('content.edit')}}
      </n-button>
      <n-button
          @click="onOpen(item)"
          size="small"
          type="info"
          secondary
      >
        <template #icon>
          <Edit20Regular/>
        </template>
        {{$t('workerProfile.personal.additionalContract')}}
      </n-button>
      <n-button
          @click="onOpenCommand(item)"
          size="small"
          type="warning"
          secondary
      >
        <template #icon>
          <Edit20Regular/>
        </template>
        {{$t('workerProfile.personal.createOrder')}}
      </n-button>
    </div>
  </div>
  <UIModal
      :title="$t('adContractPage.createTitle')"
      :width="1200"
      v-model:visible="store.positionVisible"
  >
    <adContractForm
        :workers="workers"
        :organization="organization"
        :call-back="onSuccessEv"
    />
  </UIModal>
  <UIModal
      :title="$t('documentPage.command.createTitle')"
      :width="1200"
      v-model:visible="store.commandVisible"
  >
    <CommandForm
        :workers="workers"
    />
  </UIModal>
  <UIModal
      :title="$t('content.edit')"
      :width="1200"
      v-model:visible="store.editVisible"
  >
   <editFrom/>
  </UIModal>
</div>
</template>

<style scoped>

</style>