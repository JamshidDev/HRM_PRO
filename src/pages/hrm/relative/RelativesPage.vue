<script setup>
  import { onMounted } from 'vue'
  import { useRelativeStore } from '@/store/modules/index.js'
  import Table from './ui/Table.vue'
  import createForm from './ui/createForm.vue'
  import disabilityForm from './ui/disabilityForm.vue'
  import { UIDrawer, UIModal } from '@/components/index.js'
  import { useRoute } from 'vue-router'

  const store = useRelativeStore()
  const route = useRoute()

  onMounted(() => {
    store.uuid = route.query.id
    store._index()
  })
</script>

<template>
  <div>
    <Table />
    <UIDrawer
      :visible="store.visible"
      @update:visible="(v) => (store.visible = v)"
      :title="store.visibleType ? $t('relativePage.createTitle') : $t('relativePage.updateTitle')"
    >
      <template #content>
        <createForm />
      </template>
    </UIDrawer>

    <UIModal
      v-model:visible="store.disabilityVisible"
      :title="store.disabilityVisibleType ? $t('relativePage.disability.createTitle') : $t('relativePage.disability.updateTitle')"
      width="500px"
    >
      <disabilityForm @onCancel="store.disabilityVisible = false" />
    </UIModal>
  </div>
</template>

<style scoped></style>
