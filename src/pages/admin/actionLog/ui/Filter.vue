<script setup>
import {UIPageFilter, UIStructure} from "@/components/index.js"
import {useComponentStore, useActionLogStore} from "@/store/modules/index.js"
const compStore = useComponentStore()
const store = useActionLogStore()

const tree = ref([])

onMounted(()=>{
  store._getActionLog()
})
</script>

<template>
  <UIPageFilter
      :show-add-button="false"
  >
    <template #filterContent>
      <label class="mt-3 text-sm">{{$t('actionLog.table.structure')}}</label>
      <UIStructure
          :modelV="tree"
          @updateModel="(v)=>tree =v"
      />
    </template>
  </UIPageFilter>
</template>

<style scoped>

</style>