<script setup>
  import { UISelect } from '@/components/index.js'
  import validationRules from '@/utils/validationRules.js'
  const formRef = ref(null)
  import { useTopicStore, useComponentStore } from '@/store/modules/index.js'

  const store = useTopicStore()
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
    componentStore._enumExam()
    // componentStore._structures()
    if (componentStore.structureList.length === 0) {
      componentStore._structures()
    }
  })

  // Saqlash tugmasi modal footer'ida (TopicPage.vue) turadi.
  defineExpose({ submit: onSubmit })
</script>

<template>
  <n-spin :show="store.showLoading">
    <n-form
      ref="formRef"
      :rules="validationRules.topicPage"
      :model="store.payload"
      class="grid grid-cols-12 gap-x-4"
    >
      <n-form-item class="col-span-12 md:col-span-6" :label="$t(`content.name`)" path="name">
        <n-input
          type="text"
          v-model:value="store.payload.name"
          :placeholder="$t('content.enterField')"
        />
      </n-form-item>
      <n-form-item class="col-span-12 md:col-span-6" :label="$t(`content.type`)" path="type">
        <n-select
          v-model:value="store.payload.type"
          filterable
          :options="componentStore.topicTypes"
          label-field="name"
          value-field="id"
          :placeholder="$t('content.choose')"
          :loading="componentStore.enumExamLoading"
        />
      </n-form-item>
      <n-form-item
        class="col-span-12 md:col-span-6"
        :label="$t(`content.workplace`)"
        path="organizations"
      >
        <UISelect
          :options="componentStore.structureList"
          :modelV="store.payload.organizations"
          @defaultValue="(v) => (store.payload.organizations = v)"
          @updateModel="(v) => (store.payload.organizations = v)"
          v-model:search="componentStore.structureParams.search"
          @onSearch="componentStore._structures"
          :checkedVal="store.structureCheck"
          @updateCheck="(v) => (store.structureCheck = v)"
          :loading="componentStore.structureLoading"
        />
      </n-form-item>
    </n-form>
  </n-spin>
</template>
