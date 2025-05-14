<script setup>
import {useAppStore} from "@/store/modules/index.js"
import {WeatherMoon28Filled, WeatherSunny32Filled} from "@vicons/fluent"

const store = useAppStore()
</script>

<template>
  <n-button @click="()=>{
      store.themeSwitch = !store.themeSwitch;
      store.changeTheme()
    }"
    circle
    quaternary
    size="large"
            class="relative"
  >
    <template #icon>
      <n-icon class="text-primary mode-button !absolute" :class="{'mode-button-active': !store.themeSwitch}">
        <WeatherMoon28Filled/>
      </n-icon>
      <n-icon class="text-warning mode-button !absolute" :class="{'mode-button-active': store.themeSwitch}">
        <WeatherSunny32Filled/>
      </n-icon>
    </template>
  </n-button>
  <!--  <n-switch v-model:value="store.themeSwitch" size="large" @update:value="store.changeTheme">-->
  <!--    <template #checked-icon>-->
  <!--      <n-icon class="text-primary">-->
  <!--        <WeatherMoon28Filled/>-->
  <!--      </n-icon>-->
  <!--    </template>-->
  <!--    <template #unchecked-icon>-->
  <!--      <n-icon class="text-warning">-->
  <!--        <WeatherSunny32Filled/>-->
  <!--      </n-icon>-->
  <!--    </template>-->
  <!--  </n-switch>-->
</template>

<style scoped lang="scss">
.mode-button {
  transform: scale(0);
  transition: all .3s ease;
  opacity: 0;

  &-active {
    transform: scale(1);
    opacity: 1;
  }
}
</style>