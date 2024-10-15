<script setup>

const props = defineProps({
  title:{
    type:String,
    default:null,
  },
})

const visible = defineModel('visible', {type:Boolean, default:false })
</script>

<template>
  <n-drawer
      v-model:show="visible"
      :default-width="502"
      placement="right"
      resizable
      class="ui-drawer"
  >
    <n-drawer-content>
      <template #default>
        <div class="w-full flex justify-between">
          <span>Ttitle</span>
          <span>Close</span>
        </div>


      </template>
    </n-drawer-content>
  </n-drawer>
</template>

<style scoped>

</style>