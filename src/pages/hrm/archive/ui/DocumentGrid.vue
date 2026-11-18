<script setup>
  import { useArchiveDocumentStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import icons from '@/assets/icons'
  import { ArrowDownload16Regular, Eye16Regular } from '@vicons/fluent'

  const emit = defineEmits(['open'])
  const store = useArchiveDocumentStore()

  const fio = (w) => Utils.shortFio(w.last_name, w.first_name, w.middle_name)
  const workerNames = (doc) => (doc.workers || []).map(fio).join(', ')
  const docKey = (doc) => `${doc.kind}-${doc.id}`

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
        <div
          v-for="doc in store.list"
          :key="docKey(doc)"
          class="doc-card relative flex flex-col rounded-2xl border border-surface-line bg-surface-section cursor-pointer"
          :class="doc.cancelled ? 'doc-card--cancelled' : 'doc-card--approved'"
          @click="emit('open', doc)"
        >
          <!-- Yuqori: PDF ikonkasi (qutisiz), guruh nomi + sana, hujjat turi -->
          <div class="flex items-start gap-2 p-4 pb-2">
            <n-icon size="42" class="shrink-0 flex"><component :is="icons.pdfFileIcon" /></n-icon>
            <div class="min-w-0 flex-1">
              <div
                class="flex items-center gap-2 text-[13px] font-medium leading-5 text-textColor3"
              >
                <!-- Sig'maganini «...» bilan kesamiz, to'liq matn — hover'da -->
                <n-ellipsis class="block! min-w-0 flex-1">
                  {{ $t(`archive.documents.groups.${doc.type?.group || 'others'}`) }}
                </n-ellipsis>
                <span class="shrink-0" :title="$t('archive.documents.date')">
                  {{ Utils.timeOnlyDate(doc.date) || '—' }}
                </span>
              </div>
              <n-ellipsis class="block! text-sm font-semibold leading-5 text-textColor0">
                {{ doc.type?.name || '—' }}
              </n-ellipsis>
            </div>
          </div>

          <!-- Ma'lumotlar: har qator bir xil balandlik (26px), bir xil shrift (14px, 500) -->
          <div class="flex flex-col gap-1 px-4 pb-3">
            <div class="doc-row justify-between">
              <span class="doc-line text-textColor0" :title="$t('archive.documents.number')">
                <span class="truncate">
                  <span>{{ doc.number ? `№${doc.number}` : '—' }}</span>
                  <template v-if="doc.electronic_number">
                    <span> · {{ doc.electronic_number }}</span>
                  </template>
                </span>
              </span>
              <span
                class="doc-status"
                :class="
                  doc.cancelled
                    ? 'bg-fig-red-50 text-fig-text-red'
                    : 'bg-fig-chip-green text-fig-chip-green-text'
                "
              >
                {{
                  doc.cancelled
                    ? $t('archive.documents.cancelled')
                    : $t('archive.documents.approved')
                }}
              </span>
            </div>
            <div class="doc-row">
              <span class="doc-line text-textColor0" :title="workerNames(doc)">
                <span class="truncate">
                  {{ doc.workers?.length ? fio(doc.workers[0]) : '—' }}
                  <span v-if="doc.workers?.length > 1"> +{{ doc.workers.length - 1 }} </span>
                </span>
              </span>
            </div>
            <div class="doc-row">
              <span class="doc-line text-textColor0" :title="doc.organization?.name">
                <span class="truncate">{{ doc.organization?.name || '—' }}</span>
              </span>
            </div>
          </div>

          <!-- Amallar -->
          <div class="mt-auto flex items-center gap-2 border-t border-surface-line px-4 py-2.5">
            <n-button secondary class="doc-btn flex-1" @click.stop="emit('open', doc)">
              <template #icon>
                <n-icon><Eye16Regular /></n-icon>
              </template>
              {{ $t('archive.documents.view') }}
            </n-button>
            <n-button
              type="primary"
              class="doc-btn flex-1"
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
  /* Silliq skroll: skroll ichki ro'yxatda qoladi, sahifaga o'tmaydi */
  .doc-scroll {
    overscroll-behavior: contain;
  }

  .doc-card {
    transition: transform 0.2s;
  }
  /* Hover soyasi alohida qatlamda — faqat opacity animatsiya bo'ladi (arzon).
     box-shadow'ni o'zini animatsiya qilish skroll paytida (kartalar kursor ostidan
     o'tib turganda) har kadrda qayta chizishga olib kelardi → skroll tutilardi. */
  .doc-card::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
    box-shadow:
      0 8px 24px -12px rgb(15 23 42 / 0.18),
      0 2px 6px -2px rgb(15 23 42 / 0.06);
    opacity: 0;
    transition: opacity 0.2s;
  }
  .doc-card:hover {
    transform: translateY(-2px);
  }
  .doc-card:hover::after {
    opacity: 1;
  }

  /* Ma'lumot qatorlari — bir xil balandlik va shrift */
  .doc-row {
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 26px;
  }
  .doc-line {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
    font-size: 14px;
    font-weight: 500;
    line-height: 20px;
  }

  /* Amal tugmalari — medium (34px) va small (28px) orasida */
  .doc-btn {
    --n-height: 30px !important;
    --n-font-size: 13px !important;
  }

  /* Holat chipi — raqam qatorida o'ngda (pill, 22px) */
  .doc-status {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    height: 22px;
    min-width: 108px;
    padding: 0 8px;
    /* Gradient fonida ko'rinib turishi uchun chegara (o'z rangida) */
    border: 1px solid color-mix(in srgb, currentColor 35%, transparent);
    border-radius: 999px;
    font-size: 12px;
    font-weight: 500;
    white-space: nowrap;
  }

  /* Gradient: o'ng yuqoridan chap pastga sekin yo'qoladi; tasdiqlangan — ko'k, bekor qilingan — qizil */
  .doc-card--approved {
    background-image: linear-gradient(
      to bottom left,
      color-mix(in srgb, var(--primary-color) 7%, transparent),
      transparent 70%
    );
  }
  .doc-card--cancelled {
    background-image: linear-gradient(
      to bottom left,
      color-mix(in srgb, var(--fig-text-red) 7%, transparent),
      transparent 70%
    );
  }

  @media (prefers-reduced-motion: reduce) {
    .doc-card:hover {
      transform: none;
    }
  }
</style>
