<script setup>
import {ArrowSort16Regular, ArrowSortDownLines16Regular, Record24Regular, Record32Filled} from "@vicons/fluent"

const props = defineProps({
  orderNumber:{
    type:Number,
    default:0
  }
})
</script>

<template>
<div>
    <n-icon size="16">
      <template v-if="orderNumber===0">
        <ArrowSort16Regular/>
      </template>
      <template v-else-if="orderNumber===-1">
        <ArrowSortDownLines16Regular/>
      </template>
      <template v-else-if="orderNumber===1">
        <ArrowSortDownLines16Regular class="rotate-180"/>
      </template>

    </n-icon>


</div>
</template>
