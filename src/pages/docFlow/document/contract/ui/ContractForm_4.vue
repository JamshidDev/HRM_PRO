<script setup>
import {CheckmarkCircle32Filled} from "@vicons/fluent"
</script>

<template>
  <div class="w-full flex flex-col ">
    <n-icon size="60" class="mx-auto text-success">
      <CheckmarkCircle32Filled/>
    </n-icon>
    <h3 class="text-center text-lg mt-2">{{$t('contractPage.succeedText')}}</h3>
  </div>
</template>