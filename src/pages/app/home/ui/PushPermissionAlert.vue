<script setup>
  // Brauzer bildirishnomasi holati bo'yicha bildirishnoma kartasi:
  //   default → «Yoqish» tugmasi (ruxsat so'raydi)
  //   denied  → yo'riqnoma (brauzer qayta so'ramaydi, faqat sozlamadan ochiladi)
  //
  // Ilgari bu sahifa oqimidagi to'liq kenglikdagi banner edi va bosh sahifaning
  // tepasidan katta joy olardi. Endi u `GlobalNotification.vue` dagi toast
  // stack'i kabi ekranning burchagida suzib turadi — kontent siljimaydi.
  import {
    Alert24Regular,
    AlertOff24Regular,
    Copy20Regular,
    Dismiss20Regular
  } from '@vicons/fluent'
  import { pushPermission, requestPushPermission } from '@/utils/webPush.js'
  import Utils from '@/utils/Utils.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global

  const DISMISS_KEY = 'app-push-banner-dismissed'

  const permission = ref('granted')
  const dismissed = ref(!!localStorage.getItem(DISMISS_KEY))
  const loading = ref(false)
  const showHelp = ref(false)
  // Sahifa ochilishi bilan birga chiqmasin: kontent joylashib olgach, chetdan
  // suzib kirsin — shunda banner emas, bildirishnoma bo'lib o'qiladi.
  const ready = ref(false)

  const blocked = computed(() => permission.value === 'denied')
  const visible = computed(
    () =>
      ready.value &&
      !dismissed.value &&
      (permission.value === 'default' || permission.value === 'denied')
  )

  const onEnable = async () => {
    loading.value = true
    const result = await requestPushPermission()
    permission.value = result === 'granted' ? 'granted' : pushPermission()
    loading.value = false
    if (result === 'granted') $Toast.success(t('content.pushEnabled'))
  }

  /**
   * Brauzer sozlamalari sahifasini KOD BILAN ochish mumkin emas: `chrome://`,
   * `edge://`, `about:` manzillariga sahifadan o'tish brauzer tomonidan
   * bloklanadi (`location`, `window.open`, `<a href>` — hammasi), va bunday API
   * ham yo'q. Ruxsat `denied` bo'lgach `Notification.requestPermission()` ham
   * boshqa so'ramaydi.
   *
   * Shu bois qo'ldan kelgani: brauzerga mos sozlama manzilini ko'rsatib,
   * bosilganda clipboard'ga ko'chirish — foydalanuvchi uni manzil satriga
   * qo'yadi. Safari kabi manzili yo'q brauzerlarda faqat matnli yo'riqnoma
   * qoladi.
   */
  const settingsPath = computed(() => {
    const ua = navigator.userAgent

    // Tartib MUHIM: Edge/Opera ham `Chrome/` ni UA'da olib yuradi.
    if (/Edg\//.test(ua)) return 'edge://settings/content/notifications'
    if (/OPR\//.test(ua)) return 'opera://settings/content/notifications'
    if (/YaBrowser\//.test(ua)) return 'browser://settings/content/notifications'
    if (/Firefox\//.test(ua)) return 'about:preferences#privacy'
    if (/Chrome\//.test(ua)) return 'chrome://settings/content/notifications'
    return null
  })

  const onCopyPath = () => {
    if (!settingsPath.value) return
    Utils.copyToClipboard(settingsPath.value, () => $Toast.success(t('content.pushPathCopied')))
  }

  const onDismiss = () => {
    dismissed.value = true
    localStorage.setItem(DISMISS_KEY, '1')
  }

  let readyTimeout = null

  onMounted(() => {
    permission.value = pushPermission()
    readyTimeout = setTimeout(() => (ready.value = true), 1200)
  })

  onUnmounted(() => clearTimeout(readyTimeout))
</script>

<template>
  <!-- `Teleport`: karta `position: fixed` bo'lgani uchun sahifaning skroll
       konteyneri ichida qolmasligi kerak (ota-elementdagi `transform`/`filter`
       fixed'ni o'ziga bog'lab qo'yishi mumkin). -->
  <Teleport to="body">
    <Transition name="push-alert">
      <div v-if="visible" class="push-alert" :class="{ 'push-alert--blocked': blocked }">
        <n-icon size="18" class="push-alert__icon">
          <AlertOff24Regular v-if="blocked" />
          <Alert24Regular v-else />
        </n-icon>

        <div class="min-w-0 flex-1">
          <p class="text-textColor0 text-[13px] leading-[18px] font-semibold">
            {{ blocked ? t('content.pushBlockedTitle') : t('content.pushEnableTitle') }}
          </p>
          <!-- Yo'riqnoma ochilganda bu qisqartirilgan nusxa yashiriladi: pastda
               aynan shu matn to'liq holda chiqadi, ikki marta ko'rinmasin. -->
          <p
            v-if="!(blocked && showHelp)"
            class="text-textColor2 mt-0.5 line-clamp-2 text-[12px] leading-[16px]"
          >
            {{ blocked ? t('content.pushBlockedText') : t('content.pushEnableText') }}
          </p>

          <div class="mt-2">
            <n-button
              v-if="!blocked"
              type="primary"
              size="tiny"
              :loading="loading"
              @click="onEnable"
            >
              {{ t('content.pushEnableBtn') }}
            </n-button>
            <n-button v-else size="tiny" quaternary @click="showHelp = !showHelp">
              {{ t('content.pushBlockedBtn') }}
            </n-button>
          </div>

          <div v-if="blocked && showHelp" class="mt-2">
            <p class="text-textColor2 text-[11px] leading-[15px]">
              {{ t('content.pushBlockedText') }}
            </p>

            <!-- Manzil bosilganda nusxalanadi: `chrome://` ga sahifadan o'tish
                 bloklangani uchun havola qilib bo'lmaydi. -->
            <button
              v-if="settingsPath"
              type="button"
              class="push-alert__path"
              :title="t('content.pushCopyPath')"
              @click="onCopyPath"
            >
              <span class="truncate">{{ settingsPath }}</span>
              <n-icon size="12" class="shrink-0"><Copy20Regular /></n-icon>
            </button>
          </div>
        </div>

        <n-icon size="16" class="push-alert__close" @click="onDismiss">
          <Dismiss20Regular />
        </n-icon>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
  /*
    O'ng-past burchak ATAYLAB: o'ng-tepada `GlobalNotification.vue` ning toast
    stack'i turadi (`top-[50px] right-2`), ikkisi ustma-ust tushmasin.
    `z-index` ham shu stack'dan (9999) past.
  */
  .push-alert {
    position: fixed;
    right: 16px;
    bottom: 16px;
    z-index: 9000;
    display: flex;
    width: 320px;
    align-items: flex-start;
    gap: 10px;
    padding: 12px;
    border: 1px solid var(--surface-line);
    border-radius: 14px;
    background: var(--surface-section);
    box-shadow: 0 8px 24px rgb(16 24 40 / 12%);
  }

  /* Telefonda 320px qat'iy kenglik ekranga sig'masligi mumkin — kartochka
     chetlardan 12px qoldirib cho'ziladi. */
  @media (max-width: 479.98px) {
    .push-alert {
      right: 12px;
      bottom: 12px;
      left: 12px;
      width: auto;
    }
  }

  .push-alert__icon {
    margin-top: 1px;
    flex-shrink: 0;
    color: var(--primary-color);
  }

  .push-alert--blocked .push-alert__icon {
    color: var(--fig-icon-red);
  }

  /* Sozlama manzili — nusxalash uchun "chip". Havola emas, tugma: brauzer
     `chrome://` ga o'tishga ruxsat bermaydi. */
  .push-alert__path {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
    margin-top: 6px;
    padding: 4px 8px;
    border: 1px solid var(--surface-line);
    border-radius: 8px;
    background: var(--surface-ground);
    color: var(--textColor1);
    cursor: pointer;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 11px;
    line-height: 16px;
    transition: background-color 0.2s ease;
  }

  .push-alert__path:hover {
    background: var(--surface-line);
  }

  .push-alert__close {
    flex-shrink: 0;
    color: var(--textColor2);
    cursor: pointer;
    transition: color 0.2s ease;
  }

  .push-alert__close:hover {
    color: var(--textColor0);
  }

  /* Chetdan suzib kiradi — bildirishnoma stack'idagi harakat bilan bir ohangda. */
  .push-alert-enter-active,
  .push-alert-leave-active {
    transition:
      opacity 0.25s ease,
      transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
  }

  .push-alert-enter-from,
  .push-alert-leave-to {
    opacity: 0;
    transform: translateY(12px) scale(0.96);
  }

  @media (prefers-reduced-motion: reduce) {
    .push-alert-enter-active,
    .push-alert-leave-active {
      transition: none;
    }
  }
</style>
