<script setup>
import {useAppStore} from "@/store/modules/index.js"
import {WeatherMoon28Filled, WeatherSunny32Filled} from "@vicons/fluent"

const store = useAppStore()
</script>

<template>
  <n-switch v-model:value="store.themeSwitch" size="large" @update:value="store.changeTheme">
    <template #checked-icon>
      <n-icon class="text-primary">
        <WeatherMoon28Filled/>
      </n-icon>
    </template>
    <template #unchecked-icon>
      <n-icon class="text-warning">
        <WeatherSunny32Filled/>
      </n-icon>
    </template>
  </n-switch>
</template>

<style scoped>

</style>