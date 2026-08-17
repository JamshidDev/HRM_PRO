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
    persistent: {
      type: Boolean,
      default: true
    },
    cardClass: {
      type: [String, Array, Object],
      default: null
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
</script>

<template>
  <n-modal
    v-model:show="visible"
    :close-on-esc="!persistent"
    :mask-closable="!persistent"
    class="ui__modal-element"
  >
    <n-card
      title="Modal"
      :class="cardClass"
      :bordered="false"
      size="huge"
      role="dialog"
      aria-modal="true"
      :style="cardStyle"
      :content-style="isFlexBody ? 'flex:1;min-height:0;overflow:hidden;padding:0;display:flex;flex-direction:column;' : 'padding:0;'"
      closable
    >
      <template #default>
        <div class="flex flex-col p-2" :class="[isFlexBody && 'h-full']">
          <div class="w-full shrink-0">
            <slot name="header">
              <!-- `-mx-2 -mt-2` tashqi `p-2` ni bekor qiladi, shunda ajratuvchi chiziq
                   kartaning butun kengligi bo'ylab cho'ziladi. -->
              <div
                class="flex items-center justify-between gap-3 -mx-2 -mt-2 px-6 py-4 border-b border-surface-line"
              >
                <h3 class="text-xl font-bold text-textColor0 truncate">
                  <slot name="header-title">
                    {{ title }} 
                  </slot>
                </h3>
                <div
                  @click="onClickClose"
                  class="w-9 h-9 rounded-full bg-surface-ground hover:bg-surface-line flex items-center justify-center cursor-pointer shrink-0 transition-colors"
                >
                  <n-icon size="18" class="text-textColor1">
                    <Dismiss24Regular />
                  </n-icon>
                </div>
              </div>
            </slot>
          </div>
          <div class="px-4 pt-4 pb-4" :class="[isFlexBody && 'flex-1 min-h-0 overflow-y-auto']">
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
