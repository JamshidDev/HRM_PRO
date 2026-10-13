<script setup>
  import {
    ArrowLeft16Regular,
    ArrowRight16Regular,
    ArrowSync16Regular,
    CheckmarkCircle16Filled,
    DataTrending24Regular,
    PersonAvailable24Filled
  } from '@vicons/fluent'
  import { useLoginNewStore } from '@/store/modules/index.js'
  import { useAppSetting } from '@/utils/AppSetting.js'

  const SECONDS = 5

  // Dev preview (`?sso_preview`) uchun namunaviy foydalanuvchi.
  const PREVIEW_ACCOUNT = {
    worker: { last_name: 'Raximov', first_name: 'Jasur', middle_name: 'Sharipovich', photo: null },
    role: { name: 'Mashinist' },
    organization: { name: 'Toshkent lokomotiv deposi' }
  }

  const store = useLoginNewStore()
  const left = ref(SECONDS)
  const account = ref(null)
  let timer = null

  const hostOf = (url) => {
    try {
      return new URL(url).host
    } catch {
      return ''
    }
  }

  const appHost = computed(() => hostOf(store.ssoRedirect?.url))
  const hrmHost = window.location.host

  const worker = computed(() => account.value?.worker ?? null)
  const fullName = computed(() =>
    [worker.value?.last_name, worker.value?.first_name, worker.value?.middle_name].filter(Boolean).join(' ')
  )
  // «J. Raximov» — oqim chizig'idagi kichik yorliq.
  const shortName = computed(() =>
    [worker.value?.first_name?.[0] && `${worker.value.first_name[0]}.`, worker.value?.last_name]
      .filter(Boolean)
      .join(' ')
  )
  const subtitle = computed(() =>
    [
      account.value?.position?.name ?? worker.value?.position?.name ?? account.value?.role?.name,
      account.value?.organization?.name
    ]
      .filter(Boolean)
      .join(' · ')
  )

  // Token allaqachon saqlangan — profilni yo'naltirishdan oldin ko'rsatish uchun olamiz.
  const loadAccount = () => {
    account.value = null
    if (store.ssoRedirect?.preview) {
      account.value = PREVIEW_ACCOUNT
      return
    }
    $ApiService.accountService
      ._index()
      .then((res) => {
        account.value = res.data.data
      })
      .catch(() => {})
  }

  // replace — «Orqaga» bosilsa HRM login sahifasiga qaytib qolmasin.
  const go = () => {
    clearInterval(timer)
    // Dev preview — hech qayerga ketmaymiz, hisoblagich qaytadan boshlanadi.
    if (store.ssoRedirect.preview) return start()
    window.location.replace(store.ssoRedirect.url)
  }

  // Tashqi tizimga o'tmasdan HRM'ning o'ziga kirish.
  const stay = () => {
    clearInterval(timer)
    const preview = store.ssoRedirect?.preview
    store.ssoRedirect = null
    if (preview) return
    store.sso = null
    store._finalizeLogin(localStorage.getItem(useAppSetting.tokenKey))
  }

  // Boshqa hisob bilan kirish: token o'chiriladi, login formasi qaytadi.
  // `store.sso` saqlanadi — keyingi login ham shu tizimga yo'naltiradi.
  const switchAccount = () => {
    clearInterval(timer)
    const preview = store.ssoRedirect?.preview
    store.ssoRedirect = null
    if (preview) return
    localStorage.removeItem(useAppSetting.tokenKey)
    store.password = null
  }

  const start = () => {
    clearInterval(timer)
    left.value = SECONDS
    timer = setInterval(() => {
      left.value -= 1
      if (left.value <= 0) go()
    }, 1000)
  }

  watch(
    () => store.ssoRedirect,
    (value) => {
      clearInterval(timer)
      if (!value) return
      loadAccount()
      start()
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

        <div class="sso__stack">
          <div class="sso__card">
            <!-- HRM → tashqi tizim -->
            <div class="sso__flow">
              <div class="sso__app">
                <span class="sso__icon">
                  <n-icon size="30"><PersonAvailable24Filled /></n-icon>
                </span>
                <p class="sso__app-name">HRM PRO</p>
                <p class="sso__app-host">{{ hrmHost }}</p>
              </div>

              <div class="sso__link" aria-hidden="true">
                <span class="sso__line sso__line--done"></span>
                <span class="sso__line sso__line--pending"></span>
                <span v-if="shortName" class="sso__who">
                  <n-icon size="16" class="sso__who-ok"><CheckmarkCircle16Filled /></n-icon>
                  {{ shortName }}
                </span>
              </div>

              <div class="sso__app">
                <span class="sso__icon sso__icon--to">
                  <n-icon size="30"><DataTrending24Regular /></n-icon>
                </span>
                <p class="sso__app-name" :title="store.ssoRedirect.name">{{ store.ssoRedirect.name }}</p>
                <p class="sso__app-host" :title="appHost">{{ appHost }}</p>
              </div>
            </div>

            <div class="sso__divider"></div>

            <h2 class="sso__title">
              {{ $t('loginPage.sso.title', { name: store.ssoRedirect.name }) }}
            </h2>

            <!-- Kim sifatida o'tilmoqda -->
            <div class="sso__user">
              <n-avatar
                round
                :size="44"
                object-fit="cover"
                class="sso__avatar shrink-0"
                :src="worker?.photo || useAppSetting.noAvailableImage"
                :fallback-src="useAppSetting.noAvailableImage"
              />
              <div class="min-w-0 flex-1">
                <n-skeleton v-if="!account" text :width="180" />
                <p v-else class="sso__user-name">{{ fullName }}</p>
                <n-skeleton v-if="!account" text :width="220" class="mt-1" />
                <p v-else-if="subtitle" class="sso__user-sub">{{ subtitle }}</p>
              </div>
              <button type="button" class="sso__switch" @click="switchAccount">
                {{ $t('loginPage.sso.otherAccount') }}
              </button>
            </div>

            <div class="sso__actions">
              <button type="button" class="sso__btn sso__btn--ghost" @click="stay">
                <n-icon size="18"><ArrowLeft16Regular /></n-icon>
                <span class="truncate">{{ $t('loginPage.sso.stay') }}</span>
              </button>
              <button type="button" class="sso__btn sso__btn--primary" @click="go">
                <span class="truncate">{{ $t('loginPage.sso.goNow', { name: store.ssoRedirect.name }) }}</span>
                <n-icon size="18"><ArrowRight16Regular /></n-icon>
              </button>
            </div>

            <p class="sso__countdown">
              {{ $t('loginPage.sso.seconds', { n: Math.max(left, 1) }) }}
            </p>
          </div>

          <div class="sso__tray">
            <n-icon size="16" class="sso__spin"><ArrowSync16Regular /></n-icon>
            <span class="truncate">{{ $t('loginPage.sso.redirecting', { name: store.ssoRedirect.name }) }}</span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
  .sso__glow {
    position: absolute;
    width: 760px;
    height: 760px;
    max-width: 150vw;
    max-height: 150vw;
    border-radius: 50%;
    background: radial-gradient(circle, var(--login-glow) 0%, transparent 65%);
    pointer-events: none;
  }

  .sso__stack {
    position: relative;
    width: 100%;
    max-width: 560px;
    animation: sso-rise 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) both;
  }

  .sso__card {
    position: relative;
    z-index: 1;
    padding: 26px 26px 26px;
    border-radius: 28px;
    background: var(--login-form-bg);
    box-shadow: 0 24px 48px -28px rgba(15, 17, 20, 0.25);
  }

  /* Karta ostidan chiqib turuvchi holat paneli */
  .sso__tray {
    margin-top: -28px;
    padding: 38px 20px 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border-radius: 0 0 28px 28px;
    font-size: 13px;
    font-weight: 500;
    color: #ffffff;
    background: #8d9cad;
  }

  .sso__spin {
    flex-shrink: 0;
    animation: sso-spin 1.6s linear infinite;
  }

  /* --- Oqim --- */
  .sso__flow {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr) minmax(0, 1fr);
    align-items: start;
  }

  .sso__app {
    min-width: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .sso__icon {
    width: 68px;
    height: 68px;
    margin-bottom: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    color: #3170e8;
    background: var(--login-captcha-bg);
    border: 1px solid var(--login-form-border);
  }

  .sso__icon--to {
    color: #ffffff;
    background: #3170e8;
    border-color: #3170e8;
  }

  .sso__app-name {
    max-width: 100%;
    font-size: 14px;
    font-weight: 600;
    line-height: 1.3;
    color: var(--login-ink);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .sso__app-host {
    max-width: 100%;
    margin-top: 2px;
    font-size: 13px;
    color: var(--login-body);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* Chiziq ikonalar markazida (34px): chap qismi bajarilgan, o'ng qismi kutilmoqda */
  .sso__link {
    position: relative;
    height: 68px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .sso__line {
    position: absolute;
    top: 50%;
    height: 2px;
    margin-top: -1px;
  }

  .sso__line--done {
    left: 8px;
    right: 50%;
    background: #3170e8;
  }

  .sso__line--pending {
    left: 50%;
    right: 8px;
    background-image: linear-gradient(90deg, #3170e8 50%, transparent 50%);
    background-size: 8px 2px;
    animation: sso-dash 0.8s linear infinite;
  }

  .sso__who {
    position: relative;
    max-width: 100%;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px 4px 6px;
    border-radius: 999px;
    font-size: 13px;
    font-weight: 600;
    color: var(--login-ink);
    white-space: nowrap;
    background: var(--login-form-bg);
    border: 1px solid #9cc0f5;
  }

  .sso__who-ok {
    color: #2e9d55;
  }

  .sso__divider {
    height: 1px;
    margin: 26px 0;
    background: var(--login-divider);
  }

  .sso__title {
    font-size: 21px;
    font-weight: 600;
    line-height: 1.3;
    color: var(--login-ink);
    overflow-wrap: anywhere;
  }

  /* --- Foydalanuvchi --- */
  .sso__user {
    margin-top: 18px;
    padding: 12px 14px;
    display: flex;
    align-items: center;
    gap: 14px;
    border-radius: 16px;
    background: var(--login-captcha-bg);
    border: 1px solid var(--login-form-border);
  }

  .sso__avatar :deep(img) {
    object-position: top;
  }

  .sso__user-name {
    font-size: 15px;
    font-weight: 600;
    color: var(--login-ink);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .sso__user-sub {
    margin-top: 2px;
    font-size: 13px;
    color: var(--login-body);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .sso__switch {
    flex-shrink: 0;
    font-size: 13px;
    font-weight: 600;
    color: var(--login-link);
    transition: color 0.15s ease;
  }

  .sso__switch:hover {
    color: var(--login-link-hover);
  }

  /* --- Tugmalar --- */
  .sso__actions {
    margin-top: 26px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 9px;
  }

  .sso__btn {
    min-width: 0;
    height: 52px;
    padding: 0 16px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 500;
    transition:
      background-color 0.15s ease,
      transform 0.1s ease;
  }

  .sso__btn:active {
    transform: scale(0.98);
  }

  .sso__btn:focus-visible {
    outline: 2px solid var(--login-link);
    outline-offset: 2px;
  }

  .sso__btn--ghost {
    color: var(--login-ink);
    background: #e9ebef;
  }

  .sso__btn--ghost:hover {
    background: #dfe2e8;
  }

  .sso__btn--primary {
    color: #ffffff;
    background: #3170e8;
  }

  .sso__btn--primary:hover {
    background: #255fd0;
  }

  .sso__countdown {
    margin-top: 14px;
    text-align: center;
    font-size: 13px;
    color: var(--login-body);
    font-variant-numeric: tabular-nums;
  }

  [data-theme='dark'] .sso__btn--ghost {
    background: rgba(255, 255, 255, 0.08);
  }

  [data-theme='dark'] .sso__btn--ghost:hover {
    background: rgba(255, 255, 255, 0.12);
  }

  [data-theme='dark'] .sso__tray {
    background: #2a3446;
  }

  @media (max-width: 480px) {
    .sso__card {
      padding: 20px 16px;
    }

    .sso__actions {
      grid-template-columns: 1fr;
    }

    .sso__actions .sso__btn--primary {
      order: -1;
    }

    .sso__icon {
      width: 56px;
      height: 56px;
    }

    .sso__link {
      height: 56px;
    }

    .sso__title {
      font-size: 18px;
    }
  }

  @keyframes sso-rise {
    from {
      opacity: 0;
      transform: translateY(12px) scale(0.98);
    }
    to {
      opacity: 1;
      transform: none;
    }
  }

  @keyframes sso-dash {
    to {
      background-position: 8px 0;
    }
  }

  @keyframes sso-spin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .sso__stack,
    .sso__line--pending,
    .sso__spin {
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
