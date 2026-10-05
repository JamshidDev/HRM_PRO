<script setup>
  import { Dismiss24Regular } from '@vicons/fluent'
  import { useAppBreakpoints } from '@/composables/index.js'

  const visible = defineModel('visible', { type: Boolean, default: false })
  const emit = defineEmits(['click:close'])
  const props = defineProps({
    width: {
      type: [Number, String],
      default: 400
    },
    height: {
      type: [Number, String],
      default: null
    },
    /**
     * `width` HAR DOIM shu qiymatga qisiladi. Ilgari clamp umuman yo'q edi, ya'ni
     * `:width="1200"` tom ma'noda `width: 1200px` bo'lib, telefon/planshetda
     * ekrandan chiqib ketardi. Clamp faqat `viewport < width + 32` bo'lganda
     * ishga tushadi — ya'ni allaqachon buzuq bo'lgan holatlarda.
     */
    maxWidth: {
      type: String,
      default: 'calc(100vw - 32px)'
    },
    /**
     * Telefonda (`< md`) modal butun ekranni egallaydi — burchaksiz, chetsiz.
     * Faqat KENG modallar uchun (~700px+): tor dialoglar markazlashgan karta
     * bo'lib qolgani ma'qul, aks holda ular navigatsiyaga o'xshab qoladi.
     * Shu sababli opt-in.
     */
    fullscreenOnMobile: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: 'no-title'
    },
    // Faqat tashqi (mask) bosilganda yopilishni bloklaydi — tasodifiy klikdan
    // forma yo'qolmasin. Esc esa ongli harakat, u `closeOnEsc` bilan boshqariladi.
    persistent: {
      type: Boolean,
      default: true
    },
    closeOnEsc: {
      type: Boolean,
      default: true
    },
    cardClass: {
      type: [String, Array, Object],
      default: null
    },
    /**
     * Sarlavha ostidagi ajratuvchi chiziq. Tanasi o'zi bo'limlarga bo'lingan
     * (masalan shartnoma sehrgari) modallarda chiziq ortiqcha — o'chiriladi.
     */
    headerDivider: {
      type: Boolean,
      default: true
    }
  })

  const { isMobile } = useAppBreakpoints()
  const isFullscreen = computed(() => props.fullscreenOnMobile && isMobile.value)

  // Fullscreen ham `height` kabi ichki skroll konteyner talab qiladi.
  const isFlexBody = computed(() => Boolean(props.height) || isFullscreen.value)

  const cardStyle = computed(() => {
    if (isFullscreen.value) {
      return {
        width: '100vw',
        maxWidth: '100vw',
        height: '100dvh',
        maxHeight: '100dvh',
        borderRadius: '0',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }
    }

    return {
      width: isNaN(props.width) ? props.width : props.width + 'px',
      maxWidth: props.maxWidth,
      ...(props.height
        ? {
            height: isNaN(props.height) ? props.height : props.height + 'px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }
        : {})
    }
  })

  const onClickClose = () => {
    visible.value = false
    emit('click:close')
  }

  // Esc/mask orqali yopilganda ham X tugmasi bilan bir xil hodisa chiqsin.
  const onUpdateShow = (show) => {
    if (!show) emit('click:close')
  }

  // ♿ Ochilganda fokus birinchi forma maydoniga tushadi — darhol klaviaturada
  // to'ldirish mumkin. naive-ui o'zi birinchi fokuslanuvchi elementni tanlardi,
  // u esa sarlavhadagi yopish tugmasi bo'lib qoladi. Sana/vaqt tanlagichlar
  // fokusda panel ochadi — ular o'tkazib yuboriladi. Telefonda klaviatura
  // o'z-o'zidan chiqib ketmasligi uchun avtofokus qilinmaydi.
  const bodyRef = ref(null)
  const closeBtnRef = ref(null)
  const FIELD_SELECTOR = '.n-input:not(.n-input--disabled) :is(input, textarea)'
  const onAfterEnter = () => {
    if (isMobile.value) return
    const field = [...(bodyRef.value?.querySelectorAll(FIELD_SELECTOR) ?? [])].find(
      (el) => !el.closest('.n-date-picker, .n-time-picker') && el.offsetParent !== null
    )
    ;(field ?? closeBtnRef.value)?.focus({ preventScroll: true })
  }

  // ⌨️ Ctrl/Cmd + Enter — formani saqlash. Saqlash tugmasi har modalda o'zicha
  // (ko'pincha slot ichidagi forma komponentida), shuning uchun uni DOM'dan
  // topamiz: avval aniq belgilangan `data-modal-submit`, bo'lmasa eng oxirgi
  // ko'rinib turgan to'liq (secondary/ghost emas) primary tugma. Popover ichidagi
  // tugmalar (masalan daraxt qidiruvi) hisobga olinmaydi.
  const SUBMIT_FALLBACK =
    '.n-button--primary-type:not(.n-button--secondary):not(.n-button--ghost):not(.n-button--dashed)'
  const isUsable = (btn) =>
    !btn.disabled &&
    !btn.classList.contains('n-button--loading') &&
    !btn.closest('.n-popover') &&
    btn.getClientRects().length > 0
  const onCardKeydown = (e) => {
    if (e.key !== 'Enter' || !(e.ctrlKey || e.metaKey) || e.isComposing) return
    const root = e.currentTarget
    const btn =
      [...root.querySelectorAll('[data-modal-submit]')].find(isUsable) ??
      [...root.querySelectorAll(SUBMIT_FALLBACK)].filter(isUsable).pop()
    if (!btn) return
    e.preventDefault()
    btn.click()
  }
</script>

<template>
  <n-modal
    v-model:show="visible"
    :close-on-esc="closeOnEsc"
    :mask-closable="!persistent"
    :auto-focus="false"
    class="ui__modal-element"
    @update:show="onUpdateShow"
    @after-enter="onAfterEnter"
  >
    <n-card
      title="Modal"
      :class="cardClass"
      :bordered="false"
      size="huge"
      role="dialog"
      aria-modal="true"
      :style="cardStyle"
      @keydown="onCardKeydown"
      :content-style="
        isFlexBody
          ? 'flex:1;min-height:0;overflow:hidden;padding:0;display:flex;flex-direction:column;'
          : 'padding:0;'
      "
      closable
    >
      <template #default>
        <div class="flex flex-col p-2" :class="[isFlexBody && 'h-full']">
          <div class="w-full shrink-0">
            <slot name="header">
              <!-- `-mx-2 -mt-2` tashqi `p-2` ni bekor qiladi, shunda ajratuvchi chiziq
                   kartaning butun kengligi bo'ylab cho'ziladi. -->
              <div
                class="ui-modal__header flex items-center justify-between gap-3 -mx-2 -mt-2 px-6 py-4"
                :class="headerDivider && 'border-b border-surface-line'"
              >
                <!-- `min-w-0` + `flex-1`: uzun sarlavha amallar qatorini (sana,
                     yopish tugmasi) siqib chiqarmasin, o'zi qisqartirilsin. -->
                <h3 class="text-xl font-bold text-textColor0 truncate min-w-0 flex-1">
                  <slot name="header-title">
                    {{ title }}
                  </slot>
                </h3>
                <!-- Qo'shimcha amallar — YOPISH tugmasidan oldin. Slot bo'sh bo'lsa
                     hech narsa render qilinmaydi, mavjud modallar o'zgarmaydi. -->
                <div class="flex items-center gap-2 shrink-0">
                  <slot name="header-actions"></slot>
                  <button
                    ref="closeBtnRef"
                    type="button"
                    :aria-label="$t('content.close')"
                    :title="$t('content.close')"
                    @click="onClickClose"
                    class="w-9 h-9 rounded-full bg-surface-ground hover:bg-surface-line flex items-center justify-center cursor-pointer shrink-0 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <n-icon size="18" class="text-textColor1">
                      <Dismiss24Regular />
                    </n-icon>
                  </button>
                </div>
              </div>
            </slot>
          </div>
          <div
            ref="bodyRef"
            class="px-4 pt-4 pb-4"
            :class="[isFlexBody && 'flex-1 min-h-0 overflow-y-auto']"
          >
            <slot name="default"> </slot>
          </div>
          <div class="shrink-0" v-if="$slots.footer">
            <slot name="footer"> </slot>
          </div>
        </div>
      </template>
    </n-card>
  </n-modal>
</template>
