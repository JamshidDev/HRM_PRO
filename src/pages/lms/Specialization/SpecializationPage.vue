<script setup>
  import { UIPageContent, UIPageFilter, UIModal } from '@/components/index.js'
  import Table from './ui/Table.vue'
  import { useAccountStore, useSpecializationStore } from '@/store/modules/index.js'
  import createFrom from './ui/createForm.vue'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const createFormRef = ref(null)
  const store = useSpecializationStore()
  const accStore = useAccountStore()

  const onSearch = () => {
    if (!accStore.checkAction(accStore.pn.lmsSpecializationRead)) return
    store.params.page = 1
    store._index()
  }

  const onAdd = () => {
    if (!accStore.checkAction(accStore.pn.lmsSpecializationWrite)) return
    store.resetForm()
    store.visibleType = true
    store.visible = true
  }

  onMounted(() => {
    if (!accStore.checkAction(accStore.pn.lmsSpecializationRead)) return
    store._index()
  })
</script>

<template>
  <UIPageContent>
    <UIPageFilter
      :add-permission="accStore.pn.lmsSpecializationWrite"
      v-model:search="store.params.search"
      @on-search="onSearch"
      :search-loading="store.loading"
      @on-add="onAdd"
      :show-filter-button="false"
    />
    <Table />
    <UIModal
      v-model:visible="store.visible"
      :title="
        store.visibleType
          ? t('specializationPage.createTitle')
          : t('specializationPage.updateTitle')
      "
      width="min(700px, calc(100vw - 32px))"
    >
      <createFrom ref="createFormRef" />

      <template #footer>
        <div class="flex justify-end gap-2 px-4 pb-2">
          <n-button type="error" ghost class="w-[130px]" @click="store.openVisible(false)">
            {{ t('content.cancel') }}
          </n-button>
          <n-button
            type="primary"
            class="w-[130px]"
            :loading="store.saveLoading"
            @click="createFormRef?.submit()"
          >
            {{ t('content.save') }}
          </n-button>
        </div>
      </template>
    </UIModal>
  </UIPageContent>
</template>

<style scoped></style>
