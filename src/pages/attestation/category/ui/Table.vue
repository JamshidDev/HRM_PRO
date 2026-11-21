<script setup>
  import { h } from 'vue'
  import { UITable, UITablePagination, UIUser } from '@/components/index.js'
  import i18n from '@/i18n/index.js'
  import { useAccountStore, useCategoryStore } from '@/store/modules/index.js'
  import { AppPaths } from '@/utils/index.js'
  import UIHelper from '@/utils/UIHelper.js'
  import Utils from '@/utils/Utils.js'
  import { useRouter } from 'vue-router'
  import editRefreshIcon from '@/assets/icons/editRefreshIcon.svg'
  import trash from '@/assets/icons/trash.svg'
  import question from '@/assets/icons/question.svg'

  const { t } = i18n.global
  const store = useCategoryStore()
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
    store.payload.scope = row.scope
    store.visibleType = false
    store.visible = true
  }

  const onDelete = (row) => {
    if (!accStore.checkAction(accStore.pn.examCategoriesWrite)) return
    store.elementId = row.id
    store._delete()
  }

  // «Ko'rish» — to'plam ichidagi savollar sahifasi.
  const onView = (row) => {
    if (!accStore.checkAction(accStore.pn.examCategoriesRead)) return
    router.push(`${AppPaths.Attestation}${AppPaths.Category}/${row.id}${AppPaths.Questions}`)
  }

  const scopeBadge = (scope) =>
    h(
      'span',
      {
        class: [
          'inline-flex rounded-full px-2 py-0.5 text-[12px] leading-[16px] whitespace-nowrap',
          scope === 1
            ? 'bg-fig-chip-green text-fig-chip-green-text'
            : 'bg-fig-chip-brand text-fig-chip-brand-text'
        ]
      },
      t(scope === 1 ? 'categoryPage.scopePublic' : 'categoryPage.scopeOrganization')
    )

  const columns = computed(() => [
    { key: 'name', title: t('categoryPage.categoryName'), minWidth: 240 },
    {
      key: 'scope',
      title: t('categoryPage.scope'),
      width: 150,
      render: (row) => scopeBadge(row.scope)
    },
    {
      key: 'questions_count',
      title: t('categoryPage.questionCount'),
      width: 130,
      align: 'center'
    },
    {
      key: 'user',
      title: t('categoryPage.author'),
      minWidth: 260,
      render: (row) =>
        row.user
          ? h(UIUser, {
              short: false,
              data: {
                photo: row.user.photo,
                lastName: row.user.last_name,
                firstName: row.user.first_name,
                middleName: row.user.middle_name,
                position: row.organization?.name
              }
            })
          : ''
    },
    {
      key: 'created_at',
      title: t('categoryPage.createdAt'),
      width: 120,
      align: 'center',
      render: (row) => (row.created_at ? Utils.timeOnlyDate(row.created_at) : '')
    }
  ])

  // Boshqa korxonaning ommaviy to'plami faqat ko'riladi.
  const actions = computed(() => [
    {
      label: t('content.view'),
      key: Utils.ActionTypes.view,
      icon: UIHelper.renderIcon(question),
      action: onView
    },
    {
      label: t('content.edit'),
      key: Utils.ActionTypes.edit,
      icon: UIHelper.renderIcon(editRefreshIcon),
      visible: (row) => row.can_edit,
      action: onEdit
    },
    {
      label: t('content.delete'),
      key: Utils.ActionTypes.delete,
      icon: UIHelper.renderIcon(trash),
      visible: (row) => row.can_edit,
      action: onDelete
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
</template>
