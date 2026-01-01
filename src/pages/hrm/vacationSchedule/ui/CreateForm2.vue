<script setup>
import validationRules from '@/utils/validationRules.js'
import { useComponentStore, useVacationScheduleStore } from '@/store/modules/index.js'
import {useAppSetting} from "@utils"
import UIHelper from "@utils/UIHelper.js"
import Utils from "@utils/Utils.js"
import {UIPagination} from "@components"

const formRef = ref(null)


const store = useVacationScheduleStore()
const componentStore = useComponentStore()

const onSubmit = () => {
  formRef.value?.validate((error) => {
    if (!error) {
      if (store.visibleType) {
        store._create()
      } else {
        store._update()
      }
    }
  })
}

const fetchConfirmations = () =>{
  if(componentStore.confirmationList?.length) return
  componentStore._confirmations()
}

const onChangePage = ({page, per_page}) => {

}


onMounted(()=>{
  fetchConfirmations()
})
</script>

<template>
  <n-form
      ref="formRef"
      :rules="validationRules.common"
      :model="store.payload"
      class="grid grid-cols-12 gap-x-4"
  >
    <n-form-item
        class="col-span-2"
        :label="$t(`vacationSchedule.form.to_date`)"
        path="date"
        :rule-path="validationRules.rulesNames.requiredNumberField"
    >
      <n-date-picker
          class="w-full"
          v-model:value="store.payload.date"
          type="date"
          :format="useAppSetting.datePicketFormat"
      />
    </n-form-item>
    <n-form-item
        class="col-span-2"
        :label="$t(`content.year`)"
        path="year1"
        :rule-path="validationRules.rulesNames.requiredNumberField"
    >
      <n-select
          :options="Utils.yearList"
          v-model:value="store.payload.year"
          value-field="id"
          label-field="name"
      />
    </n-form-item>
    <n-form-item
        class="col-span-3"
        :label="$t(`documentPage.command.form.director_id`)" path="director_id"
        :rule-path="validationRules.rulesNames.requiredNumberField"
    >
      <n-select
          value-field="id"
          label-field="last_name"
          v-model:value="store.payload.director_id"
          :options="componentStore.confirmationList"
          :loading="componentStore.confirmationLoading"
          :render-label="UIHelper.avatarRender.label"
          :render-tag="UIHelper.avatarRender.value"
      />
    </n-form-item>
    <n-form-item
        class="col-span-3"
        :label="$t(`documentPage.command.form.confirm`)"
        path="trade_union_id"
        :rule-path="validationRules.rulesNames.requiredNumberField">
      <n-select
          value-field="id"
          v-model:value="store.payload.trade_union_id"
          :options="componentStore.confirmationList"
          :loading="componentStore.confirmationLoading"
          :render-label="UIHelper.avatarRender.label"
          :render-tag="UIHelper.avatarRender.value"
      />
    </n-form-item>
    <n-form-item
        class="col-span-2"
        :label="$t(`content.worker`)"
        path="creator_id"
        :rule-path="validationRules.rulesNames.requiredNumberField">
      <n-select
          value-field="id"
          v-model:value="store.payload.creator_id"
          :options="componentStore.confirmationList"
          :loading="componentStore.confirmationLoading"
          :render-label="UIHelper.avatarRender.label"
          :render-tag="UIHelper.avatarRender.value"
      />
    </n-form-item>

    <div class="px-2 pt-2 col-span-12 border border-surface-line rounded-lg h-[calc(100vh-260px)] mb-4">

      <template v-for="item in store.payload.worker_position_ids" :key="item">
        <div class="grid grid-cols-12 gap-3 border border-surface-line bg-surface-ground/30 px-2 py-2 rounded-2xl">
          <div class="col-span-3">

          </div>
          <n-form-item
              class="col-span-1"
              :label="$t(`vacationSchedule.form.all_days`)"
              :show-feedback="false"
          >
            <n-input-number
                class="w-full"
                min="0"
                max="100"
                v-model:value="item.all_days"
            />
          </n-form-item>
          <n-form-item
              class="col-span-2"
              :label="$t(`vacationSchedule.form.table_number`)"
              :show-feedback="false"
          >
            <n-input
                class="w-full"
                type="text"
                v-model:value="item.table_number"
            />
          </n-form-item>
          <n-form-item
              class="col-span-2"
              :label="$t(`vacationSchedule.form.period_from`)"
              :show-feedback="false"
          >
            <n-date-picker
                class="w-full"
                v-model:value="item.period_from"
                type="date"
                :format="useAppSetting.datePicketFormat"
            />
          </n-form-item>
          <n-form-item
              class="col-span-2"
              :label="$t(`vacationSchedule.form.period_to`)"
              :show-feedback="false"
          >
            <n-date-picker
                class="w-full"
                v-model:value="item.period_to"
                type="date"
                :format="useAppSetting.datePicketFormat"
            />
          </n-form-item>
          <n-form-item
              class="col-span-2"
              :label="$t(`vacationSchedule.form.plan_date`)"
              :show-feedback="false"
          >
            <n-date-picker
                class="w-full"
                v-model:value="item.plan_date"
                type="date"
                :format="useAppSetting.datePicketFormat"
            />
          </n-form-item>
        </div>

      </template>
    </div>
    <div class="col-span-12 flex justify-between">
      <div></div>
      <UIPagination
          :short="false"
          :show-size-picker="false"
          :page="store.worker.page"
          :per_page="store.worker.per_page"
          :total="store.worker.total"
          @change-page="onChangePage"
      />
    </div>


    <div class="grid grid-cols-2 gap-2 col-span-12">
      <n-button @click="store.openVisible(false)" type="error" ghost>
        {{ $t('content.cancel') }}
      </n-button>
      <n-button @click="onSubmit" :loading="store.saveLoading" type="primary">
        {{ $t('content.save') }}
      </n-button>
    </div>
  </n-form>
</template>
