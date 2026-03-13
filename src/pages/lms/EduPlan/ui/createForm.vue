<script setup>
  import validationRules from '@/utils/validationRules.js'
  import { useEduPlanStore, useComponentStore } from '@/store/modules/index.js'
  import { useAppSetting } from '@/utils/index.js'
  import { SuperSelect } from '@components'

  const formRef = ref(null)
  const store = useEduPlanStore()
  const componentStore = useComponentStore()

  const onSubmit = () => {
    formRef.value?.validate((error) => {
      if (!error) {
        store.saveLoading = true
        if (store.visibleType) {
          store._create()
        } else {
          store._update()
        }
      }
    })
  }

  onMounted(() => {
    store.specializationsParams.page = 1
    store.specializationsParams.search = null
    store.subjectsParams.page = 1
    store.subjectsParams.search = null

    store._specializations()
    store._subjects()

    if (componentStore.lmsLearningCenters.length === 0) {
      componentStore._lmsLearningCenter()
    }

    if (componentStore.lmsEnumTypes.length === 0) {
      componentStore._lmsEnum()
    }
  })
</script>

<template>
  <n-form
    class="h-[calc(100vh-120px)]"
    ref="formRef"
    :rules="validationRules.common"
    :model="store.payload"
  >
    <div class="grid grid-cols-12 gap-x-4">
      <n-form-item
        class="col-span-12"
        :label="$t(`content.name`)"
        path="name"
        rule-path="requiredStringField"
      >
        <n-input type="text" v-model:value="store.payload.name" />
      </n-form-item>
      <n-form-item
        class="col-span-12"
        :label="$t(`content.type`)"
        path="type"
        rule-path="requiredNumberField"
      >
        <n-select
          v-model:value="store.payload.type"
          :options="componentStore.lmsEnumTypes"
          :loading="componentStore.lmsEnumLoading"
          label-field="name"
          value-field="id"
          filterable
        />
      </n-form-item>
      <n-form-item
        class="col-span-12"
        :label="$t(`eduPlanPage.form.learning_center`)"
        path="learning_center_id"
        rule-path="requiredNumberField"
      >
        <n-select
          v-model:value="store.payload.learning_center_id"
          :options="componentStore.lmsLearningCenters"
          :loading="componentStore.lmsLearningCenterLoading"
          label-field="name"
          value-field="id"
          filterable
        />
      </n-form-item>
      <n-form-item
        class="col-span-12"
        :label="$t(`eduPlanPage.form.specialization`)"
        path="specialization_id"
        rule-path="requiredNumberField"
      >
        <n-select
          v-model:value="store.payload.specialization_id"
          @scroll="store.onScrollSpecializations"
          :options="store.specializations"
          :loading="store.specializationsLoading"
          label-field="name"
          value-field="id"
          filterable
          :filter="() => true"
          @search="store.onSearchSpecializations"
          :max-tag-count="1"
        />
      </n-form-item>
      <n-form-item
        class="col-span-12"
        :label="$t(`eduPlanPage.form.subjects`)"
        path="subjects"
        rule-path="requiredMultiSelectField"
      >
        <n-select
          v-model:value="store.payload.subjects"
          multiple
          @scroll="store.onScrollSubjects"
          :options="store.subjects"
          :loading="store.subjectsLoading"
          label-field="name"
          value-field="id"
          filterable
          :filter="() => true"
          :max-tag-count="1"
          @search="store.onSearchSubjects"
        />
      </n-form-item>
      <n-form-item
        class="col-span-6"
        :label="$t(`eduPlanPage.form.start_date`)"
        path="start_date"
        rule-path="requiredNumberField"
      >
        <n-date-picker
          class="w-full"
          v-model:value="store.payload.start_date"
          type="date"
          :format="useAppSetting.datePicketFormat"
        />
      </n-form-item>

      <n-form-item
        class="col-span-6"
        :label="$t(`eduPlanPage.form.hours`)"
        path="hours"
        rule-path="requiredNumberField"
      >
        <n-input-number class="w-full" min="1" v-model:value="store.payload.hours" />
      </n-form-item>
      <n-form-item
        class="col-span-6"
        :label="$t(`eduPlanPage.form.count_groups`)"
        path="count_groups"
        rule-path="requiredNumberField"
      >
        <n-input-number class="w-full" min="1" v-model:value="store.payload.count_groups" />
      </n-form-item>
      <n-form-item
        class="col-span-6"
        :label="$t(`eduPlanPage.form.count_workers`)"
        path="count_workers"
        rule-path="requiredNumberField"
      >
        <n-input-number class="w-full" min="1" v-model:value="store.payload.count_workers" />
      </n-form-item>
      <n-form-item
        class="col-span-12"
        :label="$t(`eduPlanPage.form.serial`)"
        path="serial"
        rule-path="requiredNumberField"
      >
        <n-select
          v-model:value="store.payload.serial"
          @scroll="store.onScrollSpecializations"
          :options="componentStore.lmsSerials"
          :loading="componentStore.lmsEnumLoading"
          label-field="name"
          value-field="id"
          filterable
        />
      </n-form-item>
      <n-form-item class="col-span-12" :label="$t(`eduPlanPage.form.end_date`)">
        <n-date-picker
          class="w-full"
          v-model:value="store.payload.end_date"
          type="date"
          :format="useAppSetting.datePicketFormat"
        />
      </n-form-item>
    </div>
  </n-form>
  <div class="grid grid-cols-2 gap-2">
    <n-button @click="store.openVisible(false)" type="error" ghost>
      {{ $t('content.cancel') }}
    </n-button>
    <n-button @click="onSubmit" :loading="store.saveLoading" type="primary">
      {{ $t('content.save') }}
    </n-button>
  </div>
</template>
