<script setup>
import {useServiceStore} from "@/store/modules/serviceStore.js";
import { StoreMicrosoft16Regular, Settings48Regular, Apps28Filled, BoxCheckmark20Regular } from '@vicons/fluent'
const store = useServiceStore()
</script>

<template>
  <n-steps :current="store.currentStep" :status="store.stepStatus">
    <n-step
        :title="$t(`service.step.one`)"
    >
      <template #icon>
        <n-icon>
          <StoreMicrosoft16Regular />
        </n-icon>
      </template>
    </n-step>
    <n-step
        :title="$t(`service.step.two`)"
    >
      <template #icon>
        <n-icon>
          <Settings48Regular />
        </n-icon>
      </template>
    </n-step>
    <n-step
        :title="$t(`service.step.three`)"
    >
      <template #icon>
        <n-icon>
          <Apps28Filled />
        </n-icon>
      </template>
    </n-step>
    <n-step
        :title="$t(`service.step.four`)"
    >
      <template #icon>
        <n-icon>
          <BoxCheckmark20Regular />
        </n-icon>
      </template>
    </n-step>
  </n-steps>
</template>

<style scoped>

</style>