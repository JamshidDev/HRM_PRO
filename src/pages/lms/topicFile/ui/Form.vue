<script setup>
import {useComponentStore, useTopicFileStore} from "@/store/modules/index.js";
import validationRules from "@/utils/validationRules.js";

import {
  Call28Regular,
  Eye24Regular,
  EyeOff20Filled,
  LockClosed16Regular,
  Password20Regular,
  Person24Regular
} from "@vicons/fluent";
import {AppPaths} from "@/utils/index.js";

const formRef = ref(null)
const store = useTopicFileStore()
const componentStore = useComponentStore()

onMounted(()=>{
  componentStore._enumExam()
})

const onSubmit = ()=>{

}

</script>
<template>
  <n-form
      ref="formRef"
      :rules="validationRules.topicFilePage"
      :model="store.payload"
      class="h-full flex flex-col"
  >
    <n-form-item :label="$t(`content.file`)" path="requiredField">
      <n-select
          v-model:value="store.params.description"
          :options="componentStore.topicFileTypes"
          label-field="name"
          :loading="componentStore.enumExamLoading"
          value-field="id"
          :placeholder="$t('content.choose')"
          clearable
      />
<!--      <n-input-->
<!--          size="large"-->
<!--          name="firstName"-->
<!--          id="firstName"-->
<!--          type="text"-->
<!--          :placeholder="$t(`registerPage.firstName`)"-->
<!--          v-model:value="store.payload.first_name"-->
<!--      >-->
<!--        <template #prefix>-->
<!--          <n-icon size="24" :component="Person24Regular" />-->
<!--        </template>-->
<!--      </n-input>-->
    </n-form-item>
    <div class="grid grid-cols-2 gap-2 mt-auto">
      <n-button @click="store.openVisible(false)" type="error" ghost>
        {{ $t('content.cancel') }}
      </n-button>
      <n-button
          @click="onSubmit"
          :loading="store.saveLoading"
          type="primary">
        {{ $t('content.save') }}
      </n-button>
    </div>
  </n-form>
</template>