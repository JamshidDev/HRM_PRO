<script setup>
  import QuestionList from './ui/QuestionList.vue'
  import TemplateImport from './ui/TemplateImport.vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useCategoryQuestionStore, useCategoryStore } from '@/store/modules'
  import { UIModal, UIPageContent } from '@/components/index.js'
  import { AppPaths } from '@/utils/index.js'
  import QuestionForm from './ui/QuestionForm.vue'
  import { useAccountStore } from '@/store/modules/index.js'
  import { AddCircle24Regular, ArrowLeft24Regular } from '@vicons/fluent'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const accStore = useAccountStore()

  const route = useRoute()
  const router = useRouter()
  const store = useCategoryQuestionStore()
  const categoryStore = useCategoryStore()
  const importVisible = ref(false)

  onMounted(() => {
    if (!accStore.checkAction(accStore.pn.examCategoriesRead)) return
    store.resetData()
    store.category_id = route.params.category_id
    categoryStore._show(route.params.category_id)
    store._index()
  })

  // Qo'shish 2 xil: shablon fayli orqali yoki forma orqali (bittalab).
  const addOptions = computed(() => [
    { key: 'file', label: t('categoryPage.addByFile') },
    { key: 'form', label: t('categoryPage.addByForm') }
  ])

  const onAdd = (key) => {
    if (!accStore.checkAction(accStore.pn.examCategoriesWrite)) return
    if (key === 'file') {
      importVisible.value = true
      return
    }
    store.visibleType = true
    store.visible = true
  }

  const onImported = () => {
    importVisible.value = false
    store.params.page = 1
    store._index()
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
        <div class="min-w-0">
          <p class="text-lg font-semibold text-textColor0 truncate">
            {{ categoryStore.current?.name || $t('questionPage.title') }}
          </p>
          <p
            v-if="categoryStore.current && !categoryStore.current.can_edit"
            class="text-[12px] text-fig-text-tertiary"
          >
            {{ $t('categoryPage.readOnly') }}
          </p>
        </div>
        <div v-if="categoryStore.current?.can_edit" class="flex flex-wrap gap-2">
          <n-button
            type="success"
            ghost
            class="rounded-lg!"
            :loading="categoryStore.templateLoading"
            @click="categoryStore._template()"
          >
            {{ $t('categoryPage.downloadTemplate') }}
          </n-button>
          <n-dropdown trigger="click" :options="addOptions" @select="onAdd">
            <n-button
              type="primary"
              class="rounded-lg!"
              icon-placement="left"
              :disabled="!accStore.checkPermission(accStore.pn.examCategoriesWrite)"
            >
              <template #icon>
                <n-icon :component="AddCircle24Regular" />
              </template>
              {{ $t('content.add') }}
            </n-button>
          </n-dropdown>
        </div>
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

    <UIModal :width="1100" :title="$t('categoryPage.importTitle')" v-model:visible="importVisible">
      <TemplateImport @done="onImported" />
    </UIModal>
  </UIPageContent>
</template>
