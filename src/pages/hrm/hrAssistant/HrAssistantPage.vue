<script setup>
  import { useAccountStore, useHrAssistantStore } from '@/store/modules/index.js'
  import { UIPageContent } from '@/components/index.js'
  import { useDebounceFn } from '@vueuse/core'
  import Table from './ui/Table.vue'
  import ScopeModal from './ui/ScopeModal.vue'

  const store = useHrAssistantStore()
  const accStore = useAccountStore()

  const onSearch = useDebounceFn((v) => {
    store.params.search = v || null
    store.params.page = 1
    store._index()
  }, 400)

  onMounted(() => {
    if (!accStore.checkAction(accStore.pn.hrAssistantsRead)) return
    store.params.page = 1
    store.params.search = null
    store._index()
  })
</script>

<template>
  <UIPageContent>
    <div class="flex items-center justify-between gap-3 mb-3">
      <n-input
        class="max-w-[320px]"
        clearable
        :placeholder="$t('content.search')"
        @update:value="onSearch"
      />
      <span class="text-xs text-secondary">{{ $t('hrAssistantPage.roleInfo') }}</span>
    </div>
    <Table />
    <ScopeModal />
  </UIPageContent>
</template>
