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
  // Telefonda: «Familiya I.»
  const shortName = computed(() => {
    const [last, first] = nameParts.value
    return first ? `${last} ${first[0]}.` : last || ''
  })
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
  <div
    class="w-full h-[60px] border-b bg-surface-section border-surface-line fixed left-0 top-0 z-50 px-3 sm:px-5"
  >
    <div class="flex justify-between gap-3 h-full items-center max-w-[1440px] mx-auto">
      <!-- Logo, ilova nomi va link kimga tegishli -->
      <div class="flex items-center gap-3 min-w-0">
        <button
          type="button"
          class="flex items-center gap-2 shrink-0 cursor-pointer"
          @click="router.push(AppPaths.Home)"
        >
          <img class="w-10 h-10 object-cover" src="/main-logo.svg" alt="app logo" />
          <span class="hidden md:inline text-base font-semibold text-primary whitespace-nowrap">
            {{ $t('homePage.appName') }}
          </span>
        </button>
        <template v-if="isSignPage && fullName">
          <span class="hidden md:block h-6 w-px bg-surface-line shrink-0"></span>
          <div class="flex items-center gap-2 min-w-0">
            <n-ellipsis class="text-sm font-medium text-textColor1 hidden sm:block max-w-[320px]">
              {{ fullName }}
            </n-ellipsis>
            <span class="text-sm font-medium text-textColor1 truncate sm:hidden">
              {{ shortName }}
            </span>
            <span
              v-if="roleLabel"
              class="hidden sm:inline shrink-0 text-[11px] font-semibold rounded-full px-2 py-0.5 bg-surface-ground text-textColor2"
            >
              {{ roleLabel }}
            </span>
          </div>
        </template>
      </div>

      <!-- Holat, imzolash va til -->
      <div class="flex items-center gap-2 sm:gap-3 shrink-0">
        <n-tooltip v-if="showTimer" trigger="hover">
          <template #trigger>
            <span
              class="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-sm font-semibold tabular-nums"
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
          class="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-sm font-semibold bg-fig-chip-green text-fig-chip-green-text"
        >
          <n-icon size="16"><CheckmarkCircle16Filled /></n-icon>
          {{ $t('documentPage.command.dataTab.resend.status.3') }}
        </span>
        <span
          v-else-if="isSignPage && store.rejectedNow"
          class="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-sm font-semibold bg-danger/10 text-danger"
        >
          <n-icon size="16"><DismissCircle16Filled /></n-icon>
          {{ $t('documentPage.command.dataTab.resend.status.4') }}
        </span>

        <n-button v-if="canSign" type="primary" @click="goSignature">
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
