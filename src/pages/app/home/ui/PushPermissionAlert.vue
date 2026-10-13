<script setup>
  // Bildirishnoma ruxsati — ixcham markaziy modal; ruxsat yo'q bo'lsa har yangi login'dan keyin chiqadi.
  import { Copy20Regular, Dismiss20Regular } from '@vicons/fluent'
  import { UIModal } from '@/components/index.js'
  import { pushPermission, requestPushPermission } from '@/utils/webPush.js'
  import { useAppSetting } from '@/utils/AppSetting.js'
  import Utils from '@/utils/Utils.js'
  import i18n from '@/i18n/index.js'
  import bellUrl from '@/assets/icons/push/bell-3d.png'

  const { t } = i18n.global

  // «Keyinroq» joriy login tokeniga bog'lanadi — qayta login qilinganda modal yana chiqadi.
  const DISMISS_KEY = 'app-push-banner-dismissed'
  const currentToken = () => localStorage.getItem(useAppSetting.tokenKey) || ''

  const permission = ref('granted')
  const visible = ref(false)
  const loading = ref(false)

  const blocked = computed(() => permission.value === 'denied')

  const onLater = () => {
    visible.value = false
    localStorage.setItem(DISMISS_KEY, currentToken())
  }

  const onEnable = async () => {
    loading.value = true
    const result = await requestPushPermission()
    loading.value = false
    permission.value = pushPermission()
    if (result === 'granted') {
      visible.value = false
      $Toast.success(t('content.pushEnabled'))
    }
  }

  // `chrome://` ga sahifadan o'tib bo'lmaydi — sozlama manzili nusxalanadi.
  const settingsPath = computed(() => {
    const ua = navigator.userAgent
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

  let openTimeout = null

  onMounted(() => {
    permission.value = pushPermission()
    const needsPrompt = permission.value === 'default' || permission.value === 'denied'
    const dismissedThisLogin = localStorage.getItem(DISMISS_KEY) === currentToken()
    // Sahifa joylashib olgach ochiladi — kontent bilan bir vaqtda sakramasin.
    if (needsPrompt && !dismissedThisLogin) {
      openTimeout = setTimeout(() => (visible.value = true), 800)
    }
  })

  onUnmounted(() => clearTimeout(openTimeout))
</script>

<template>
  <UIModal v-model:visible="visible" :width="360" @click:close="onLater">
    <template #header>
      <div class="flex justify-end">
        <button
          type="button"
          class="push-modal__close"
          :aria-label="t('content.close')"
          @click="onLater"
        >
          <n-icon size="16"><Dismiss20Regular /></n-icon>
        </button>
      </div>
    </template>

    <div class="flex flex-col items-center px-2 text-center -mt-5">
      <div class="push-modal__halo" :class="{ 'push-modal__halo--blocked': blocked }">
        <img
          :src="bellUrl"
          alt=""
          class="h-16 w-16 select-none"
          :class="{ 'grayscale opacity-70': blocked }"
          draggable="false"
        />
      </div>
      <h3 class="mt-4 text-lg font-semibold leading-6 text-textColor0">
        {{ blocked ? t('content.pushBlockedTitle') : t('content.pushEnableTitle') }}
      </h3>
      <p class="mt-1.5 text-sm leading-5 text-textColor2">
        {{ blocked ? t('content.pushBlockedText') : t('content.pushEnableText') }}
      </p>
    </div>

    <!-- Bloklangan: brauzer qayta so'ramaydi — sozlama manzili nusxalanadi. -->
    <button
      v-if="blocked && settingsPath"
      type="button"
      class="push-modal__path mt-4"
      :title="t('content.pushCopyPath')"
      @click="onCopyPath"
    >
      <span class="truncate">{{ settingsPath }}</span>
      <n-icon size="14" class="shrink-0"><Copy20Regular /></n-icon>
    </button>

    <div class="mt-6 grid gap-3" :class="blocked ? 'grid-cols-1' : 'grid-cols-2'">
      <n-button class="push-modal__btn" type="primary" secondary @click="onLater">
        {{ blocked ? t('content.close') : t('content.later') }}
      </n-button>
      <n-button
        v-if="!blocked"
        class="push-modal__btn"
        type="primary"
        data-modal-submit
        :loading="loading"
        @click="onEnable"
      >
        {{ t('content.pushEnableBtn') }}
      </n-button>
    </div>
  </UIModal>
</template>

<style scoped>
  .push-modal__close {
    display: flex;
    width: 28px;
    height: 28px;
    align-items: center;
    justify-content: center;
    border-radius: 9999px;
    color: var(--textColor2);
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  .push-modal__close:hover {
    background: var(--surface-ground);
  }

  /* Ikonka orqasidagi yumshoq brend doirasi. */
  .push-modal__halo {
    display: flex;
    width: 88px;
    height: 88px;
    align-items: center;
    justify-content: center;
    border-radius: 9999px;
    background: color-mix(in srgb, var(--primary-color) 10%, transparent);
  }

  .push-modal__halo--blocked {
    background: var(--surface-ground);
  }

  .push-modal__btn {
    height: 40px;
    border-radius: 10px;
    font-weight: 600;
  }

  /* Sozlama manzili — havola emas, nusxalash tugmasi. */
  .push-modal__path {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 6px 10px;
    border: 1px solid var(--surface-line);
    border-radius: 10px;
    background: var(--surface-ground);
    color: var(--textColor1);
    cursor: pointer;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 12px;
    line-height: 16px;
    transition: background-color 0.2s ease;
  }

  .push-modal__path:hover {
    background: var(--surface-line);
  }
</style>
