<script setup>
  import {
    ArrowRight16Regular,
    Checkmark16Filled,
    Key16Filled,
    LockClosed16Regular
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

  const worker = computed(() => account.value?.worker ?? null)
  const fullName = computed(() =>
    [worker.value?.last_name, worker.value?.first_name, worker.value?.middle_name]
      .filter(Boolean)
      .join(' ')
  )
  const firstName = computed(() => worker.value?.first_name ?? '')

  // «Railway KPI» → «RK» — tizim belgisi.
  const appInitials = computed(() =>
    (store.ssoRedirect?.name || '')
      .replace(/[^\p{L}\p{N}\s]/gu, '')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join('')
  )

  // Progress chizig'i animatsiyasini har `start()`da boshidan boshlash uchun.
  const runId = ref(0)
  const clock = computed(() => `0:${String(Math.max(left.value, 0)).padStart(2, '0')}`)

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

  // «Bekor qilish» — tashqi tizimga o'tmasdan HRM'ning o'ziga kirish.
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
    // Token va mavjud sessiya (`ssoSession`) tozalanadi.
    store._ssoUseOtherAccount()
    store.password = null
  }

  const start = () => {
    clearInterval(timer)
    left.value = SECONDS
    runId.value += 1
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

  // 3D sahna sichqonchaga qarab qiyshayadi (parallax). Harakat kamaytirilgan bo'lsa — yo'q.
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  const tilt = ref({ x: 0, y: 0 })
  const onSideMove = (e) => {
    if (reducedMotion || e.pointerType === 'touch') return
    const r = e.currentTarget.getBoundingClientRect()
    tilt.value = {
      x: (e.clientX - r.left) / r.width - 0.5,
      y: (e.clientY - r.top) / r.height - 0.5
    }
  }
  const onSideLeave = () => {
    tilt.value = { x: 0, y: 0 }
  }
  const stageStyle = computed(() => ({
    '--tilt-x': `${16 - tilt.value.y * 16}deg`,
    '--tilt-y': `${-10 + tilt.value.x * 26}deg`
  }))

  onBeforeUnmount(() => clearInterval(timer))
</script>

<template>
  <Teleport to="body">
    <Transition name="sso-fade">
      <div
        v-if="store.ssoRedirect"
        class="sso fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-login-page overflow-y-auto"
        role="status"
        aria-live="polite"
      >
        <div class="sso__card">
          <!-- Chap panel: HRM PRO va kirish bosqichlari -->
          <aside class="sso__side" @pointermove="onSideMove" @pointerleave="onSideLeave">
            <div class="sso__brand">
              <span class="sso__brand-logo">
                <img src="/logo-new.png" alt="HRM PRO" />
              </span>
              <div class="min-w-0">
                <p class="sso__brand-name">HRM PRO</p>
                <p class="sso__brand-sub">{{ $t('loginPage.sso.brand') }}</p>
              </div>
            </div>

            <ol class="sso__steps">
              <li class="sso__step sso__step--done" style="--d: 0.25s">
                <span class="sso__step-dot">
                  <n-icon size="14"><Checkmark16Filled /></n-icon>
                </span>
                <div class="min-w-0">
                  <p class="sso__step-title">{{ $t('loginPage.sso.stepIdentity') }}</p>
                  <p class="sso__step-hint">{{ $t('loginPage.sso.stepIdentityHint') }}</p>
                </div>
              </li>
              <li class="sso__step sso__step--done" style="--d: 0.85s">
                <span class="sso__step-dot">
                  <n-icon size="14"><Checkmark16Filled /></n-icon>
                </span>
                <div class="min-w-0">
                  <p class="sso__step-title">{{ $t('loginPage.sso.stepAccess') }}</p>
                  <p class="sso__step-hint">
                    {{ $t('loginPage.sso.stepAccessHint', { name: store.ssoRedirect.name }) }}
                  </p>
                </div>
              </li>
              <li class="sso__step sso__step--active" style="--d: 1.45s">
                <span class="sso__step-dot"><span></span></span>
                <div class="min-w-0">
                  <p class="sso__step-title">{{ $t('loginPage.sso.stepRedirect') }}</p>
                  <p class="sso__step-hint" :title="appHost">{{ appHost }}</p>
                </div>
              </li>
            </ol>

            <!-- 3D sahna: HRM PRO'dan token (kalit) yoy bo'ylab keyingi tizimga uchadi -->
            <div class="sso__scene" aria-hidden="true">
              <div class="sso__stage" :style="stageStyle">
                <div class="sso__floor"></div>
                <div class="sso__beam"></div>

                <div class="sso__node sso__node--from">
                  <span class="sso__shadow"></span>
                  <div class="sso__slab">
                    <span
                      v-for="i in 7"
                      :key="i"
                      class="sso__slab-layer"
                      :style="{ transform: `translateZ(${-i * 1.6}px)` }"
                    ></span>
                    <span class="sso__slab-face"><img src="/logo-new.png" alt="" /></span>
                  </div>
                  <span class="sso__node-label">HRM PRO</span>
                </div>

                <span class="sso__spark sso__spark--2"></span>
                <span class="sso__spark sso__spark--1"></span>
                <span class="sso__packet">
                  <n-icon size="14"><Key16Filled /></n-icon>
                </span>

                <div class="sso__node sso__node--to">
                  <span class="sso__shadow"></span>
                  <span class="sso__orbit"><span></span></span>
                  <div class="sso__slab sso__slab--to">
                    <span
                      v-for="i in 7"
                      :key="i"
                      class="sso__slab-layer"
                      :style="{ transform: `translateZ(${-i * 1.6}px)` }"
                    ></span>
                    <span class="sso__slab-face">{{ appInitials }}</span>
                  </div>
                  <span class="sso__ring"></span>
                  <span class="sso__node-label" :title="store.ssoRedirect.name">
                    {{ store.ssoRedirect.name }}
                  </span>
                </div>
              </div>
            </div>

            <p class="sso__secure">
              <n-icon size="14"><LockClosed16Regular /></n-icon>
              {{ $t('loginPage.sso.secure') }}
            </p>
          </aside>

          <!-- O'ng panel: keyingi tizim va harakatlar -->
          <section class="sso__main">
            <div class="sso__app">
              <span class="sso__app-logo">{{ appInitials }}</span>
              <div class="min-w-0">
                <p class="sso__app-label">{{ $t('loginPage.sso.nextSystem') }}</p>
                <p class="sso__app-name" :title="store.ssoRedirect.name">
                  {{ store.ssoRedirect.name }}
                </p>
              </div>
            </div>

            <h2 class="sso__title">
              <template v-if="firstName">
                {{ $t('loginPage.sso.welcome', { name: firstName }) }}
              </template>
              <template v-else-if="account">{{ $t('loginPage.sso.welcomePlain') }}</template>
              <n-skeleton v-else text :width="260" />
            </h2>

            <i18n-t keypath="loginPage.sso.autoOpen" tag="p" class="sso__text" scope="global">
              <template #seconds>
                <b>{{ $t('loginPage.sso.secondsBold', { n: Math.max(left, 1) }) }}</b>
              </template>
              <template #name>{{ store.ssoRedirect.name }}</template>
            </i18n-t>

            <div class="sso__progress" aria-hidden="true">
              <span
                :key="runId"
                class="sso__progress-bar"
                :style="{ animationDuration: `${SECONDS}s` }"
              ></span>
            </div>
            <div class="sso__meta">
              <span class="truncate">
                <template v-if="fullName">{{
                  $t('loginPage.sso.as', { name: fullName })
                }}</template>
              </span>
              <span class="tabular-nums">{{ clock }}</span>
            </div>

            <button type="button" class="sso__go" @click="go">
              {{ $t('loginPage.sso.goNowShort') }}
              <n-icon size="18"><ArrowRight16Regular /></n-icon>
            </button>

            <div class="sso__links">
              <button type="button" class="sso__link" @click="switchAccount">
                {{ $t('loginPage.sso.otherAccount') }}
              </button>
              <button type="button" class="sso__link" @click="stay">
                {{ $t('loginPage.sso.cancel') }}
              </button>
            </div>
          </section>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
  .sso {
    /* Hammasi tizim rangidan (`--primary-color`) — rang o'zgarsa shu yer ham moslashadi */
    --sso-accent: var(--primary-color);
    --sso-accent-hover: color-mix(in srgb, var(--primary-color) 82%, #000000);
    --sso-side: linear-gradient(
      160deg,
      var(--primary-color) 0%,
      color-mix(in srgb, var(--primary-color) 78%, #000000) 60%,
      color-mix(in srgb, var(--primary-color) 62%, #000000) 100%
    );
    --sso-success: #16a34a;
  }

  .sso__card {
    display: grid;
    grid-template-columns: 1fr 1fr;
    width: 100%;
    max-width: 940px;
    min-height: 452px;
    margin: auto;
    overflow: hidden;
    border-radius: 20px;
    background: var(--login-form-bg);
    border: 1px solid var(--login-form-border);
    box-shadow: 0 30px 60px -30px rgba(15, 23, 42, 0.35);
    animation: sso-rise 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) both;
  }

  /* ---------- Chap panel ---------- */
  .sso__side {
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    padding: 40px;
    color: #ffffff;
    background: var(--sso-side);
  }

  /* Fonda sekin suzib yuruvchi yorug'lik dog'lari */
  .sso__side::before,
  .sso__side::after {
    content: '';
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.16) 0%, transparent 70%);
  }

  .sso__side::before {
    width: 340px;
    height: 340px;
    top: -120px;
    right: -120px;
    animation: sso-drift 9s ease-in-out infinite alternate;
  }

  .sso__side::after {
    width: 260px;
    height: 260px;
    bottom: -110px;
    left: -90px;
    animation: sso-drift 11s ease-in-out infinite alternate-reverse;
  }

  .sso__side > * {
    position: relative;
    z-index: 1;
  }

  .sso__brand {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  /* Logotip ko'k — to'q panelda ko'rinishi uchun oq plitka ichida */
  .sso__brand-logo {
    width: 44px;
    height: 44px;
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 5px;
    border-radius: 12px;
    background: #ffffff;
  }

  .sso__brand-logo img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .sso__brand-name {
    font-size: 15px;
    font-weight: 700;
  }

  .sso__brand-sub,
  .sso__step-hint,
  .sso__secure {
    font-size: 12.5px;
    color: rgba(255, 255, 255, 0.8);
  }

  .sso__steps {
    margin: 36px 0 0;
    padding: 0;
    list-style: none;
  }

  /* Bosqichlar ketma-ket paydo bo'ladi (`--d` — har birining kechikishi) */
  .sso__step {
    position: relative;
    display: flex;
    gap: 14px;
    padding-bottom: 22px;
    animation: sso-step-in 0.45s cubic-bezier(0.22, 1, 0.36, 1) var(--d, 0s) both;
  }

  .sso__step:last-child {
    padding-bottom: 0;
  }

  /* Bosqichlar orasidagi chiziq — bajarilganlari yashil */
  .sso__step:not(:last-child)::before {
    content: '';
    position: absolute;
    left: 14px;
    top: 30px;
    bottom: 0;
    width: 2px;
    background: rgba(255, 255, 255, 0.3);
  }

  /* Bajarilgan bosqich chizig'i yuqoridan pastga "to'ladi" */
  .sso__step--done:not(:last-child)::before {
    background: var(--sso-success);
    transform-origin: top;
    animation: sso-line-grow 0.45s ease calc(var(--d, 0s) + 0.3s) both;
  }

  .sso__step--done + .sso__step--active::before {
    display: none;
  }

  .sso__step-dot {
    position: relative;
    z-index: 1;
    width: 30px;
    height: 30px;
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
  }

  .sso__step--done .sso__step-dot {
    background: var(--sso-success);
    animation: sso-check-pop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) calc(var(--d, 0s) + 0.1s) both;
  }

  .sso__step--active .sso__step-dot {
    border: 2px solid #ffffff;
  }

  .sso__step--active .sso__step-dot > span {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #ffffff;
    animation: sso-pulse 1.4s ease-in-out infinite;
  }

  .sso__step-title {
    margin-top: 4px;
    font-size: 14px;
    font-weight: 600;
  }

  .sso__step-hint {
    margin-top: 2px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* ---------- 3D sahna ---------- */
  .sso__scene {
    --scene-h: 176px;
    height: var(--scene-h);
    margin-top: 26px;
    perspective: 760px;
    perspective-origin: 50% 30%;
    animation: sso-scene-in 0.8s cubic-bezier(0.22, 1, 0.36, 1) 1.7s both;
  }

  /* Butun sahna bir tekislikda qiyshayadi — sichqoncha bilan burchak o'zgaradi */
  .sso__stage {
    position: relative;
    height: 100%;
    transform-style: preserve-3d;
    transform: rotateX(var(--tilt-x, 16deg)) rotateY(var(--tilt-y, -10deg));
    transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
  }

  /* Perspektivali "pol" to'ri — HRM'dan tizim tomonga oqadi */
  .sso__floor {
    position: absolute;
    left: -25%;
    right: -25%;
    bottom: -40px;
    height: 220px;
    transform-origin: 50% 100%;
    transform: rotateX(78deg);
    background-image:
      linear-gradient(rgba(255, 255, 255, 0.22) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.22) 1px, transparent 1px);
    background-size: 28px 28px;
    mask-image: radial-gradient(ellipse at 50% 55%, #000 25%, transparent 70%);
    animation: sso-grid 1.6s linear infinite;
  }

  .sso__node {
    position: absolute;
    top: 22px;
    width: 92px;
    display: flex;
    flex-direction: column;
    align-items: center;
    transform-style: preserve-3d;
  }

  .sso__node--from {
    left: 2%;
  }

  .sso__node--to {
    right: 2%;
  }

  /* Qalinlikka ega plitka: old yuz + orqasida qatlamlar (yon devor) */
  .sso__slab {
    position: relative;
    width: 58px;
    height: 58px;
    transform-style: preserve-3d;
    animation: sso-sway 5s ease-in-out infinite;
  }

  .sso__slab--to {
    animation-delay: -2.5s;
  }

  .sso__slab-layer,
  .sso__slab-face {
    position: absolute;
    inset: 0;
    border-radius: 16px;
  }

  .sso__slab-layer {
    background: color-mix(in srgb, var(--primary-color) 30%, #dbe7ff);
  }

  .sso__slab-face {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px;
    font-size: 18px;
    font-weight: 800;
    color: var(--primary-color);
    background: linear-gradient(145deg, #ffffff 0%, #eef4ff 100%);
    box-shadow:
      inset 0 1px 0 #ffffff,
      inset 0 -2px 6px rgba(18, 121, 240, 0.12);
  }

  .sso__slab-face img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  /* Yerdagi soya — plitka ko'tarilganda kichrayadi */
  .sso__shadow {
    position: absolute;
    top: 72px;
    width: 64px;
    height: 14px;
    border-radius: 50%;
    background: radial-gradient(ellipse, rgba(0, 0, 0, 0.35) 0%, transparent 70%);
    transform: translateZ(-30px) rotateX(70deg);
    animation: sso-shadow 5s ease-in-out infinite;
  }

  .sso__node--to .sso__shadow {
    animation-delay: -2.5s;
  }

  /* Tizim atrofida 3D orbita */
  .sso__orbit {
    position: absolute;
    top: -14px;
    width: 88px;
    height: 88px;
    border-radius: 50%;
    border: 1.5px solid rgba(255, 255, 255, 0.35);
    transform: rotateX(72deg);
    animation: sso-orbit 3.6s linear infinite;
  }

  .sso__orbit > span {
    position: absolute;
    top: -4px;
    left: calc(50% - 4px);
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #ffffff;
    box-shadow: 0 0 10px 2px rgba(255, 255, 255, 0.8);
  }

  /* Kalit yetib kelganda tizimdan tarqaladigan to'lqin */
  .sso__ring {
    position: absolute;
    top: 0;
    width: 58px;
    height: 58px;
    border-radius: 18px;
    border: 2px solid rgba(255, 255, 255, 0.9);
    opacity: 0;
    animation: sso-ring 2.2s ease-out 3.55s infinite;
  }

  .sso__node-label {
    max-width: 100%;
    margin-top: 16px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 11.5px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.85);
  }

  /* Ikki tizim orasidagi nur — punktir oqib turadi */
  .sso__beam {
    position: absolute;
    top: 50px;
    left: calc(2% + 80px);
    right: calc(2% + 80px);
    height: 2px;
    background: repeating-linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.6) 0 6px,
      transparent 6px 12px
    );
    background-size: 24px 2px;
    animation: sso-flow 0.9s linear infinite;
  }

  /* Kalit va ortidan uchqunlar — yoy bo'ylab uchadi */
  .sso__packet,
  .sso__spark {
    position: absolute;
    top: 37px;
    left: calc(2% + 80px);
    opacity: 0;
    animation: sso-arc 2.2s cubic-bezier(0.45, 0, 0.25, 1) 2.4s infinite;
  }

  .sso__packet {
    width: 28px;
    height: 28px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    color: var(--primary-color);
    background: #ffffff;
    box-shadow:
      0 0 0 5px rgba(255, 255, 255, 0.22),
      0 10px 18px rgba(0, 0, 0, 0.25);
  }

  .sso__spark {
    width: 10px;
    height: 10px;
    margin: 9px;
    border-radius: 50%;
    background: #ffffff;
    box-shadow: 0 0 12px 3px rgba(255, 255, 255, 0.7);
  }

  .sso__spark--1 {
    animation-delay: 2.5s;
    transform: scale(0.8);
  }

  .sso__spark--2 {
    animation-delay: 2.6s;
    width: 6px;
    height: 6px;
    margin: 11px;
  }

  .sso__secure {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: auto;
    padding-top: 32px;
  }

  /* ---------- O'ng panel ---------- */
  .sso__main {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 48px 46px;
  }

  .sso__app {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .sso__app-logo {
    width: 54px;
    height: 54px;
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 14px;
    font-size: 17px;
    font-weight: 700;
    color: #ffffff;
    background: var(--sso-accent);
  }

  .sso__app-label {
    font-size: 11.5px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--login-body);
  }

  .sso__app-name {
    margin-top: 2px;
    font-size: 16px;
    font-weight: 700;
    color: var(--login-ink);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .sso__title {
    margin-top: 30px;
    font-size: 28px;
    font-weight: 700;
    line-height: 1.2;
    color: var(--login-ink);
  }

  .sso__text {
    margin-top: 10px;
    font-size: 14.5px;
    line-height: 1.6;
    color: var(--login-body);
  }

  .sso__text b {
    color: var(--login-ink);
    font-weight: 700;
  }

  .sso__progress {
    margin-top: 28px;
    height: 6px;
    overflow: hidden;
    border-radius: 999px;
    background: var(--login-divider);
  }

  .sso__progress-bar {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: var(--sso-accent);
    transform-origin: left;
    animation-name: sso-progress;
    animation-timing-function: linear;
    animation-fill-mode: both;
  }

  .sso__meta {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    margin-top: 8px;
    font-size: 12.5px;
    color: var(--login-body);
  }

  .sso__go {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    height: 50px;
    margin-top: 26px;
    border-radius: 12px;
    font-size: 15px;
    font-weight: 600;
    color: #ffffff;
    background: var(--sso-accent);
    transition:
      background-color 0.15s ease,
      transform 0.15s ease;
  }

  .sso__go:hover {
    background: var(--sso-accent-hover);
  }

  .sso__go:active {
    transform: scale(0.99);
  }

  .sso__go:focus-visible,
  .sso__link:focus-visible {
    outline: 2px solid var(--sso-accent);
    outline-offset: 2px;
  }

  .sso__links {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    margin-top: 16px;
  }

  .sso__link {
    font-size: 13.5px;
    font-weight: 500;
    color: var(--login-body);
    text-decoration: underline;
    text-underline-offset: 3px;
    border-radius: 4px;
    transition: color 0.15s ease;
  }

  .sso__link:hover {
    color: var(--login-ink);
  }

  [data-theme='dark'] .sso {
    --sso-side: linear-gradient(
      160deg,
      color-mix(in srgb, var(--primary-color) 70%, #000000) 0%,
      color-mix(in srgb, var(--primary-color) 40%, #000000) 100%
    );
  }

  [data-theme='dark'] .sso__side {
    border-right: 1px solid var(--login-form-border);
  }

  /* Planshet/telefon: panellar ustma-ust va BITTA ekranga sig'adi (scroll'siz).
     Bosqichlar ro'yxati yashiriladi — jarayonni 3D sahna ko'rsatadi. */
  @media (max-width: 767.98px) {
    .sso {
      padding: 12px;
    }

    .sso__card {
      grid-template-columns: 1fr;
      min-height: 0;
      max-height: calc(100dvh - 24px);
      border-radius: 18px;
    }

    .sso__side {
      padding: 18px 20px 12px;
    }

    .sso__steps {
      display: none;
    }

    /* Sahna kichraytiriladi: 176px → ~120px */
    .sso__scene {
      height: 122px;
      margin-top: 4px;
    }

    .sso__stage {
      transform-origin: 50% 0;
      transform: scale(0.7) rotateX(var(--tilt-x, 16deg)) rotateY(var(--tilt-y, -10deg));
    }

    .sso__secure {
      justify-content: center;
      padding-top: 0;
    }

    .sso__main {
      padding: 20px 20px 18px;
    }

    .sso__app-logo {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      font-size: 15px;
    }

    .sso__title {
      margin-top: 16px;
      font-size: 21px;
    }

    .sso__text {
      margin-top: 6px;
      font-size: 13.5px;
      line-height: 1.5;
    }

    .sso__progress {
      margin-top: 16px;
    }

    .sso__go {
      height: 46px;
      margin-top: 16px;
    }

    .sso__links {
      margin-top: 12px;
    }

    .sso__link {
      font-size: 13px;
    }
  }

  /* Past ekranlar (iPhone SE va h.k.) — sahna ham yashiriladi */
  @media (max-width: 767.98px) and (max-height: 640px) {
    .sso__scene {
      display: none;
    }

    .sso__secure {
      justify-content: flex-start;
      padding-top: 12px;
    }
  }

  @keyframes sso-rise {
    from {
      opacity: 0;
      transform: translateY(14px) scale(0.98);
    }
    to {
      opacity: 1;
      transform: none;
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

  @keyframes sso-step-in {
    from {
      opacity: 0;
      transform: translateX(-10px);
    }
    to {
      opacity: 1;
      transform: none;
    }
  }

  @keyframes sso-line-grow {
    from {
      transform: scaleY(0);
    }
    to {
      transform: scaleY(1);
    }
  }

  /* ✓ belgisi 3D aylanib "ochiladi" */
  @keyframes sso-check-pop {
    from {
      transform: perspective(160px) rotateY(-180deg) scale(0.5);
      opacity: 0;
    }
    to {
      transform: perspective(160px) rotateY(0) scale(1);
      opacity: 1;
    }
  }

  @keyframes sso-scene-in {
    from {
      opacity: 0;
      transform: translateY(18px) scale(0.92);
    }
    to {
      opacity: 1;
      transform: none;
    }
  }

  @keyframes sso-grid {
    to {
      background-position: 28px 0;
    }
  }

  @keyframes sso-sway {
    0%,
    100% {
      transform: translateZ(14px) translateY(0) rotateY(-24deg) rotateX(10deg);
    }
    50% {
      transform: translateZ(26px) translateY(-8px) rotateY(-6deg) rotateX(18deg);
    }
  }

  @keyframes sso-shadow {
    0%,
    100% {
      opacity: 1;
      transform: translateZ(-30px) rotateX(70deg) scale(1);
    }
    50% {
      opacity: 0.55;
      transform: translateZ(-30px) rotateX(70deg) scale(0.8);
    }
  }

  @keyframes sso-orbit {
    to {
      transform: rotateX(72deg) rotateZ(360deg);
    }
  }

  @keyframes sso-flow {
    to {
      background-position: 24px 0;
    }
  }

  /* Kalit yuqoriga ko'tarilib (yoy), kamerga yaqinlashib, tizimga tushadi */
  @keyframes sso-arc {
    0% {
      left: calc(2% + 80px);
      opacity: 0;
      transform: translateY(0) translateZ(0) scale(0.5) rotate(0deg);
    }
    12% {
      opacity: 1;
    }
    50% {
      transform: translateY(-34px) translateZ(40px) scale(1.15) rotate(180deg);
    }
    85% {
      opacity: 1;
    }
    100% {
      left: calc(98% - 108px);
      opacity: 0;
      transform: translateY(0) translateZ(0) scale(0.5) rotate(360deg);
    }
  }

  @keyframes sso-ring {
    0% {
      opacity: 0.9;
      transform: translateZ(20px) scale(1);
    }
    100% {
      opacity: 0;
      transform: translateZ(20px) scale(1.5);
    }
  }

  @keyframes sso-drift {
    to {
      transform: translate(-40px, 50px) scale(1.15);
    }
  }

  @keyframes sso-pulse {
    50% {
      transform: scale(0.7);
      opacity: 0.6;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .sso__card,
    .sso__step,
    .sso__step::before,
    .sso__step-dot,
    .sso__step--active .sso__step-dot > span,
    .sso__scene,
    .sso__side::before,
    .sso__side::after,
    .sso__floor,
    .sso__beam,
    .sso__slab,
    .sso__shadow,
    .sso__orbit {
      animation: none !important;
    }

    .sso__packet,
    .sso__spark,
    .sso__ring {
      display: none;
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
