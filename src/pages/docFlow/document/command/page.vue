<script setup>
  import { useAccountStore, useCommandStore, useComponentStore } from '@/store/modules/index.js'
  import { UIOfficeApp, UIPageContent, UIConfirmByFile } from '@/components/index.js'
  import Table from './Table.vue'
  import CommandForm from './CommandForm.vue'
  import { UIModal } from '@/components/index.js'
  import Utils from '@/utils/Utils.js'
  import Filter from './ui/Filter.vue'
  import { Events, eventBus } from '@utils'

  const officeAppRef = ref(null)
  const store = useCommandStore()
  const componentStore = useComponentStore()
  const accStore = useAccountStore()
  const emits = defineEmits(['openOffice'])

  const openCommand = (id) => {
    officeAppRef.value.openPdf(id, Utils.documentModels.command)
  }

  const onSuccessEv = (v) => {
    store._index()
  }

  const updateDocument = (v) => {
    const index = store.list.findIndex((x) => x.id === v.documentId)
    if (index === 1) return
    store.list[index].generate = 3
  }

  onMounted(() => {
    eventBus.on(Events.COMMAND_GENERATED, updateDocument)
    if (!accStore.checkAction(accStore.pn.hrCommandsRead)) return
    store._index()
  })

  onUnmounted(() => {
    eventBus.off(Events.COMMAND_GENERATED, updateDocument)
    componentStore.clearCache()
  })
</script>

<template>
  <UIPageContent>
    <Filter />
    <Table @openOffice="openCommand" />
    <CommandForm />
    <UIOfficeApp ref="officeAppRef" />
    <UIConfirmByFile
      :model="Utils.documentModels.command"
      :document-id="store.elementId"
      @onSuccess="onSuccessEv"
    />
  </UIPageContent>
</template>
