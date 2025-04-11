<script setup>
import {useCategoryQuestionStore} from "@/store/modules";
import {UIEditor} from "@/components/index.js";
import OptionEditor from './OptionEditor.vue'
import {AddCircle20Filled, Save20Filled} from "@vicons/fluent";
import validationRules from "@/utils/validationRules.js";

const store = useCategoryQuestionStore()
const formRef = ref(null)

const onSubmit = () => {

  formRef.value?.validate((error) => {
    if (!error) {
      if (store.visibleType) {
        store._create()
      } else {
        store._update()
      }
    } else {
      let message = ''
      error.forEach(i => {
        message += (i.map(j => j.message).join('\n') + '\n')
      })
      $Toast.error(message)
    }
  })
}


onMounted(() => {
  store.resetForm()
})

</script>
<template>
  <n-spin class="w-full" :show="store.showLoading">
    <n-form
        ref="formRef"
        :model="store.payload"
        :rules="validationRules.common"
    >
      <UIEditor
          :placeholder="$t('questionPage.form.enterQuestion')"
          v-model:text="store.payload.ques"
          :extra-rules="[{
              trigger: ['input', 'blur'],
              validator() {
                return (store.payload.options.length<3) ? new Error( $t('questionPage.rules.minOptions')) : true
              }
            }]"
          path="ques"
          show-toolbar
          with-validation
          :showValidationMessage="false"
      />
      <div class=" my-4">


          <div class="w-full flex flex-col gap-3 min-h-[400px] max-h-[400px] overflow-auto p-1">
            <template v-for="(option, idx) in store.payload.options" :key="idx">
              <div
                  class="flex gap-2 bg-surface-section rounded-sm pl-2"
                  style="box-shadow: rgba(0, 0, 0, 0.16) 0 1px 4px;">
                <n-radio
                    @click="()=>{
                    store.payload.options.forEach(i=>{
                      i.is_correct=false
                    })
                    store.payload.options[idx].is_correct=true
                  }"
                    :checked="option.is_correct"
                    class="mt-4"/>
                <div class="grow">
                  <OptionEditor
                      :placeholder="$t('questionPage.form.enterOption')"
                      v-model:text="option.text"
                      :path="`${idx}.text`"
                      @on-remove="store.removeOption(idx)"
                  />
                </div>
              </div>
            </template>
          </div>

      </div>

      <n-space justify="end">
        <n-button
            icon-placement="right"
            tertiary
            type="primary"
            @click="store.addOption()"
            :disabled="store.payload.options.length > 5"
        >
          {{ $t('questionPage.form.addOption') }}
          <template #icon>
            <AddCircle20Filled/>
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
    </n-form>
  </n-spin>
</template>
<style lang="scss" scoped>
:deep(.n-radio__label) {
  flex-grow: 1;
}
</style>