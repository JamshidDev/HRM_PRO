<script setup>
  import { ArrowCounterclockwise20Regular } from '@vicons/fluent'
  import { UIDrawer, UIPageContent, UIPageFilter } from '@/components/index.js'
  import Table from './ui/Table.vue'
  import { usePositionStore } from '@/store/modules/index.js'
  import createFrom from './ui/createForm.vue'
  import i18n from '@/i18n/index.js'
  import { AppPaths } from '@/utils/index.js'
  import { useAccountStore } from '@/store/modules/index.js'
  const accStore = useAccountStore()

  const { t } = i18n.global
  const store = usePositionStore()

  const onSearch = (v) => {
    store.params.page = 1
    store._index()
  }

  const onAdd = () => {
    if (!accStore.checkAction(accStore.pn.positionsWrite)) return
    store.resetForm()
    store.visibleType = true
    store.visible = true
  }

  // [↺ Tarix] — global audit sahifasiga o'tadi. `trigger_name` shu page'ning
  // kaliti (backend: `audit_pages.key`); audit sahifasida page filtri shu qiymatga
  // qulflanadi. Bo'limlardan farqli o'laroq tugma permission bilan yashirilmaydi:
  // lavozimlar tarixi backendda ham ochiq (`audit_pages.permission = NULL`),
  // sahifaning o'zini ko'rish esa allaqachon `positions-read` bilan cheklangan.
  const router = useRouter()
  const onHistory = () => {
    router.push({ path: AppPaths.Audit, query: { trigger_name: 'structure.positions' } })
  }

  onMounted(() => {
    if (!accStore.checkAction(accStore.pn.positionsRead)) return
    store._index()
  })
</script>

<template>
  <UIPageContent>
    <UIPageFilter
      :add-permission="accStore.pn.positionsWrite"
      v-model:search="store.params.search"
      @on-search="onSearch"
      :search-loading="store.loading"
      @on-add="onAdd"
      :show-filter-button="false"
    >
      <template #filterEnd>
        <n-button
          class="ui-page-action-button w-full! md:w-auto!"
          secondary
          icon-placement="right"
          @click="onHistory"
        >
          <template #icon>
            <n-icon><ArrowCounterclockwise20Regular /></n-icon>
          </template>
          {{ $t('audit.historyBtn') }}
        </n-button>
      </template>
    </UIPageFilter>
    <Table />
    <UIDrawer
      :visible="store.visible"
      @update:visible="(v) => (store.visible = v)"
      :title="store.visibleType ? t('positionPage.createTitle') : t('positionPage.updateTitle')"
    >
      <template #content>
        <createFrom />
      </template>
    </UIDrawer>
  </UIPageContent>
</template>

<style scoped></style>
