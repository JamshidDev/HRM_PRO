<script setup>
  import validationRules from '@/utils/validationRules.js'
  import { useComponentStore, useTopicExamStore } from '@/store/modules/index.js'
  import { SuperSelect, UINSelect } from '@/components/index.js'

  const formRef = ref(null)
  const store = useTopicExamStore()
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
    if (componentStore.topicWhomList.length === 0) {
      componentStore._enumExam()
    }
  })

  const onChange = () => {
    store.payload.whom_ids = []
    if (store.payload.whom === 2) {
      store._position()
    } else if (store.payload.whom === 3) {
      store._workers()
    }
  }

  let timer = null
  const onSearch = (v) => {
    if (v?.toString().length === 17) {
      clearTimeout(timer)
      timer = setTimeout(() => {
        let pin = v.split('-').join('')
        store._checkWorker(pin)
      }, 600)
    }
  }

  const onScrollEv = () => {
    store.workerParams.page += 1
    store._workers(true)
  }

  // Saqlash tugmasi modal footer'ida (TopicDetailPage.vue) turadi.
  defineExpose({ submit: onSubmit })
</script>

<template>
  <n-spin :show="store.showLoading">
    <n-form
      ref="formRef"
      :rules="validationRules.common"
      :model="store.payload"
      class="grid grid-cols-12 gap-x-4"
    >
      <n-form-item
        class="col-span-12 md:col-span-6"
        :label="$t(`content.name`)"
        path="name"
        rule-path="requiredStringField"
      >
        <n-input type="text" v-model:value="store.payload.name" />
      </n-form-item>

      <n-form-item
        class="col-span-12 md:col-span-6"
        :label="$t(`topicDetailsPage.exams.deadline`)"
        path="deadline"
        rule-path="requiredDateTimeField"
      >
        <n-date-picker
          class="w-full"
          v-model:value="store.payload.deadline"
          type="datetime"
          update-value-on-close
          :actions="null"
          clearable
        />
      </n-form-item>

      <n-form-item
        class="col-span-6 md:col-span-3"
        path="tests_count"
        rule-path="requiredNumberField"
        :label="$t(`topicDetailsPage.exams.tests_count`)"
      >
        <n-input-number class="w-full" :min="1" v-model:value="store.payload.tests_count" />
      </n-form-item>
      <n-form-item
        class="col-span-6 md:col-span-3"
        path="variant"
        rule-path="requiredNumberField"
        :label="$t(`topicDetailsPage.exams.variants`)"
      >
        <n-input-number class="w-full" :min="1" v-model:value="store.payload.variant" />
      </n-form-item>
      <n-form-item
        class="col-span-6 md:col-span-3"
        path="chances"
        rule-path="requiredNumberField"
        :label="$t(`topicDetailsPage.exams.chances`)"
      >
        <n-input-number :min="1" class="w-full" v-model:value="store.payload.chances" />
      </n-form-item>
      <n-form-item
        class="col-span-6 md:col-span-3"
        path="minute"
        rule-path="requiredNumberField"
        :label="$t(`topicDetailsPage.exams.minute`)"
      >
        <n-input-number :min="1" class="w-full" v-model:value="store.payload.minute" />
      </n-form-item>

      <n-form-item
        class="col-span-12 md:col-span-6"
        :label="$t(`topicDetailsPage.exams.toWhom`)"
        path="whom"
        rule-path="requiredNumberField"
      >
        <n-select
          v-model:value="store.payload.whom"
          filterable
          @update:value="onChange"
          :options="componentStore.topicWhomList"
          label-field="name"
          value-field="id"
          :loading="componentStore.enumExamLoading"
        >
        </n-select>
      </n-form-item>
      <n-form-item
        class="col-span-12 md:col-span-6"
        v-if="store.payload.whom === 2"
        :label="$t(`topicDetailsPage.exams.positions`)"
        path="whom_ids"
        rule-path="requiredMultiSelectField"
      >
        <UINSelect
          multiple
          v-model:value="store.payload.whom_ids"
          :options="store.positionList"
          :loading="store.positionLoading"
          :max-tag-count="1"
          value-field="id"
        />
      </n-form-item>
      <n-form-item
        class="col-span-12 md:col-span-6"
        v-else-if="store.payload.whom === 3"
        :label="$t(`topicDetailsPage.exams.workers`)"
        path="whom_ids"
        rule-path="requiredMultiSelectField"
      >
        <SuperSelect
          multiple
          :options="store.workerList"
          :loading="store.workerLoading"
          :total-count="store.totalWorker"
          :per-page="store.workerParams.per_page"
          v-model:value="store.payload.whom_ids"
          v-model:search="store.workerParams.search"
          @onSearch="store.onSearchWorker"
          @onScrollEv="onScrollEv"
        />
      </n-form-item>
      <n-form-item
        class="col-span-12 md:col-span-6"
        v-else-if="store.payload.whom === 5"
        :label="$t(`topicDetailsPage.exams.workers`)"
        path="whom_ids"
        rule-path="requiredMultiSelectField"
      >
        <UINSelect
          v-model:value="store.payload.whom_ids"
          value-field="id"
          :loading="store.checkWorkerLoading"
          :query="store.workerPin"
          :options="store.checkedWorkers"
          @onSearch="onSearch"
          multiple
          pin-select
        />
      </n-form-item>

      <n-form-item class="col-span-12" :label="$t(`topicDetailsPage.exams.camera`)" path="camera">
        <n-switch v-model:value="store.payload.camera" />
      </n-form-item>
      <n-form-item class="col-span-12" :label="$t(`content.description`)" path="description">
        <n-input type="textarea" v-model:value="store.payload.description" />
      </n-form-item>
    </n-form>
  </n-spin>
</template>
