<script setup>
import UIHelper from "@/utils/UIHelper.js"
const searchModel = ref('')
const selectAll = ref(false)
const selectedOptions = ref([])

const valueModel = defineModel('value', {type:[Array, Number, String, null], default:null})

const props = defineProps({
  value:{
    type:[Array, Number, String, null],
    default:null,
    required:true,
  },
  options:{
    type:Array,
    default:[],
    required:true,
  },
  valueField:{
    type:String,
    default:"id",
  },
  labelField:{
    type:String,
    default:'name',
  },
  renderLabel:{
    type:Function,
    default:UIHelper.selectRender.label,
  },
  renderTag:{
    type:Function,
    default:UIHelper.selectRender.value,
  },
  loading:{
    type:Boolean,
    default:false,
  },
  disabled:{
    type:Boolean,
    default:false,
  },
  multiple:{
    type:Boolean,
    default:false,
  },
  maxTagCount:{
    type:Number,
    default:1,
  },
  query:{
    type:String,
    default:undefined,
  },
  pinSelect:{
    type:Boolean,
    default:false,
  },
  multipleSearch:{
    type:Boolean,
    default:false,
  },
  clearable:{
    type:Boolean,
    default:false,
  },
  totalCount:{
    type:Number,
    default:0,
  }


})

const emits = defineEmits(['onScroll', 'updateValue', 'onSearch', 'onScrollEv', 'updateShow'])

const onCloseEv = (v)=>{
  valueModel.value =props.multiple? valueModel.value.filter(x=>x!==v.id) : null
}

let timer = null
const onSearchEv = ()=>{
  if(props.query === undefined) return
  clearTimeout(timer)
  timer = setTimeout(()=>{
    emits('onSearch', searchModel.value)
  },1000)
}



const computedOption =computed(()=>{
  if(props.query !== undefined){
    return props.options
  }

  let query=searchModel.value?.toString()?.trim()?.toLowerCase()
  if(!query){
    return props.options
  }

  selectedOptions.value =props.multiple? [...props.options].filter(v=>valueModel.value.includes(v.id)) : [...props.options].filter(v=>valueModel.value === v.id)

  const filtered = props.multipleSearch? props.options.filter(v=>v?.name?.toString()?.toLowerCase()?.includes(query) || v?.position?.toString()?.toLowerCase()?.includes(query)) : props.options.filter(v=>v?.name?.toString()?.toLowerCase()?.includes(query))

  return Array.from(new Map([...filtered, ...selectedOptions.value].map(v => [v.id, v])).values())

})

watchEffect(()=>{
  if(props.multiple){
    selectAll.value = computedOption.value.length === valueModel.value.length && computedOption.value.length>0
  }
  searchModel.value = props.query
})

const onUpdateCheck = (v)=>{
  valueModel.value = v? computedOption.value.map(x=>x[props.valueField]):[]
}

const onScrollEv = (e)=>{
  emits('onScroll',e)
  if(props.totalCount === 0) return
  const currentTarget = e.currentTarget;
  if(currentTarget.scrollTop + currentTarget.offsetHeight >= currentTarget.scrollHeight && !props.loading && props.totalCount>props.options.length){
    emits('onScrollEv')
  }
}

onMounted(()=>{
  searchModel.value = props.query
})


</script>

<template>

  <n-select
      :clearable="clearable"
      @scroll="onScrollEv"
      @update:show="(e)=>emits('updateShow',e)"
      :multiple="multiple"
      v-model:value="valueModel"
      :options="computedOption"
      :loading="loading"
      :disabled="disabled"
      :render-label="renderLabel"
      :render-tag="renderTag"
      :label-field="labelField"
      :value-field="valueField"
      :max-tag-count="maxTagCount"
      :reset-menu-on-options-change="false"
      :virtual-scroll="true"


  >
    <template #header>
      <div class="w-full flex">
        <n-input
            clearable
            v-model:value="searchModel"
            class="w-full skip-format"
            :placeholder="$t(pinSelect? 'content.pin' : 'content.search')"
            :on-keyup="onSearchEv"
            @paste="onSearchEv"
            @keydown.stop
            @clear="onSearchEv"
            v-mask="pinSelect? '####-####-####-##' : undefined"
        />
      </div>
    </template>
    <template v-if="multiple" #action>
      <n-checkbox @update:checked="onUpdateCheck" v-model:checked="selectAll">
        <span class="text-secondary text-xs">{{$t('content.selectAll')}} - ({{options.length}})</span>
      </n-checkbox>
    </template>
  </n-select>
</template>