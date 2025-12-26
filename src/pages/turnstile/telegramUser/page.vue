<script setup>
  import { UIModal, UIPageContent } from '@/components/index.js'
  import Filter from './ui/Filter.vue'
  import Table from './ui/Table.vue'
  import createForm from './ui/createForm.vue'
  import { useTelegramUserStore } from '@/store/modules/index.js'
  import UserForm from '@/pages/turnstile/terminalUser/ui/UserForm.vue'

  const store = useTelegramUserStore()

  onMounted(() => {
    store._index()
  })
</script>

<template>
  <UIPageContent>
    <Filter />
    <Table />
    <UIModal
      :width="500"
      :visible="store.visible"
      @update:visible="(v) => (store.visible = v)"
      :title="$t(store.visibleType ? 'notification.createTitle' : 'notification.updateTitle')"
    >
      <template #default>
        <createForm />
      </template>
    </UIModal>
  </UIPageContent>
</template>
