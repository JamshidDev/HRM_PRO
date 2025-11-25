<script setup>
import {useShiftTypeStore} from "@/store/modules/index.js"
import {UIModal} from "@/components/index.js"
import validationRules from "@/utils/validationRules.js"
import Utils from "@/utils/Utils.js"
import {useAppSetting} from "@/utils/index.js"

const store = useShiftTypeStore()
const formRef = ref(null)


const onSubmit = ()=>{
  formRef.value?.validate((error)=>{
    if(!error) {
      const data = {
        start_date:`${store.generatePayload.year1}-${store.generatePayload.month1.toString().padStart(2,'0')}-01`,
        end_date:`${store.generatePayload.year2}-${store.generatePayload.month2.toString().padStart(2,'0')}-01`,
        schedule_type:store.elementId,
      }

      if(store.isDailySchedule){
        store.notScheduleParams.start_date = data.start_date
        store.notScheduleParams.end_date = data.end_date
        store._notScheduleWorker()
        store.selectedWorkers = []
        store.notScheduleVisible = true
        store.visible = false
        return
      }


      if(store.visibleType){
        store._generateSchedule(data)
      }else{
        const editDate = {
          start_date:Utils.timeToZone(store.generatePayload.start_date),
          end_date:Utils.timeToZone(store.generatePayload.end_date),
          name:store.generatePayload.name
        }
        store._editGroup(editDate)

      }

    }
  })
}
</script>


<template>
  <UIModal
      v-model:visible="store.visible"
      :width="600"
      :title="$t(store.visibleType? 'shiftType.createTitle' : 'shiftType.updateTitle')">
    <n-form
        class="grid grid-cols-12 gap-x-4"
        ref="formRef"
        :rules="validationRules.common"
        :model="store.generatePayload"
    >
      <template  v-if="!store.visibleType">
        <n-form-item

            class="col-span-12"
            :label="$t(`content.name`)"
            path="name"
            :rule-path="validationRules.rulesNames.requiredStringField">
          <n-input
              type="text"
              v-model:value="store.generatePayload.name"
          />
        </n-form-item>
        <n-form-item
            class="col-span-6"
            :label="$t(`content.from`)"
            path="start_date"
            :rule-path="validationRules.rulesNames.requiredNumberField">
          <n-date-picker :format="useAppSetting.datePicketFormat" v-model:value="store.generatePayload.start_date" type="date" class="w-full" />
        </n-form-item>
        <n-form-item
            class="col-span-6"
            :label="$t(`content.from`)"
            path="end_date"
            :rule-path="validationRules.rulesNames.requiredNumberField">
          <n-date-picker :format="useAppSetting.datePicketFormat" v-model:value="store.generatePayload.end_date" type="date" class="w-full" />
        </n-form-item>
      </template>


      <template v-else>
        <div class="border border-surface-line rounded-xl col-span-12 grid grid-cols-12 gap-4 px-4 pt-4 relative">
          <span class="absolute top-[-12px] left-[20px] px-3 bg-surface-section">{{$t('content.from')}}</span>
          <n-form-item
              class="col-span-6"
              :label="$t(`content.year`)"
              path="year1"
              :rule-path="validationRules.rulesNames.requiredNumberField">
            <n-select
                :options="Utils.yearList"
                v-model:value="store.generatePayload.year1"
                value-field="id"
                label-field="name"
            />
          </n-form-item>
          <n-form-item
              class="col-span-6"
              :label="$t(`content.month`)"
              path="month1"
              :rule-path="validationRules.rulesNames.requiredNumberField">
            <n-select
                :options="Utils.monthList"
                v-model:value="store.generatePayload.month1"
                value-field="id"
                label-field="name"
            />
          </n-form-item>
        </div>

        <div class="border border-surface-line rounded-xl col-span-12 grid grid-cols-12 gap-4 px-4 pt-4 relative mt-10">
          <span class="absolute top-[-12px] left-[20px] px-3 bg-surface-section">{{$t('content.to')}}</span>
          <n-form-item
              class="col-span-6"
              :label="$t(`content.year`)"
              path="year2"
              :rule-path="validationRules.rulesNames.requiredNumberField">
            <n-select
                :options="Utils.yearList"
                v-model:value="store.generatePayload.year2"
                value-field="id"
                label-field="name"
            />
          </n-form-item>
          <n-form-item
              class="col-span-6"
              :label="$t(`content.month`)"
              path="month2"
              :rule-path="validationRules.rulesNames.requiredNumberField">
            <n-select
                :options="Utils.monthList"
                v-model:value="store.generatePayload.month2"
                value-field="id"
                label-field="name"
            />
          </n-form-item>
        </div>
      </template>




      <div class="grid grid-cols-1 gap-2 mt-8  col-span-12 px-4">
        <n-button
            @click="onSubmit"
            :loading="store.saveLoading"
            type="primary">
          {{ $t(store.visibleType? 'shiftType.form.generate' : 'content.save') }}
        </n-button>
      </div>
    </n-form>
  </UIModal>
</template>
