<script setup>
import {Calculator24Regular, DismissCircle20Filled, Info20Filled} from '@vicons/fluent'
import { useCommandStore, useComponentStore } from '@/store/modules/index.js'
import Utils from '@/utils/Utils.js'
import validationRules from '@/utils/validationRules.js'
import i18n from '@/i18n/index.js'
import { useAppSetting } from '@/utils/index.js'
import LastVacationItem from '@/pages/docFlow/document/command/ui/LastVacationItem.vue'

const store = useCommandStore()
const componentStore = useComponentStore()
const formRef = ref(null)
const lastVacationRef = ref(null)
const { t } = i18n.global
const onSubmit = async (mainData) => {
  let data = null
  await formRef.value?.validate(async (error) => {
    if (!error) {
      if(!store.form_46.result || !store.form_46.result?.all_day){
        return {
          data: null,
          isValid: false
        }
      }

      data = {
        ...mainData,
        period_from:Utils.timeToZone(store.form_46.result.period_from),
        period_to:Utils.timeToZone(store.form_46.result.period_to),
        work_day:Utils.timeToZone(store.form_46.result.work_day),
        to:Utils.timeToZone(store.form_46.result.to),
        all_day:store.form_46.result.all_day,

        from:Utils.timeToZone(store.form_46.from),
        main_day:store.form_46.main_day,
        second_day:store.form_46.second_day,
        additional:store.form_46.addList.map(x=>({id:x.id, value:x.day})),

        half_one_day:store.form_46.half_one_day,
        half_two_base:store.form_46.half_two_base ===2,
        half_two_day:store.form_46.half_two_base ===2? store.form_46.half_two_day : undefined,
        half_two_date:store.form_46.half_two_base ===2? Utils.timeToZone(store.form_46.half_two_date) : undefined,
      }
    } else {
      data = null
    }
  })
  return {
    data: data,
    isValid: Boolean(data)
  }
}

const onRemove = (id) =>{
  store.form_46.addList = store.form_46.addList.filter(v=> v.id !== id)
}

const onChange = (id) =>{
  if (!id) return
  const item = componentStore.vacationAdditional.filter(x=>x.id === id)[0]
  store.form_46.addList.push({
    ...item,
    day:0,
  })
}

const onCalculate = () =>{
  if(!store.payload.worker || !store.form_46.main_day || !store.form_46.from){
    $Toast.warning(t('message.warning-data'))
    return
  }

  const data = {
    id: store.payload.worker,
    from: Utils.timeToZone(store.form_46.from),
    main_day: store.form_46.main_day,
    second_day: store.form_46.second_day,
    additional: store.form_46.addList.map((v) => ({
      id: v.id,
      value: v.day
    }))
  }
  store.calculateLoading = true
  $ApiService.vacationService._vacationCalculate({data: { worker_positions: [data] }}).then((res)=>{
    $Toast.success(t('message.successDone'))
    if(res.data.data?.[0]){
      const v = res.data.data?.[0]
      store.form_46.result.all_day = v.all_day
      store.form_46.result.experience = v.experience?.toString()
      store.form_46.result.period_from = new Date(v.period_from).getTime()
      store.form_46.result.period_to = new Date(v.period_to).getTime()
      store.form_46.result.work_day = new Date(v.work_day).getTime()
      store.form_46.result.to = new Date(v.to).getTime()
    }
  }).finally(() => {
    store.calculateLoading = false
  })
}

const options = [
  {
    name:'Pullik kompensatsiya',
    id:1,
  },
  {
    name:'Keyingi yilga ko\'chirish',
    id:2,
  },
]

const validateForm = async () => {
  if(!store.form_46.result || !store.form_46.result?.all_day){
    $Toast.warning(t('message.warning-data'))
    return false
  }
  await formRef.value?.validate()
}

watchEffect(()=>{
  store.form_46.half_two_day =Number(store.form_46.result.all_day) - Number(store.form_46.half_one_day)
})

defineExpose({
  onSubmit,
  validateForm,
})

onMounted(() => {
  componentStore._enums()
})
</script>

<template>
  <n-form
      ref="formRef"
      :model="store.form_46"
      :rules="validationRules.common"
      class="grid grid-cols-12 mb-8 gap-x-4 gap-y-2 border border-surface-line border-dashed p-2 rounded-md bg-surface-ground"
  >
    <div class="col-span-12">
      <LastVacationItem ref="lastVacationRef" />
    </div>
    <div class="col-span-12 md:col-span-6 lg:col-span-2">
      <n-form-item
          :show-feedback="false"
          :label="$t(`documentPage.command.form.from`)"
          :rule-path="validationRules.rulesNames.requiredNumberField"
          path="from">
        <n-date-picker
            class="w-full"
            v-model:value="store.form_46.from"
            type="date"
            :format="useAppSetting.datePicketFormat"

        />
      </n-form-item>
    </div>
    <div class="col-span-12 md:col-span-6 lg:col-span-2">
      <n-form-item
          :show-feedback="false"
          :label="$t(`documentPage.command.form.main_day`)"
          path="main_day"
          :rule-path="validationRules.rulesNames.requiredNumberField"
      >
        <n-input-number
            class="w-full"
            min="0"
            max="100"
            v-model:value="store.form_46.main_day"
        />
      </n-form-item>
    </div>
    <div class="col-span-12 md:col-span-6 lg:col-span-2">
      <n-form-item
          :show-feedback="false"
          :label="$t(`documentPage.command.form.second_day`)"
          path="second_day"
          :rule-path="validationRules.rulesNames.requiredNumberField"
      >
        <n-input-number
            class="w-full"
            min="0"
            max="100"
            v-model:value="store.form_46.second_day"
        />
      </n-form-item>
    </div>
    <div class="col-span-12 md:col-span-6 lg:col-span-6">
      <n-form-item
          :show-feedback="false"
          :label="$t(`documentPage.command.form.additional`)"
          path="additional"

      >
        <n-select
            v-model:value="store.form_46.additional"
            filterable
            :options="componentStore.vacationAdditional"
            label-field="name"
            value-field="id"
            :loading="componentStore.enumLoading"
            @update:value="onChange"
        />
      </n-form-item>
    </div>
    <div class="col-span-12">
      <template v-for="(subItem, index) in store.form_46.addList" :key="index">
        <div
            class="flex justify-between items-center w-full bg-surface-section border border-surface-line mt-2 px-2 py-1 rounded-md"
        >
          <span class="text-xs font-semibold">{{ subItem.name }}</span>
          <span class="w-[150px] min-w-[120px] flex gap-4">
            <n-input-number v-model:value="subItem.day"></n-input-number>
            <n-button @click="onRemove(subItem.id)" circle type="error" secondary>
              <template #icon>
                <DismissCircle20Filled />
              </template>
            </n-button>
          </span>
        </div>
      </template>
    </div>
    <div
        class="col-span-12 grid mt-2 grid-cols-12 gap-x-4 w-full border border-dashed border-surface-line bg-surface-section/40 rounded-md p-2"
    >
      <div class="col-span-12 flex justify-center mb-4">
        <n-button
            :loading="store.calculateLoading"
            @click="onCalculate(idx)"
            type="primary"
            secondary
            size="tiny"
        >
          <template #icon>
            <Calculator24Regular />
          </template>
          {{ $t('documentPage.command.form.calculateVacation') }}
        </n-button>
      </div>
      <div class="col-span-12 md:col-span-6 lg:col-span-3 mb-2 lg:mb-0">
        <n-form-item
            :show-feedback="false"
            :label="$t(`documentPage.command.form.period_from`)"
            path="result.period_from"
            :rule-path="validationRules.rulesNames.requiredNumberField"
        >
          <n-date-picker
              class="w-full"
              v-model:value="store.form_46.result.period_from"
              type="date"
              :format="useAppSetting.datePicketFormat"
          />
        </n-form-item>
      </div>
      <div class="col-span-12 md:col-span-6 lg:col-span-3 mb-2 lg:mb-0">
        <n-form-item
            :show-feedback="false"
            :label="$t(`documentPage.command.form.period_to`)"
            path="result.period_to"
            :rule-path="validationRules.rulesNames.requiredNumberField"
        >
          <n-date-picker
              class="w-full"
              v-model:value="store.form_46.result.period_to"
              type="date"
              :format="useAppSetting.datePicketFormat"
          />
        </n-form-item>
      </div>
      <div class="col-span-12 md:col-span-6 lg:col-span-3 mb-2 lg:mb-0">
        <n-form-item
            :show-feedback="false"
            :label="$t(`documentPage.command.form.all_day`)"
            path="result.all_day"
            :rule-path="validationRules.rulesNames.requiredNumberField"
        >
          <n-input-number
              class="w-full"
              min="0"
              max="100"
              v-model:value="store.form_46.result.all_day"
          />
        </n-form-item>
      </div>
      <div class="col-span-12 md:col-span-6 lg:col-span-3 mb-2 lg:mb-0">
        <n-form-item
            :show-feedback="false"
            :label="$t(`vacationSchedule.form.experience`)"
            path="experience"
        >
          <n-input disabled v-model:value="store.form_46.result.experience">
            <template #suffix>
              {{$t('content.year')}}
            </template>
          </n-input>
        </n-form-item>
      </div>


    </div>

    <div
        class="col-span-12 grid mt-2 grid-cols-12 gap-x-4 gap-y-2 w-full border border-dashed border-surface-line bg-surface-section/40 rounded-md p-2"
    >
      <div class="col-span-12 md:col-span-6 lg:col-span-3">
        <n-form-item
            :show-feedback="false"
            :label="$t(`documentPage.command.form.half_one_day`)"
            path="half_one_day"
            :rule-path="validationRules.rulesNames.requiredNumberField"
        >
          <n-input-number
              class="w-full"
              min="15"
              max="100"
              v-model:value="store.form_46.half_one_day"
          />

        </n-form-item>
      </div>
      <div class="col-span-12 md:col-span-6 lg:col-span-3">
        <n-form-item
            :show-feedback="false"
            :label="$t(`content.type`)"
            path="additional"
        >
          <n-select
              v-model:value="store.form_46.half_two_base"
              filterable
              :options="options"
              label-field="name"
              value-field="id"
          />
        </n-form-item>
      </div>
      <div class="col-span-12 md:col-span-6 lg:col-span-3">
        <n-form-item
            :show-feedback="false"
            :label="$t(`documentPage.command.form.to`)"
            path="result.to"
            :rule-path="validationRules.rulesNames.requiredNumberField"
        >
          <n-date-picker
              class="w-full"
              v-model:value="store.form_46.result.to"
              type="date"
              :format="useAppSetting.datePicketFormat"
          />
        </n-form-item>
      </div>
      <div class="col-span-12 md:col-span-6 lg:col-span-3">
        <n-form-item
            :show-feedback="false"
            :label="$t(`documentPage.command.form.work_day`)"
            path="result.work_day"
            :rule-path="validationRules.rulesNames.requiredNumberField"
        >
          <n-date-picker
              class="w-full"
              v-model:value="store.form_46.result.work_day"
              type="date"
              :format="useAppSetting.datePicketFormat"
          />
        </n-form-item>
      </div>
      <template v-if="store.form_46.half_two_base === 2">
        <div class="col-span-12 md:col-span-6 lg:col-span-3">
          <n-form-item
              :show-feedback="false"
              :label="$t(`documentPage.command.form.half_two_date`)"
              path="half_two_date"
              :rule-path="validationRules.rulesNames.requiredNumberField">
            <n-date-picker
                class="w-full"
                v-model:value="store.form_46.half_two_date"
                type="date"
                :format="useAppSetting.datePicketFormat"
            />
          </n-form-item>
        </div>
        <div class="col-span-12 md:col-span-6 lg:col-span-3">
          <n-form-item
              :show-feedback="false"
              :label="$t(`documentPage.command.form.half_two_day`)"
          >
            <n-input-number
                :disabled="true"
                class="w-full"
                min="0"
                max="100"
                v-model:value="store.form_46.half_two_day"
            />
          </n-form-item>
        </div>
      </template>
    </div>


  </n-form>
</template>
