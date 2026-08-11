<script setup>
  import {
    useAccountStore,
    useOrganizationLeaderStore,
    useComponentStore
  } from '@/store/modules/index.js'
  import Table from './ui/Table.vue'
  import Form from './ui/Form.vue'
  import Filter from './ui/Filter.vue'
  import { UIModal, UIPageContent } from '@/components/index.js'

  const store = useOrganizationLeaderStore()
  const accStore = useAccountStore()
  const componentStore = useComponentStore()
  const formRef = ref(null)

  onMounted(() => {
    if (!accStore.checkAction(accStore.pn.hrLeadersRead)) return
    store.params.page = 1
    store.params.search = null
    store._index()
  })

  onUnmounted(() => {
    componentStore.clearCache()
  })
</script>

<template>
  <UIPageContent>
    <Filter />
    <Table />
    <UIModal
      v-model:visible="store.visible"
      :title="
        $t(
          store.visibleType
            ? 'organizationLeaderPage.addLeader'
            : 'organizationLeaderPage.editLeader'
        )
      "
      width="min(700px, calc(100vw - 32px))"
    >
      <Form ref="formRef" />

      <template #footer>
        <div class="flex justify-end gap-2 px-4 pb-2">
          <n-button type="error" ghost class="w-[130px]" @click="store.openVisible(false)">
            {{ $t('content.cancel') }}
          </n-button>
          <n-button
            type="primary"
            class="w-[130px]"
            :loading="store.saveLoading"
            @click="formRef?.submit()"
          >
            {{ $t('content.save') }}
          </n-button>
        </div>
      </template>
    </UIModal>
  </UIPageContent>
</template>
