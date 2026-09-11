<script setup>
  import { UIPageContent } from '@components'
  import { useAccountStore, useNotificationStore, useTelegramBroadcastStore } from '@stores'
  import { createFrom, HistoryList } from './ui'
  import TelegramCreateForm from './ui/telegram/CreateForm.vue'
  import TelegramHistoryList from './ui/telegram/HistoryList.vue'

  const store = useNotificationStore()
  const tgStore = useTelegramBroadcastStore()
  const accStore = useAccountStore()

  // Push yuborish `instructionsWrite` bilan gated (forma faqat huquq bo'lsa).
  // `checkPermission` — yon ta'sirsiz; `checkAction` render vaqtida toast chiqaradi.
  const canSend = computed(() => accStore.checkPermission(accStore.pn.instructionsWrite))

  // Tab: 'push' (FCM) yoki 'telegram' («HRM PRO» boti orqali ommaviy xabar).
  const activeTab = ref('push')

  onMounted(() => {
    // Bildirishnomalar `instructions` slug'i bilan qo'riqlanadi.
    if (!accStore.checkAction(accStore.pn.instructionsRead)) return
    store._push_logs()
  })

  // Telegram tabiga birinchi kirganda ro'yxat yuklanadi (keyin o'zi yangilanadi).
  watch(activeTab, (tab) => {
    if (tab === 'telegram' && !tgStore.list.length) tgStore._index()
  })
</script>

<template>
  <UIPageContent>
    <!-- Tab o'z qatorida: sarlavha bilan bir qatorda bo'lsa ilova shellidagi
         suzuvchi banner (yuqori-markaz) uning chap yarmini yopib qo'yadi. -->
    <div class="shrink-0 text-lg font-semibold">{{ $t('notificationPage.name') }}</div>
    <div class="w-full max-w-[320px] shrink-0">
      <n-tabs v-model:value="activeTab" type="segment" size="small">
        <n-tab name="push">{{ $t('telegramBroadcast.pushTab') }}</n-tab>
        <n-tab name="telegram">{{ $t('telegramBroadcast.tab') }}</n-tab>
      </n-tabs>
    </div>

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
          {{ activeTab === 'push' ? $t('notificationPage.create') : $t('telegramBroadcast.create') }}
        </div>
        <div class="md:min-h-0 md:flex-1 md:overflow-y-auto md:pr-1">
          <createFrom v-if="activeTab === 'push'" />
          <TelegramCreateForm v-else />
        </div>
      </div>

      <!-- O'ng: yuborilgan xabarlar tarixi -->
      <div
        class="col-span-12 flex flex-col rounded-[20px] bg-surface-section p-4 md:min-h-0"
        :class="canSend ? 'md:col-span-7' : 'md:col-span-12'"
      >
        <HistoryList v-if="activeTab === 'push'" />
        <TelegramHistoryList v-else />
      </div>
    </div>
  </UIPageContent>
</template>
