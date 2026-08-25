<script setup>
  // Brauzer bildirishnomasi holati bo'yicha banner:
  //   default → «Yoqish» tugmasi (ruxsat so'raydi)
  //   denied  → yo'riqnoma (brauzer qayta so'ramaydi, faqat sozlamadan ochiladi)
  import { Alert24Regular, AlertOff24Regular, Dismiss20Regular } from '@vicons/fluent'
  import { pushPermission, requestPushPermission } from '@/utils/webPush.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global

  const DISMISS_KEY = 'app-push-banner-dismissed'

  const permission = ref('granted')
  const dismissed = ref(!!localStorage.getItem(DISMISS_KEY))
  const loading = ref(false)
  const showHelp = ref(false)

  const blocked = computed(() => permission.value === 'denied')
  const visible = computed(
    () => !dismissed.value && (permission.value === 'default' || permission.value === 'denied')
  )

  const onEnable = async () => {
    loading.value = true
    const result = await requestPushPermission()
    permission.value = result === 'granted' ? 'granted' : pushPermission()
    loading.value = false
    if (result === 'granted') $Toast.success(t('content.pushEnabled'))
  }

  const onDismiss = () => {
    dismissed.value = true
    localStorage.setItem(DISMISS_KEY, '1')
  }

  onMounted(() => {
    permission.value = pushPermission()
  })
</script>

<template>
  <div
    v-if="visible"
    class="flex items-start gap-3 w-full p-4 mb-4 rounded-xl border"
    :class="blocked ? 'bg-error/5 border-error/30' : 'bg-primary/5 border-primary/30'"
  >
    <n-icon size="22" :class="blocked ? 'text-error' : 'text-primary'" class="mt-0.5 shrink-0">
      <AlertOff24Regular v-if="blocked" />
      <Alert24Regular v-else />
    </n-icon>

    <div class="flex-1 min-w-0">
      <p class="text-sm font-semibold text-textColor0">
        {{ blocked ? t('content.pushBlockedTitle') : t('content.pushEnableTitle') }}
      </p>
      <p class="text-xs text-textColor2 mt-1">
        {{ blocked ? t('content.pushBlockedText') : t('content.pushEnableText') }}
      </p>

      <div class="mt-3">
        <n-button v-if="!blocked" type="primary" size="small" :loading="loading" @click="onEnable">
          {{ t('content.pushEnableBtn') }}
        </n-button>
        <n-button v-else size="small" quaternary @click="showHelp = !showHelp">
          {{ t('content.pushBlockedBtn') }}
        </n-button>
      </div>

      <ol v-if="blocked && showHelp" class="mt-3 pl-4 list-decimal text-xs text-textColor2 space-y-1">
        <li>{{ t('content.pushBlockedText') }}</li>
        <li>chrome://settings/content/notifications</li>
      </ol>
    </div>

    <n-icon size="18" class="text-textColor2 cursor-pointer shrink-0" @click="onDismiss">
      <Dismiss20Regular />
    </n-icon>
  </div>
</template>
