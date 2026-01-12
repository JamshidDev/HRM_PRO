<script setup>
  import { UIModal } from '@/components/index.js'
  import { useScheduleTableStore } from '@/store/modules/index.js'
  import validationRules from '@/utils/validationRules.js'

  const formRef = ref(null)
  const store = useScheduleTableStore()

  const onSubmit = () => {
    formRef.value?.validate((error) => {
      if (!error) {
        const { dayTime, eveningTime } = store._calculateTimeIntervals(
          store.timePayload.startTime,
          store.timePayload.endTime,
          store.timePayload.breakStartTime,
          store.timePayload.breakEndTime
        )
        store.savedOption.isWorkDay = true
        store.savedOption.isEdit = true
        store.savedOption.startTime = store.timePayload.startTime
        store.savedOption.endTime = store.timePayload.endTime
        store.savedOption.empty = false
        store.savedOption.dayTime = dayTime
        store.savedOption.eveningTime = eveningTime
        store.savedOption.workTime = dayTime + eveningTime

        store.workerList[store.workerIndex].days[store.dayIndex] = { ...store.savedOption }
        store.workerList[store.workerIndex].isEdit = true
        store.selectedCellSet.clear()
        store.timeVisible = false
        store.isSelectedContext = true
      }
    })
  }
</script>

<template>
  <UIModal :width="500" v-model:visible="store.timeVisible">
    <template #header>
      <div></div>
    </template>
    <n-form
      ref="formRef"
      :rules="validationRules.common"
      :model="store.timePayload"
      class="grid grid-cols-12 gap-x-4 pt-4"
    >
      <n-form-item
        class="col-span-6"
        :label="$t(`schedule.form.starTimeSchedule`)"
        path="startTime"
        :rule-path="validationRules.rulesNames.requiredHoursField"
      >
        <n-input
          v-model:value="store.timePayload.startTime"
          placeholder="00:00"
          v-mask="'##:##'"
          maxlength="5"
        />
      </n-form-item>
      <n-form-item
        class="col-span-6"
        :label="$t(`schedule.form.endTimeSchedule`)"
        path="endTime"
        :rule-path="validationRules.rulesNames.requiredHoursField"
      >
        <n-input
          v-model:value="store.timePayload.endTime"
          placeholder="00:00"
          v-mask="'##:##'"
          maxlength="5"
        />
      </n-form-item>

      <n-form-item class="col-span-12" :show-label="false">
        <n-checkbox v-model:checked="store.timePayload.status">{{
          $t('schedule.form.addBreakTime')
        }}</n-checkbox>
      </n-form-item>
      <template v-if="store.timePayload.status">
        <n-form-item
          class="col-span-6"
          :label="$t(`schedule.form.breakStartTime`)"
          path="startTime"
          :rule-path="validationRules.rulesNames.requiredHoursField"
        >
          <n-input
            v-model:value="store.timePayload.breakStartTime"
            placeholder="00:00"
            v-mask="'##:##'"
            maxlength="5"
          />
        </n-form-item>
        <n-form-item
          class="col-span-6"
          :label="$t(`schedule.form.breakEndTime`)"
          path="endTime"
          :rule-path="validationRules.rulesNames.requiredHoursField"
        >
          <n-input
            v-model:value="store.timePayload.breakEndTime"
            placeholder="00:00"
            v-mask="'##:##'"
            maxlength="5"
          />
        </n-form-item>
      </template>

      <div class="grid grid-cols-2 gap-2 mt-4 col-span-12">
        <n-button @click="store.timeVisible = false" type="error" ghost>
          {{ $t('content.cancel') }}
        </n-button>
        <n-button @click="onSubmit" :loading="store.saveLoading" type="primary">
          {{ $t('content.save') }}
        </n-button>
      </div>
    </n-form>
  </UIModal>
</template>
