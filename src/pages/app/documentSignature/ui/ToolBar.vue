<script setup>
  /**
   * Elektron imzolash sahifasi sarlavhasi. Chapda logo va kim uchun link (ism, rol),
   * o'ngda holat: imzolash uchun qolgan vaqt chipi yoki «Tasdiqlagan» / «Rad etgan»,
   * «Imzolash» tugmasi va til. Telefonda ism qisqaradi, rol yashiriladi.
   */
  import { UILanguage } from '@/components/index.js'
  import {
    DrawText24Regular,
    Timer24Regular,
    CheckmarkCircle16Filled,
    DismissCircle16Filled
  } from '@vicons/fluent'
  import { usePdfViewerStore } from '@/store/modules/index.js'
  import { useRouter } from 'vue-router'
  import { AppPaths } from '@/utils/index.js'
  import Utils from '@/utils/Utils.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global

  const store = usePdfViewerStore()
  const router = useRouter()

  const goSignature = () => {
    const el = document.getElementById('draw-signature')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Ism va rol faqat imzolash linkida (ariza sahifasida bu ma'lumot yo'q).
  const isSignPage = computed(
    () => store.viewerStatus === Utils.viewerStatus.signatureDocument && !store.checkLoading
  )
  const nameParts = computed(() => (store.signatureWorker || '').split(' ').filter(Boolean))
  const fullName = computed(() => nameParts.value.join(' '))
  // Imzolovchining roli (sahifa sarlavhasidan bu yerga ko'chirildi)
  const roleLabel = computed(() => {
    const type = store.signerType
    if (type === 'r') return t('documentPage.command.form.route.roleView')
    return ['w', 's', 'd'].includes(type) ? t(`documentPage.signature.approval.roles.${type}`) : ''
  })
  const isSigned = computed(() => store.isSigned || store.signedNow)
  const canSign = computed(
    () => !isSigned.value && !store.linkExpired && !store.rejectedNow && !store.errorMessage
  )
  const showTimer = computed(
    () =>
      isSignPage.value &&
      store.pdfUrl &&
      !isSigned.value &&
      !store.rejectedNow &&
      !store.errorMessage
  )
  const timeText = computed(
    () => `${Math.floor(store.linkLeft / 60)}:${String(store.linkLeft % 60).padStart(2, '0')}`
  )
  // Ko'k — vaqt bor, to'q sariq — oxirgi daqiqa, qizil — muddat tugagan.
  const timerClass = computed(() => {
    if (store.linkLeft <= 0) return 'bg-danger/10 text-danger border-danger/30'
    if (store.linkLeft <= 60) return 'bg-warning/10 text-warning border-warning/40'
    return 'bg-fig-chip-brand text-fig-chip-brand-text border-transparent'
  })
</script>

<template>
  <div class="sign-topbar fixed left-0 top-0 z-50 h-[64px] w-full px-3 sm:px-6">
    <div class="flex justify-between gap-3 h-full items-center max-w-[1680px] mx-auto">
      <!-- Logo, ilova nomi va link kimga tegishli -->
      <!-- Chap (logo) qisqarmaydi; telefonda bo'sh joyni o'ng tomondagi ism oladi va «…» bilan qisqaradi -->
      <div class="flex shrink-0 items-center gap-3 md:min-w-0 md:flex-1 md:shrink">
        <button
          type="button"
          class="flex items-center gap-2 shrink-0 cursor-pointer"
          @click="router.push(AppPaths.Home)"
        >
          <!-- main-logo.svg oq (qorong'i sidebar uchun) — oq sarlavhada ko'rinmasdi; login sahifasidagi rangli logo -->
          <img class="h-9 w-auto object-contain" src="/logo-new.png" alt="app logo" />
          <span class="hidden md:inline text-base font-semibold text-primary whitespace-nowrap">
            {{ $t('homePage.appName') }}
          </span>
        </button>
        <!-- Ism va rol endi sahifa sarlavhasida (Document.vue) — bu yerda faqat portal nomi -->
        <span class="hidden h-6 w-px shrink-0 bg-surface-line md:block"></span>
        <span class="hidden truncate text-sm font-medium text-textColor2 md:inline">
          {{ $t('signature.portalLabel') }}
        </span>
      </div>

      <!-- Holat, imzolash va til -->
      <div class="flex min-w-0 flex-1 items-center justify-end gap-2 sm:gap-3 md:flex-none">
        <!-- Imzolovchi: ism va roli (avatar yo'q); undan keyin vaqt chipi. Telefonda faqat ism (qisqartirilgan) -->
        <div
          v-if="isSignPage && fullName"
          class="flex min-w-0 flex-col leading-tight"
          :title="fullName"
        >
          <span
            class="max-w-[150px] truncate text-[13px] font-semibold text-textColor1 sm:max-w-[260px]"
          >
            {{ fullName }}
          </span>
          <span v-if="roleLabel" class="hidden text-[11.5px] text-textColor3 sm:block">{{
            roleLabel
          }}</span>
        </div>
        <n-tooltip v-if="showTimer" trigger="hover">
          <template #trigger>
            <span
              class="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-sm font-semibold tabular-nums"
              :class="timerClass"
            >
              <n-icon size="16"><Timer24Regular /></n-icon>
              {{ store.linkLeft > 0 ? timeText : $t('signature.linkExpiredShort') }}
            </span>
          </template>
          {{
            store.linkLeft > 0
              ? `${$t('signature.linkTimeLeft')} ${timeText}`
              : $t('signature.linkExpiredPublic')
          }}
        </n-tooltip>
        <span
          v-else-if="isSignPage && isSigned"
          class="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-sm font-semibold bg-fig-chip-green text-fig-chip-green-text"
        >
          <n-icon size="16"><CheckmarkCircle16Filled /></n-icon>
          {{ $t('documentPage.command.dataTab.resend.status.3') }}
        </span>
        <span
          v-else-if="isSignPage && store.rejectedNow"
          class="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-sm font-semibold bg-danger/10 text-danger"
        >
          <n-icon size="16"><DismissCircle16Filled /></n-icon>
          {{ $t('documentPage.command.dataTab.resend.status.4') }}
        </span>

        <!-- Kompyuterda imzolash paneli doim ko'rinib turadi — tugma faqat telefonda (pastdagi panelga olib boradi) -->
        <n-button v-if="canSign" type="primary" class="lg:!hidden" @click="goSignature">
          <template #icon>
            <DrawText24Regular />
          </template>
          <span class="hidden sm:inline">{{ $t('signature.goSignature') }}</span>
        </n-button>
        <UILanguage />
      </div>
    </div>
  </div>
</template>

<style scoped>
  /* Biroz shaffof, xira fon va yumshoq soya — sahifa aylanganda ostidagi «ko'rinib» turadi */
  .sign-topbar {
    border-bottom: 1px solid var(--color-surface-line);
    background: color-mix(in srgb, var(--color-surface-section) 86%, transparent);
    backdrop-filter: saturate(160%) blur(10px);
    box-shadow: 0 6px 24px -18px rgb(16 24 40 / 35%);
  }
</style>
