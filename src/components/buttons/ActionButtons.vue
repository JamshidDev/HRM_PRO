<script setup>
import {Edit16Regular, Delete28Regular, Screenshot20Regular, AddCircle32Regular} from "@vicons/fluent"

const props = defineProps({
  visibleAddBtn:{
    type: Boolean,
    default:false,
  },
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
  loadingAdd:{
    type: Boolean,
    default:false,
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

const emits = defineEmits(["onEdit", "onDelete", "onView", "onNegDelete", "onAdd" ])


const onAdd = ()=>{
  emits("onAdd", props.data)
}

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
      size="small"
      @click="onAdd"
      v-if="visibleAddBtn"
      :loading="loadingAdd"
      strong
      ghost
      type="success"
  >
    <template #icon>
      <n-icon size="26"><AddCircle32Regular /></n-icon>
    </template>
  </n-button>

  <n-button
      size="small"
      @click="onView"
      v-if="visibleViewBtn"
      :loading="loadingView"
      strong
      ghost
      type="success"
  >
    <template #icon>
      <n-icon size="22"><Screenshot20Regular /></n-icon>
    </template>
  </n-button>

  <n-button
      size="small"
      @click="onEdit"
      :loading="loadingEdit"
      v-if="visibleEditBtn"
      strong
      ghost
      type="info">
    <template #icon>
      <n-icon><Edit16Regular /></n-icon>
    </template>
  </n-button>

  <n-popconfirm
      v-if="visibleDeleteBtn"
      @positive-click="handlePositiveClick"
      @negative-click="handleNegativeClick"
      :negative-text="$t('content.no')"
      :positive-text="$t('content.yes')"
  >    <template #trigger>
    <n-button
        size="small"
        ref="confirm_btn"
        :loading="loadingDelete"
        ghost
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