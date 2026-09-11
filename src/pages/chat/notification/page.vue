<script setup>
  import { UIPageContent } from '@components'
  import { useAccountStore, useNotificationStore } from '@stores'
  import { createFrom, HistoryList } from './ui'

  const store = useNotificationStore()
  const accStore = useAccountStore()

  // Push yuborish `instructionsWrite` bilan gated (forma faqat huquq bo'lsa).
  // `checkPermission` — yon ta'sirsiz; `checkAction` render vaqtida toast chiqaradi.
  const canSend = computed(() => accStore.checkPermission(accStore.pn.instructionsWrite))

  onMounted(() => {
    // Bildirishnomalar `instructions` slug'i bilan qo'riqlanadi.
    if (!accStore.checkAction(accStore.pn.instructionsRead)) return
    store._push_logs()
  })
</script>

<template>
  <UIPageContent>
    <!-- Ekran ikkiga bo'linadi: chapda forma (doimiy ochiq), o'ngda yuborilganlar.
         Balandlik `.ui-page-content { height: 100% }` zanjiridan keladi — desktopda
         sahifa skroll bo'lmaydi, har panel o'zi skroll qiladi. Mobilda (< md)
         panellar tik yig'iladi va cheklovlar o'chadi. -->
    <div class="grid grid-cols-12 gap-4 md:min-h-0 md:flex-1">
      <!-- Chap: xabar yuborish formasi -->
      <div
        v-if="canSend"
        class="col-span-12 flex flex-col rounded-[20px] bg-surface-section p-4 md:col-span-5 md:min-h-0"
      >
        <div class="mb-3 shrink-0 text-sm font-semibold text-gray-500">
          {{ $t('notificationPage.create') }}
        </div>
        <div class="md:min-h-0 md:flex-1 md:overflow-y-auto md:pr-1">
          <createFrom />
        </div>
      </div>

      <!-- O'ng: yuborilgan bildirishnomalar -->
      <div
        class="col-span-12 flex flex-col rounded-[20px] bg-surface-section p-4 md:min-h-0"
        :class="canSend ? 'md:col-span-7' : 'md:col-span-12'"
      >
        <HistoryList />
      </div>
    </div>
  </UIPageContent>
</template>
