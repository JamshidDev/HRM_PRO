<script setup>
  import { useCommandStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import validationRules from '@/utils/validationRules.js'
  import { useAppSetting } from '@/utils/index.js'

  const store = useCommandStore()
  const formRef = ref(null)

  // start/end vaqtdan davomiylikni avtomatik hisoblaymiz ("N soatlik").
  const onChangeTime = () => {
    const s = store.form_56.start_time
    const e = store.form_56.end_time
    if (s && e && e > s) {
      const hours = (e - s) / 3600000
      store.form_56.duration = `${hours % 1 === 0 ? hours : hours.toFixed(1)} soatlik`
    } else {
      store.form_56.duration = null
    }
  }

  const onSubmit = async (mainData) => {
    let data = null
    await formRef.value?.validate(async (error) => {
      if (!error) {
        data = {
          ...mainData,
          work_date: Utils.timeToZone(store.form_56.work_date),
          start_time: Utils.timeOnlyHour(store.form_56.start_time) || undefined,
          end_time: Utils.timeOnlyHour(store.form_56.end_time) || undefined,
          duration: store.form_56.duration || undefined,
          reason: store.form_56.reason,
          responsible: store.form_56.responsible
        }
      } else {
        data = null
      }
    })
    return { data, isValid: Boolean(data) }
  }

  const validateForm = async () => {
    await formRef.value?.validate()
  }

  defineExpose({ onSubmit, validateForm })
</script>

<template>
  <n-form
    ref="formRef"
    :model="store.form_56"
    :rules="validationRules.form_56"
    class="grid grid-cols-12 mb-8 gap-x-4 border border-surface-line border-dashed p-2 rounded-md bg-surface-ground"
  >
    <div class="col-span-12 md:col-span-6 lg:col-span-3">
      <n-form-item :label="$t(`commandPage.form_56.work_date`)" path="work_date">
        <n-date-picker
          class="w-full"
          v-model:value="store.form_56.work_date"
          type="date"
          :format="useAppSetting.datePicketFormat"
        />
      </n-form-item>
    </div>
    <div class="col-span-12 md:col-span-6 lg:col-span-3">
      <n-form-item :label="$t(`commandPage.form_56.start_time`)" path="start_time">
        <n-time-picker
          format="HH:mm"
          class="w-full"
          v-model:value="store.form_56.start_time"
          @update:value="onChangeTime"
        />
      </n-form-item>
    </div>
    <div class="col-span-12 md:col-span-6 lg:col-span-3">
      <n-form-item :label="$t(`commandPage.form_56.end_time`)" path="end_time">
        <n-time-picker
          format="HH:mm"
          class="w-full"
          v-model:value="store.form_56.end_time"
          @update:value="onChangeTime"
        />
      </n-form-item>
    </div>
    <div class="col-span-12 md:col-span-6 lg:col-span-3">
      <n-form-item :label="$t(`commandPage.form_56.duration`)" path="duration">
        <n-input class="w-full" :disabled="true" v-model:value="store.form_56.duration" />
      </n-form-item>
    </div>
    <div class="col-span-12 md:col-span-6">
      <n-form-item :label="$t(`commandPage.form_56.reason`)" path="reason">
        <n-input class="w-full" type="text" v-model:value="store.form_56.reason" />
      </n-form-item>
    </div>
    <div class="col-span-12 md:col-span-6">
      <n-form-item :label="$t(`commandPage.form_56.responsible`)" path="responsible">
        <n-input class="w-full" type="text" v-model:value="store.form_56.responsible" />
      </n-form-item>
    </div>
  </n-form>
</template>
