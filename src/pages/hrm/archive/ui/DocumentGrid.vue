<script setup>
  import { useArchiveDocumentStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import {
    ArrowDownload16Regular,
    ArrowSwap20Regular,
    Building16Regular,
    CalendarLtr16Regular,
    Clipboard16Regular,
    Document16Regular,
    DocumentEdit16Regular,
    DocumentPerson16Regular,
    Eye16Regular,
    PersonAdd16Regular,
    PersonDelete16Regular,
    VehicleCar16Regular
  } from '@vicons/fluent'

  const emit = defineEmits(['open'])
  const store = useArchiveDocumentStore()

  // Guruh → ikonka va rang (loyiha chip tokenlari, tungi rejim bilan mos).
  const GROUPS = {
    employment: { icon: PersonAdd16Regular, chip: 'bg-fig-chip-green text-fig-chip-green-text' },
    termination: { icon: PersonDelete16Regular, chip: 'bg-fig-red-50 text-fig-text-red' },
    transfer: { icon: ArrowSwap20Regular, chip: 'bg-fig-chip-indigo text-fig-chip-indigo-text' },
    vacation: { icon: CalendarLtr16Regular, chip: 'bg-fig-chip-amber text-fig-chip-amber-text' },
    business_trip: { icon: VehicleCar16Regular, chip: 'bg-fig-chip-lime text-fig-chip-lime-text' },
    others: { icon: Document16Regular, chip: 'bg-fig-chip-brand text-fig-chip-brand-text' },
    contracts: {
      icon: DocumentPerson16Regular,
      chip: 'bg-fig-chip-brand text-fig-chip-brand-text'
    },
    contract_additional: {
      icon: DocumentEdit16Regular,
      chip: 'bg-fig-chip-pink text-fig-chip-pink-text'
    },
    applications: { icon: Clipboard16Regular, chip: 'bg-fig-chip-amber text-fig-chip-amber-text' }
  }
  const groupOf = (doc) => GROUPS[doc.type?.group] || GROUPS.others

  const fio = (w) => Utils.shortFio(w.last_name, w.first_name, w.middle_name)
  const initials = (w) => `${w.last_name?.[0] || ''}${w.first_name?.[0] || ''}`.toUpperCase()
  const docKey = (doc) => `${doc.kind}-${doc.id}`

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
        class="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 pb-2"
      >
        <div
          v-for="doc in store.list"
          :key="docKey(doc)"
          class="doc-card relative flex flex-col gap-3 rounded-2xl border border-surface-line bg-surface-section p-4 cursor-pointer transition hover:border-primary hover:shadow-md"
          :class="{ 'doc-card--cancelled': doc.cancelled }"
          @click="emit('open', doc)"
        >
          <!-- Guruh ikonkasi, guruh nomi, holat va hujjat turi -->
          <div class="flex items-start gap-3">
            <div
              class="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center"
              :class="groupOf(doc).chip"
            >
              <n-icon size="20"><component :is="groupOf(doc).icon" /></n-icon>
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center justify-between gap-2">
                <span class="text-[11px] font-medium text-textColor3 truncate">
                  {{ $t(`archive.documents.groups.${doc.type?.group || 'others'}`) }}
                </span>
                <span
                  class="shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium"
                  :class="
                    doc.cancelled
                      ? 'bg-fig-red-50 text-fig-text-red'
                      : 'bg-fig-chip-green text-fig-chip-green-text'
                  "
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-current"></span>
                  {{
                    doc.cancelled
                      ? $t('archive.documents.cancelled')
                      : $t('archive.documents.approved')
                  }}
                </span>
              </div>
              <div
                class="mt-0.5 text-sm font-semibold leading-snug text-textColor0 line-clamp-2 min-h-[2.5rem]"
                :title="doc.type?.name"
              >
                {{ doc.type?.name || '—' }}
              </div>
            </div>
          </div>

          <!-- Raqam va sana -->
          <div class="grid grid-cols-2 gap-3 rounded-xl bg-surface-ground px-3 py-2">
            <div class="min-w-0">
              <div class="text-[11px] text-textColor3">{{ $t('archive.documents.number') }}</div>
              <div class="text-sm font-semibold text-textColor1 truncate" :title="doc.number">
                {{ doc.number ? `№${doc.number}` : '—' }}
              </div>
              <div
                v-if="doc.electronic_number"
                class="text-[11px] text-textColor3 truncate"
                :title="doc.electronic_number"
              >
                {{ doc.electronic_number }}
              </div>
            </div>
            <div class="min-w-0">
              <div class="text-[11px] text-textColor3">{{ $t('archive.documents.date') }}</div>
              <div class="text-sm font-semibold text-textColor1">
                {{ Utils.timeOnlyDate(doc.date) || '—' }}
              </div>
            </div>
          </div>

          <!-- Xodim(lar) va korxona -->
          <div class="flex flex-col gap-2">
            <div v-if="doc.workers?.length" class="flex items-center gap-2 min-w-0">
              <div class="flex -space-x-2 shrink-0">
                <span
                  v-for="w in doc.workers.slice(0, 3)"
                  :key="w.id"
                  class="w-7 h-7 rounded-full border-2 border-surface-section bg-fig-chip-brand text-fig-chip-brand-text text-[10px] font-semibold flex items-center justify-center"
                >
                  {{ initials(w) }}
                </span>
              </div>
              <span
                class="text-xs font-medium text-textColor1 truncate"
                :title="doc.workers.map(fio).join(', ')"
              >
                {{ fio(doc.workers[0]) }}
                <span v-if="doc.workers.length > 1" class="text-textColor3">
                  +{{ doc.workers.length - 1 }}
                </span>
              </span>
            </div>
            <div class="flex items-center gap-2 text-xs text-textColor3 min-w-0">
              <n-icon size="14" class="shrink-0"><Building16Regular /></n-icon>
              <span class="truncate" :title="doc.organization?.name">
                {{ doc.organization?.name || '—' }}
              </span>
            </div>
          </div>

          <!-- Amallar -->
          <div class="mt-auto flex items-center gap-2 border-t border-surface-line pt-3">
            <n-button size="small" secondary class="flex-1" @click.stop="emit('open', doc)">
              <template #icon>
                <n-icon><Eye16Regular /></n-icon>
              </template>
              {{ $t('archive.documents.view') }}
            </n-button>
            <n-button
              size="small"
              type="primary"
              class="flex-1"
              :loading="store.downloadId === docKey(doc)"
              :disabled="!!store.downloadId && store.downloadId !== docKey(doc)"
              @click.stop="store._download(doc)"
            >
              <template #icon>
                <n-icon><ArrowDownload16Regular /></n-icon>
              </template>
              {{ $t('archive.documents.download') }}
            </n-button>
          </div>
        </div>
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
  .doc-card--cancelled {
    background-image: linear-gradient(
      to bottom,
      color-mix(in srgb, var(--fig-text-red) 6%, transparent),
      transparent 40%
    );
  }
</style>
