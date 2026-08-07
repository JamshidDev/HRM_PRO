<script setup>
  import Tabs from './ui/Tabs.vue'
  import { UIPageTitle } from '@/components/index.js'
</script>

<template>
  <div class="px-3 py-3">
    <!--    <Banner/>-->
    <UIPageTitle :title="$t('content.profile')" />
    <Tabs />
  </div>
</template>
