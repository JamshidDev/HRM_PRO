<script setup>
import NoDataIllustration from './NoDataIllustration.vue'
</script>

<template>
  <div class="grid grid-cols-1 w-full mt-20 mb-10">
    <NoDataIllustration />
    <span class="text-grey-color text-center font-medium pt-4 text-lg">{{$t("content.notFoundData")}}</span>
    <span class="text-grey-color text-center font-normal pt-2 text-sm">{{$t("content.noResultYourRequest")}}</span>
  </div>


</template>

<style scoped>

</style>