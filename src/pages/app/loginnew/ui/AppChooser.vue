<script setup>
  import { ArrowRight16Regular, Phone24Regular } from '@vicons/fluent'
  import { useLoginNewStore } from '@/store/modules/index.js'

  const emit = defineEmits(['browser'])

  const ANDROID_PACKAGE = 'hrms.railway.uz'
  const PLAY_URL = `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE}`
  const APP_STORE_URL = 'https://apps.apple.com/us/app/hr-rail/id6759365016'

  const store = useLoginNewStore()
  const isAndroid = /Android/i.test(navigator.userAgent)

  // idle → opened (ilova ochildi) | missing (iOS: ilova topilmadi)
  const phase = ref('idle')
  let missingTimer = null

  // Ilova tizimni o'zi tasdiqlab, code bilan ochadi — brauzer hech narsa kutmaydi.
  const appUrl = () => {
    const q = `client_id=${encodeURIComponent(store.sso?.client_id ?? '')}`
    // Android: ilova bo'lmasa Chrome o'zi Play Store'ni ochadi.
    return isAndroid
      ? `intent://open/sso?${q}#Intent;scheme=hrrail;package=${ANDROID_PACKAGE};S.browser_fallback_url=${encodeURIComponent(PLAY_URL)};end`
      : `hrrail://open/sso?${q}`
  }

  const openApp = () => {
    phase.value = 'opened'
    clearTimeout(missingTimer)
    // iOS: ilova ochilmasa sahifa ko'rinishda qoladi — «topilmadi» deymiz.
    if (!isAndroid) {
      missingTimer = setTimeout(() => {
        if (document.visibilityState === 'visible') phase.value = 'missing'
      }, 2500)
    }
    window.location.href = appUrl()
  }

  const toBrowser = () => {
    clearTimeout(missingTimer)
    emit('browser')
  }

  onBeforeUnmount(() => clearTimeout(missingTimer))
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

    <template v-if="phase === 'missing'">
      <div class="app-chooser__wait mt-5 w-full rounded-xl px-4 py-3.5 flex items-center gap-3 text-left">
        <n-icon size="22" class="text-login-body shrink-0"><Phone24Regular /></n-icon>
        <p class="text-sm text-login-ink">{{ $t('loginPage.appLogin.missing') }}</p>
      </div>
      <a :href="APP_STORE_URL" target="_blank" rel="noopener" class="w-full mt-4">
        <n-button size="large" block>{{ $t('loginPage.appLogin.install') }}</n-button>
      </a>
    </template>

    <template v-else>
      <p class="text-sm text-login-body mt-2 max-w-[320px]">
        {{ phase === 'opened' ? $t('loginPage.appLogin.waitText', { name: store.sso?.name }) : $t('loginPage.appLogin.text') }}
      </p>
      <div class="w-full mt-6">
        <n-button type="primary" size="large" block icon-placement="right" @click="openApp">
          {{ phase === 'opened' ? $t('loginPage.appLogin.reopen') : $t('loginPage.appLogin.open') }}
          <template #icon>
            <n-icon><ArrowRight16Regular /></n-icon>
          </template>
        </n-button>
      </div>
    </template>

    <button type="button" class="app-chooser__browser text-sm mt-5" @click="toBrowser">
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

  .app-chooser__label {
    color: var(--login-link);
  }

  .app-chooser__wait {
    background: var(--login-eimzo-bg);
    border: 1px solid var(--login-eimzo-border);
  }

  .app-chooser__browser {
    color: var(--login-body);
    text-decoration: underline;
    text-underline-offset: 3px;
  }
</style>
