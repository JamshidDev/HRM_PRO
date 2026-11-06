<script setup>
import LangDropdown from '@/components/general/LangDropdown.vue'
import { UIThemeSwitch } from '@/components/index.js'
import { useAppSetting } from '@/utils/index.js'
import {
  useAppStore,
  useLoginNewStore,
  useQrLoginStore,
  useResetPasswordStore,
  useSocketStore
} from '@/store/modules/index.js'
import i18n from '@/i18n/index.js'
import LoginForm from './ui/LoginForm.vue'
import EriForm from './ui/EriForm.vue'
import QrForm from './ui/QrForm.vue'
import TwoFactorForm from './ui/TwoFactorForm.vue'
import ResetForm from './ui/ResetForm.vue'
import ExpiredForm from './ui/ExpiredForm.vue'
import StoreLinks from './ui/StoreLinks.vue'
import LoginBanner from './ui/LoginBanner.vue'
import SeasonEffect from './ui/SeasonEffect.vue'
import OfferModal from '@/components/OfferModal.vue'
import SsoRedirectOverlay from './ui/SsoRedirectOverlay.vue'
import AppChooser from './ui/AppChooser.vue'
import { useRoute } from 'vue-router'
import mandalaUrl from '@/assets/images/login/mandala.svg?url'
import gridTileUrl from '@/assets/images/login/grid-tile.svg?url'

// Fon naqshlari CSS maska sifatida — rangi token'dan (yorug'/qorong'i mavzu)
const patternVars = {
  '--login-mandala-url': `url(${mandalaUrl})`,
  '--login-grid-url': `url(${gridTileUrl})`
}


const appStore = useAppStore()
const loginStore = useLoginNewStore()
const resetStore = useResetPasswordStore()
const qrStore = useQrLoginStore()
const route = useRoute()

// Tashqi tizim «HRM orqali kirish» bilan yuborgan bo'lsa — login'dan keyin o'sha tizimga qaytamiz.
loginStore._loadSsoClient(route.query.client_id)
if (route.query.client_id) loginStore._checkSsoSession()

// HRM'ga allaqachon kirilgan bo'lsa — qayta login yo'q, darhol tizimga yo'naltiriladi.
watch(
  () => [loginStore.sso, loginStore.ssoSession],
  ([sso, session]) => {
    if (sso && session && !loginStore.ssoRedirect) loginStore._ssoContinueSession()
  }
)

const isPhone = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
const appChooserDismissed = ref(false)
const ssoChecking = computed(
  () =>
    !!route.query.client_id &&
    (loginStore.ssoSessionChecking || (isPhone && loginStore.ssoLoading) || (!!loginStore.ssoSession && !!loginStore.sso))
)
const showAppChooser = computed(() => isPhone && !!loginStore.sso && !appChooserDismissed.value)

// Faqat lokal dev: `/login?sso_preview` — SSO yo'naltirish oynasini soxta ma'lumot bilan ko'rsatadi (UI ustida ishlash uchun).
if (import.meta.env.DEV && route.query.sso_preview !== undefined) {
  loginStore.ssoRedirect = {
    name: route.query.sso_preview || 'KPI-Application-Ismoil',
    url: 'https://kpi.das-uty.uz/',
    preview: true
  }
}

const steps = { login: 'login', twofa: 'twofa', reset: 'reset', expired: 'expired' }
const step = ref(steps.login)

// Kirish usullari — login qadamida tab sifatida ko'rsatiladi.
// ERI faqat `signatureLogin` yoqilgan bo'lsa chiqadi (E-IMZO plagini kerak).
const tabs = { password: 'password', eri: 'eri', qr: 'qr' }
const tab = ref(tabs.password)
const tabList = computed(() =>
  [
    { key: tabs.password, label: i18n.global.t('loginPage.tabs.password') },
    appStore.appConfig.signatureLogin
      ? { key: tabs.eri, label: i18n.global.t('loginPage.tabs.eri') }
      : null,
    { key: tabs.qr, label: i18n.global.t('loginPage.tabs.qr') }
  ].filter(Boolean)
)

// QR sessiyasi = socket ulanishi: tab ochilganda ulanadi, chiqilganda uziladi
// (server ham sessiyani bekor qiladi), qaytib kelinganda yangi kod so'raladi.
//
// ⚠️ Sessiya egasi FAQAT shu yer — `QrForm`ning mount/unmount hooklari EMAS.
// Sabab: tab animatsiyasi (`out-in`) chiqayotgan komponentni ~180ms ushlab turadi;
// agar unmount'da `close()` chaqirilsa, tez ketma-ket bosishda u ALLAQACHON
// ochilgan yangi sessiyani yopib yuborardi (race).
watch(tab, (value) => {
  if (value === tabs.qr) qrStore.open()
  else qrStore.close()
})

watch(step, (value) => {
  if (value !== steps.login) qrStore.close()
})

// --- Karta balandligini qotirish (barcha ekran o'lchamlarida) ---
// O'lchov ASOSIY (Login) tabdan olinadi va `viewport`ga `min-height` bo'lib
// qo'llanadi — shunda ERI/QR/2FA/parol tiklash ekranlarida karta sakramaydi.
// Qattiq raqam (masalan `420px`) YARAMAYDI: mobil va desktopda login formasi
// turli balandlikda (mobil'da qo'shimcha "Ilovani yuklab oling" bloki bor),
// shuning uchun jonli o'lchanadi.
const paneRef = ref(null)
const baseHeight = ref(0)

const measureBase = async () => {
  if (tab.value !== tabs.password || step.value !== steps.login) return
  await nextTick()
  const h = paneRef.value?.offsetHeight ?? 0
  if (h) baseHeight.value = h
}

let resizeTimer = null
const onResize = () => {
  clearTimeout(resizeTimer)
  resizeTimer = setTimeout(measureBase, 150)
}

onMounted(() => {
  // Login sahifasida eski sessiya socket'i kerak emas — qayta kirishda «chiqarildingiz» chiqmasin.
  useSocketStore().disconnect()
  void measureBase()
  // Captcha rasmi/shriftlar kech yuklansa balandlik o'zgaradi — qayta o'lchaymiz.
  setTimeout(measureBase, 600)
  window.addEventListener('resize', onResize)
})

watch([tab, step], measureBase)

onBeforeUnmount(() => {
  clearTimeout(resizeTimer)
  window.removeEventListener('resize', onResize)
  qrStore.close()
  // Login qilmay ortga qaytildi — eski sessiya socket'i qayta ulanadi.
  const socketStore = useSocketStore()
  const token = localStorage.getItem(useAppSetting.tokenKey)
  const userId = localStorage.getItem(useAppSetting.accountUserId)
  if (!socketStore.socket && token && userId) socketStore.initSocket(token, Number(userId))
})

// o'tish yo'nalishi: oldinga (slide-next) yoki orqaga (slide-prev)
const transitionName = ref('slide-next')

// backend 2FA talab qilsa kod qadamiga, bekor qilinsa loginga qaytamiz
watch(
  () => loginStore.twoFactorRequired,
  (required) => {
    transitionName.value = required ? 'slide-next' : 'slide-prev'
    step.value = required ? steps.twofa : steps.login
  }
)

// Parol muddati o'tgan — backend kirishga ruxsat bermadi. Login qadamida
// qolib toast bilan cheklanmaymiz: nima qilish kerakligi (bot orqali tiklash)
// alohida ekranda tushuntiriladi.
watch(
  () => loginStore.passwordExpired,
  (expired) => {
    if (expired) {
      transitionName.value = 'slide-next'
      step.value = steps.expired
      return
    }
    // Bayroq tashqaridan tozalansa ekran osilib qolmasin. `toLogin` va
    // `onExpiredReset` qadamni o'zi belgilaydi — shuning uchun faqat HALI
    // muddat ekranida turgan holat qaytariladi.
    if (step.value === steps.expired) {
      transitionName.value = 'slide-prev'
      step.value = steps.login
    }
  }
)

// Muddat ekranidagi "Parolni tiklash" — o'sha telefon bilan tiklash oqimiga.
const onExpiredReset = () => {
  resetStore.start(loginStore.phone)
  loginStore.clearPasswordExpired()
  transitionName.value = 'slide-next'
  step.value = steps.reset
}

// LoginForm'dagi "Parolni unutdingizmi?" — telefonni olib reset qadamiga o'tamiz
const onForgot = (phone) => {
  resetStore.start(phone)
  transitionName.value = 'slide-next'
  step.value = steps.reset
}

const toLogin = () => {
  // Muddat bayrog'i tozalanmasa, `watch` qayta ishga tushmaydi-yu, lekin
  // keyingi urinishda holat eskicha qolib ketardi.
  loginStore.clearPasswordExpired()
  transitionName.value = 'slide-prev'
  step.value = steps.login
}

// Tab bosildi. 2FA yoki parol tiklash qadamida bo'lsak — "Orqaga" bilan bir xil
// xatti-harakat: avval login qadamiga qaytamiz, so'ng tanlangan tab ochiladi.
const selectTab = (key) => {
  if (step.value !== steps.login) toLogin()
  tab.value = key
}

// Parol yangilangach login qadamiga qaytamiz
const onDone = () => {
  transitionName.value = 'slide-prev'
  step.value = steps.login
  window.$message?.success(i18n.global.t('loginPage.resetPassword.success'))
}
</script>

<template>
  <!-- Figma «HRM PRO» → «↪ Login»: chapda banner (slayd-shou), o'ngda kirish kartasi.
       1440×800 maketda: sahifa chetidan 24px, banner va karta orasi 48px. -->
  <div
    class="login-new relative min-h-screen w-full flex items-stretch gap-12 p-3 sm:p-6 text-login-ink bg-login-page overflow-hidden"
    :style="patternVars"
  >
    <!-- Fon naqshlari: uchburchak to'r (3%) va chap chetdagi mandala -->
    <div class="login-new__grid absolute inset-0 pointer-events-none" aria-hidden="true"></div>
    <div class="login-new__page-mandala absolute pointer-events-none" aria-hidden="true"></div>

    <!-- Chap banner — faqat keng ekranda -->
    <div class="login-new__hero relative hidden lg:flex overflow-hidden rounded-2xl">
      <LoginBanner class="w-full" />
      <SeasonEffect :season="useAppSetting.loginSeason" />
    </div>

    <!-- O'ng: kirish kartasi -->
    <div
      class="login-new__card relative flex-1 min-w-0 flex flex-col items-center overflow-hidden px-5 sm:px-10 xl:px-[100px] pt-6 sm:pt-8 pb-8"
    >
      <!-- Kartaning yuqori va pastki chetidagi yarim mandalalar -->
      <div class="login-new__mandala login-new__mandala--top" aria-hidden="true"></div>
      <div class="login-new__mandala login-new__mandala--bottom" aria-hidden="true"></div>

      <!-- Telefon/planshet: banner yo'q — logo shu yerda -->
      <div class="relative z-10 w-full max-w-[472px] flex lg:hidden items-center gap-3 mb-6">
        <img :src="useAppSetting.appLogoUrl" alt=" " class="h-10 object-center" />
        <span class="text-xl font-bold uppercase">HRM PRO</span>
      </div>

      <div class="relative z-10 w-full max-w-[472px] my-auto py-4 login-new__fade-in">
        <!-- Sarlavha + mavzu / til (Figma «Header Container», node 4821:46328) -->
        <div class="flex items-center gap-4 mb-6">
          <h1 class="flex-1 min-w-0 m-0 text-2xl leading-[30px] font-semibold text-login-ink">
            {{ $t('loginPage.title') }}
          </h1>
          <div class="flex items-center gap-3 shrink-0">
            <UIThemeSwitch class="bg-login-field!" />
            <div class="login-new__lang flex">
              <LangDropdown pill />
            </div>
          </div>
        </div>

        <!-- Telefonda tashqi tizimdan kelinganda — avval HR Rail ilovasi tavsiya qilinadi -->
        <div v-if="ssoChecking" class="h-[360px]"></div>
        <AppChooser v-else-if="showAppChooser" @browser="appChooserDismissed = true" />
        <template v-else>
          <!-- Kirish usuli: Login / ERI / QR-kod (Figma «Status Toggle», node 4821:46339).
               ⚠️ Tab qatori BARCHA qadamlarda ko'rinadi (2FA / parol tiklashda ham):
               yashirilsa yo joyi yo'qolib karta ~100px sakrardi, yo `invisible`
               qilinganda tepada bo'sh oraliq qolardi. Ko'rinib turgani ham qulay —
               parol tiklashdan tab bosib chiqib ketish mumkin. -->
          <div
            class="login-new__tabs mb-6 grid p-0.5 rounded-xl"
            :style="{ gridTemplateColumns: `repeat(${tabList.length}, minmax(0, 1fr))` }"
          >
            <button
              v-for="t in tabList"
              :key="t.key"
              type="button"
              class="login-new__tab h-8 rounded-[10px] px-4 text-sm leading-[18px] font-medium transition-colors"
              :class="tab === t.key ? 'login-new__tab--active' : ''"
              @click="selectTab(t.key)"
            >
              {{ t.label }}
            </button>
          </div>

          <!-- qadamlar yo'nalishli slide bilan almashadi.
               ⚠️ Transition FAQAT qadam (login/twofa/reset) almashuvini kuzatadi —
               tab'lar uning ICHIDA almashadi. Aks holda `mode="out-in"` tez ketma-ket
               bosishda leave fazasida "qotib" qolib, yangi komponentni MOUNT QILMAYDI
               (natijada QrForm'ning `onMounted`i ishlamay, QR yuklanmay qolardi). -->
          <div
            class="login-new__viewport overflow-hidden -mx-2 px-2"
            :style="baseHeight ? { minHeight: `${baseHeight}px` } : null"
          >
            <Transition :name="transitionName" mode="out-in">
              <TwoFactorForm v-if="step === steps.twofa" key="twofa" @back="toLogin" />
              <ExpiredForm
                v-else-if="step === steps.expired"
                key="expired"
                @back="toLogin"
                @reset="onExpiredReset"
              />
              <ResetForm v-else-if="step === steps.reset" key="reset" @back="toLogin" @done="onDone" />
              <!-- Balandlik tab'lar bo'ylab QOTIB turadi — o'lchov asosiy (Login) tabdan -->
              <div v-else key="login" ref="paneRef" class="w-full login-new__tab-pane">
                <!-- Tab almashuvi animatsiyasi — loyihadagi `tab-fade` patterni
                     (`pages/app/profile/ui/Tabs.vue`) asosida, kalitlangan o'rovchi.
                     ⚠️ `mode="out-in"` ATAYLAB YO'Q: tez ketma-ket bosishda leave
                     fazasi uzilib qolib, kirayotgan komponent MOUNT BO'LMAY qolardi
                     (QR yuklanmasdi). Bir vaqtda (default) rejimda chiquvchi element
                     `position: absolute` bilan ustma-ust so'nadi — sakrash yo'q. -->
                <Transition name="tab-fade">
                  <div :key="tab">
                    <EriForm v-if="tab === tabs.eri" />
                    <QrForm v-else-if="tab === tabs.qr" />
                    <LoginForm v-else @forgot="onForgot" />
                  </div>
                </Transition>
              </div>
            </Transition>
          </div>
        </template>
      </div>

      <!-- Mobil ilova (Figma «Mobile App Section», node 4821:46372) -->
      <div
        v-if="appStore.appConfig.signatureLogin"
        class="relative z-10 w-full max-w-[472px] flex flex-col items-center gap-2.5 mt-6"
      >
        <p class="m-0 text-sm leading-5 text-login-body text-center">
          {{ $t('loginPage.mobileApp') }}
        </p>
        <StoreLinks />
      </div>

      <!-- Mualliflik huquqi — keng ekranda banner ichida, bu yerda faqat telefon/planshetda -->
      <p class="relative z-10 lg:hidden w-full mt-6 px-2 text-center text-xs text-login-foot">
        {{ $t('loginPage.banner.copyright') }}
      </p>
    </div>

    <!-- Offerta modali — login javobida `offer:true` kelsa ochiladi (teleport) -->
    <OfferModal />
    <SsoRedirectOverlay />
  </div>
</template>

<style scoped>
/* Banner va karta teng bo'linadi (maketda 672 + 672) */
.login-new__hero {
  flex: 1 1 0;
  min-width: 0;
}

/* Sahifa fonidagi uchburchak to'r (Figma «PATTERN», 3%) — bitta katak takrorlanadi */
.login-new__grid {
  background-color: var(--login-grid);
  -webkit-mask: var(--login-grid-url) 0 0 / 279.5px 379.4px repeat;
  mask: var(--login-grid-url) 0 0 / 279.5px 379.4px repeat;
}

/* Naqsh SVG'si tik yarim mandala (tekis tomoni chapda, 325×622).
   Rang `background-color` (token), shakl — maska. */
.login-new__page-mandala,
.login-new__mandala {
  -webkit-mask: var(--login-mandala-url) center / 100% 100% no-repeat;
  mask: var(--login-mandala-url) center / 100% 100% no-repeat;
}

/* Sahifaning chap chetida (asosan banner ortida) */
.login-new__page-mandala {
  left: 0;
  top: -3px;
  width: 423px;
  height: 807px;
  background-color: var(--login-mandala-page);
}

/* Karta: 622×325 yarim doira — burilgan holda, gorizontal markazda.
   Element tik (325×622) chiziladi va 90° buriladi: markaz o'zgarmaydi,
   shuning uchun `bottom/top: -148.5px` = (325 − 622) / 2. */
.login-new__mandala {
  position: absolute;
  left: 50%;
  width: 325px;
  height: 622px;
  background-color: var(--login-mandala);
  pointer-events: none;
}

.login-new__mandala--bottom {
  bottom: -148.5px;
  transform: translateX(-50%) rotate(-90deg);
}

.login-new__mandala--top {
  top: -148.5px;
  transform: translateX(-50%) rotate(90deg);
}

/* Karta balandligi SAKRAMASIN. Chegara `viewport`ga INLINE `min-height` bo'lib
   beriladi (`baseHeight`, script'da o'lchanadi) — u BARCHA ekranlarni (Login/ERI/
   QR tab'lari + 2FA + parol tiklash bosqichlari) o'rab turadi.
   `flow-root` — ichkaridagi `mt-*` margin'i konteynerdan "chiqib ketmasin"
   (margin collapse), aks holda ERI/QR tab'lari 24px balandroq bo'lib qolardi.
   `position` — `.tab-fade-leave-active` absolute bo'lgani uchun tayanch nuqta. */
.login-new__viewport,
.login-new__tab-pane {
  display: flow-root;
  position: relative;
}

/* Tab almashuvi animatsiyasi — loyihadagi `tab-fade` bilan bir xil
   (`pages/app/profile/ui/Tabs.vue`, `components/worker/UIWorkerView.vue`) */
.tab-fade-enter-active,
.tab-fade-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}

.tab-fade-enter-from,
.tab-fade-leave-to {
  opacity: 0;
  transform: translateY(6px);
}

/* Chiquvchi tab oqimdan chiqariladi — kiruvchisi bilan yonma-yon turmaydi */
.tab-fade-leave-active {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

/* Kirish usuli tab'lari (Login / ERI / QR-kod) — Figma «Status Toggle»:
   36px qator, `bg-secondary` fon, faol tab — karta rangida, qalinroq matn */
.login-new__tabs {
  background-color: var(--login-field-bg);
}

.login-new__tab {
  color: var(--login-ink);
  background-color: transparent;
  cursor: pointer;
}

.login-new__tab:hover:not(.login-new__tab--active) {
  color: var(--login-link);
}

.login-new__tab--active {
  background-color: var(--login-form-bg);
  font-weight: 600;
}

.login-new__card {
  background-color: var(--login-form-bg);
  border-radius: 16px;
  transition: background-color 0.25s;
}

/* Til tanlagich «tabletkasi» — Figma'da tema tugmasi bilan bir xil `bg-secondary` */
.login-new__lang :deep(.bg-fig-bg-tertiary) {
  background-color: var(--login-field-bg);
}

/* yo'nalishli slide o'tishlari (tez) */
.slide-next-enter-active,
.slide-next-leave-active,
.slide-prev-enter-active,
.slide-prev-leave-active {
  transition:
    transform 0.18s ease,
    opacity 0.18s ease;
}

/* oldinga: eski chapga chiqadi, yangi o'ngdan kiradi */
.slide-next-enter-from {
  transform: translateX(40px);
  opacity: 0;
}

.slide-next-leave-to {
  transform: translateX(-40px);
  opacity: 0;
}

/* orqaga: eski o'ngga chiqadi, yangi chapdan kiradi */
.slide-prev-enter-from {
  transform: translateX(-40px);
  opacity: 0;
}

.slide-prev-leave-to {
  transform: translateX(40px);
  opacity: 0;
}

/* kirishda yumshoq paydo bo'lish (fade-in + slide-up), ketma-ket kechikish bilan */
.login-new__fade-in {
  animation: login-new-fade-in 0.7s ease-out both;
}

.login-new__fade-in-delay-1 {
  animation-delay: 0.1s;
}

.login-new__fade-in-delay-2 {
  animation-delay: 0.25s;
}

@keyframes login-new-fade-in {
  from {
    opacity: 0;
    transform: translateY(16px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

<style>
.login-new__submit {
  background: var(--login-brand) !important;
  color: #ffffff !important;
  transition:
    transform 0.15s ease,
    background-color 0.15s ease,
    filter 0.15s ease !important;
}

.login-new__submit:not(.n-button--disabled):hover {
  background: var(--login-brand-hover) !important;
  transform: translateY(-1px);
}

.login-new__submit:not(.n-button--disabled):active {
  transform: scale(0.97);
}

.login-new__submit .n-button__border {
  border: unset !important;
}

.login-new .dark-border-button .n-button__border {
  border: unset !important;
}

.login-new .dark-border-button {
  border: 1px solid var(--login-field-border) !important;
}

.login-new .dark-border-button .n-base-wave {
  display: none !important;
}

.login-new .dark-border-button:not(.n-button--disabled):hover {
  color: var(--color-textColor0) !important;
}

.login-new .dark-border-button:not(.n-button--disabled):hover .n-button__border {
  border: unset !important;
}

.login-new .dark-border-button .n-button__state-border {
  border: unset !important;
}

/* E-imzo orqali kirish tugmasi — dizayndagi aniq ranglar (--login-eimzo-*) */
.login-new .login-new__signature-btn {
  background-color: var(--login-eimzo-bg) !important;
  color: var(--login-eimzo-ink) !important;
  border-color: var(--login-eimzo-border) !important;
}

.login-new .login-new__signature-btn:not(.n-button--disabled):hover {
  background-color: color-mix(in srgb, var(--login-link) 14%, var(--login-form-bg)) !important;
  border-color: var(--login-link) !important;
  color: var(--login-eimzo-ink) !important;
}

.login-new__store-card {
  transition:
    border-color 0.2s ease,
    transform 0.2s ease;
}

.login-new__store-card:hover {
  border-color: var(--color-primary, #0177d7) !important;
  transform: translateY(-1px);
}

.login-new input:-webkit-autofill,
.login-new input:-webkit-autofill:hover,
.login-new input:-webkit-autofill:focus {
  -webkit-box-shadow: 0 0 0px 1000px var(--login-form-bg) inset !important;
  -webkit-text-fill-color: var(--login-field-ink) !important;
}

/* Forma label'lari — Figma: 14/20, oddiy qalinlik, `text-secondary`, chapdan 4px */
.login-new .n-form-item .n-form-item-label {
  color: var(--login-label) !important;
  font-size: 14px;
  line-height: 20px;
  font-weight: 400;
  min-height: 0;
  padding: 0 0 8px 4px;
}

.login-new .n-form-item .n-form-item-label__asterisk {
  color: var(--login-star) !important;
}

/* "Yoki" ajratkichi */
.login-new .n-divider .n-divider__line {
  background-color: var(--login-divider) !important;
}

.login-new .n-divider .n-divider__title {
  color: var(--login-muted) !important;
  font-size: 12px;
  font-weight: 500;
}

/* === Login oqimidagi n-input'lar — Figma «Input»: 48px, `bg-secondary`, 8px radius,
   chegarasiz (faqat hover/focus'da brend rang), ichki chekka 16px, matn 14px medium === */
.login-new__input {
  --n-border-radius: 8px !important;
  --n-height: 48px !important;
  --n-padding-left: 16px !important;
  --n-padding-right: 16px !important;
  --n-font-size: 14px !important;
  --n-color: var(--login-field-bg) !important;
  --n-color-focus: var(--login-field-bg) !important;
  --n-text-color: var(--login-field-ink) !important;
  --n-placeholder-color: var(--login-ph) !important;
  --n-border: 1px solid transparent !important;
  --n-border-hover: 1px solid var(--login-link) !important;
  --n-border-focus: 1px solid var(--login-link) !important;
  --n-box-shadow-focus: 0 0 0 4px color-mix(in srgb, var(--login-link) 16%, transparent) !important;
  --n-caret-color: var(--login-link) !important;
  --n-icon-color: var(--login-icon-muted) !important;
  --n-icon-color-hover: var(--login-icon) !important;
}

.login-new__input .n-input__input-el,
.login-new__input .n-input__textarea-el {
  font-size: 14px;
  font-weight: 500;
}

/* ikonka va matn orasi 8px (Figma «Language title» gap) */
.login-new__input .n-input__prefix {
  margin-right: 8px;
}
</style>
