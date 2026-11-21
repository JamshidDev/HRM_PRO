<script setup>
  import { h } from 'vue'
  import { UIPageContent, UIPageFilter, UITable, UITablePagination } from '@/components/index.js'
  import i18n from '@/i18n/index.js'
  import UIHelper from '@/utils/UIHelper.js'
  import Utils from '@/utils/Utils.js'
  import { useAccountStore } from '@/store/modules/index.js'
  import { useExamMonitoringStore } from '@/store/modules/attestation/examMonitoringStore.js'
  import WatchDrawer from './ui/WatchDrawer.vue'
  import eyeIcon from '@/assets/icons/eye.svg'

  const { t } = i18n.global
  const store = useExamMonitoringStore()
  const accStore = useAccountStore()

  const load = () => {
    if (!accStore.checkAction(accStore.pn.examMonitoringRead)) return
    store._index()
  }
  const onSearch = () => {
    store.params.page = 1
    load()
  }
  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    load()
  }

  const chip = (text, cls) =>
    h(
      'span',
      {
        class: [
          'inline-flex rounded-full px-2 py-0.5 text-[12px] leading-[16px] whitespace-nowrap',
          cls
        ]
      },
      text
    )

  const columns = computed(() => [
    {
      key: 'name',
      title: t('examMonitoringPage.topic'),
      minWidth: 280,
      render: (row) =>
        h('div', { class: 'flex flex-col' }, [
          h('span', { class: 'text-[14px] text-fig-text-primary' }, row.name),
          h('span', { class: 'text-[12px] text-fig-text-tertiary' }, row.type?.name)
        ])
    },
    {
      key: 'languages_count',
      title: t('examMonitoringPage.languages'),
      width: 150,
      align: 'center',
      render: (row) =>
        row.languages?.length
          ? h(
              'div',
              { class: 'flex flex-wrap justify-center gap-1' },
              row.languages.map((l) =>
                chip(l.toUpperCase(), 'bg-fig-chip-indigo text-fig-chip-indigo-text')
              )
            )
          : String(row.languages_count)
    },
    { key: 'tests_count', title: t('examMonitoringPage.questions'), width: 130, align: 'center' },
    {
      key: 'solving_now',
      title: t('examMonitoringPage.solvingNow'),
      width: 160,
      align: 'center',
      render: (row) =>
        h('span', { class: 'inline-flex items-center gap-1.5 font-semibold' }, [
          h('span', {
            class: [
              'w-2 h-2 rounded-full',
              row.solving_now ? 'bg-fig-green animate-pulse' : 'bg-fig-neutral-300'
            ]
          }),
          String(row.solving_now)
        ])
    },
    {
      key: 'monitoring',
      title: t('examMonitoringPage.monitoring'),
      width: 200,
      render: (row) =>
        !row.camera && !row.screen
          ? chip(t('examMonitoringPage.none'), 'bg-fig-red-100 text-fig-text-red')
          : h('div', { class: 'flex flex-wrap gap-1' }, [
              row.camera
                ? chip(t('examMonitoringPage.camera'), 'bg-fig-chip-green text-fig-chip-green-text')
                : null,
              row.screen
                ? chip(t('examMonitoringPage.screen'), 'bg-fig-chip-brand text-fig-chip-brand-text')
                : null
            ])
    }
  ])

  const actions = computed(() => [
    {
      label: t('content.view'),
      key: Utils.ActionTypes.view,
      icon: UIHelper.renderIcon(eyeIcon),
      action: (row) => store.openDrawer(row)
    }
  ])

  onMounted(() => {
    store.params.page = 1
    load()
  })
  onBeforeUnmount(() => {
    if (store.drawer) store.closeDrawer()
  })
</script>

<template>
  <UIPageContent>
    <UIPageFilter
      :show-filter-button="false"
      :show-add-button="false"
      v-model:search="store.params.search"
      :search-loading="store.loading"
      @onSearch="onSearch"
    />
    <UITable
      permission-prefix="exam-monitoring"
      :columns="columns"
      :actions="actions"
      :actions-title="$t('content.action')"
      :data="store.list"
      :loading="store.loading"
      :page="store.params.page"
      :per-page="store.params.per_page"
      :total="store.total"
      @change-page="changePage"
    >
      <template #footer>
        <UITablePagination
          :page="store.params.page"
          :per-page="store.params.per_page"
          :total="store.total"
          @change-page="changePage"
        />
      </template>
    </UITable>
    <WatchDrawer />
  </UIPageContent>
</template>
