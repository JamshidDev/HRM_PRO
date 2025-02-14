<script setup>

import {useCategoryQuestionStore} from "@/store/modules";
import {UIEditor} from "@/components/index.js";
import OptionEditor from './OptionEditor.vue'
import {AddCircle20Filled, ClipboardTaskListRtl20Filled, DismissCircle20Filled, Save20Filled} from "@vicons/fluent";
import validationRules from "@/utils/validationRules.js";
import {useRoute, useRouter} from "vue-router";
import {AppPaths} from "@/utils/index.js";

const store = useCategoryQuestionStore()
const formRef = ref(null)
const route = useRoute()
const router = useRouter()

const onSubmit = () => {
  formRef.value?.validate((error) => {
    if (!error) {
      store._create()
    }
  })
}

const onCancel = ()=>{
  router.push(`${route.fullPath.replace(AppPaths.Create, '')}`)
}

onMounted(()=>{
  store.category_id = route.params.category_id
})

</script>
<template>
  <n-form
      ref="formRef"
      :model="store.payload"
      :rules="validationRules.common"
      class="mx-2 mt-4 mb-4 rounded p-4 border border-surface-line"
  >
    <n-space justify="end">
      <n-button
          icon-placement="right"
          type="error"
          @click="onCancel"
      >
        {{ $t('content.cancel') }}
        <template #icon>
          <DismissCircle20Filled/>
        </template>
      </n-button>
      <n-button
          icon-placement="right"
          type="primary"
          @click="onSubmit"
          :loading="store.saveLoading"
      >
        {{ $t('content.save') }}
        <template #icon>
          <Save20Filled/>
        </template>
      </n-button>
    </n-space>
    <div class="rounded-lg">
      <UIEditor
          :placeholder="$t('questionPage.form.enterQuestion')"
          v-model:text="store.payload.ques"
          :extra-rules="[{
            trigger: ['input', 'blur'],
            validator() {
              return (store.payload.options.length<2) ? new Error( $t('questionPage.rules.minOptions')) : true
            },
          }]"
          path="ques"
          show-toolbar
          with-validation
      />

    </div>
    <n-form-item :rule="[{
      trigger: ['input'],
      validator() {
        return (store.payload.correct_option===null && store.payload.options.length>1) ? new Error( $t('questionPage.rules.chooseCorrectAnswer')) : true
      },
    }]" path="correct_option">
      <n-radio-group v-model:value="store.payload.correct_option" class="w-full">
        <template v-for="(option, idx) in store.payload.options" :key="idx">
          <div class="flex gap-2 bg-white my-2 px-2 pb-2 rounded-lg">
            <n-radio :value="idx" class="mt-4"></n-radio>
            <div class="grow">
              <OptionEditor
                  :placeholder="$t('questionPage.form.enterOption')"
                  :model-value="option"
                  :path="`${idx}`"
                  with-validation
                  @update:model-value="(v)=>{
                    store.payload.options[idx]=v
                  }"
                  @on-remove="store.removeOption(idx)"
              />
            </div>
          </div>
        </template>
      </n-radio-group>
    </n-form-item>


    <n-space justify="end">
      <n-button
          icon-placement="right"
          tertiary
          type="primary"
          @click="store.addOption()"
      >
        {{ $t('questionPage.form.addOption') }}
        <template #icon>
          <AddCircle20Filled/>
        </template>
      </n-button>
    </n-space>
  </n-form>
</template>
<style lang="scss" scoped>
:deep(.n-radio__label) {
  flex-grow: 1;
}
</style>