<script setup>
  import { UIModal } from '@/components/index.js'
  import { useComponentStore } from '@/store/modules/index.js'

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

  // Har bir xatboshi: matn kaliti va (bo'lsa) qalin yoziladigan qismi kaliti.
  const paragraphs = [
    { key: 'p2', bold: 'p2Bold' },
    { key: 'p4' },
    { key: 'p5', bold: 'p5Bold' }
  ]
</script>

<template>
  <UIModal :width="520" :title="$t('content.eSignNotice.title')" v-model:visible="componentStore.fileVisible">
    <div class="flex flex-col gap-3 text-sm text-textColor1 leading-[1.6]">
      <template v-for="item in paragraphs" :key="item.key">
        <i18n-t
          v-if="item.bold"
          :keypath="`content.eSignNotice.${item.key}`"
          tag="p"
          scope="global"
        >
          <template #bold>
            <b class="font-semibold text-textColor0">{{ $t(`content.eSignNotice.${item.bold}`) }}</b>
          </template>
        </i18n-t>
        <p v-else :class="item.class">{{ $t(`content.eSignNotice.${item.key}`) }}</p>
      </template>
    </div>
  </UIModal>
</template>
