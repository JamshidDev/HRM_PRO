<script setup>
  import { useShiftTypeStore } from '@/store/modules/index.js'
  import { UIModal } from '@/components/index.js'
  import validationRules from '@/utils/validationRules.js'
  import Utils from '@/utils/Utils.js'
  import { useAppSetting } from '@/utils/index.js'

  const store = useShiftTypeStore()
  const formRef = ref(null)

  const onSubmit = () => {
    formRef.value?.validate((error) => {
      if (!error) {
        const data = {
          start_date: Utils.timeToZone(store.generatePayload.start_date),
          end_date: Utils.timeToZone(store.generatePayload.end_date),
          work_date: store.showWorkDate
            ? Utils.timeToZone(store.generatePayload.work_date)
            : undefined,
          schedule_type: store.elementId,
          count: store.showGroupCountField ? store.generatePayload.count : undefined
        }

        if (store.isDailySchedule) {
          store.notScheduleParams.start_date = data.start_date
          store.notScheduleParams.end_date = data.end_date
          store._notScheduleWorker()
          store.selectedWorkers = []
          store.groupId = null
          store.notScheduleVisible = true
          store.visible = false
          return
        }

        if (store.visibleType) {
          store._generateSchedule(data)
        } else {
          const editDate = {
            end_date: Utils.timeToZone(store.generatePayload.end_date)
          }
          store._editGroup(editDate)
        }
      }
    })
  }

  const checkValidateRange = (v) => {
    const date = new Date(v).setHours(0, 0, 0, 0)
    const start = new Date(store.generatePayload.start_date).setHours(0, 0, 0, 0)
    const end = new Date(store.generatePayload.end_date).setHours(23, 59, 59, 999)
    return !(start <= date && date <= end)
  }
</script>

<template>
  <UIModal
    v-model:visible="store.visible"
    :width="600"
    :title="$t(store.visibleType ? 'shiftType.createTitle' : 'shiftType.updateTitle')"
  >
    <n-form
      class="grid grid-cols-12 gap-x-4"
      ref="formRef"
      :rules="validationRules.common"
      :model="store.generatePayload"
    >
      <template v-if="!store.visibleType">
        <n-form-item
          class="col-span-12"
          :label="$t(`content.date`)"
          path="end_date"
          :rule-path="validationRules.rulesNames.requiredNumberField"
        >
          <n-date-picker
            :format="useAppSetting.datePicketFormat"
            v-model:value="store.generatePayload.end_date"
            type="date"
            class="w-full"
          />
        </n-form-item>
      </template>

      <template v-else>
        <n-form-item
          class="col-span-6"
          :label="$t(`content.from`)"
          path="start_date"
          :rule-path="validationRules.rulesNames.requiredNumberField"
        >
          <n-date-picker
            :format="useAppSetting.datePicketFormat"
            v-model:value="store.generatePayload.start_date"
            type="date"
            class="w-full"
          />
        </n-form-item>
        <n-form-item
          class="col-span-6"
          :label="$t(`content.to`)"
          path="end_date"
          :rule-path="validationRules.rulesNames.requiredNumberField"
        >
          <n-date-picker
            :format="useAppSetting.datePicketFormat"
            v-model:value="store.generatePayload.end_date"
            type="date"
            class="w-full"
          />
        </n-form-item>
        <n-form-item
          class="col-span-6"
          :label="$t(`content.work_date`)"
          path="work_date"
          :rule-path="validationRules.rulesNames.requiredNumberField"
          v-if="store.showWorkDate"
        >
          <n-date-picker
            :disabled="!store.generatePayload.start_date || !store.generatePayload.end_date"
            :format="useAppSetting.datePicketFormat"
            v-model:value="store.generatePayload.work_date"
            :is-date-disabled="checkValidateRange"
            type="date"
            class="w-full"
          />
        </n-form-item>

        <n-form-item
          v-if="store.showGroupCountField"
          class="col-span-6"
          :label="$t(`shiftType.form.howMuchGroup`)"
          path="count"
          :rule-path="validationRules.rulesNames.requiredNumberField"
        >
          <n-input-number
            :max="50"
            :min="1"
            :step="1"
            :show-button="false"
            class="w-full"
            type="text"
            :allow-input="Utils.onlyAllowNumber"
            v-model:value="store.generatePayload.count"
          />
        </n-form-item>
      </template>
      <div class="grid grid-cols-1 gap-2 mt-8 col-span-12 px-4">
        <n-button @click="onSubmit" :loading="store.saveLoading" type="primary">
          {{ $t(store.visibleType ? 'shiftType.form.generate' : 'content.save') }}
        </n-button>
      </div>
    </n-form>
  </UIModal>
</template>
