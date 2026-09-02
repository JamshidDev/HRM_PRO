<script setup>
  /**
   * Figma "commonQuestions" — "Ko'p beriladigan savollar" sahifasi.
   * "Bog'lanish" sahifasidagi FAQ kartasi shu yerga olib keladi.
   */
  import { UIPageContent, UIBackButton } from '@/components/index.js'
  import { AppPaths } from '@/utils/index.js'
  import CommonQuestions from './ui/CommonQuestions.vue'

  const router = useRouter()

  const goBack = () => router.push(AppPaths.Contact)
</script>

<template>
  <UIPageContent class="!h-auto !gap-6">
    <div class="flex w-full shrink-0 flex-wrap items-center gap-4">
      <UIBackButton @click="goBack" />
      <h1 class="text-[24px] leading-[30px] font-semibold text-fig-text-primary">
        {{ $t('faqPage.title') }}
      </h1>
    </div>

    <CommonQuestions />
  </UIPageContent>
</template>
