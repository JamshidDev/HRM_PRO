<script setup>

const login = ref(null)
const password = ref(null)
const loading = ref(false)

</script>

<template>
<div class="flex justify-center items-center h-screen w-full">
  <n-form class="flex flex-col border-surface-line xl:w-[400px]  w-[360px]">
    <div class="grid grid-cols-1">
      <div class="flex justify-center">
        <img class="w-[80px] h-[80px]" src="@/assets/images/logo/logo.png" alt="">
      </div>
      <span class="text-center font-bold text-3xl mb-[20px]">{{$t(`loginPage.title`)}}</span>
    </div>
    <n-form-item :label="$t(`loginPage.email`)">
      <n-input
          type="text"
          :placeholder="$t(`loginPage.email`)"
      />
    </n-form-item>
    <n-form-item :label="$t(`loginPage.password`)">
      <n-input
          type="text"
          :placeholder="$t(`loginPage.password`)"
      />
    </n-form-item>
    <n-button type="info">{{$t(`loginPage.login`)}}</n-button>
    <span class="text-sm mt-[20px]">{{$t(`loginPage.doYouHaveAccount`)}} <span class="text-primary">{{$t(`loginPage.singUp`)}}</span></span>

  </n-form>

</div>
</template>

<style scoped>

</style>