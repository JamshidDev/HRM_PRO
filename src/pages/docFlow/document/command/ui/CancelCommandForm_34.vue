<script setup>
import {Info20Filled} from '@vicons/fluent'
import {useCommandStore, useComponentStore} from "@/store/modules/index.js"
import Utils from "@/utils/Utils.js"
import validationRules from "@/utils/validationRules.js"
import i18n from "@/i18n/index.js"
import {useAppSetting} from "@/utils/index.js"
import LastVacationItem from "@/pages/docFlow/document/command/ui/LastVacationItem.vue"
import {Eye24Regular} from "@vicons/fluent"

const store = useCommandStore()
const componentStore = useComponentStore()
const formRef = ref(null)
const lastVacationRef = ref(null)
const {t} = i18n.global
const onSubmit =async (mainData)=>{
  let data = null
  await formRef.value?.validate(async (error)=>{
    if(!error){
      data =
          {
            ...mainData,
            contract_to_date:Utils.timeToZone(store.form_34.contract_to_date),
            warning_date:Utils.timeToZone(store.form_34.warning_date),
            reason:store.form_34.reason,
            warning_number:store.form_34.warning_number,
            command_additional: {
              pension_count: showPension.value? store.form_34.pension_count: undefined,
              salary_withholding: showSalaryWithholding.value? {
                ...store.form_34.salary_withholding,
                period1:Utils.timeToZone(store.form_34.salary_withholding.period1),
                period2:Utils.timeToZone(store.form_34.salary_withholding.period2),

              }: undefined,
              compensation: showCompensation.value? {
                ...store.form_34.compensation,
                period1:Utils.timeToZone(store.form_34.compensation.period1),
                period2:Utils.timeToZone(store.form_34.compensation.period2),
              } : undefined,
            }

          }

    }else{
      data = null
    }
  })
  return {
    data:data,
    isValid:Boolean(data),
  }
}

const typeConfig ={
  pensionCount:'pension_count',
  pensionCoefficient:'pension_coefficient',
  compensation:'compensation',
  salaryWithHolding:'salary_withholding',
}

const pensionCountLoading = ref(false)
const pensionCoefficientLoading = ref(false)
const compensationLoading = ref(false)
const salaryWithholdingLoading = ref(false)

const showPension = computed(()=>Boolean(store.form_34.command_additional.find(v=>v === typeConfig.pensionCount)))
const showPensionCoefficient = computed(()=>Boolean(store.form_34.command_additional.find(v=>v === typeConfig.pensionCoefficient)))
const showCompensation = computed(()=>Boolean(store.form_34.command_additional.find(v=>v === typeConfig.compensation)))
const showSalaryWithholding = computed(()=>Boolean(store.form_34.command_additional.find(v=>v === typeConfig.salaryWithHolding)))

watch(()=>store.form_34.command_additional, (newValue, oldValue)=>{
  if(newValue.length === 0 || newValue.length < oldValue.length) return
  const paramType = newValue.at(-1)

  pensionCountLoading.value = paramType===typeConfig.pensionCount
  pensionCoefficientLoading.value = paramType===typeConfig.pensionCoefficient
  compensationLoading.value = paramType===typeConfig.compensation
  salaryWithholdingLoading.value = paramType===typeConfig.salaryWithHolding
  store._additionalData({ type:paramType},(res)=>{
    const {data, type} = res.data

    if(type === typeConfig.pensionCount){
      store.form_34.pension_count.year = data.year
      store.form_34.pension_count.count = data.count
      pensionCountLoading.value = false
    }else if (type === typeConfig.pensionCoefficient){
      store.form_34.pension_coefficient.year = data.year
      store.form_34.pension_coefficient.coefficient = data.coefficient
      pensionCoefficientLoading.value = false
    }else if (type === typeConfig.compensation){
      store.form_34.compensation.period1 = data.period1? new Date(data.period1).getTime() : null
      store.form_34.compensation.period2 = data.period2? new Date(data.period2).getTime() : null
      store.form_34.compensation.rest_day = data.rest_day
      compensationLoading.value = false
    }else if (type === typeConfig.salaryWithHolding){
      store.form_34.salary_withholding.period1 = data.period1? new Date(data.period1).getTime() : null
      store.form_34.salary_withholding.period2 = data.period2? new Date(data.period2).getTime() : null
      store.form_34.salary_withholding.all_day = data.all_day
      store.form_34.salary_withholding.rest_day = data.rest_day
      store.form_34.salary_withholding.month = data.month
      salaryWithholdingLoading.value = false
    }

  })
})

const pairs = {
  'pension_count':'pension_coefficient',
  'pension_coefficient':'pension_count',
  'compensation':'salary_withholding',
  'salary_withholding':'compensation',
}

const selectOptions = computed(()=>{
  return componentStore.deleteCommandEnum.map(v=>({...v, disabled:store.form_34.command_additional.includes(pairs[v.id])}))
})

const options_34 = [
  {
    id: 1,
    name: t('documentPage.command.form.warning_one')
  },
  {
    id: 2,
    name: t('documentPage.command.form.warning_two')
  },
  {
    id: 3,
    name: t('documentPage.command.form.warning_three')
  },
  {
    id: 4,
    name: t('documentPage.command.form.warning_four')
  },
  {
    id: 5,
    name: t('documentPage.command.form.warning_five')
  },
]

const options_35 = [
  {
    id: 1,
    name: t('documentPage.command.form.warning_seven')
  },
  {
    id: 2,
    name: t('documentPage.command.form.warning_eight')
  },
  {
    id: 3,
    name: t('documentPage.command.form.warning_nine')
  }
]

const options_39 = [
  { id: 1, name: t('documentPage.command.form.warning_ten') },
  { id: 2, name: t('documentPage.command.form.warning_eleven') },
  { id: 3, name: t('documentPage.command.form.warning_twelve') },
  { id: 4, name: t('documentPage.command.form.warning_thirteen') },
  { id: 5, name: t('documentPage.command.form.warning_fourteen') },
  { id: 6, name: t('documentPage.command.form.warning_fifteen') },
  { id: 7, name: t('documentPage.command.form.warning_sixteen') },
  { id: 8, name: t('documentPage.command.form.warning_seventeen') },
  { id: 9, name: t('documentPage.command.form.warning_eighteen') },
  { id: 10, name: t('documentPage.command.form.warning_nineteen') },
  { id: 11, name: t('documentPage.command.form.warning_twenty') },
  { id: 12, name: t('documentPage.command.form.warning_twenty_one') }
]

const options = computed(()=>{
  const type =store.payload.command_type

  if(type === 34) return options_34
  if(type === 35) return options_35
  else return options_39
})

const onSelectReason = (v)=>{
  store.form_34.reason = v
}




defineExpose({
  onSubmit
})


</script>

<template>
  <n-form
      ref="formRef"
      :model="store.form_34"
      :rules="validationRules.form_32"

      class="grid grid-cols-12 mb-8 gap-x-4 gap-y-2 border border-surface-line border-dashed p-2 rounded-md bg-surface-ground">

    <div class="col-span-12 md:col-span-6 lg:col-span-3">
      <n-form-item
          :show-feedback="false"
          :label="$t(`documentPage.command.form.warning_number`)"
          path="warning_number"
      >
        <n-input
            class="!w-full"
            type="text"
            v-model:value="store.form_34.warning_number"
        />
      </n-form-item>
    </div>
    <div class="col-span-12 md:col-span-6 lg:col-span-3">
      <n-form-item
          :show-feedback="false"
          :label="$t(`documentPage.command.form.warning_date`)"
          path="warning_date"
      >
        <n-date-picker
            class="w-full"
            v-model:value="store.form_34.warning_date"
            type="date"
            :format="useAppSetting.datePicketFormat"

        />
      </n-form-item>
    </div>
    <div class="col-span-12 md:col-span-6 lg:col-span-6">
      <n-form-item
          :show-feedback="false"
          :label="$t(`documentPage.command.form.reason`)"
          path="reason"
      >
        <div class="!w-full flex gap-2">
          <n-input
              rows="1"
              class="!w-full"
              type="textarea"
              v-model:value="store.form_34.reason"
              :autosize="true"
              clearable
          />
          <n-popover
              placement="bottom"
              trigger="click"
          >
            <template #trigger>
              <n-button type="primary" secondary round>
                <template #icon>
                  <Info20Filled/>
                </template>
              </n-button>
            </template>
            <div class="max-w-[400px] h-[300px] overflow-y-auto">
              <div
                  v-for="item in options" :key="item.id"
                  class="leading-[1.2] mb-1 text-[14px] text-secondary cursor-pointer p-2 bg-transparent hover:bg-primary/10 rounded-xl"
                  @click="onSelectReason(item.name)"
              >
                {{item.id}}. {{item.name}}
              </div>
            </div>

          </n-popover>

        </div>

      </n-form-item>
    </div>

    <div class="col-span-12 md:col-span-6 lg:col-span-3">
      <n-form-item :label="$t(`documentPage.command.form.contract_to_date`)" path="contract_to_date">
        <n-date-picker
            class="w-full"
            v-model:value="store.form_34.contract_to_date"
            type="date"
            :format="useAppSetting.datePicketFormat"

        />
      </n-form-item>
    </div>
    <div v-if="store.payload.worker" class="col-span-12 md:col-span-6 lg:col-span-9">
      <n-form-item
          :show-feedback="false"
          :label="$t(`documentPage.command.form.additional`)">
        <n-select
            :consistent-menu-width="false"
            multiple
            v-model:value="store.form_34.command_additional"
            filterable
            :options="selectOptions"
            label-field="name"
            value-field="id"
            :loading="componentStore.enumLoading"
        />
      </n-form-item>
    </div>

    <n-spin :show="pensionCountLoading" class="col-span-12">
      <div v-if="showPension" class="grid grid-cols-12 gap-x-4 gap-y-2 p-2 border border-dashed rounded-lg border-surface-line bg-surface-section/80">
        <div class="col-span-12 text-xs">
          <n-button type="primary" secondary size="tiny">{{componentStore.deleteCommandEnum?.[0]?.name}}</n-button>
        </div>
        <div class="col-span-12 md:col-span-6 lg:col-span-2">
          <n-form-item
              :show-feedback="false"
              :label="$t(`content.year`)"
              path="pension_count.year"
          >
            <n-input-number
                class="w-full"
                min="0"
                max="100"
                v-model:value="store.form_34.pension_count.year"
            />
          </n-form-item>
        </div>
        <div class="col-span-12 md:col-span-6 lg:col-span-2">
          <n-form-item
              :show-feedback="false"
              :label="$t(`documentPage.command.form.count`)"
              path="pension_count.count"
          >
            <n-input-number
                class="w-full"
                min="0"
                max="100"
                v-model:value="store.form_34.pension_count.count"
            />
          </n-form-item>
        </div>
      </div>
    </n-spin>

    <n-spin :show="pensionCoefficientLoading" class="col-span-12">
      <div v-if="showPensionCoefficient" class="grid grid-cols-12 gap-x-4 gap-y-2 p-2 border border-dashed rounded-lg border-surface-line bg-surface-section/80">
        <div class="col-span-12 text-xs">
          <n-button type="primary" secondary size="tiny">{{componentStore.deleteCommandEnum?.[1]?.name}}</n-button>
        </div>
        <div class="col-span-12 md:col-span-6 lg:col-span-2">
          <n-form-item
              :show-feedback="false"
              :label="$t(`content.year`)"
              path="pension_count.year"
          >
            <n-input-number
                class="w-full"
                min="0"
                max="100"
                v-model:value="store.form_34.pension_coefficient.year"
            />
          </n-form-item>
        </div>
        <div class="col-span-12 md:col-span-6 lg:col-span-2">
          <n-form-item
              :show-feedback="false"
              :label="$t(`documentPage.command.form.coefficient`)"
              path="pension_count.count"
          >
            <n-input-number
                class="w-full"
                min="0"
                max="100"
                v-model:value="store.form_34.pension_coefficient.coefficient"
            />
          </n-form-item>
        </div>
      </div>
    </n-spin>

    <n-spin :show="compensationLoading" class="col-span-12">
      <div v-if="showCompensation" class="grid grid-cols-12 gap-x-4 gap-y-2 p-2 border border-dashed rounded-lg border-surface-line bg-surface-section/80">
        <div class="col-span-12 text-xs">
          <n-button type="primary" secondary size="tiny">{{componentStore.deleteCommandEnum?.[3]?.name}}</n-button>
        </div>
        <LastVacationItem ref="lastVacationRef" />
        <div class="col-span-12 flex justify-center mb-1">
          <n-button
              :loading="store.vacationLoading"
              ghost
              size="tiny"
              @click="lastVacationRef.getLastVacation(store.payload.worker)"
          >
            <template #icon>
              <Eye24Regular/>
            </template>
            {{ $t('documentPage.command.lastVacation') }}
          </n-button>
        </div>
        <div class="col-span-12 md:col-span-6 lg:col-span-2">
          <n-form-item
              :show-feedback="false"
              :label="$t(`content.from`)"
              path="compensation.period1"
          >
            <n-date-picker
                class="w-full"
                v-model:value="store.form_34.compensation.period1"
                type="date"
                :format="useAppSetting.datePicketFormat"

            />
          </n-form-item>
        </div>
        <div class="col-span-12 md:col-span-6 lg:col-span-2">
          <n-form-item
              :show-feedback="false"
              :label="$t(`content.to`)"
              path="compensation.period2"
          >
            <n-date-picker
                class="w-full"
                v-model:value="store.form_34.compensation.period2"
                type="date"
                :format="useAppSetting.datePicketFormat"

            />
          </n-form-item>
        </div>
        <div class="col-span-12 md:col-span-6 lg:col-span-2">
          <n-form-item
              :show-feedback="false"
              :label="$t(`documentPage.command.form.all_day`)"
              path="pension.count"
          >
            <n-input-number
                class="w-full"
                min="0"
                max="1000"
                v-model:value="store.form_34.compensation.rest_day"
            />
          </n-form-item>
        </div>
      </div>
    </n-spin>

    <n-spin :show="salaryWithholdingLoading" class="col-span-12">
      <div v-if="showSalaryWithholding" class="grid grid-cols-12 gap-x-4 gap-y-2 p-2 border border-dashed rounded-lg border-surface-line bg-surface-section/80">
        <div class="col-span-12 text-xs">
          <n-button type="primary" secondary size="tiny">{{componentStore.deleteCommandEnum?.[2]?.name}}</n-button>
        </div>
        <LastVacationItem ref="lastVacationRef" />
        <div class="col-span-12 flex justify-center mb-1">
          <n-button
              :loading="store.vacationLoading"
              ghost
              size="tiny"
              @click="lastVacationRef.getLastVacation(store.payload.worker)"
          >
            <template #icon>
              <Eye24Regular/>
            </template>
            {{ $t('documentPage.command.lastVacation') }}
          </n-button>
        </div>
        <div class="col-span-12 md:col-span-6 lg:col-span-2">
          <n-form-item
              :show-feedback="false"
              :label="$t(`content.from`)"
              path="salary_withholding.period1"
          >
            <n-date-picker
                class="w-full"
                v-model:value="store.form_34.salary_withholding.period1"
                type="date"
                :format="useAppSetting.datePicketFormat"

            />
          </n-form-item>
        </div>
        <div class="col-span-12 md:col-span-6 lg:col-span-2">
          <n-form-item
              :show-feedback="false"
              :label="$t(`content.to`)"
              path="salary_withholding.period2"
          >
            <n-date-picker
                class="w-full"
                v-model:value="store.form_34.salary_withholding.period2"
                type="date"
                :format="useAppSetting.datePicketFormat"

            />
          </n-form-item>
        </div>
        <div class="col-span-12 md:col-span-6 lg:col-span-2">
          <n-form-item
              :show-feedback="false"
              :label="$t(`documentPage.command.form.all_day`)"
              path="salary_withholding.all_day"
          >
            <n-input-number
                class="w-full"
                min="0"
                max="1000"
                v-model:value="store.form_34.salary_withholding.all_day"
            />
          </n-form-item>
        </div>
        <div class="col-span-12 md:col-span-6 lg:col-span-2">
          <n-form-item
              :show-feedback="false"
              :label="$t(`documentPage.command.form.rest_day`)"
              path="salary_withholding.rest_day"
          >
            <n-input-number
                class="w-full"
                min="0"
                max="1000"
                v-model:value="store.form_34.salary_withholding.rest_day"
            />
          </n-form-item>
        </div>
        <div class="col-span-12 md:col-span-6 lg:col-span-2">
          <n-form-item
              :show-feedback="false"
              :label="$t(`documentPage.command.form.rest_day`)"
              path="salary_withholding.month"
          >
            <n-select
                v-model:value="store.form_34.salary_withholding.month"
                filterable
                :options="Utils.monthList"
                label-field="name"
                value-field="id"
            />
          </n-form-item>
        </div>
      </div>
    </n-spin>


  </n-form>
</template>
