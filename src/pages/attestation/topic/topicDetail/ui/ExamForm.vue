<script setup>
  import validationRules from '@/utils/validationRules.js'
  import i18n from '@/i18n/index.js'
  import { useComponentStore, useTopicExamStore } from '@/store/modules/index.js'
  import { Add16Regular, Delete20Regular } from '@vicons/fluent'

  // Muddat, «kimlarga», urinishlar va holat — katta imtihon (mavzu) darajasida.
  const { t } = i18n.global
  const formRef = ref(null)
  const store = useTopicExamStore()
  const componentStore = useComponentStore()

  // Savollar tili — ilova tillari bilan bir xil.
  const LANGUAGES = ['uz', 'uz_new', 'uz_kr', 'ru', 'kaa', 'en']
  const languageOptions = computed(() =>
    LANGUAGES.map((value) => ({ value, label: t(`examLanguages.${value}`) }))
  )

  // Savollar to'plamlari: tanlangan to'plam boshqa qatorda qayta chiqmaydi.
  const categoryOptions = (row) => {
    const used = new Set(store.payload.questions.map((q) => q.exam_category_id))
    return componentStore.examCategoryList.map((c) => ({
      value: c.id,
      label: `${c.name} (${c.questions_count ?? 0})`,
      disabled: used.has(c.id) && c.id !== row.exam_category_id
    }))
  }
  const maxOf = (id) =>
    componentStore.examCategoryList.find((c) => c.id === id)?.questions_count ?? 1
  const questionsSum = computed(() =>
    store.payload.questions.reduce((acc, q) => acc + (Number(q.count) || 0), 0)
  )
  const sumMatches = computed(() => questionsSum.value === Number(store.payload.tests_count))
  const addSet = () => store.payload.questions.push({ exam_category_id: null, count: 1 })
  const removeSet = (idx) => store.payload.questions.splice(idx, 1)

  const rules = {
    ...validationRules.common,
    questions: {
      trigger: ['change', 'input'],
      validator: () =>
        (store.payload.questions.length > 0 && sumMatches.value) ||
        new Error(t('topicDetailsPage.exams.questionsSumError'))
    }
  }

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
    componentStore._examCategory()
  })

  // Saqlash tugmasi modal footer'ida (TopicDetailPage.vue) turadi.
  defineExpose({ submit: onSubmit })
</script>

<template>
  <n-spin :show="store.showLoading">
    <n-form ref="formRef" :rules="rules" :model="store.payload" class="grid grid-cols-12 gap-x-4">
      <n-form-item
        class="col-span-12 md:col-span-6"
        :label="$t('topicDetailsPage.exams.language')"
        path="language"
        rule-path="requiredStringField"
      >
        <n-select
          v-model:value="store.payload.language"
          :options="languageOptions"
          :placeholder="$t('content.choose')"
        />
      </n-form-item>
      <n-form-item
        class="col-span-12 md:col-span-6"
        :label="$t('topicDetailsPage.exams.time')"
        :show-feedback="false"
      >
        <div class="w-full flex items-center gap-3">
          <n-input-number
            class="flex-1"
            :min="1"
            :disabled="store.payload.unlimited"
            v-model:value="store.payload.minute"
          >
            <template #suffix>{{ $t('topicDetailsPage.exams.minuteShort') }}</template>
          </n-input-number>
          <n-checkbox v-model:checked="store.payload.unlimited">
            {{ $t('topicDetailsPage.exams.unlimited') }}
          </n-checkbox>
        </div>
      </n-form-item>

      <n-form-item
        class="col-span-6"
        path="tests_count"
        rule-path="requiredNumberField"
        :label="$t(`topicDetailsPage.exams.tests_count`)"
      >
        <n-input-number class="w-full" :min="1" v-model:value="store.payload.tests_count" />
      </n-form-item>
      <n-form-item
        class="col-span-6"
        path="variant"
        rule-path="requiredNumberField"
        :label="$t(`topicDetailsPage.exams.variants`)"
      >
        <n-input-number class="w-full" :min="1" v-model:value="store.payload.variant" />
      </n-form-item>

      <n-form-item class="col-span-12" path="questions">
        <template #label>
          <div class="flex items-center justify-between w-full gap-2">
            <span>{{ $t('topicDetailsPage.exams.questionSets') }}</span>
            <span class="text-xs" :class="sumMatches ? 'text-success' : 'text-error'">
              {{ questionsSum }} / {{ store.payload.tests_count ?? 0 }}
            </span>
          </div>
        </template>
        <div class="w-full flex flex-col gap-2">
          <div
            v-for="(row, idx) in store.payload.questions"
            :key="idx"
            class="flex items-center gap-2"
          >
            <n-select
              class="flex-1"
              v-model:value="row.exam_category_id"
              filterable
              :options="categoryOptions(row)"
              :loading="componentStore.examCategoryLoading"
              :placeholder="$t('content.choose')"
            />
            <n-input-number
              class="w-[140px]"
              :min="1"
              :max="maxOf(row.exam_category_id)"
              v-model:value="row.count"
            />
            <n-button quaternary circle type="error" @click="removeSet(idx)">
              <template #icon><n-icon :component="Delete20Regular" /></template>
            </n-button>
          </div>
          <n-button dashed @click="addSet">
            <template #icon><n-icon :component="Add16Regular" /></template>
            {{ $t('topicDetailsPage.exams.addQuestionSet') }}
          </n-button>
        </div>
      </n-form-item>
    </n-form>
  </n-spin>
</template>
