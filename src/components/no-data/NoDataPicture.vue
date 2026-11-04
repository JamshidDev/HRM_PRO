<script setup>
  import NoDataIllustration from './NoDataIllustration.vue'

  // Ixtiyoriy: sahifaga mos matn (berilmasa — umumiy «Ma'lumot topilmadi»).
  defineProps({
    title: { type: String, default: null },
    hint: { type: String, default: null }
  })
</script>

<template>
  <div class="w-full grid grid-cols-1 mt-20 mb-10">
    <NoDataIllustration />

    <span class="text-textColor2 text-center font-medium pt-4 text-lg">
      {{ title ?? $t('content.notFoundData') }}
    </span>

    <span class="text-textColor3 text-center font-normal pt-2 text-sm">
      {{ hint ?? $t('content.noResultYourRequest') }}
    </span>
  </div>
</template>
