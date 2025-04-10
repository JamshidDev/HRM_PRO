<script setup>
import {Edit32Regular, Delete20Regular, OpenFolder24Filled, Eye16Regular, ArrowCircleDown48Regular, MoreHorizontal48Filled } from "@vicons/fluent"
const {t} = i18n.global
import {UIDConfirm} from "@/components/index.js"
import i18n from "@/i18n/index.js"
import Utils from "@/utils/Utils.js"
import UIHelper from "@/utils/UIHelper.js"
const visible = ref(false)
const props = defineProps({
  size: {
    type: String,
    default: "small"
  },
  showDelete:{
    type: Boolean,
    default:true,
  },
  showEdit:{
    type: Boolean,
    default:false,
  },
  showView:{
    type: Boolean,
    default:false,
  },
  showOpen:{
    type: Boolean,
    default:false,
  },
  showAttachment:{
    type: Boolean,
    default:false,
  },
  showDownload:{
    type: Boolean,
    default:false,
  },
  data:{
    type: Object,
    default:null,
  },
  deleteWarning:{
    type: String,
    default:null,
  },
  extraOptions:{
    type: Array,
    default: [],
  },
  loading:{
    type: Boolean,
    default: false
  }
})

const emits = defineEmits(["selectEv"])




const options = computed(()=>{
  return [
    {
      label: t('content.open'),
      key: Utils.ActionTypes.open,
      icon: UIHelper.renderIcon(OpenFolder24Filled),
      visible:props.showOpen
    },
    {
      label: t('content.attachment'),
      key: Utils.ActionTypes.attachment,
      icon: UIHelper.renderIcon(OpenFolder24Filled),
      visible:props.showAttachment
    },
    {
      label: t('content.view'),
      key: Utils.ActionTypes.view,
      icon: UIHelper.renderIcon(Eye16Regular),
      visible:props.showView
    },
    {
      label: t('content.edit'),
      key: Utils.ActionTypes.edit,
      icon: UIHelper.renderIcon(Edit32Regular),
      visible:props.showEdit,
    },
    {
      label: t('content.download'),
      key: Utils.ActionTypes.download,
      icon: UIHelper.renderIcon(ArrowCircleDown48Regular),
      visible:props.showDownload,
    },
    {
      label: t('content.delete'),
      key: Utils.ActionTypes.delete,
      icon: UIHelper.renderIcon(Delete20Regular),
      visible:props.showDelete,
    }
  ].filter((v)=>v.visible)
})

const onSelect = (v)=>{
  if(v === Utils.ActionTypes.delete){
    visible.value = true
  }else{
    emits('selectEv', {
      data:props.data,
      key:v,
    })
  }
}

const onDelete = ()=>{
  visible.value = false
  emits('selectEv', {
    data:props.data,
    key:Utils.ActionTypes.delete,
  })
}
</script>

<template>
  <div class="flex gap-2 items-center justify-center relative" @click.stop>
    <n-spin v-if="loading" size="small" />
    <n-dropdown
        size="small"
        :options="[
          ...options,
          ...extraOptions.map(i=>({...i, icon: UIHelper.renderIcon(i.icon)}))
        ]"
        trigger="click"
        @select="onSelect"
    >
      <n-button
          :style="{opacity: loading ? 0 : 1}"
          :disabled="loading"
          tertiary
          :size="size"
          style="width: 30px"
      >
        <template #icon>
<!--          <i class='bx bx-dots-vertical-rounded text-2xl'></i>-->
          <MoreHorizontal48Filled class="!text-4xl"/>
        </template>
      </n-button>
    </n-dropdown>
    <UIDConfirm v-model:visible="visible" type="warning">
      <div class="text-lg text-center">
        {{deleteWarning || $t('content.deleteWarning')}}
      </div>

      <template #action>
        <div class="grid grid-cols-12 gap-2">
          <div class="col-span-6">
            <n-button
                secondary
                @click="visible = false"
                type="error"
                style="width: 100%">{{$t('content.no')}}
            </n-button>
          </div>
          <div class="col-span-6">
            <n-button
                secondary
                @click="onDelete"
                type="primary"
                style="width: 100%"
            >{{$t('content.yes')}}</n-button>
          </div>
        </div>
      </template>
    </UIDConfirm>
  </div>
</template>

<style scoped>

</style>