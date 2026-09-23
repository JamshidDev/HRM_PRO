<script setup>
  import {
    ArrowReply20Regular,
    Edit16Regular,
    Copy20Regular,
    ArrowForward20Regular,
    Delete16Regular,
    ChevronRight20Regular
  } from '@vicons/fluent'
  import { QUICK_REACTIONS, EMOJI_LIST } from './emojiData.js'

  defineProps({
    canEdit: { type: Boolean, default: false },
    canDelete: { type: Boolean, default: false },
    canCopy: { type: Boolean, default: false },
    placement: { type: String, default: 'bottom-end' }
  })

  const emit = defineEmits(['reply', 'edit', 'copy', 'forward', 'delete', 'react'])

  const show = ref(false)
  // Berilmasa (tugma bosilganda) popover trigger elementiga qarab o'zi
  // joylashadi; o'ng klik qilinganda esa sichqoncha koordinatasiga qadaladi.
  const x = ref(undefined)
  const y = ref(undefined)
  // Menyu yopilganda to'liq palitra qayta ochilganda tezkor qatordan
  // boshlanadi — foydalanuvchi oldingi holatni eslab qolishini kutmaydi.
  const expanded = ref(false)

  watch(show, (value) => {
    if (!value) expanded.value = false
  })

  // O'ng klik bilan (butun xabar pufakchasi ustida) ochish uchun — ota
  // komponent shablon ref orqali shu metodni chaqiradi.
  const openAt = (clientX, clientY) => {
    x.value = clientX
    y.value = clientY
    show.value = true
  }

  defineExpose({ openAt })

  const pick = (emoji) => {
    emit('react', emoji)
    show.value = false
  }

  const runAction = (name) => {
    emit(name)
    show.value = false
  }
</script>

<template>
  <n-popover
    v-model:show="show"
    raw
    trigger="manual"
    :x="x"
    :y="y"
    :placement="placement"
    :show-arrow="false"
    @clickoutside="show = false"
  >
    <!-- Ko'rinadigan tugma yo'q — menyu FAQAT o'ng klik orqali (ota
         komponentdagi `openAt`) ochiladi. Popover baribir bog'lanadigan
         DOM elementi talab qiladi, shu sababli 0x0 va bosilmaydigan. -->
    <template #trigger>
      <span class="pointer-events-none absolute h-0 w-0 overflow-hidden" />
    </template>

    <div class="w-64 overflow-hidden rounded-2xl border border-surface-line bg-surface-section shadow-lg">
      <!-- Tezkor reaksiyalar / to'liq emoji palitra -->
      <div class="flex items-center gap-1 border-b border-surface-line px-2 py-2">
        <template v-if="!expanded">
          <button
            v-for="emoji in QUICK_REACTIONS"
            :key="emoji"
            type="button"
            class="flex-1 rounded-lg py-1 text-xl leading-none hover:bg-surface-ground"
            @click="pick(emoji)"
          >
            {{ emoji }}
          </button>
          <button
            type="button"
            class="shrink-0 size-7 rounded-full flex items-center justify-center text-textColor3 hover:bg-surface-ground"
            @click="expanded = true"
          >
            <n-icon size="16"><ChevronRight20Regular /></n-icon>
          </button>
        </template>
        <div v-else class="grid max-h-40 w-full grid-cols-8 gap-0.5 overflow-y-auto pr-0.5">
          <button
            v-for="emoji in EMOJI_LIST"
            :key="emoji"
            type="button"
            class="rounded-lg py-1 text-lg leading-none hover:bg-surface-ground"
            @click="pick(emoji)"
          >
            {{ emoji }}
          </button>
        </div>
      </div>

      <!-- Amallar -->
      <div class="py-1">
        <button
          type="button"
          class="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm text-textColor0 hover:bg-surface-ground"
          @click="runAction('reply')"
        >
          <n-icon size="16"><ArrowReply20Regular /></n-icon>
          {{ $t('liveChatPage.reply') }}
        </button>
        <button
          v-if="canEdit"
          type="button"
          class="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm text-textColor0 hover:bg-surface-ground"
          @click="runAction('edit')"
        >
          <n-icon size="16"><Edit16Regular /></n-icon>
          {{ $t('content.edit') }}
        </button>
        <button
          v-if="canCopy"
          type="button"
          class="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm text-textColor0 hover:bg-surface-ground"
          @click="runAction('copy')"
        >
          <n-icon size="16"><Copy20Regular /></n-icon>
          {{ $t('content.copy') }}
        </button>
        <button
          type="button"
          class="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm text-textColor0 hover:bg-surface-ground"
          @click="runAction('forward')"
        >
          <n-icon size="16"><ArrowForward20Regular /></n-icon>
          {{ $t('liveChatPage.forward') }}
        </button>
        <button
          v-if="canDelete"
          type="button"
          class="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm text-danger hover:bg-surface-ground"
          @click="runAction('delete')"
        >
          <n-icon size="16"><Delete16Regular /></n-icon>
          {{ $t('content.delete') }}
        </button>
      </div>
    </div>
  </n-popover>
</template>
