<script setup>
import {useCommandStore, useComponentStore} from "@/store/modules/index.js"
import {
  PersonNote20Regular, DismissCircle16Regular, Eye24Regular
} from "@vicons/fluent"
import Utils from "../../../../../utils/Utils.js"
import i18n from "@/i18n/index.js"

const store = useCommandStore()
const componentStore = useComponentStore()
const {t} = i18n.global



const onRemoveWorker = (id) => {
  store.workerData = store.workerData.filter((v) => v.id !== id)
  store.payload.workers = store.payload.workers.filter((workerId) => workerId !== id)
}
const onSubmit = (mainData) => {
  const checkForm = store.workerData.every((v) => (v.by_whom !== null && v.reason !== null && v.gift_type !== null && (v.gift_type ===4? v.gift !== null : true )))
  if (checkForm) {
    const data = store.workerData.map(v => ({
      id: v.id,
      by_whom: v.by_whom,
      reason: v.reason,
      gift_type: v.gift_type,
      gift:v.gift_type ===4? v.gift : componentStore.giftTypes[v.gift_type-1]?.name,
    }))

    return {
      data: {
        ...mainData,
        worker_positions: data,
      },
      isValid: true,
    }
  } else {
    $Toast.warning(t('message.warning-data'))
    return {
      data: null,
      isValid: false,
    }
  }


}



defineExpose({
  onSubmit
})


onMounted(() => {
  componentStore._enums()
})


</script>

<template>
  <div v-for="(item, idx) in store.workerData" :key="idx"
       class="grid grid-cols-12 mb-8 gap-x-4 border border-surface-line p-2 rounded-md bg-surface-ground">

    <div class="col-span-12 flex justify-between">
      <n-button type="info" secondary size="tiny">
        <template #icon>
          <PersonNote20Regular/>
        </template>
        {{ Utils.combineFullName(item.worker.worker) }}
      </n-button>
      <n-button
          type="error"
          secondary
          size="tiny"
          @click="onRemoveWorker(item.id)"
      >
        <template #icon>
          <DismissCircle16Regular/>
        </template>
        {{ $t('documentPage.command.form.removeWorker') }}
      </n-button>
    </div>
    <div class="col-span-12 md:col-span-6 lg:col-span-12">
      <n-form-item
          :show-feedback="false"
          :label="$t(`documentPage.command.form.reason`)" path="reason">
        <n-input
            class="w-full"
            type="text"

            v-model:value="item.reason"
        />
      </n-form-item>
    </div>
    <div class="col-span-12 md:col-span-6 lg:col-span-4">
      <n-form-item
          :show-feedback="false"
          :label="$t(`documentPage.command.form.by_whom`)" path="by_whom">
        <n-input
            class="w-full"
            type="text"

            v-model:value="item.by_whom"
        />
      </n-form-item>
    </div>
    <div class="col-span-12 md:col-span-6 lg:col-span-4">
      <n-form-item
          :show-feedback="false"
          :label="$t(`documentPage.command.form.gift_type`)" path="gift_type">
        <n-select
            v-model:value="item.gift_type"
            filterable

            :options="componentStore.giftTypes"
            label-field="name"
            value-field="id"
            :loading="componentStore.enumLoading"
        />
      </n-form-item>
    </div>
    <div v-if="item.gift_type===4"
         class="col-span-12 md:col-span-6 lg:col-span-4">
      <n-form-item
          :show-feedback="false"
          :label="$t(`documentPage.command.form.gift`)" path="gift">
        <n-input
            class="w-full"
            type="text"

            v-model:value="item.gift"
        />
      </n-form-item>
    </div>


  </div>
</template>

