<script setup>
  import {
    Eye20Regular,
    Save16Regular,
    DismissCircle32Filled,
    FullScreenMaximize24Regular,
    FullScreenMinimize24Regular
  } from '@vicons/fluent'
  import { useCommandStore } from '@/store/modules/index.js'
  import { UIModal } from '@/components/index.js'
  import CommandFormBody from './CommandFormBody.vue'

  const store = useCommandStore()
  const bodyRef = ref(null)

  // To'liq ekran — sahifa ochiq turguncha eslab qolinadi (modal qayta ochilganda ham).
  const isFullscreen = ref(false)
  // Kattalashish/kichrayish silliq bo'lishi uchun brauzerning View Transitions API'si
  // ishlatiladi: modal kartasi eski o'lchamidan yangisiga «o'sib» o'tadi.
  // API yo'q brauzerda yoki «harakatni kamaytirish» yoqilgan bo'lsa — darhol almashadi.
  const toggleFullscreen = () => {
    const flip = async () => {
      isFullscreen.value = !isFullscreen.value
      await nextTick()
    }
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (!document.startViewTransition || reduceMotion) return flip()
    document.startViewTransition(flip)
  }

  // Forma sahifa ochilganda bir marta tozalanadi (modal yopilib-ochilganda qiymatlar saqlanadi).
  onMounted(() => store.resetForm())

  // status=true — PDF ko'rish, aks holda yaratish (forma holati «Ma'lumotlar» tabi uchun saqlanadi).
  const onSubmit = async (status) => {
    const res = await bodyRef.value?.submit()
    if (!res?.isValid) return
    if (status) {
      store._viewCommand(res.data)
    } else {
      store._create({ ...res.data, form_state: store.snapshotFormState() })
    }
  }
</script>

<template>
  <UIModal
    v-model:visible="store.visible"
    :width="isFullscreen ? '100vw' : 1200"
    :max-width="isFullscreen ? '100vw' : undefined"
    :height="isFullscreen ? '100dvh' : null"
    :card-class="['command-form', isFullscreen && 'command-form--fullscreen']"
  >
    <template #header>
      <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 pb-2 px-4">
        <div class="flex items-center gap-3 min-w-0">
          <n-button
            secondary
            class="shrink-0 no-scale"
            :title="
              $t(
                isFullscreen
                  ? 'documentPage.command.exitFullscreen'
                  : 'documentPage.command.fullscreen'
              )
            "
            :aria-label="
              $t(
                isFullscreen
                  ? 'documentPage.command.exitFullscreen'
                  : 'documentPage.command.fullscreen'
              )
            "
            :aria-pressed="isFullscreen"
            @click="toggleFullscreen"
          >
            <template #icon>
              <FullScreenMinimize24Regular v-if="isFullscreen" />
              <FullScreenMaximize24Regular v-else />
            </template>
          </n-button>
          <h3 class="text-lg font-medium truncate">
            {{ $t('documentPage.command.createTitle') }}
          </h3>
        </div>
        <!-- Tartib: bekor qilish → ko'rish → saqlash (asosiy amal eng o'ngda). -->
        <div class="flex items-center gap-2">
          <n-button class="no-scale" type="error" secondary @click="store.openVisible(false)">
            <template #icon>
              <DismissCircle32Filled />
            </template>
            {{ $t('content.cancel') }}
          </n-button>
          <n-button class="no-scale" ghost :loading="store.viewLoading" @click="onSubmit(true)">
            <template #icon>
              <Eye20Regular />
            </template>
            {{ $t('content.view') }}
          </n-button>
          <n-button
            class="no-scale"
            type="primary"
            data-modal-submit
            :loading="store.saveLoading"
            @click="onSubmit(false)"
          >
            <template #icon>
              <Save16Regular />
            </template>
            {{ $t('content.save') }}
          </n-button>
        </div>
      </div>
    </template>
    <!-- To'liq ekranda UIModal tanasining o'zi skroll qiladi; bu yerda ikkinchi skroll
         bo'lsa o'ng ustundagi yopishqoq (sticky) imzolovchilar bloki ishlamay qoladi.
         Element bitta qoladi — almashganda forma qayta yaratilmaydi, kiritilganlar saqlanadi. -->
    <div
      :style="isFullscreen ? null : { height: 'calc(100vh - 100px)' }"
      class="px-1"
      :class="isFullscreen ? 'max-w-[1760px] mx-auto' : 'overflow-y-auto overflow-x-hidden'"
    >
      <CommandFormBody ref="bodyRef" mode="create" :wide="isFullscreen" />
    </div>
  </UIModal>
</template>

<style>
  /* To'liq ekran: burchaksiz, ekran chetigacha. */
  .command-form--fullscreen {
    border-radius: 0 !important;
  }

  /* Kattalashish animatsiyasi: karta alohida qatlam bo'lib o'lchami silliq o'zgaradi,
     ichidagi eski va yangi ko'rinish bir-biriga tez almashadi. */
  .command-form {
    view-transition-name: command-form;
  }
  ::view-transition-group(command-form) {
    animation-duration: 0.38s;
    animation-timing-function: cubic-bezier(0.2, 0.8, 0.2, 1);
  }
  ::view-transition-old(command-form),
  ::view-transition-new(command-form) {
    height: 100%;
    width: 100%;
    object-fit: cover;
    object-position: top left;
    animation-duration: 0.22s;
  }
  ::view-transition-group(root) {
    animation-duration: 0.38s;
  }
</style>
