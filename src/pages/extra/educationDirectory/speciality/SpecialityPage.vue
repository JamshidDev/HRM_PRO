<script setup>
  import { useSpecialityStore } from '@/store/modules/index.js'
  const store = useSpecialityStore()
  import { UIModal } from '@/components/index.js'
  import Table from './ui/Table.vue'
  import createForm from './ui/createForm.vue'
  import { useAccountStore } from '@/store/modules/index.js'
  const accStore = useAccountStore()

  const createFormRef = ref(null)

  onMounted(() => {
    if (!accStore.checkAction(accStore.pn.specialitiesRead)) return
    store._index()
  })
</script>
<template>
  <div class="h-full">
    <Table />
    <UIModal
      v-model:visible="store.visible"
      :title="
        store.visibleType
          ? $t('othersPage.speciality.createTitle')
          : $t('othersPage.speciality.updateTitle')
      "
      width="min(560px, calc(100vw - 32px))"
    >
      <createForm ref="createFormRef" />
      <template #footer>
        <div class="flex justify-end gap-2 px-4 pb-2">
          <n-button type="error" ghost class="w-[130px]" @click="store.openVisible(false)">
            {{ $t('content.cancel') }}
          </n-button>
          <n-button
            type="primary"
            class="w-[130px]"
            :loading="store.saveLoading"
            @click="createFormRef?.submit()"
          >
            {{ $t('content.save') }}
          </n-button>
        </div>
      </template>
    </UIModal>
  </div>
</template>
