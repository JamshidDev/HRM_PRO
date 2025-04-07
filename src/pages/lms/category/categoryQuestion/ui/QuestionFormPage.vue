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

const goBack = ()=>{
  router.push({
    name: 'category_question',
    params: {
      category_id: store.category_id
    }
  })
}

const onSubmit = () => {
  formRef.value?.validate((error) => {
    if (!error) {
      if(!store.isModeEdit){
        store._create()
      }else{
        store._update(goBack)
      }
    }else{
      let message = ''
      error.forEach(i=>{
        message+=(i.map(j=>j.message).join('\n')+'\n')
      })
      $Toast.error(message)
    }
  })
}


onMounted(()=>{
  store.resetForm()
  store.category_id = route.params.category_id
  if(route.params.question_id){
    store.elementId = route.params.question_id
    store.isModeEdit = true
    store._show()
  }
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
          @click="goBack"
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
              return (store.payload.options.length<3) ? new Error( $t('questionPage.rules.minOptions')) : true
            },
          }]"
          path="ques"
          show-toolbar
          with-validation
          :showValidationMessage="false"
      />

    </div>
    <n-form-item :rule="[{
      trigger: ['input'],
      validator() {
        let check = false
        store.payload.options.forEach(i=>{
          if(i.is_correct){
            check = true
          }
        })
        return (store.payload.options.length>2 && !check) ? new Error( $t('questionPage.rules.chooseCorrectAnswer')) : true
      },
    }]" path="correct_option"
      :show-feedback="false"
    >
      <div class="w-full">
        <template v-for="(option, idx) in store.payload.options" :key="idx">
          <div class="flex gap-2 bg-white my-2 px-2 pb-2 rounded-lg">
            <n-radio
                @click="()=>{
                  store.payload.options.forEach(i=>{
                    i.is_correct=false
                  })
                  store.payload.options[idx].is_correct=true
                }"
                :checked="option.is_correct"
                class="mt-4"></n-radio>
            <div class="grow">
              <OptionEditor
                  :placeholder="$t('questionPage.form.enterOption')"
                  v-model:text="option.text"
                  :path="`${idx}.text`"
                  with-validation
                  @on-remove="store.removeOption(idx)"
              />
            </div>
          </div>
        </template>
      </div>
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