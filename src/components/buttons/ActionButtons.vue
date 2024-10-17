<script setup>
import {Edit16Regular, Delete28Regular, AppRecent24Regular} from "@vicons/fluent"

const props = defineProps({
  visibleViewBtn:{
    type: Boolean,
    default:false,
  },
  visibleEditBtn:{
    type: Boolean,
    default:true,
  },
  visibleDeleteBtn:{
    type: Boolean,
    default:true,
  },
  data:{
    type: Object,
    default:null,
  },
  loadingDelete:{
    type: Boolean,
    default:false,
  },
  loadingEdit:{
    type: Boolean,
    default:false,
  },
  loadingView:{
    type: Boolean,
    default:false,
  },

})

const emits = defineEmits(["onEdit", "onDelete", "onView", "onNegDelete" ])


const onEdit = ()=>{
  emits("onEdit", props.data)
}

const onView = ()=>{
  emits("onView", props.data)
}

const handlePositiveClick = ()=>{
  emits("onDelete", props.data)
}

const handleNegativeClick = ()=>{
  emits("onNegDelete", props.data)
}
</script>

<template>
<div class="flex gap-2 items-center">

  <slot name="first"></slot>

  <n-button
      @click="onView"
      v-if="visibleViewBtn"
      :loading="loadingView"
      strong
      secondary
      circle
      type="success"
  >
    <template #icon>
      <n-icon><AppRecent24Regular /></n-icon>
    </template>
  </n-button>

  <n-button
      @click="onEdit"
      :loading="loadingEdit"
      v-if="visibleEditBtn"
      strong
      secondary
      circle
      type="info">
    <template #icon>
      <n-icon><Edit16Regular /></n-icon>
    </template>
  </n-button>

  <n-popconfirm
      @positive-click="handlePositiveClick"
      @negative-click="handleNegativeClick"
      :negative-text="$t('content.no')"
      :positive-text="$t('content.yes')"
  >    <template #trigger>
    <n-button
        ref="confirm_btn"
        v-if="visibleDeleteBtn"
        :loading="loadingDelete"
        strong
        secondary
        circle
        type="error">
      <template #icon>
        <n-icon><Delete28Regular /></n-icon>
      </template>
    </n-button>
  </template>
    {{$t('content.confirmDelete')}}
  </n-popconfirm>



  <slot name="last"></slot>

</div>
</template>

<style scoped>

</style>