<script setup>
  import { UINSelect, UISelect } from '@/components/index.js'
  import validationRules from '@/utils/validationRules.js'
  import { useLmsWorkerStore, useComponentStore } from '@/store/modules/index.js'
  import UIHelper from '@/utils/UIHelper.js'

  const formRef = ref(null)
  const store = useLmsWorkerStore()
  const componentStore = useComponentStore()

  const onSubmit = () => {
    formRef.value?.validate((error) => {
      if (!error) {
        store.saveLoading = true
        const data = {
          ...store.payload,
          organizations: undefined
        }
        store._create(data)
      }
    })
  }

  const onChange = () => {
    store.payload.worker_position_ids = []
    store.workerParams.page = 1
    if (!store.payload.edu_plan_id) return
    store._workers()
  }

  const onSearch = (v) => {
    store.workerParams.search = v
    store.workerParams.page = 1
    store._workers()
  }

  const onChangeOrg = (v) => {
    store.payload.organizations = v
    store.payload.worker_position_ids = []
    store.workerParams.page = 1
    if (!store.payload.organizations.length === 0) return
    store._workers()
  }

  const onScrollWorkers = () => {
    store.workerParams.page += 1
    store._workers(true)
  }

  onMounted(() => {
    if (store.eduPlanList.length === 0) {
      store._eduPlans()
    }
    if (componentStore.structureList.length === 0) {
      componentStore._structures()
    }
  })
</script>

<template>
  <n-form ref="formRef" :rules="validationRules.common" :model="store.payload">
    <div style="min-height: calc(100vh - 120px)">
      <n-form-item
        :label="$t(`lmsWorkerPage.form.eduPlan`)"
        path="edu_plan_id"
        rule-path="requiredNumberField"
      >
        <n-select
          v-model:value="store.payload.edu_plan_id"
          :options="store.eduPlanList"
          :loading="store.eduPlanLoading"
          label-field="name"
          value-field="id"
          filterable
          clearable
          :render-label="UIHelper.selectRender.label"
          :render-tag="UIHelper.selectRender.value"
          @update:value="onChange"
        />
      </n-form-item>
      <n-form-item
        :label="$t(`content.organization`)"
        path="edu_plan_id"
        rule-path="requiredNumberField"
      >
        <UISelect
          :options="componentStore.structureList"
          :modelV="store.payload.organizations"
          @defaultValue="(v) => (store.payload.organizations = v)"
          @updateModel="onChangeOrg"
          :checkedVal="store.structureCheck"
          @updateCheck="(v) => (store.structureCheck = v)"
          :loading="componentStore.structureLoading"
          v-model:search="componentStore.structureParams.search"
          @onSearch="componentStore._structures"
        />
      </n-form-item>
      <n-form-item
        :label="$t(`lmsWorkerPage.form.worker_position_ids`)"
        path="worker_position_ids"
        rule-path="requiredMultiSelectField"
      >
        <UINSelect
          :disabled="!store.payload.edu_plan_id || store.payload.organizations.length === 0"
          :multiple="true"
          :query="store.workerParams.search"
          v-model:value="store.payload.worker_position_ids"
          :value-field="'id'"
          :options="store.workerList"
          :loading="store.workerLoading"
          :total-count="store.totalWorker"
          @onSearch="onSearch"
          @onScrollEv="onScrollWorkers"
        />
      </n-form-item>
    </div>

    <div class="grid grid-cols-2 gap-2">
      <n-button @click="store.openVisible(false)" type="error" ghost>
        {{ $t('content.cancel') }}
      </n-button>
      <n-button @click="onSubmit" :loading="store.saveLoading" type="primary">
        {{ $t('content.save') }}
      </n-button>
    </div>
  </n-form>
</template>
