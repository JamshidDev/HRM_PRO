<script setup>
  import { UIModal } from '@/components/index.js'
  import { useComponentStore } from '@/store/modules/index.js'
  import { Signature20Regular, DocumentLock20Regular, ShieldCheckmark20Regular } from '@vicons/fluent'

  // Tugma bilan tasdiqlash o'chirildi — hujjatlar endi faqat E-imzo orqali tasdiqlanadi.
  // Modal foydalanuvchini shu o'zgarish haqida xabardor qiladi. `model` / `documentId`
  // propslari va `onSuccess` hodisasi chaqiruvchi sahifalar buzilmasligi uchun qoldirildi.
  defineProps({
    model: {
      type: String,
      required: true
    },
    documentId: {
      type: Number,
      default: null
    }
  })
  defineEmits(['onSuccess'])

  const componentStore = useComponentStore()

  // Har bir xatboshi alohida kartada: ikonka, matn kaliti va (bo'lsa) qalin qism kaliti.
  const paragraphs = [
    { key: 'p2', bold: 'p2Bold', icon: Signature20Regular },
    { key: 'p4', icon: DocumentLock20Regular },
    { key: 'p5', bold: 'p5Bold', icon: ShieldCheckmark20Regular }
  ]
</script>

<template>
  <UIModal :width="520" :title="$t('content.eSignNotice.title')" v-model:visible="componentStore.fileVisible">
    <div class="flex flex-col gap-3">
      <div
        v-for="item in paragraphs"
        :key="item.key"
        class="flex items-start gap-3 p-4 rounded-xl border border-surface-line bg-fig-bg-secondary"
      >
        <div class="w-9 h-9 rounded-lg bg-fig-chip-brand text-fig-chip-brand-text flex items-center justify-center shrink-0">
          <n-icon size="20">
            <component :is="item.icon" />
          </n-icon>
        </div>
        <i18n-t
          v-if="item.bold"
          :keypath="`content.eSignNotice.${item.key}`"
          tag="p"
          scope="global"
          class="text-sm text-textColor1 leading-[1.6]"
        >
          <template #bold>
            <b class="font-semibold text-textColor0">{{ $t(`content.eSignNotice.${item.bold}`) }}</b>
          </template>
        </i18n-t>
        <p v-else class="text-sm text-textColor1 leading-[1.6]">
          {{ $t(`content.eSignNotice.${item.key}`) }}
        </p>
      </div>
    </div>
  </UIModal>
</template>
