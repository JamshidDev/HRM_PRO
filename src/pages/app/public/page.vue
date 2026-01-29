<script setup>
  import { usePdfViewerStore, usePublicStore } from '@/store/modules/index.js'
  import { ToolBar, Document, Authectication, QuizItem, Confirmations } from './ui/index.js'

  const store = usePublicStore()
  const pdfViewerStore = usePdfViewerStore()

  const route = useRoute()

  onMounted(() => {
    const { key, model } = route.params
    store.elementId = key
    store.selectedModel = model
    store.list = []
    store.isExist = false
    store._getDocument(async (url) => {
      pdfViewerStore.pdfUrl = url
      await pdfViewerStore.loadPdf()
    })
  })
</script>

<template>
  <div class="w-full flex-col bg-surface-ground pt-[64px] min-h-screen pb-[100px]">
    <ToolBar />
    <Document />
    <Authectication />
    <div class="flex flex-col gap-4 max-w-[700px] md:mx-auto mx-2 mt-4">
      <template v-for="(item, index) in store.list" :key="item.id">
        <QuizItem
          :selected-answer="item.result"
          :number="index + 1"
          :question="item.question"
          :answers="item.answers"
        />
      </template>

      <Confirmations/>
    </div>
  </div>
</template>
