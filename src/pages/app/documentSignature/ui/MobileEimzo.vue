<script setup>
  import { useRoute } from 'vue-router'
  import { usePdfViewerStore } from '@/store/modules/index.js'
  import { Phone24Regular } from '@vicons/fluent'

  defineProps({ isPhone: { type: Boolean, default: false } })
  const store = usePdfViewerStore()
  const route = useRoute()
  const waiting = ref(false)
  let poll = null

  const stop = () => {
    clearInterval(poll)
    poll = null
    waiting.value = false
  }
  onBeforeUnmount(stop)

  // E-IMZO ilovasi imzolaguncha har 2 soniyada holat so'raladi, tayyor bo'lsa tekshiruvga yuboriladi.
  const start = async () => {
    stop()
    await store._linkMobileInit(route.query)
    if (!store.mobileSession) return
    waiting.value = true
    poll = setInterval(async () => {
      try {
        const res = await store._linkMobileStatus(route.query)
        if (res.data?.data?.status !== 1) return
        clearInterval(poll)
        await store._linkMobileVerify(route.query)
        stop()
      } catch {
        stop()
      }
    }, 2000)
  }
</script>

<template>
  <div class="rounded-xl border border-surface-line bg-surface-section p-6 mt-2 text-center">
    <n-icon size="40" class="text-primary"><Phone24Regular /></n-icon>
    <p class="text-textColor2 mt-2 mb-5">
      {{ isPhone ? $t('signature.mobileHintPhone') : $t('signature.mobileHintQr') }}
    </p>
    <n-button
      v-if="!store.mobileSession"
      type="primary"
      :loading="store.mobileLoading"
      @click="start"
    >
      {{ $t('signature.mobileStart') }}
    </n-button>
    <template v-else>
      <a v-if="isPhone" :href="store.mobileSession.deep_link" class="inline-block">
        <n-button type="primary" size="large">{{ $t('signature.mobileOpenApp') }}</n-button>
      </a>
      <div v-else class="flex justify-center">
        <n-qr-code :value="store.mobileSession.qr_code" :size="200" error-correction-level="M" />
      </div>
      <p v-if="waiting" class="mt-4 text-sm text-textColor3">
        <n-spin size="small" class="mr-2 align-middle" />{{ $t('signature.mobileWaiting') }}
      </p>
      <n-button v-if="!waiting" text type="primary" class="mt-3" @click="start">
        {{ $t('signature.mobileRetry') }}
      </n-button>
    </template>
  </div>
</template>
