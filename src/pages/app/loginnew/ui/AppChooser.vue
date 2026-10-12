<script setup>
  import { ArrowRight16Regular, CheckmarkCircle16Filled, Phone24Regular } from '@vicons/fluent'
  import { useLoginNewStore } from '@/store/modules/index.js'

  const emit = defineEmits(['browser'])

  const ANDROID_PACKAGE = 'hrms.railway.uz'
  const PLAY_URL = `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE}`
  const APP_STORE_URL = 'https://apps.apple.com/us/app/hr-rail/id6759365016'
  const POLL_MS = 2000

  const store = useLoginNewStore()
  const isAndroid = /Android/i.test(navigator.userAgent)

  // idle → waiting → (approved | rejected | expired | missing)
  const phase = ref('idle')
  const opening = ref(false)
  let session = null
  let pollTimer = null
  let missingTimer = null

  const appUrl = (payload) => {
    const q = `payload=${encodeURIComponent(payload)}`
    // Android: ilova bo'lmasa Chrome o'zi Play Store'ni ochadi.
    return isAndroid
      ? `intent://open/app-login?${q}#Intent;scheme=hrrail;package=${ANDROID_PACKAGE};S.browser_fallback_url=${encodeURIComponent(PLAY_URL)};end`
      : `hrrail://open/app-login?${q}`
  }

  const stop = () => {
    clearInterval(pollTimer)
    clearTimeout(missingTimer)
    pollTimer = null
  }

  const claim = async () => {
    if (!session) return
    try {
      const res = await $ApiService.authService._appLoginClaim({
        data: { id: session.id, secret: session.secret }
      })
      const data = res.data.data
      if (data.status === 'approved') {
        stop()
        phase.value = 'approved'
        store._handleAuthSuccess({ data: { access_token: data.access_token, offer: data.offer } }, 'app')
      } else if (data.status === 'rejected' || data.status === 'expired') {
        stop()
        session = null
        phase.value = data.status
      }
    } catch {
      // tarmoq uzilishi — keyingi urinishda qayta so'raladi
    }
  }

  const openApp = async () => {
    opening.value = true
    try {
      const res = await $ApiService.authService._appLoginStart({
        data: { client_id: store.sso?.client_id }
      })
      session = res.data.data
    } finally {
      opening.value = false
    }
    phase.value = 'waiting'
    stop()
    pollTimer = setInterval(claim, POLL_MS)
    // iOS: ilova ochilmasa sahifa ko'rinishda qoladi — «topilmadi» deymiz.
    if (!isAndroid) {
      missingTimer = setTimeout(() => {
        if (document.visibilityState === 'visible' && phase.value === 'waiting') phase.value = 'missing'
      }, 2500)
    }
    window.location.href = appUrl(session.payload)
  }

  // Brauzerga qaytilganda natijani darhol so'raymiz.
  const onVisible = () => {
    if (document.visibilityState !== 'visible') return
    clearTimeout(missingTimer)
    if (phase.value === 'waiting' || phase.value === 'missing') claim()
  }

  onMounted(() => document.addEventListener('visibilitychange', onVisible))
  onBeforeUnmount(() => {
    stop()
    document.removeEventListener('visibilitychange', onVisible)
  })
</script>

<template>
  <div class="app-chooser flex flex-col items-center text-center pt-2 pb-1">
    <div class="app-chooser__icon mb-5">
      <img src="/logo-new.png" alt=" " class="h-12 w-12 object-contain" />
    </div>

    <p class="app-chooser__label text-[11px] font-semibold uppercase tracking-wide">
      {{ $t('loginPage.appLogin.label') }}
    </p>
    <h2 class="font-grotesk text-xl font-bold text-login-ink leading-snug mt-1.5">
      {{ $t('loginPage.appLogin.title', { name: store.sso?.name }) }}
    </h2>

    <template v-if="phase === 'idle' || phase === 'rejected' || phase === 'expired'">
      <p v-if="phase === 'idle'" class="text-sm text-login-body mt-2 max-w-[320px]">
        {{ $t('loginPage.appLogin.text') }}
      </p>
      <p v-else class="app-chooser__warn text-sm mt-2 max-w-[320px]">
        {{ $t(`loginPage.appLogin.${phase}`) }}
      </p>
      <n-button type="primary" size="large" block class="mt-6" :loading="opening" icon-placement="right" @click="openApp">
        {{ $t('loginPage.appLogin.open') }}
        <template #icon>
          <n-icon><ArrowRight16Regular /></n-icon>
        </template>
      </n-button>
    </template>

    <template v-else-if="phase === 'waiting'">
      <div class="app-chooser__wait mt-5 w-full rounded-xl px-4 py-3.5 flex items-center gap-3 text-left">
        <n-spin size="small" />
        <div>
          <p class="text-sm font-semibold text-login-ink">{{ $t('loginPage.appLogin.waitTitle') }}</p>
          <p class="text-xs text-login-body mt-0.5">{{ $t('loginPage.appLogin.waitText') }}</p>
        </div>
      </div>
      <button type="button" class="app-chooser__link text-sm font-semibold mt-4" @click="openApp">
        {{ $t('loginPage.appLogin.reopen') }}
      </button>
    </template>

    <template v-else-if="phase === 'missing'">
      <div class="app-chooser__wait mt-5 w-full rounded-xl px-4 py-3.5 flex items-center gap-3 text-left">
        <n-icon size="22" class="text-login-body shrink-0"><Phone24Regular /></n-icon>
        <p class="text-sm text-login-ink">{{ $t('loginPage.appLogin.missing') }}</p>
      </div>
      <a :href="APP_STORE_URL" target="_blank" rel="noopener" class="w-full mt-4">
        <n-button size="large" block>{{ $t('loginPage.appLogin.install') }}</n-button>
      </a>
    </template>

    <template v-else-if="phase === 'approved'">
      <div class="app-chooser__ok mt-5 w-full rounded-xl px-4 py-3.5 flex items-center justify-center gap-2">
        <n-icon size="18"><CheckmarkCircle16Filled /></n-icon>
        <span class="text-sm font-semibold">{{ $t('loginPage.appLogin.approved') }}</span>
      </div>
    </template>

    <button
      v-if="phase !== 'approved'"
      type="button"
      class="app-chooser__browser text-sm mt-5"
      @click="stop(); emit('browser')"
    >
      {{ $t('loginPage.appLogin.browser') }}
    </button>
  </div>
</template>

<style scoped>
  .app-chooser__icon {
    width: 72px;
    height: 72px;
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--login-form-bg);
    border: 1px solid var(--login-form-border);
    box-shadow: 0 10px 30px -12px rgba(18, 121, 240, 0.35);
  }

  .app-chooser__label,
  .app-chooser__link {
    color: var(--login-link);
  }

  .app-chooser__warn {
    color: var(--login-star);
  }

  .app-chooser__wait {
    background: var(--login-eimzo-bg);
    border: 1px solid var(--login-eimzo-border);
  }

  .app-chooser__ok {
    color: #16a34a;
    background: rgba(22, 163, 74, 0.1);
  }

  .app-chooser__browser {
    color: var(--login-body);
    text-decoration: underline;
    text-underline-offset: 3px;
  }
</style>
