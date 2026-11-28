<script setup>
  /**
   * Imzolash kartasi: sarlavha, kim uchun havola (izoh), usul tanlash kartochkalari,
   * tanlangan usul maydoni va pastki qator — chapda «Rad etish», o'ngda asosiy amal.
   * Asosiy amal usulga qarab: chizish — «Tasdiqlash», kompyuter — «E-IMZO bilan imzolash»,
   * telefon — «Boshlash» (QR/ilova ochilgandan keyin tugma kerak emas).
   */
  import { useRoute } from 'vue-router'
  import { usePdfViewerStore, useSignatureStore } from '@/store/modules/index.js'
  import SignatureBox from '@/pages/app/documentSignature/ui/SignatureBox.vue'
  import MobileEimzo from '@/pages/app/documentSignature/ui/MobileEimzo.vue'
  import LinkReject from '@/pages/app/documentSignature/ui/LinkReject.vue'
  import {
    Signature20Regular,
    Key20Regular,
    Key24Regular,
    Phone20Regular,
    Info16Regular,
    Checkmark20Filled,
    DismissCircle20Regular
  } from '@vicons/fluent'

  const store = usePdfViewerStore()
  const signStore = useSignatureStore()
  const route = useRoute()
  const isPhone = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
  // Ariza havolasidan kelgan — faqat E-IMZO (chizish faqat lokal sinovda), rad etish yo'q.
  const fromLink = route.query.from === 'link'
  const allowDraw = !fromLink || import.meta.env.DEV
  // Telefonda odatda E-IMZO ilovasi, kompyuterda — chizish (havolada — E-IMZO).
  const tab = ref(isPhone ? 'mobile' : fromLink ? 'eimzo' : 'draw')

  const boxRef = ref(null)
  const mobileRef = ref(null)
  const rejectRef = ref(null)

  const allMethods = [
    {
      key: 'draw',
      icon: Signature20Regular,
      label: 'signature.methodDraw',
      hint: 'signature.methodDrawHint'
    },
    {
      key: 'eimzo',
      icon: Key20Regular,
      label: 'signature.methodEimzo',
      hint: 'signature.methodEimzoHint'
    },
    {
      key: 'mobile',
      icon: Phone20Regular,
      label: 'signature.methodMobile',
      hint: 'signature.methodMobileHint'
    }
  ]

  const methods = allMethods.filter((m) => m.key !== 'draw' || allowDraw)

  const onEimzo = () => {
    signStore._signatureLink(route.query.token, () => store.markLinkSigned())
  }

  const current = computed(() => methods.find((m) => m.key === tab.value))

  // Pastki qatordagi asosiy tugma — tanlangan usulga mos matn, holat va amal.
  const action = computed(() => {
    if (tab.value === 'draw') {
      return {
        label: 'content.confirm',
        loading: store.saveLoading,
        disabled: !boxRef.value?.hasDrawing,
        run: () => boxRef.value?.confirm()
      }
    }
    if (tab.value === 'eimzo') {
      return { label: 'signature.eimzoSign', loading: signStore.loading, run: onEimzo }
    }
    if (store.mobileSession) return null
    return {
      label: 'signature.mobileStart',
      loading: store.mobileLoading,
      run: () => mobileRef.value?.start()
    }
  })
</script>

<template>
  <div id="draw-signature" class="sign-card flex w-full scroll-mt-24 flex-col p-5 sm:p-6">
    <h3 class="text-lg font-semibold text-textColor0">{{ $t('signature.signTitle') }}</h3>
    <!-- Havola kim uchun ekanligi -->
    <p class="sign-short-hide mt-1 flex gap-1.5 text-[13px] leading-5 text-textColor2">
      <n-icon size="16" class="mt-0.5 shrink-0 text-primary"><Info16Regular /></n-icon>
      <span>{{ $t('signature.signatureWorker', { name: store.signatureWorker }) }}</span>
    </p>

    <!-- Usul tanlash: katta plitkalar (ikonka tepada, nomi ostida) -->
    <div class="sign-short-hide mt-5 text-xs font-semibold uppercase tracking-wide text-textColor3">
      {{ $t('signature.methodTitle') }}
    </div>
    <div class="mt-2 grid gap-2" :class="methods.length === 3 ? 'grid-cols-3' : 'grid-cols-2'" role="radiogroup">
      <button
        v-for="m in methods"
        :key="m.key"
        type="button"
        role="radio"
        :aria-checked="tab === m.key"
        class="sign-tile"
        :class="{ 'is-active': tab === m.key }"
        @click="tab = m.key"
      >
        <span class="sign-tile__icon">
          <n-icon size="20"><component :is="m.icon" /></n-icon>
        </span>
        <span class="sign-tile__label">{{ $t(m.label) }}</span>
      </button>
    </div>
    <p class="sign-short-hide mt-2 text-xs text-textColor3">{{ $t(current.hint) }}</p>

    <!-- Tanlangan usul maydoni -->
    <!-- Kompyuterda maydon panelda qolgan joyni egallaydi — panel oyna balandligiga sig'adi, aylantirilmaydi -->
    <div class="mt-3 flex flex-col lg:min-h-0 lg:flex-1">
      <SignatureBox v-if="tab === 'draw'" ref="boxRef" />
      <div
        v-else-if="tab === 'eimzo'"
        class="rounded-2xl border border-dashed border-surface-line bg-surface-ground p-6 text-center"
      >
        <n-icon size="36" class="text-primary"><Key24Regular /></n-icon>
        <p class="mt-2 text-sm text-textColor2">{{ $t('signature.eimzoHint') }}</p>
      </div>
      <MobileEimzo v-else ref="mobileRef" :is-phone="isPhone" />
    </div>

    <!-- Asosiy amal — katta, to'liq kenglikda; rad etish — ostida sokin havola -->
    <!-- n-button `block` margin'ni yutadi — oraliq o'rovchi div'da -->
    <div v-if="action" class="mt-4">
      <n-button
        type="primary"
        size="large"
        block
        :loading="action.loading"
        :disabled="action.disabled"
        @click="action.run"
      >
        <template #icon><Checkmark20Filled /></template>
        {{ $t(action.label) }}
      </n-button>
    </div>
    <!-- Rad etish — aniq tugma (havola emas): asosiy tugma ostida, qizil chiziqli -->
    <div v-if="!fromLink" class="mt-3">
      <n-button type="error" secondary size="large" block @click="rejectRef?.open()">
        <template #icon><DismissCircle20Regular /></template>
        {{ $t('documentPage.signature.rejectTitle') }}
      </n-button>
    </div>
    <LinkReject ref="rejectRef" />
  </div>
</template>

<style scoped>
  /* Past ekranli kompyuterda (oyna < 760px) ikkinchi darajali yozuvlar yashiriladi — panel aylantirilmasdan sig'adi */
  @media (min-width: 976px) and (max-height: 760px) {
    .sign-short-hide {
      display: none;
    }
    .sign-short-hide + .grid {
      margin-top: 16px;
    }
  }
  .sign-tile {
    display: flex;
    min-height: 92px;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px 6px;
    border: 1.5px solid var(--color-surface-line);
    border-radius: 16px;
    text-align: center;
    background: var(--color-surface-section);
    cursor: pointer;
    transition:
      border-color 0.15s,
      background-color 0.15s,
      box-shadow 0.15s;
  }
  .sign-tile:hover {
    border-color: color-mix(in srgb, var(--color-primary) 45%, transparent);
  }
  .sign-tile.is-active {
    border-color: var(--color-primary);
    background: color-mix(in srgb, var(--color-primary) 6%, transparent);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 14%, transparent);
  }
  .sign-tile__icon {
    display: flex;
    width: 38px;
    height: 38px;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    color: var(--color-textColor2);
    background: var(--color-surface-ground);
  }
  .sign-tile.is-active .sign-tile__icon {
    color: #fff;
    background: var(--color-primary);
  }
  .sign-tile__label {
    font-size: 12.5px;
    font-weight: 600;
    line-height: 1.25;
    color: var(--color-textColor1);
  }
  .sign-tile.is-active .sign-tile__label {
    color: var(--color-primary);
  }
</style>
