<script setup>
  import { UITable } from '@/components/index.js'
  import i18n from '@/i18n/index.js'
  import {
    useAccountStore,
    useCategoryQuestionStore,
    useCategoryStore
  } from '@/store/modules/index.js'
  import { AppPaths } from '@/utils/index.js'
  import UIHelper from '@/utils/UIHelper.js'
  import Utils from '@/utils/Utils.js'
  import {
    CloudLink20Regular,
    Cut24Filled,
    Delete20Regular,
    Edit32Regular,
    Eye16Regular
  } from '@vicons/fluent'
  import { useRouter } from 'vue-router'

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
    categoryQuestionStore.elementId = row.id
    categoryQuestionStore.selectedFile = null
    categoryQuestionStore.selectedCol = null
    categoryQuestionStore.excelVisible = true
  }

  const onClear = (row) => {
    store.elementId = row.id
    store._clear()
  }

  const columns = computed(() => [
    {
      key: 'name',
      title: t('categoryPage.name'),
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
      icon: UIHelper.renderIcon(Edit32Regular),
      action: onEdit
    },
    {
      label: t('content.delete'),
      key: Utils.ActionTypes.delete,
      icon: UIHelper.renderIcon(Delete20Regular),
      action: onDelete
    },
    {
      label: t('questionPage.title'),
      key: Utils.ActionTypes.view,
      icon: UIHelper.renderIcon(Eye16Regular),
      action: onViewQuestions
    },
    {
      label: t('categoryPage.upload'),
      key: Utils.ActionTypes.attachment,
      icon: UIHelper.renderIcon(CloudLink20Regular),
      action: onAttachment
    },
    {
      label: t('content.clear'),
      key: Utils.ActionTypes.close,
      icon: UIHelper.renderIcon(Cut24Filled),
      action: onClear
    }
  ])
</script>

<template>
  <UITable
    permission-prefix="exam-categories"
    :columns="columns"
    :actions="actions"
    :data="store.list"
    :loading="store.loading"
    :page="store.params.page"
    :per-page="store.params.per_page"
    :total="store.totalItems"
    storage-key="attestation-category"
    @change-page="changePage"
  />
</template>
