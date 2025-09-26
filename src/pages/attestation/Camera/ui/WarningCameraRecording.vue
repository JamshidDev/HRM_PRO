<script setup>
const emits = defineEmits(['onContinueEv'])
</script>

<template>
<div class="grid grid-cols-12">
      <div class="col-span-12 text-danger">
        <p class="leading-[1.2] !mb-2">1. {{$t('cameraPage.warningTextOne')}}</p>
        <p class="leading-[1.2] !mb-2">2. {{$t('cameraPage.warningTextTwo')}}</p>
        <p class="leading-[1.2] !mb-2">3. {{$t('cameraPage.warningTextThree')}}</p>
        <n-button @click="emits('onContinueEv')" type="primary" class="!w-full !mt-6">{{$t('content.continue')}}</n-button>
      </div>
</div>
</template>
