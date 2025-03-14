<script setup>
import {CheckmarkCircle32Filled} from "@vicons/fluent"
</script>

<template>
<div class="w-full flex flex-col ">
  <n-icon size="60" class="mx-auto text-success">
    <CheckmarkCircle32Filled/>
  </n-icon>
  <h3 class="text-center text-lg mt-2">{{$t('applicationPage.succeedApplication')}}</h3>
  <h3 class="text-center text-gray-400 mb-10">{{$t('applicationPage.applicationTime')}}</h3>

</div>
</template>