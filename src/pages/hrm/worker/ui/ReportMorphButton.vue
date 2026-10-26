<script setup>
  import { Dismiss16Regular } from '@vicons/fluent'
  import reportIcon from '@/assets/icons/reportIcon.svg?url'
  import exportIcon from '@/assets/icons/export.svg?url'

  // «Hisobot olish» ↔ yashil «Yuklash | ×» — BITTA quti o'zgaradi: rangi binafshadan yashilga
  // (500ms) o'tadi, kengligi yangi kontentga moslashadi, ichidagi yozuv esa sirpanib almashadi.
  // Ikki xil tugmani ustma-ust qo'yish xira «dog'» berardi — shuning uchun bitta quti.
  const props = defineProps({
    active: { type: Boolean, default: false },
    count: { type: Number, default: 0 },
    disabled: { type: Boolean, default: false }
  })
  defineEmits(['open', 'export', 'close'])

  // Kenglik `auto` dan `auto` ga animatsiya qilinmaydi — shu sabab ichki kontent o'lchanib,
  // qutiga aniq px kenglik beriladi va u `transition` bilan o'zgaradi.
  const innerRef = ref(null)
  const width = ref(null)
  let observer = null
  onMounted(() => {
    observer = new ResizeObserver(([entry]) => {
      width.value = Math.ceil(entry.borderBoxSize?.[0]?.inlineSize ?? innerRef.value.offsetWidth)
    })
    observer.observe(innerRef.value)
  })
  onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <div
    class="report-morph"
    :class="{ 'is-active': props.active }"
    :style="width ? { width: `${width}px` } : null"
  >
    <div ref="innerRef" class="report-morph__inner">
      <Transition name="report-content" mode="out-in">
        <button
          v-if="!props.active"
          key="idle"
          type="button"
          class="report-morph__btn"
          @click="$emit('open')"
        >
          <img :src="reportIcon" alt="" />
          {{ $t('workerPage.filter.generateReport') }}
        </button>
        <div v-else key="active" class="report-morph__row">
          <button
            type="button"
            class="report-morph__btn"
            :disabled="props.disabled"
            @click="$emit('export')"
          >
            <img :src="exportIcon" alt="" />
            {{ $t('content.download') }}
            <!-- Son o'zgarganda belgi qisqa «sakraydi» -->
            <span :key="props.count" class="report-morph__badge">{{ props.count }}</span>
          </button>
          <button
            type="button"
            class="report-morph__close"
            :title="$t('content.cancel')"
            :aria-label="$t('content.cancel')"
            @click="$emit('close')"
          >
            <n-icon size="16"><Dismiss16Regular /></n-icon>
          </button>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
  /* Asos — yashil; ustida binafsha gradient qatlami. Faol bo'lganda qatlam so'nadi —
     rang aynan shu qutining o'zida silliq o'tadi (gradient'ni to'g'ridan-to'g'ri
     animatsiya qilib bo'lmaydi). Balandlik yonidagi tugmalarniki (34px). */
  .report-morph {
    position: relative;
    isolation: isolate;
    display: inline-flex;
    height: 34px;
    border-radius: 8px;
    overflow: hidden;
    color: #fff;
    background: var(--success-color);
    transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .report-morph::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    background: linear-gradient(135deg, #6a5cf5, #4b3df0);
    transition: opacity 0.5s ease;
  }
  .report-morph.is-active::before {
    opacity: 0;
  }

  /* `flex: 0 0 auto` shart: aks holda ichki qator quti kengligiga qisilib, o'lchov ham
     qisilgan qiymatni berardi — son belgisi (63725) kesilib qolardi. Kenglik animatsiyasi
     paytida ortiqcha qism qutining `overflow: hidden` i bilan yashiriladi. */
  .report-morph__inner {
    flex: 0 0 auto;
    display: inline-flex;
    width: max-content;
    height: 100%;
  }
  .report-morph__row {
    display: inline-flex;
    height: 100%;
  }

  .report-morph__btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    height: 100%;
    padding: 0 16px;
    border: 0;
    background: transparent;
    color: inherit;
    font-size: 14px;
    font-weight: 600;
    white-space: nowrap;
    cursor: pointer;
    outline: none;
    transition: background-color 0.2s ease;
  }
  .report-morph__btn img {
    width: 16px;
    height: 16px;
    filter: brightness(0) invert(1);
  }
  .report-morph__btn:hover:not(:disabled) {
    background: rgb(255 255 255 / 12%);
  }
  .report-morph__btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Yopish qismi ajralib tursin — to'qroq fon va oq ajratuvchi chiziq. */
  .report-morph__close {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 0 12px;
    border: 0;
    color: inherit;
    background: rgb(0 0 0 / 14%);
    box-shadow: inset 1px 0 0 rgb(255 255 255 / 35%);
    cursor: pointer;
    outline: none;
    transition: background-color 0.2s ease;
  }
  .report-morph__close:hover {
    background: rgb(0 0 0 / 24%);
  }
  .report-morph__btn:focus-visible,
  .report-morph__close:focus-visible {
    box-shadow: inset 0 0 0 2px rgb(255 255 255 / 85%);
  }

  .report-morph__badge {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 20px;
    height: 20px;
    padding: 0 5px;
    border-radius: 999px;
    background: var(--white-color);
    color: var(--success-color);
    font-size: 12px;
    font-weight: 700;
    animation: report-badge-pop 0.3s ease-out;
  }

  /* Ichki yozuv: eskisi tepaga chiqib so'nadi, yangisi pastdan kiradi. */
  .report-content-enter-active,
  .report-content-leave-active {
    transition:
      opacity 0.2s ease,
      transform 0.2s ease;
  }
  .report-content-enter-from {
    opacity: 0;
    transform: translateY(8px);
  }
  .report-content-leave-to {
    opacity: 0;
    transform: translateY(-8px);
  }

  @keyframes report-badge-pop {
    0% {
      transform: scale(0.6);
    }
    60% {
      transform: scale(1.2);
    }
    100% {
      transform: scale(1);
    }
  }

  /* Telefon: qatorni to'liq egallaydi (kenglik animatsiyasi kerak emas), × doim ko'rinadi. */
  @media (max-width: 767.98px) {
    .report-morph {
      width: auto !important;
      height: 38px;
    }
    .report-morph__inner,
    .report-morph__row {
      width: 100%;
    }
    .report-morph__btn {
      flex: 1 1 0;
      min-width: 0;
      justify-content: center;
      gap: 6px;
      padding: 0 10px;
    }
    .report-morph__close {
      flex: 0 0 auto;
      padding: 0 10px;
    }
    .report-morph__badge {
      flex: 0 0 auto;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .report-morph,
    .report-morph::before,
    .report-content-enter-active,
    .report-content-leave-active {
      transition: none;
    }
    .report-morph__badge {
      animation: none;
    }
  }
</style>
