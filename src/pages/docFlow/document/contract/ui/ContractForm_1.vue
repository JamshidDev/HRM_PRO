<script setup>
  import Utils from '@/utils/Utils.js'
  import { UIAutoComplete, UIUser, UISelect } from '@/components/index.js'
  import { useComponentStore, useContractStore } from '@/store/modules/index.js'
  import { NAvatar } from 'naive-ui'
  import UIHelper from '@/utils/UIHelper.js'
  import { useAppSetting } from '@/utils/index.js'

  const store = useContractStore()
  const componentStore = useComponentStore()

  const renderLabel = (option) => {
    return [
      h(
        'div',
        {
          class: 'flex gap-2 my-1 items-center'
        },
        [
          h(NAvatar, {
            class: '',
            src: option.photo || Utils.noAvailableImage,
            'fallback-src': Utils.noAvailableImage
          }),
          h('div', { class: 'flex flex-col' }, [
            h(
              'div',
              { class: 'text-xs font-medium text-gray-500' },
              `${option.last_name}.${option.first_name[0]}.${option.middle_name[0]}`
            ),
            h('div', { class: 'text-xs text-gray-400' }, option.position)
          ])
        ]
      )
    ]
  }
  const renderValue = ({ option }) => {
    return [
      h(
        'div',
        {
          class: 'flex gap-2 my-1 items-center'
        },
        `${option?.last_name} ${option?.first_name} ${option?.middle_name}`
      )
    ]
  }

  const showVacationDay = computed(() => {
    return ![2].includes(store.payload.type)
  })

  const fetchConfirmation = () => {
    if (componentStore.confirmationList.length > 0) return
    componentStore._confirmations()
  }

  const onChangeType = () => {
    if (store.payload.type === 2) {
      store.payload.command_status = false
      store.payload.vacation_main_day = 0
      store.payload.additional_vacation_day = 0
      // FXSH bitta qadam — tashkilot shu qadamda so'raladi, ro'yxatni yuklaymiz.
      if (componentStore.structureList.length === 0) componentStore._structures()
    }
  }

  // FXSH tashkilot tanlanganda — faqat organization_id (FXSH'da bo'lim/shtat yo'q).
  const onChangeStructure = (v) => {
    store.payload.organization_id = v
  }

  watchEffect(() => {
    if (store.payload.type) {
      store.payload.command_type = null
      const data = {
        status: Utils.documentModels.contract,
        type: store.payload.type
      }
      componentStore._commandTypes(data, (id) => {
        store.payload.command_type = id
      })
    }
    store.payload.position_date = store.payload.contract_date
    store.payload.command_date = store.payload.contract_date
  })

  onMounted(() => {
    fetchConfirmation()
  })
</script>

<template>
  <div class="grid grid-cols-12 gap-x-4">
    <div class="col-span-12 flex justify-center">
      <div class="w-[600px]">
        <template v-if="componentStore.isSelectedWorker">
          <div class="w-full rounded-xl border-surface-line border mb-4 p-1">
            <UIUser :data="componentStore.worker" :short="false" />
          </div>
        </template>
        <template v-else>
          <UIAutoComplete v-model:pin="store.payload.pin" />
        </template>
      </div>
    </div>

    <div
      class="col-span-12 border border-dashed p-2 rounded-xl border-surface-line bg-surface-ground"
    >
      <div class="grid grid-cols-12 gap-x-4">
        <div class="col-span-12 md:col-span-6 lg:col-span-2">
          <n-form-item :label="$t(`documentPage.form.contractNumber`)" path="number">
            <n-input class="w-full" type="text" v-model:value="store.payload.number" />
          </n-form-item>
        </div>
        <div class="col-span-12 md:col-span-6 lg:col-span-7">
          <n-form-item :label="$t(`documentPage.form.type`)" path="type">
            <n-select
              v-model:value="store.payload.type"
              filterable
              :options="componentStore.contractTypeList"
              label-field="name"
              value-field="id"
              :loading="componentStore.enumLoading"
              @update:value="onChangeType"
            />
          </n-form-item>
        </div>
        <div class="col-span-12 md:col-span-6 lg:col-span-3">
          <n-form-item :label="$t(`documentPage.form.contractDate`)" path="contract_date">
            <n-date-picker
              class="w-full"
              v-model:value="store.payload.contract_date"
              type="date"
              :format="useAppSetting.datePicketFormat"
            />
          </n-form-item>
        </div>
        <div class="col-span-12 md:col-span-6 lg:col-span-3" v-if="store.payload.type !== 1">
          <n-form-item :label="$t(`documentPage.form.contract_to_date`)" path="contract_to_date">
            <n-date-picker
              class="w-full"
              v-model:value="store.payload.contract_to_date"
              type="date"
              :format="useAppSetting.datePicketFormat"
            />
          </n-form-item>
        </div>
        <div class="col-span-12 md:col-span-6 lg:col-span-3">
          <n-form-item :label="$t(`documentPage.form.position_date`)" path="position_date">
            <n-date-picker
              class="w-full"
              v-model:value="store.payload.position_date"
              type="date"
              :format="useAppSetting.datePicketFormat"
            />
          </n-form-item>
        </div>
        <!-- FXSH (turi 2): tashkilot shu top-box ichida, "Ishga chiqish sanasi"dan
             keyin (2-qadamdan ko'chirildi). Boshqa turlarda ko'rinmaydi. -->
        <div class="col-span-12 md:col-span-6" v-if="store.payload.type === 2">
          <n-form-item :label="$t(`documentPage.form.organization`)" path="organization_id">
            <UISelect
              :multiple="false"
              :auto-select="true"
              :checkedVal="store.structureCheck"
              :loading="componentStore.structureLoading"
              :options="componentStore.structureList"
              :modelV="store.payload.organization_id"
              @updateModel="onChangeStructure"
              @updateCheck="(v) => (store.structureCheck = v)"
              @onSearch="componentStore._structures"
              v-model:search="componentStore.structureParams.search"
            />
          </n-form-item>
        </div>
        <template v-if="showVacationDay">
          <div class="col-span-12 md:col-span-6 lg:col-span-3">
            <n-form-item
              :label="$t(`documentPage.form.vacation_main_day`)"
              path="vacation_main_day"
            >
              <n-input
                class="w-full"
                type="text"
                v-model:value="store.payload.vacation_main_day"
                :allow-input="Utils.onlyAllowNumber"
              />
            </n-form-item>
          </div>
          <div class="col-span-12 md:col-span-6 lg:col-span-3">
            <n-form-item
              :label="$t(`documentPage.form.additional_vacation_day`)"
              path="additional_vacation_day"
            >
              <n-input
                class="w-full"
                type="text"
                v-model:value="store.payload.additional_vacation_day"
                :allow-input="Utils.onlyAllowNumber"
              />
            </n-form-item>
          </div>
        </template>

        <!-- Sinov muddati + ish jadvali — mehnat shartnomasiga xos; FXSH (turi 2)
             uchun so'ralmaydi (fuqarolik-huquqiy shartnomada ular yo'q). -->
        <template v-if="store.payload.type !== 2">
        <div class="col-span-12 md:col-span-6 lg:col-span-3">
          <n-form-item :label="$t(`documentPage.form.probation`)" path="probation">
            <n-select
              v-model:value="store.payload.probation"
              filterable
              :options="componentStore.probationList"
              label-field="name"
              value-field="id"
              :loading="componentStore.enumLoading"
              clearable
            />
          </n-form-item>
        </div>
        <div class="col-span-12 md:col-span-6 lg:col-span-3">
          <n-form-item :label="$t(`documentPage.form.schedule_id`)" path="schedule_id">
            <n-select
              v-model:value="store.payload.schedule_id"
              filterable
              :options="componentStore.scheduleList"
              value-field="id"
              :loading="componentStore.scheduleLoading"
              :render-label="UIHelper.scheduleRender.label"
              :render-tag="UIHelper.scheduleRender.value"
              clearable
            />
          </n-form-item>
        </div>
        </template>
      </div>
    </div>

    <div class="col-span-12 mt-10">
      <n-form-item :label="$t(`documentPage.form.director`)" path="director_id">
        <n-select
          size="large"
          v-model:value="store.payload.director_id"
          :options="componentStore.confirmationList"
          :loading="componentStore.confirmationLoading"
          :render-label="renderLabel"
          :render-tag="renderValue"
          label-field="last_name"
          value-field="id"
        />
      </n-form-item>
    </div>
  </div>
</template>
