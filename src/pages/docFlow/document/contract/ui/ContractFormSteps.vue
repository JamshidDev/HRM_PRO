<script setup>
  import { UIFigSteps } from '@/components/index.js'
  import { useContractStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'

  /**
   * Shartnoma sehrgarining qadamlari — `UIModal` ning sarlavha qatorida turadi
   * (`#header-actions`), shu bois ixcham ko'rinishda. Holat `contractStore` da,
   * shuning uchun forma bilan bir vaqtda o'zi yangilanadi.
   */
  const { t } = i18n.global
  const store = useContractStore()

  const steps = computed(() => [
    { key: 'one', label: t('contractPage.step.stepOne') },
    { key: 'two', label: t('contractPage.step.stepTwo') },
    { key: 'three', label: t('contractPage.step.stepThree') },
    { key: 'four', label: t('contractPage.step.stepFour') }
  ])

  // Sehrgar ketma-ket yuriladi — joriy qadamgacha bo'lganlari bajarilgan hisoblanadi
  const completedSteps = computed(() =>
    Array.from({ length: Math.max(0, store.stepNumber - 1) }, (_, i) => i + 1)
  )
</script>

<template>
  <!-- Telefonda sarlavha qatori tor: qadamlar formaning tepasida emas, umuman
       ko'rsatilmaydi (matn yorliqlari sig'maydi). -->
  <UIFigSteps
    class="hidden! sm:flex!"
    compact
    :steps="steps"
    :current="store.stepNumber"
    :completed="completedSteps"
  />
</template>
