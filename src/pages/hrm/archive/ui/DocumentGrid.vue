<script setup>
  import { useArchiveDocumentStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import { DocumentPdf24Regular, Building24Regular, Person24Regular } from '@vicons/fluent'

  const emit = defineEmits(['open'])
  const store = useArchiveDocumentStore()

  // Kartada 2 tagacha xodim, qolgani «+N».
  const workerLabel = (doc) => {
    const list = doc.workers || []
    const names = list
      .slice(0, 2)
      .map((w) => Utils.shortFio(w.last_name, w.first_name, w.middle_name))
    return list.length > 2 ? `${names.join(', ')} +${list.length - 2}` : names.join(', ')
  }

  const numberLabel = (doc) => (doc.number ? `№${doc.number}` : doc.electronic_number || '—')

  const onPage = (p) => {
    store.params.page = p
    store._index()
  }
</script>

<template>
  <div class="flex flex-1 flex-col min-h-0">
    <n-spin :show="store.loading" class="flex-1 min-h-0 overflow-auto" content-class="h-full">
      <div
        v-if="store.list.length"
        class="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 pb-2"
      >
        <button
          v-for="doc in store.list"
          :key="`${doc.kind}-${doc.id}`"
          type="button"
          class="doc-card group text-left rounded-2xl border border-surface-line bg-surface-section p-4 flex flex-col gap-2 transition hover:border-primary hover:shadow-md"
          @click="emit('open', doc)"
        >
          <div class="flex items-start gap-3">
            <div
              class="shrink-0 w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center"
            >
              <n-icon size="22"><DocumentPdf24Regular /></n-icon>
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2 text-xs text-textColor3">
                <span class="font-semibold text-textColor1">{{
                  numberLabel(doc)
                }}</span>
                <span>·</span>
                <span>{{ Utils.timeOnlyDate(doc.date) || '—' }}</span>
              </div>
              <div
                class="mt-0.5 text-sm font-medium leading-snug line-clamp-2 text-textColor0"
                :title="doc.type?.name"
              >
                {{ doc.type?.name || '—' }}
              </div>
            </div>
          </div>

          <div
            v-if="doc.workers?.length"
            class="flex items-center gap-1.5 text-xs text-textColor2"
          >
            <n-icon size="14" class="shrink-0"><Person24Regular /></n-icon>
            <span class="truncate">{{ workerLabel(doc) }}</span>
          </div>
          <div class="flex items-center gap-1.5 text-xs text-textColor3">
            <n-icon size="14" class="shrink-0"><Building24Regular /></n-icon>
            <span class="truncate" :title="doc.organization?.name">{{
              doc.organization?.name || '—'
            }}</span>
          </div>

          <div class="mt-auto pt-1 flex items-center justify-between">
            <n-tag v-if="doc.cancelled" size="small" type="error" round :bordered="false">
              {{ $t('archive.documents.cancelled') }}
            </n-tag>
            <n-tag v-else size="small" type="success" round :bordered="false">
              {{ $t('archive.documents.approved') }}
            </n-tag>
            <span class="text-xs text-primary opacity-0 group-hover:opacity-100 transition">
              {{ $t('archive.documents.view') }} →
            </span>
          </div>
        </button>
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
