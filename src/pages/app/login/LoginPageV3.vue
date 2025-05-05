<script setup>

</script>

<template>
  <div class="w-full min-h-screen">
    <div class="grid grid-cols-12 w-full h-full">
      <div class="col-span-6 flex flex-col h-full">
            <div class="mx-auto w-[600px] mt-[30px]">
              <div class="flex items-center gap-4">
                <img src="/logo.svg" class="h-[40px]" alt="App logo" />
                <p class="font-bold uppercase text-3xl text-dark">HRM PRO</p>
              </div>
            </div>
      </div>
      <div class="col-span-6 p-4">
        <div
            class="w-full rounded-lg bg-linear-to-tr from-[#4253ef] to-[#4253ef]"
            style="height: calc(100vh - 32px)"
        >

        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>

.bg-overall {
  background-image: url('@/assets/images/content/login-overall.png');
  mix-blend-mode:luminosity;
  background-size: cover;

  &:before{
    content: '';
    position: absolute;
    background-color: rgba(19, 4, 36, 0.19);
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    z-index: 1;
  }
}



</style>