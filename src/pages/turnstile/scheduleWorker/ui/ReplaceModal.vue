<script setup>
import {useScheduleGroupWorkerStore} from "@/store/modules/index.js"
import {UIModal, UINSelect} from "@/components/index.js"
import validationRules from "@/utils/validationRules.js"
import UIHelper from "@/utils/UIHelper.js"
import Utils from "@/utils/Utils.js"

const store = useScheduleGroupWorkerStore()
const formRef = ref(null)

const onSubmit = ()=>{
  formRef.value?.validate((error)=>{
    if(!error) {
      const newWorker = store.workerList.find(v=>v.positionId === store.replacePayload.positonId)
      const data = {
        group_1:store.params.group,
        worker_1:store.selectedWorker.workerId,
        worker_position_1:store.selectedWorker.workerPositionId,

        worker_2:newWorker.id,
        worker_position_2:newWorker.positionId,
        group_2:newWorker.group || undefined,
        status:store.replacePayload.status,
        date:Utils.timeToZone(store.replacePayload.date)
      }
      console.log(data)
      store._replaceWorker(data)

    }
  })
}

const onSearch = (v)=>{
  store.workerParams.search = v
  store.workerParams.page = 1
  store._workers()

}
</script>

<template>
  <UIModal
      v-model:visible="store.replaceVisible"
      :width="500"
      :title="$t('shiftType.form.replaceWorker')">

    <n-form
        class="grid grid-cols-12"
        ref="formRef"
        :rules="validationRules.common"
        :model="store.replacePayload"
    >
      <div class="col-span-12 border border-surface-line px-4 py-2 mb-6 rounded-xl bg-surface-ground/40">
        <div class="line-clamp-1 leading-[1.2] font-semibold">{{store.selectedWorker.fullName}}</div>
        <div class="line-clamp-1 leading-[1.2] text-secondary">{{store.selectedWorker.position}}</div>

      </div>
      <n-form-item
          class="col-span-12"
          :label="$t(`content.worker`)"
          path="positonId"
          :rule-path="validationRules.rulesNames.requiredNumberField">
        <UINSelect
            @onSearch="onSearch"
            :query="store.workerParams.search"
            :options="store.workerList"
            v-model:value="store.replacePayload.positonId"
            value-field="positionId"
            :render-label="UIHelper.selectRender.label"
            :render-tag="UIHelper.selectRender.value"
            :loading="store.workerLoading"
        />
      </n-form-item>
      <n-form-item
          class="col-span-12"
          :label="$t(`content.date`)"
          path="date"
          :rule-path="validationRules.rulesNames.requiredNumberField">
        <n-date-picker clearable v-model:value="store.replacePayload.date" type="date" class="w-full" />
      </n-form-item>
      <div class="col-span-12 border-surface-line px-2 py-1 mb-6 rounded-lg">
        <n-checkbox v-model:checked="store.replacePayload.status">
          {{$t(store.replacePayload.status? 'shiftType.form.onlyThisDate' : 'shiftType.form.fromThisDate')}}
        </n-checkbox>
      </div>
      <div class="col-span-12 flex justify-end gap-4">
        <n-button @click="store.replaceVisible=false" type="error" secondary>
          {{$t('content.cancel')}}
        </n-button>
        <n-button @click="onSubmit" :loading="store.replaceLoading" type="primary">
          {{$t('content.save')}}
        </n-button>
      </div>

    </n-form>

  </UIModal>
</template>
