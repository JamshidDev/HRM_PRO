<script setup>
  import QuestionList from './ui/QuestionList.vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useCategoryQuestionStore } from '@/store/modules'
  import { UIModal, UIPageContent } from '@/components/index.js'
  import { AppPaths } from '@/utils/index.js'
  import QuestionForm from './ui/QuestionForm.vue'
  import { useAccountStore } from '@/store/modules/index.js'
  import { AddCircle24Regular, ArrowLeft24Regular } from '@vicons/fluent'

  const accStore = useAccountStore()

  const route = useRoute()
  const router = useRouter()
  const store = useCategoryQuestionStore()

  onMounted(() => {
    if (!accStore.checkAction(accStore.pn.examCategoriesRead)) return
    store.resetData()
    store.category_id = route.params.category_id
    store._index()
  })

  const onAdd = () => {
    if (!accStore.checkAction(accStore.pn.examCategoriesWrite)) return
    store.visibleType = true
    store.visible = true
  }

  const goBack = () => {
    router.push(`${AppPaths.Attestation}${AppPaths.Category}`)
  }
</script>

<template>
  <UIPageContent class="h-full">
    <div class="shrink-0 flex flex-col gap-3">
      <div>
        <n-button size="small" class="rounded-lg!" @click="goBack">
          <template #icon>
            <n-icon :component="ArrowLeft24Regular" />
          </template>
          {{ $t('content.back') }}
        </n-button>
      </div>

      <div class="flex flex-wrap items-center justify-between gap-3">
        <p class="text-lg font-semibold text-textColor0">{{ $t('questionPage.title') }}</p>
        <n-button
          type="primary"
          class="rounded-lg!"
          icon-placement="left"
          :disabled="!accStore.checkPermission(accStore.pn.examCategoriesWrite)"
          @click="onAdd"
        >
          <template #icon>
            <n-icon :component="AddCircle24Regular" />
          </template>
          {{ $t('content.add') }}
        </n-button>
      </div>
    </div>

    <div class="grow basis-auto min-h-0">
      <QuestionList />
    </div>

    <UIModal
      :width="1300"
      :title="store.visibleType ? $t('categoryPage.addQuestion') : $t('categoryPage.editQuestion')"
      v-model:visible="store.visible"
    >
      <QuestionForm />
    </UIModal>
  </UIPageContent>
</template>
