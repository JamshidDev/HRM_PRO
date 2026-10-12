<script setup>
  import { ArrowRight16Regular, CheckmarkCircle16Filled } from '@vicons/fluent'
  import { useLoginNewStore } from '@/store/modules/index.js'

  const SECONDS = 5

  const store = useLoginNewStore()
  const left = ref(SECONDS)
  let timer = null

  const host = computed(() => {
    try {
      return new URL(store.ssoRedirect?.url).host
    } catch {
      return ''
    }
  })

  // App kartasidagi avatar uchun 1–2 harf (masalan «LOCAL-TEST-Claude» → «LT»).
  const initials = computed(() =>
    (store.ssoRedirect?.name ?? '')
      .split(/[\s\-_.]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join('')
  )

  // replace — «Orqaga» bosilsa HRM login sahifasiga qaytib qolmasin.
  const otherAccount = () => {
    clearInterval(timer)
    store._ssoUseOtherAccount()
  }

  const go = () => {
    clearInterval(timer)
    window.location.replace(store.ssoRedirect.url)
  }

  watch(
    () => store.ssoRedirect,
    (value) => {
      clearInterval(timer)
      if (!value) return
      left.value = SECONDS
      timer = setInterval(() => {
        left.value -= 1
        if (left.value <= 0) go()
      }, 1000)
    },
    { immediate: true }
  )

  onBeforeUnmount(() => clearInterval(timer))
</script>

<template>
  <Teleport to="body">
    <Transition name="sso-fade">
      <div
        v-if="store.ssoRedirect"
        class="sso fixed inset-0 z-[3000] flex items-center justify-center px-4 bg-login-page"
        role="status"
        aria-live="polite"
      >
        <div class="sso__glow" aria-hidden="true"></div>

        <div class="relative w-full max-w-[520px] flex flex-col items-center text-center">
          <!-- HRM → App: ikki karta va ular orasidagi oqim -->
          <div class="w-full grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-4 mb-9">
            <div class="sso__card">
              <img src="/logo-new.png" alt=" " class="h-10 w-10 object-contain" />
              <p class="sso__card-name">HRM PRO</p>
              <span class="sso__badge">
                <n-icon size="12"><CheckmarkCircle16Filled /></n-icon>
                {{ $t('loginPage.sso.verified') }}
              </span>
            </div>

            <div class="sso__link" aria-hidden="true">
              <span class="sso__dot"></span>
              <span class="sso__dot"></span>
              <span class="sso__dot"></span>
              <n-icon size="16" class="sso__arrow"><ArrowRight16Regular /></n-icon>
            </div>

            <div class="sso__card sso__card--to">
              <span class="sso__avatar">{{ initials }}</span>
              <p class="sso__card-name" :title="store.ssoRedirect.name">{{ store.ssoRedirect.name }}</p>
              <p class="sso__host" :title="host">{{ host }}</p>
            </div>
          </div>

          <h2 class="sso__text font-grotesk text-xl sm:text-2xl font-bold text-login-ink leading-snug">
            {{ $t('loginPage.sso.redirecting', { name: store.ssoRedirect.name }) }}
          </h2>
          <p class="sso__text text-login-body text-sm mt-2">
            {{ $t('loginPage.sso.seconds', { n: Math.max(left, 1) }) }}
          </p>
          <p v-if="store.ssoSession?.name" class="sso__text text-login-ink text-sm font-semibold mt-3">
            {{ $t('loginPage.sso.as', { name: store.ssoSession.name }) }}
          </p>

          <div class="sso__progress w-full max-w-[320px] mt-6" aria-hidden="true">
            <span class="sso__progress-bar" :style="{ animationDuration: `${SECONDS}s` }"></span>
          </div>

          <div class="mt-7">
            <n-button type="primary" size="large" class="min-w-[200px]" icon-placement="right" @click="go">
              {{ $t('loginPage.sso.goNow') }}
              <template #icon>
                <n-icon><ArrowRight16Regular /></n-icon>
              </template>
            </n-button>
          </div>
          <!-- Mavjud sessiya bilan o'tilayotganda — boshqa akkauntga almashtirish imkoni -->
          <button v-if="store.ssoSession" type="button" class="sso__other text-sm mt-5" @click="otherAccount">
            {{ $t('loginPage.sso.otherAccount') }}
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
  .sso__glow {
    position: absolute;
    width: 640px;
    height: 640px;
    border-radius: 50%;
    background: radial-gradient(circle, var(--login-glow) 0%, transparent 65%);
    pointer-events: none;
  }

  .sso__card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    min-width: 0;
    padding: 20px 14px 16px;
    border-radius: 20px;
    background: var(--login-form-bg);
    border: 1px solid var(--login-form-border);
    box-shadow: 0 10px 30px -12px rgba(15, 17, 20, 0.18);
    animation: sso-card-in 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) both;
  }

  .sso__card--to {
    animation-delay: 0.15s;
    border-color: rgba(18, 121, 240, 0.35);
    box-shadow:
      0 10px 30px -12px rgba(18, 121, 240, 0.35),
      0 0 0 4px rgba(18, 121, 240, 0.08);
  }

  .sso__card-name {
    max-width: 100%;
    font-size: 14px;
    font-weight: 700;
    color: var(--login-ink);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .sso__host {
    max-width: 100%;
    margin-top: -4px;
    font-size: 11px;
    color: var(--login-body);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .sso__avatar {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 15px;
    font-weight: 700;
    color: #ffffff;
    background: linear-gradient(135deg, #1279f0 0%, #7c3aed 100%);
  }

  .sso__badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    margin-top: -2px;
    padding: 2px 8px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 600;
    color: #16a34a;
    background: rgba(22, 163, 74, 0.1);
  }

  /* HRM → App oqimi: nuqtalar ketma-ket yonib o'ngga «oqadi» */
  .sso__link {
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--login-link);
  }

  .sso__dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
    opacity: 0.2;
    animation: sso-dot 1.2s ease-in-out infinite;
  }

  .sso__dot:nth-child(2) {
    animation-delay: 0.2s;
  }

  .sso__dot:nth-child(3) {
    animation-delay: 0.4s;
  }

  .sso__arrow {
    animation: sso-arrow 1.2s ease-in-out infinite;
  }

  .sso__other {
    color: var(--login-body);
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  .sso__text {
    animation: sso-text-in 0.5s ease 0.25s both;
  }

  .sso__progress {
    height: 6px;
    border-radius: 999px;
    background: var(--login-divider);
    overflow: hidden;
  }

  .sso__progress-bar {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, #1279f0 0%, #7c3aed 100%);
    transform-origin: left;
    animation: sso-progress linear forwards;
  }

  @keyframes sso-card-in {
    from {
      opacity: 0;
      transform: translateY(12px) scale(0.96);
    }
    to {
      opacity: 1;
      transform: none;
    }
  }

  @keyframes sso-text-in {
    from {
      opacity: 0;
      transform: translateY(6px);
    }
    to {
      opacity: 1;
      transform: none;
    }
  }

  @keyframes sso-dot {
    0%,
    100% {
      opacity: 0.2;
      transform: scale(0.85);
    }
    40% {
      opacity: 1;
      transform: scale(1.15);
    }
  }

  @keyframes sso-arrow {
    0%,
    100% {
      transform: translateX(0);
      opacity: 0.5;
    }
    50% {
      transform: translateX(4px);
      opacity: 1;
    }
  }

  @keyframes sso-progress {
    from {
      transform: scaleX(0);
    }
    to {
      transform: scaleX(1);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .sso__card,
    .sso__text,
    .sso__dot,
    .sso__arrow {
      animation: none;
    }
  }

  .sso-fade-enter-active,
  .sso-fade-leave-active {
    transition: opacity 0.25s ease;
  }

  .sso-fade-enter-from,
  .sso-fade-leave-to {
    opacity: 0;
  }
</style>
