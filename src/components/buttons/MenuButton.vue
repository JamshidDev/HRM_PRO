<script setup>
import {Edit32Regular, Delete20Regular, OpenFolder24Filled, Eye16Regular, ArrowCircleDown48Regular} from "@vicons/fluent"
const {t} = i18n.global
import {UIDConfirm} from "@/components/index.js"
import {NIcon} from "naive-ui"
import i18n from "@/i18n/index.js"
const visible = ref(false)
const props = defineProps({
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

})

const emits = defineEmits(["selectEv"])


function renderIcon(icon) {
  return () => {
    return h(NIcon, null, {
      default: () => h(icon),
    })
  }
}

const options = computed(()=>{
  return [
    {
      label: t('content.open'),
      key: 'open',
      icon: renderIcon(OpenFolder24Filled),
      visible:props.showOpen
    },
    {
      label: t('content.view'),
      key: 'view',
      icon: renderIcon(Eye16Regular),
      visible:props.showView
    },
    {
      label: t('content.edit'),
      key: 'edit',
      icon: renderIcon(Edit32Regular),
      visible:props.showEdit,
    },
    {
      label: t('content.download'),
      key: 'download',
      icon: renderIcon(ArrowCircleDown48Regular),
      visible:props.showDownload,
    },
    {
      label: t('content.delete'),
      key: 'delete',
      icon: renderIcon(Delete20Regular),
      visible:props.showDelete,
    }
  ].filter((v)=>v.visible)
})

const onSelect = (v)=>{
  if(v === 'delete'){
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
    key:'delete',
  })
}
</script>

<template>
  <div class="flex gap-2 items-center justify-center">
    <n-dropdown
        size="small"
        :options="options"
        trigger="click"
        @select="onSelect"
    >
      <n-button
          tertiary
          size="small"
          style="width: 30px"
      >
        <template #icon>
          <i class='bx bx-dots-vertical-rounded text-2xl'></i>
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
                @click="visible = false"
                type="error"
                style="width: 100%">{{$t('content.no')}}
            </n-button>
          </div>
          <div class="col-span-6">
            <n-button
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