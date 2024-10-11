<script setup>

const props = defineProps({
  title:{
    type:string,
    default:null,
  },

})
</script>

<template>
  <n-drawer
      v-model:show="active"
      :default-width="502"
      placement="right"
      resizable
  >
    <n-drawer-content>
      <template #header>
        {{title}}
      </template>
    </n-drawer-content>
  </n-drawer>
</template>

<style scoped>

</style>