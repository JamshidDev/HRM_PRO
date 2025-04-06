<script setup>
import validationRules from "@/utils/validationRules.js";
import {useComponentStore, useTopicExamStore} from "@/store/modules/index.js";
import {useRoute} from "vue-router";
import {NButton, NFormItem, NInputNumber, NTooltip} from "naive-ui";
import i18n from "@/i18n/index.js"

const t = i18n.global.t

const formRef = ref(null)
const store = useTopicExamStore()
const componentStore = useComponentStore()
const route = useRoute()

const onSubmit = () => {
  formRef.value?.validate((error) => {
    if (!error) {
      if (store.attachCategoryVisibleType) {
        store._attach_category()
      }
    }
  })
}


const renderSourceTransferLabel = (option) => {
  return h('div', {}, [
    h('span', {class: 'mr-2'}, option.option.label),
    h(NTooltip, {}, {
      default: () => t('categoryPage.questionCount'),
      trigger: () => h(NButton, {
        size: 'tiny',
        tertiary: true,
        circle: true,
      }, () => h('span', {
        class: 'font-bold',
      }, option.option.total))
    })
  ])
}

const renderTargetTransferLabel = (option) => {
  console.log(option)
  return h('div', {
        class: "flex justify-between items-center pr-2"
      },
      [
        h('span', {}, option.option.label),
        h(NFormItem, {
              showLabel: false,
              showFeedback: false
            },
            () => h(NInputNumber, {
              'onUpdate:value': (v)=>{
                store.categoryPayload.categories = store.categoryPayload.categories.map(i=>{
                  if(i.exam_category_id === option.option.value) return {
                    ...i,
                    count: v
                  }
                  return i
                })
              },
              style: "width: 80px",
              size: "small",
              placeholder: '',
              defaultValue: (()=>store.categoryPayload.categories.find(i=>i.exam_category_id===option.option.value)?.count)(),
              min: 0,
              max: option.option.total
            }))
      ]
  )
}


onMounted(() => {
  store.topicId = route.params.id
  componentStore._examCategory()
})

const transferOptions = computed(() => componentStore.examCategoryList.map(i => ({
  label: i.name,
  value: i.id,
  total: i.questions_count
})))

const updateCategoryIds = (newVal) => {
  let payload = store.categoryPayload.categories
  payload = payload.filter(i => {
    if (newVal.includes(i.exam_category_id)) {
      newVal = newVal.filter(k => k !== i.exam_category_id)
      return true
    }
    return false
  })
  newVal.forEach(i => {
    payload.push({
      exam_category_id: i,
      count: 0
    })
  })
  store.categoryPayload.categories = payload
}

</script>

<template>
  <n-spin :show="componentStore.examCategoryLoading || store.categoryLoading">
    <n-form
        ref="formRef"
        :model="store.questionPayload"
        :rules="validationRules.common"
    >
      <div style="min-height:calc(100vh - 120px)">
        <n-form-item>
          <n-transfer
              v-model:value="store.categoryPayload.category_ids"
              :options="transferOptions"
              :render-source-label="renderSourceTransferLabel"
              :render-target-label="renderTargetTransferLabel"
              source-filterable
              @update:value="updateCategoryIds"
          >
          </n-transfer>
        </n-form-item>
      </div>
      <div class="grid grid-cols-2 gap-2">
        <n-button ghost type="error" @click="store.openVisible(false)">
          {{ $t('content.cancel') }}
        </n-button>
        <n-button
            :loading="store.saveLoading"
            type="primary"
            @click="onSubmit">
          {{ $t('content.save') }}
        </n-button>
      </div>
    </n-form>
  </n-spin>
</template>

<style scoped>

</style>