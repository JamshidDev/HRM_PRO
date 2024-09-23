<script setup>
import {Search48Filled} from '@vicons/fluent'
const search = ref(null)
</script>

<template>
    <div class="grid grid-cols-4">
      <n-input
          v-model:value="search"
          type="text"
          placeholder="Qidiruv..."

      >
        <template #suffix>
          <n-icon :component="Search48Filled" />
        </template>
      </n-input>
    </div>
</template>

<style scoped>

</style>