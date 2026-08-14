<script setup>
  import { UIDeleteConfirm, UITable, UITablePagination } from '@/components/index.js'
  import i18n from '@/i18n/index.js'
  import {
    useAccountStore,
    useCategoryQuestionStore,
    useCategoryStore
  } from '@/store/modules/index.js'
  import { AppPaths } from '@/utils/index.js'
  import UIHelper from '@/utils/UIHelper.js'
  import Utils from '@/utils/Utils.js'
  import { useRouter } from 'vue-router'
  import editRefreshIcon from '@/assets/icons/editRefreshIcon.svg'
  import trash from '@/assets/icons/trash.svg'
  import question from '@/assets/icons/question.svg'
  import fileQuestionAlt from '@/assets/icons/fileQuestionAlt.svg'
  import wandMagicSparkles from '@/assets/icons/wandMagicSparkles.svg'

  const { t } = i18n.global

  const store = useCategoryStore()
  const categoryQuestionStore = useCategoryQuestionStore()
  const accStore = useAccountStore()
  const router = useRouter()

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  const onEdit = (row) => {
    if (!accStore.checkAction(accStore.pn.examCategoriesWrite)) return
    store.elementId = row.id
    store.payload.name = row.name
    store.visibleType = false
    store.visible = true
  }

  const onDelete = (row) => {
    if (!accStore.checkAction(accStore.pn.examCategoriesWrite)) return
    store.elementId = row.id
    store._delete()
  }

  const onViewQuestions = (row) => {
    if (!accStore.checkAction(accStore.pn.examCategoriesRead)) return
    router.push(`${AppPaths.Attestation}${AppPaths.Category}/${row.id}${AppPaths.Questions}`)
  }

  const onAttachment = (row) => {
    if (!accStore.checkAction(accStore.pn.examCategoriesWrite)) return
    categoryQuestionStore.elementId = row.id
    categoryQuestionStore.selectedFile = null
    categoryQuestionStore.selectedCol = null
    categoryQuestionStore.excelVisible = true
  }

  // Tozalash kategoriyadagi BARCHA savollarni o'chiradi, shuning uchun tasdiq so'raladi.
  // `UITable` faqat `delete` kalitiga avtomatik tasdiq beradi.
  const clearConfirmVisible = ref(false)

  const onClear = (row) => {
    if (!accStore.checkAction(accStore.pn.examCategoriesWrite)) return
    store.elementId = row.id
    clearConfirmVisible.value = true
  }

  const onConfirmClear = () => {
    clearConfirmVisible.value = false
    store._clear()
  }

  const columns = computed(() => [
    {
      key: 'name',
      title: t('categoryPage.categoryName'),
      minWidth: 500
    },
    {
      key: 'questions_count',
      title: t('categoryPage.questionCount'),
      width: 140,
      align: 'center'
    }
  ])

  const actions = computed(() => [
    {
      label: t('content.edit'),
      key: Utils.ActionTypes.edit,
      icon: UIHelper.renderIcon(editRefreshIcon),
      action: onEdit
    },
    {
      label: t('content.delete'),
      key: Utils.ActionTypes.delete,
      icon: UIHelper.renderIcon(trash),
      action: onDelete
    },
    {
      label: t('questionPage.title'),
      key: Utils.ActionTypes.view,
      icon: UIHelper.renderIcon(question),
      action: onViewQuestions
    },
    {
      label: t('categoryPage.upload'),
      key: Utils.ActionTypes.attachment,
      icon: UIHelper.renderIcon(fileQuestionAlt),
      action: onAttachment
    },
    {
      label: t('content.clear'),
      key: Utils.ActionTypes.close,
      icon: UIHelper.renderIcon(wandMagicSparkles),
      action: onClear
    }
  ])
</script>

<template>
  <UITable
    permission-prefix="exam-categories"
    :columns="columns"
    :actions="actions"
    :actions-title="$t('content.action')"
    :data="store.list"
    :loading="store.loading"
    :page="store.params.page"
    :per-page="store.params.per_page"
    :total="store.totalItems"
    @change-page="changePage"
  >
    <template #[`cell-questions_count`]="{ row }">
      <span class="text-sm font-semibold text-textColor0">{{ row.questions_count ?? 0 }}</span>
    </template>

    <template #footer>
      <UITablePagination
        :page="store.params.page"
        :per-page="store.params.per_page"
        :total="store.totalItems"
        @change-page="changePage"
      />
    </template>
  </UITable>

  <UIDeleteConfirm
    v-model:visible="clearConfirmVisible"
    :warning="$t('categoryPage.clearWarning')"
    @confirm="onConfirmClear"
  />
</template>
