<script setup>
import {useScheduleTableStore} from '@stores'
import { UIModal} from '@components'
import validationRules from '@/utils/validationRules.js'
import Utils from '@/utils/Utils.js'
import {SuperSelect} from "@components"

const store = useScheduleTableStore()
const formRef = ref(null)

const onSubmit = () => {
  formRef.value?.validate((error) => {
    if (!error) {
      const newWorker = store.worker.list.find(
          (v) => v.id === store.replace.payload.positonId
      )

      const data = {
        worker_1: store.replace.selectedWorker.workerId,
        worker_position_1: store.replace.selectedWorker.positionId,
        worker_2: newWorker.workerId,
        worker_position_2:newWorker.id ,
        status: store.replace.payload.status,
        date: Utils.timeToZone(store.replace.payload.date)
      }
      store._replaceWorker(data)
    }
  })
}

const onSearch = () => {
  store.worker.params.page = 1
  store._workers()
}

const onScroll = ()=>{
  console.log('scroll')
  store.worker.params.page += 1
  store._workers(true)
}

const onChangeStatus = (v)=>{
  store.replace.payload.status = v
}
</script>

<template>
  <UIModal
      v-model:visible="store.replace.visible"
      :width="500"
      :title="$t('shiftType.form.replaceWorker')"
  >
    <n-form
        class="grid grid-cols-12 gap-x-4"
        ref="formRef"
        :rules="validationRules.common"
        :model="store.replace.payload"
    >
      <div
          class="col-span-12 border border-surface-line px-4 py-2 mb-6 rounded-xl bg-surface-ground/40"
      >
        <div class="line-clamp-1 leading-[1.2] font-semibold">
          {{ store.replace?.selectedWorker?.fullName}}
        </div>
        <div class="line-clamp-1 leading-[1.2] text-secondary">
          {{ store.replace.selectedWorker?.position }}
        </div>
      </div>
      <n-form-item
          class="col-span-12"
          :label="$t(`content.worker`)"
          path="positonId"
          :rule-path="validationRules.rulesNames.requiredNumberField"
      >
        <SuperSelect
            :max-tag-count="1"
            v-model:value="store.replace.payload.positonId"
            v-model:search="store.worker.params.search"
            :options="store.worker.list"
            :loading="store.worker.loading"
            :total-count="store.worker.totalItem"
            :per-page="store.worker.params.per_page"
            value-field="id"
            @onSearch="onSearch"
            @onScrollEv="onScroll"

        />
      </n-form-item>
      <n-form-item
          class="col-span-12"
          :label="$t(`content.date`)"
          path="date"
          :rule-path="validationRules.rulesNames.requiredNumberField"
      >
        <n-date-picker
            clearable
            v-model:value="store.replace.payload.date"
            type="date"
            class="w-full"
        />
      </n-form-item>
      <n-checkbox @click="onChangeStatus(true)" :checked="store.replace.payload.status" class="border px-2 py-1 col-span-6 border-surface-line rounded-lg">
        {{
          $t('shiftType.form.onlyThisDate')
        }}
      </n-checkbox>
      <n-checkbox @click="onChangeStatus(false)" :checked="!store.replace.payload.status" class="border px-2 py-1 col-span-6 border-surface-line rounded-lg">
        {{
          $t('shiftType.form.fromThisDate')
        }}
      </n-checkbox>
      <div class="col-span-12 flex justify-end gap-4 mt-8">
        <n-button @click="store.replace.visible=false" type="error" secondary>
          {{ $t('content.cancel') }}
        </n-button>
        <n-button @click="onSubmit" :loading="store.replace.loading" type="primary">
          {{ $t('content.save') }}
        </n-button>
      </div>
    </n-form>
  </UIModal>
</template>
