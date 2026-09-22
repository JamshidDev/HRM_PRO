<script setup>
  import { UIModal, UIPageContent } from '@/components/index.js'
  import { useAccountStore, useComponentStore, useMedStore } from '@/store/modules/index.js'
  import createForm from './ui/createForm.vue'
  import Filter from './ui/Filter.vue'
  import Table from './ui/Table.vue'
  import SickLeave from '@/pages/hrm/sickLeave/index.vue'
  import { DocumentHeartPulse24Regular, DocumentBulletList24Regular } from '@vicons/fluent'

  const store = useMedStore()
  const componentStore = useComponentStore()
  const accStore = useAccountStore()
  const createFormRef = ref(null)
  const activeTab = ref('med')

  // Kasallik varaqasi tabi o'z ruxsati bilan ochiladi.
  const canSeeSickLeave = computed(() => accStore.checkPermission(accStore.pn.hrSickLeaveRead))

  onMounted(() => {
    if (!accStore.checkAction(accStore.pn.hrMedRead)) return
    store._index()
  })

  onUnmounted(() => {
    componentStore.clearCache()
  })
</script>

<template>
  <UIPageContent>
    <!-- Tab faqat almashtirgich (salary1c sahifasidagi kabi): kontent
         `UIPageContent` ning BEVOSITA bolasi bo'lib qoladi, shunda jadval
         qolgan balandlikni to'liq egallaydi. -->
    <n-tabs
      v-model:value="activeTab"
      type="line"
      class="ui-pill-tabs ui-pill-tabs--inline med-tabs"
    >
      <n-tab-pane name="med">
        <template #tab>
          <span class="flex items-center gap-1.5">
            <n-icon size="17"><DocumentHeartPulse24Regular /></n-icon>
            {{ $t('medPage.name') }}
          </span>
        </template>
      </n-tab-pane>
      <n-tab-pane v-if="canSeeSickLeave" name="sick-leave">
        <template #tab>
          <span class="flex items-center gap-1.5">
            <n-icon size="17"><DocumentBulletList24Regular /></n-icon>
            {{ $t('sickLeave.name') }}
          </span>
        </template>
      </n-tab-pane>
    </n-tabs>

    <template v-if="activeTab === 'med'">
      <Filter />
      <Table />
    </template>
    <SickLeave v-else />

    <UIModal
      v-model:visible="store.visible"
      :title="store.visibleType ? $t('medPage.createTitle') : $t('medPage.updateTitle')"
      width="min(700px, calc(100vw - 32px))"
      height="min(85vh, 800px)"
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
  </UIPageContent>
</template>

<style scoped>
  /* Tab faqat almashtirgich: bo'sh panel maydoni ham, rail'ning pastki
     bo'shlig'i ham kerak emas — masofani `UIPageContent` ning `gap-4` i beradi. */
  .med-tabs :deep(.n-tabs-pane-wrapper) {
    display: none;
  }
</style>
