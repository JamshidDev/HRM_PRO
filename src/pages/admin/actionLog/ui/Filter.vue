<script setup>
import {UIPageFilter} from "@/components/index.js"
import {useComponentStore, useActionLogStore} from "@/store/modules/index.js"
const compStore = useComponentStore()
const store = useActionLogStore()
</script>

<template>
  <UIPageFilter
      :show-add-button="false"
  >
    <template #filterContent>
      <n-select v-model:value="store.organization" :options="compStore.organizationList" />
    </template>
  </UIPageFilter>
</template>

<style scoped>

</style>