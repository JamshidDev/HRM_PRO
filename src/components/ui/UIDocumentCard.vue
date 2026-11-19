<script setup>
  /**
   * Hujjat kartasi — Arxiv (Hisobotlar → Arxiv) kartasidan ajratib olingan umumiy ko'rinish.
   * Ishlatiladi: `archive/ui/DocumentGrid.vue`, Guvohnomalar «Ko'rish» oynasi.
   *
   * Tuzilishi: [ikonka] kulrang qator (+ belgi) | sana → sarlavha (bir qator) →
   * ma'lumot qatorlari (`rows`, har biri 26px) → «Ko'rish» | «Yuklash».
   */
  import icons from '@/assets/icons'
  import { ArrowDownload16Regular, Eye16Regular } from '@vicons/fluent'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global

  const props = defineProps({
    // Ikonka komponenti; berilmasa — PDF.
    icon: { type: [Object, Function], default: null },
    // Ikonka o'lchami (px) va rangi — berilmasa PDF kabi 42px, o'z ranglarida.
    iconSize: { type: Number, default: 42 },
    iconColor: { type: String, default: null },
    // Kulrang yuqori qator (masalan hujjat guruhi) va uning yonidagi kichik belgi («Joriy»).
    subtitle: { type: String, default: '' },
    badge: { type: String, default: '' },
    // O'ngdagi sana (tayyor formatlangan) va uning hover matni.
    date: { type: String, default: '' },
    dateTitle: { type: String, default: '' },
    title: { type: String, default: '' },
    /**
     * Ma'lumot qatorlari: `{ text, title?, textClass?, status?: { text, tone }, note? }`.
     * `status` — o'ngda chip, `note` — o'ngda kulrang kichik matn.
     */
    rows: { type: Array, default: () => [] },
    // Burchak gradienti: 'brand' | 'red' | 'amber' | 'green' | 'neutral'.
    tone: { type: String, default: 'brand' },
    // Kartaga bosish → `open`. O'chirilsa kursor oddiy (hover effekti qoladi).
    clickable: { type: Boolean, default: true },
    showActions: { type: Boolean, default: true },
    viewText: { type: String, default: '' },
    downloadText: { type: String, default: '' },
    downloading: { type: Boolean, default: false },
    downloadDisabled: { type: Boolean, default: false }
  })

  const emit = defineEmits(['open', 'view', 'download'])

  const chipClass = {
    green: 'bg-fig-chip-green text-fig-chip-green-text',
    brand: 'bg-fig-chip-brand text-fig-chip-brand-text',
    amber: 'bg-fig-chip-amber text-fig-chip-amber-text',
    red: 'bg-fig-red-50 text-fig-text-red',
    neutral: 'bg-fig-bg-disable text-fig-text-tertiary'
  }

  const onOpen = () => {
    if (props.clickable) emit('open')
  }
</script>

<template>
  <div
    class="doc-card relative flex flex-col rounded-2xl border border-surface-line bg-surface-section"
    :class="[`doc-card--${tone}`, clickable && 'doc-card--clickable cursor-pointer']"
    @click="onOpen"
  >
    <!-- Yuqori: ikonka (qutisiz), kulrang qator + sana, sarlavha -->
    <div class="flex items-start gap-2 p-4 pb-2">
      <n-icon :size="iconSize" :color="iconColor || undefined" class="shrink-0 flex">
        <component :is="icon || icons.pdfFileIcon" />
      </n-icon>
      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-2 text-[13px] font-medium leading-5 text-textColor3">
          <!-- Sig'maganini «...» bilan kesamiz, to'liq matn — hover'da -->
          <n-ellipsis class="block! min-w-0 flex-1">{{ subtitle }}</n-ellipsis>
          <span v-if="badge" class="doc-badge">{{ badge }}</span>
          <span v-if="date" class="shrink-0" :title="dateTitle || undefined">{{ date }}</span>
        </div>
        <n-ellipsis class="block! text-sm font-semibold leading-5 text-textColor0">
          {{ title || '—' }}
        </n-ellipsis>
      </div>
    </div>

    <!-- Ma'lumotlar: har qator bir xil balandlik (26px), bir xil shrift (14px, 500) -->
    <div class="flex flex-col gap-1 px-4 pb-3">
      <div
        v-for="(row, i) in rows"
        :key="i"
        class="doc-row"
        :class="(row.status || row.note) && 'justify-between'"
      >
        <span class="doc-line" :class="row.textClass || 'text-textColor0'" :title="row.title || undefined">
          <span class="truncate">{{ row.text || '—' }}</span>
        </span>
        <span v-if="row.status" class="doc-status" :class="chipClass[row.status.tone] || chipClass.brand">
          {{ row.status.text }}
        </span>
        <span v-else-if="row.note" class="shrink-0 text-xs text-textColor3">{{ row.note }}</span>
      </div>
    </div>

    <!-- Amallar -->
    <div
      v-if="showActions"
      class="mt-auto flex items-center gap-2 border-t border-surface-line px-4 py-2.5"
    >
      <n-button secondary class="doc-btn flex-1" @click.stop="emit('view')">
        <template #icon>
          <n-icon><Eye16Regular /></n-icon>
        </template>
        {{ viewText || t('content.view') }}
      </n-button>
      <n-button
        type="primary"
        class="doc-btn flex-1"
        :loading="downloading"
        :disabled="downloadDisabled"
        @click.stop="emit('download')"
      >
        <template #icon>
          <n-icon><ArrowDownload16Regular /></n-icon>
        </template>
        {{ downloadText || t('content.download') }}
      </n-button>
    </div>
  </div>
</template>

<style scoped>
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
  /* Hover (ko'tarilish + soya) — HAR kartada; qo'l kursor esa faqat bosiladiganida (`clickable`). */
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

  /* Holat chipi — qatorda o'ngda (pill, 22px) */
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

  /* Kichik belgi kulrang qator yonida («Joriy») */
  .doc-badge {
    flex-shrink: 0;
    padding: 0 8px;
    border: 1px solid color-mix(in srgb, var(--primary-color) 35%, transparent);
    border-radius: 999px;
    color: var(--primary-color);
    font-size: 11px;
    font-weight: 600;
    line-height: 18px;
  }

  /* Gradient: o'ng yuqoridan chap pastga sekin yo'qoladi, rang — `tone` (holat chipi rangi bilan bir xil).
     5% — yengil (7% ham sezilarli edi). */
  .doc-card--brand {
    --doc-tone: var(--primary-color);
  }
  .doc-card--red {
    --doc-tone: var(--fig-text-red);
  }
  .doc-card--amber {
    --doc-tone: var(--fig-chip-amber-text);
  }
  .doc-card--green {
    --doc-tone: var(--fig-chip-green-text);
  }
  .doc-card--brand,
  .doc-card--red,
  .doc-card--amber,
  .doc-card--green {
    background-image: linear-gradient(
      to bottom left,
      color-mix(in srgb, var(--doc-tone) 5%, transparent),
      transparent 70%
    );
  }

  @media (prefers-reduced-motion: reduce) {
    .doc-card:hover {
      transform: none;
    }
  }
</style>
