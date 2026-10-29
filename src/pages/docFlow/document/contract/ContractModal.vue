<script setup>
  /**
   * Shartnoma tuzish modali — Shartnomalar, Asosiy xodimlar va Nomzodlar sahifalari
   * uchun bitta. Buyruqlar modali (command/CommandForm.vue) qolipida: sarlavhada
   * to'liq ekran tugmasi, nom va amallar; qadamlar ostidagi qatorda.
   * Ochiq/yopiqligi sahifaning o'z store'ida (`v-model:visible`), sehrgar holati —
   * `contractStore` da.
   */
  import {
    ArrowLeft16Regular,
    ArrowRight16Regular,
    DismissCircle32Filled,
    FullScreenMaximize24Regular,
    FullScreenMinimize24Regular,
    Save16Regular
  } from '@vicons/fluent'
  import { UIModal } from '@/components/index.js'
  import { useContractStore } from '@/store/modules/index.js'
  import contractForm from './contractForm.vue'
  import ContractFormSteps from './ui/ContractFormSteps.vue'

  defineProps({
    title: {
      type: String,
      required: true
    },
    // Yaratilgandan keyin chaqiriladi (FXSH — 1-qadamda saqlanadigan tur uchun).
    callBack: {
      type: Function,
      default: null
    }
  })

  const visible = defineModel('visible', { type: Boolean, default: false })

  const store = useContractStore()
  const formRef = ref(null)

  // Oxirgi qadam: FXSH (turi 2) da 1-qadam, boshqalarda 3-qadam — tugma «Saqlash» bo'ladi.
  const isLastStep = computed(
    () => (store.activeTab === 1 && store.payload.type === 2) || store.activeTab === 3
  )

  // To'liq ekran — buyruqlar modalidagidek, silliq o'tish View Transitions API bilan.
  const isFullscreen = ref(false)
  const fullscreenLabel = computed(() =>
    isFullscreen.value ? 'documentPage.command.exitFullscreen' : 'documentPage.command.fullscreen'
  )
  const toggleFullscreen = () => {
    const flip = async () => {
      isFullscreen.value = !isFullscreen.value
      await nextTick()
    }
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (!document.startViewTransition || reduceMotion) return flip()
    document.startViewTransition(flip)
  }
</script>

<template>
  <UIModal
    v-model:visible="visible"
    :width="isFullscreen ? '100vw' : 1200"
    :max-width="isFullscreen ? '100vw' : undefined"
    :height="isFullscreen ? '100dvh' : null"
    :card-class="['contract-modal-card', isFullscreen && 'contract-modal-card--fullscreen']"
    fullscreen-on-mobile
  >
    <template #header>
      <div class="contract-modal__head -mx-2 -mt-2 px-4 pt-2 pb-2">
        <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <div class="flex items-center gap-3 min-w-0">
            <n-button
              secondary
              class="shrink-0 no-scale"
              :title="$t(fullscreenLabel)"
              :aria-label="$t(fullscreenLabel)"
              :aria-pressed="isFullscreen"
              @click="toggleFullscreen"
            >
              <template #icon>
                <FullScreenMinimize24Regular v-if="isFullscreen" />
                <FullScreenMaximize24Regular v-else />
              </template>
            </n-button>
            <h3 class="text-lg font-medium truncate">{{ title }}</h3>
          </div>
          <!-- Tartib: bekor qilish → orqaga → keyingi/saqlash (asosiy amal eng o'ngda).
               4-qadam (holati) — natija, unda faqat yopish qoladi. -->
          <div class="flex items-center gap-2">
            <n-button class="no-scale" type="error" secondary @click="visible = false">
              <template #icon>
                <DismissCircle32Filled />
              </template>
              {{ $t(store.activeTab === 4 ? 'content.close' : 'content.cancel') }}
            </n-button>
            <template v-if="store.activeTab !== 4">
              <n-button
                v-if="store.activeTab !== 1"
                class="no-scale"
                ghost
                :disabled="store.saveLoading"
                @click="formRef?.goBack()"
              >
                <template #icon>
                  <ArrowLeft16Regular />
                </template>
                {{ $t('content.back') }}
              </n-button>
              <n-button
                class="no-scale"
                type="primary"
                icon-placement="right"
                data-modal-submit
                :loading="store.saveLoading"
                @click="formRef?.onSubmit()"
              >
                <template #icon>
                  <Save16Regular v-if="isLastStep" />
                  <ArrowRight16Regular v-else />
                </template>
                {{ $t(isLastStep ? 'content.save' : 'content.next') }}
              </n-button>
            </template>
          </div>
        </div>
        <div class="mt-3 flex justify-center">
          <ContractFormSteps />
        </div>
      </div>
    </template>
    <contractForm ref="formRef" :call-back="callBack" />
  </UIModal>
</template>
