<script setup>
import {useCommandStore} from "@/store/modules/index.js"
import Utils from "@/utils/Utils.js"
import validationRules from "@/utils/validationRules.js"
import {Eye24Regular} from "@vicons/fluent"
import i18n from "@/i18n/index.js"
import {useAppSetting} from "@/utils/index.js"

const {t} = i18n.global
const store = useCommandStore()
const formRef = ref(null)
const onSubmit = async (mainData) => {
  let data = null
  await formRef.value?.validate(async (error) => {
    if (!error) {
      data = {
        ...mainData,
        from: Utils.timeToZone(store.form_51.from),
        to: Utils.timeToZone(store.form_51.to),
        work_day: Utils.timeToZone(store.form_51.work_day),
        reason: store.form_51.reason,
      }

    } else {
      data = null
    }
  })
  return {
    data: data,
    isValid: Boolean(data),
  }
}

const validateForm = async () => {
  await formRef.value?.validate()
}

const vacation = ref(null)

const getLastVacation = () => {
  vacation.value = null
  store.vacationId = store.payload.worker
  store.lastVacation((data) => {
    vacation.value = data.length > 0 ? data[0] : t('content.no-data')
  })
}


defineExpose({
  onSubmit,
  validateForm,
})
</script>

<template>
  <n-form
      ref="formRef"
      :model="store.form_51"
      :rules="validationRules.form_49"

      class="grid grid-cols-12 mb-8 gap-x-4 border border-surface-line border-dashed p-2 rounded-md bg-surface-ground">

    <div class="col-span-12">
      <template v-if="vacation && vacation?.period_from && store.vacationId === store.payload.worker">
        <n-collapse-transition v-show="Boolean(vacation)">
          <div
              class="mb-4 flex flex-wrap justify-center gap-x-[20px] text-secondary border border-gray-300 px-2 py-1 rounded-lg border-dashed">
            <div>
              <div class="font-medium"> {{ vacation.period_from }}</div>
              <div class="text-xs">{{ $t('documentPage.command.form.period_from') }}</div>
            </div>
            <div>
              <div class="font-medium"> {{ vacation.period_to }}</div>
              <div class="text-xs">{{ $t('documentPage.command.form.period_to') }}</div>
            </div>
            <div>
              <div class="font-medium"> {{ vacation.from }}</div>
              <div class="text-xs">{{ $t('documentPage.command.form.from') }}</div>
            </div>
            <div>
              <div class="font-medium"> {{ vacation.to }}</div>
              <div class="text-xs">{{ $t('documentPage.command.form.to') }}</div>
            </div>
            <div>
              <div class="font-medium text-warning"> {{ vacation?.type?.name }}</div>
              <div class="text-xs">{{ $t('content.type') }}</div>
            </div>
            <div>
              <div class="font-medium text-primary"> {{ vacation?.all_day }}</div>
              <div class="text-xs">{{ $t('documentPage.command.form.all_day') }}</div>
            </div>
            <div>
              <div class="font-medium" :class="[vacation.rest_day>=0? 'text-success' : 'text-danger']">
                {{ vacation.rest_day }}
              </div>
              <div class="text-xs">{{ $t('documentPage.command.form.rest_day') }}</div>
            </div>

          </div>
        </n-collapse-transition>
      </template>
      <template v-if="typeof vacation === 'string' && store.vacationId === store.payload.worker">
        <div class="text-center mb-4 text-warning">{{ vacation }}</div>
      </template>
    </div>

    <div class="col-span-12 flex justify-center mb-1">
      <n-button
          v-if="store.payload.worker"
          :loading="store.vacationLoading"
          ghost
          size="tiny"
          @click="getLastVacation()"
      >
        <template #icon>
          <Eye24Regular/>
        </template>
        {{ $t('documentPage.command.lastVacation') }}
      </n-button>
    </div>

    <div class="col-span-12 md:col-span-6 lg:col-span-3">
      <n-form-item :label="$t(`commandPage.form_49.from`)" path="from">
        <n-date-picker
            class="w-full"
            v-model:value="store.form_51.from"
            type="date"

            :format="useAppSetting.datePicketFormat"
        />
      </n-form-item>
    </div>
    <div class="col-span-12 md:col-span-6 lg:col-span-3">
      <n-form-item :label="$t(`commandPage.form_49.to`)" path="to">
        <n-date-picker
            class="w-full"
            v-model:value="store.form_51.to"
            type="date"

            :format="useAppSetting.datePicketFormat"
            :disabled="!store.form_51.to && !store.form_51.from"
            :is-date-disabled="(v)=>Utils.disablePasteDate(v,store.form_51.from)"
        />
      </n-form-item>
    </div>
    <div class="col-span-12 md:col-span-6 lg:col-span-3">
      <n-form-item :label="$t(`commandPage.form_49.work_day`)" path="work_day">
        <n-date-picker
            class="w-full"
            v-model:value="store.form_51.work_day"
            type="date"

            :format="useAppSetting.datePicketFormat"
            :disabled="!store.form_51.work_day && !store.form_51.to"
            :is-date-disabled="(v)=>Utils.disablePasteDate(v,store.form_51.to)"
        />
      </n-form-item>
    </div>
    <div class="col-span-12 md:col-span-6 lg:col-span-3">
      <n-form-item :label="$t(`commandPage.form_48.reason`)" path="reason">
        <n-input
            class="w-full"
            type="text"

            v-model:value="store.form_51.reason"
        />
      </n-form-item>
    </div>


  </n-form>
</template>
