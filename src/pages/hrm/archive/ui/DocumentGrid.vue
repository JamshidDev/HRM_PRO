<script setup>
  import { useArchiveDocumentStore } from '@/store/modules/index.js'
  import { UIDocumentCard } from '@/components/index.js'
  import Utils from '@/utils/Utils.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const emit = defineEmits(['open'])
  const store = useArchiveDocumentStore()

  const fio = (w) => Utils.shortFio(w.last_name, w.first_name, w.middle_name)
  const workerNames = (doc) => (doc.workers || []).map(fio).join(', ')
  const docKey = (doc) => `${doc.kind}-${doc.id}`

  // Karta qatorlari: «№123 · UTY-…» | holat; xodim (+N); tashkilot.
  const rowsOf = (doc) => {
    const number = doc.number ? `№${doc.number}` : '—'
    const workers = doc.workers || []
    return [
      {
        text: doc.electronic_number ? `${number} · ${doc.electronic_number}` : number,
        title: t('archive.documents.number'),
        status: doc.cancelled
          ? { text: t('archive.documents.cancelled'), tone: 'red' }
          : { text: t('archive.documents.approved'), tone: 'green' }
      },
      {
        text: workers.length
          ? `${fio(workers[0])}${workers.length > 1 ? ` +${workers.length - 1}` : ''}`
          : '—',
        title: workerNames(doc)
      },
      { text: doc.organization?.name || '—', title: doc.organization?.name }
    ]
  }

  const onPage = (p) => {
    store.params.page = p
    store._index()
  }
</script>

<template>
  <div class="flex flex-1 flex-col min-h-0">
    <n-spin
      :show="store.loading"
      class="doc-scroll flex-1 min-h-0 overflow-auto"
      content-class="h-full"
    >
      <div
        v-if="store.list.length"
        class="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 pt-2 pb-2 pr-2"
      >
        <!-- Karta ko'rinishi — umumiy `UIDocumentCard` (Guvohnomalar oynasi ham shuni ishlatadi) -->
        <UIDocumentCard
          v-for="doc in store.list"
          :key="docKey(doc)"
          :subtitle="$t(`archive.documents.groups.${doc.type?.group || 'others'}`)"
          :date="Utils.timeOnlyDate(doc.date) || '—'"
          :date-title="$t('archive.documents.date')"
          :title="doc.type?.name"
          :rows="rowsOf(doc)"
          :tone="doc.cancelled ? 'red' : 'green'"
          :view-text="$t('archive.documents.view')"
          :download-text="$t('archive.documents.download')"
          :downloading="store.downloadId === docKey(doc)"
          :download-disabled="!!store.downloadId && store.downloadId !== docKey(doc)"
          @open="emit('open', doc)"
          @view="emit('open', doc)"
          @download="store._download(doc)"
        />
      </div>
      <n-empty
        v-else-if="!store.loading"
        :description="$t('archive.documents.empty')"
        class="py-16"
      />
    </n-spin>

    <div
      v-if="store.totalItems > store.params.per_page"
      class="flex items-center justify-between pt-3"
    >
      <span class="text-sm text-textColor3">
        {{ $t('archive.documents.total', { n: store.totalItems }) }}
      </span>
      <n-pagination
        :page="store.params.page"
        :page-size="store.params.per_page"
        :item-count="store.totalItems"
        :page-slot="7"
        @update:page="onPage"
      />
    </div>
  </div>
</template>

<style scoped>
  /* Silliq skroll: skroll ichki ro'yxatda qoladi, sahifaga o'tmaydi */
  .doc-scroll {
    overscroll-behavior: contain;
  }
</style>
