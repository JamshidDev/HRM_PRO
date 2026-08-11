<script setup>
  import validationRules from '@/utils/validationRules.js'
  import { useTeacherStore, useComponentStore } from '@/store/modules/index.js'
  import { UINSelect } from '@/components/index.js'

  const formRef = ref(null)
  const store = useTeacherStore()
  const componentSore = useComponentStore()

  const onSubmit = () => {
    formRef.value?.validate((error) => {
      if (!error) {
        store.saveLoading = true
        store._create()
      }
    })
  }

  onMounted(() => {
    if (componentSore.lmsLearningCenters.length === 0) {
      componentSore._lmsLearningCenter()
    }
    if (store.subjects.length === 0) {
      store._subjects()
    }
  })

  let timer = null
  const onSearch = (v) => {
    if (v?.toString().length === 17) {
      store.payload.worker_id = null
      clearTimeout(timer)
      timer = setTimeout(() => {
        let pin = v.split('-').join('')
        componentSore._searchWorkerByPin(pin)
      }, 1000)
    }
  }

  defineExpose({ submit: onSubmit })
</script>

<template>
  <n-form ref="formRef" :rules="validationRules.common" :model="store.payload">
    <n-form-item
      :label="$t(`teacherPage.form.worker`)"
      path="worker_id"
      rule-path="requiredNumberField"
    >
      <UINSelect
        :query="store.searchQuery"
        v-model:value="store.payload.worker_id"
        :options="componentSore.workerPinList"
        value-field="id"
        :pin-select="true"
        :loading="componentSore.workerPinLoading"
        @onSearch="onSearch"
      />
    </n-form-item>
    <n-form-item
      :label="$t(`learningCenterPage.name`)"
      path="learning_center_id"
      rule-path="requiredNumberField"
    >
      <n-select
        v-model:value="store.payload.learning_center_id"
        :options="componentSore.lmsLearningCenters"
        :loading="componentSore.lmsLearningCenterLoading"
        label-field="name"
        value-field="id"
        filterable
        clearable
      />
    </n-form-item>

    <n-form-item
      :label="$t(`teacherPage.form.subjects`)"
      path="subjects"
      rule-path="requiredMultiSelectField"
    >
      <n-select
        v-model:value="store.payload.subjects"
        multiple
        :options="store.subjects"
        :loading="store.subjectsLoading"
        label-field="name"
        value-field="id"
        filterable
      />
    </n-form-item>
  </n-form>
</template>
