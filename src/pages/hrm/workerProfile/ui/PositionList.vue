<script setup>
import {Edit20Regular} from "@vicons/fluent"
import {useWorkerProfileStore} from "@/store/modules/index.js"
import Utils from "../../../../utils/Utils.js"
import {UIModal} from "@/components/index.js"
import AdContractForm from "@/pages/docFlow/document/adContract/adContractForm.vue"

const store = useWorkerProfileStore()
const workers = ref([])

const onSuccessEv = (v)=>{
  store.positionVisible = false
}

const onOpen = (v)=>{
  const worker = v.contract.worker

  workers.value = [
    {
      name:worker.last_name + ' '+worker.first_name+' '+worker.middle_name,
      position:v.position.name,
      id:v.id,
      typeId:v.contract.type.id
    }
  ]

  store.positionVisible = true


}

</script>

<template>
<div>
  <span class=" font-medium block mb-2">{{$t('workerProfile.position.title')}}</span>
  <div v-for="(item, idx) in store.positionList" :key="idx" class="grid grid-cols-12 w-full border border-dashed border-surface-line mb-4">
    <div class="col-span-9 flex-col flex">
      <div class="grid grid-cols-12">
        <div class="col-span-12 p-2 border-b border-r border-dashed border-surface-line">
          <div class="block text-gray-400">
            {{$t('workerProfile.position.contractType')}} -  <span class="font-medium text-primary mr-4">{{item.contract.type.name}}</span>
            {{$t('workerProfile.position.contractNumber')}} -  <span class="font-medium text-gray-600 mr-4">{{item.contract.number}}</span>
            {{$t('workerProfile.position.contractDate')}} -  <span class="font-medium text-gray-600 mr-4">{{Utils.timeOnlyDate(item.contract.contract_date)}}</span>
            {{$t('workerProfile.position.contractToDate')}} -  <span class="font-medium text-gray-600 mr-4">{{Utils.timeOnlyDate(item.contract.contract_to_date)}}</span>
            {{$t('workerProfile.position.positionDate')}} -  <span class="font-medium text-gray-600 mr-4">{{Utils.timeOnlyDate(item.position_date)}}</span>


          </div>
          <div class="block text-gray-400">
            {{$t('workerProfile.position.position')}} -  <span class="font-medium text-gray-600 mr-4">{{item.post_name}}</span>
          </div>

        </div>
        <div class="col-span-4 text-gray-400 border-r border-dashed border-surface-line p-2 ">
          {{$t('workerProfile.personal.positionGroup')}} - <span class="font-bold  text-success">{{item.group}}</span>
        </div>
        <div class="col-span-4 text-gray-400 border-r border-dashed border-surface-line p-2">
          {{$t('workerProfile.personal.positionRank')}} - <span class="font-bold  text-warning">{{item.rank}}</span>
        </div>
        <div class="col-span-4 text-gray-400 border-r border-dashed border-surface-line p-2">
          {{$t('workerProfile.personal.positionRate')}} - <span class="font-bold text-danger">{{item.rate}}</span>
        </div>
      </div>
    </div>
    <div class="col-span-3 flex flex-col-reverse gap-y-2 p-2 ">
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
        :call-back="onSuccessEv"
    />
  </UIModal>
</div>
</template>

<style scoped>

</style>