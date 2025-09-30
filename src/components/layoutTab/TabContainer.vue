<script setup>
import {HeaderTabButton} from "@/components/layoutTab/index.js"
import {Star16Regular, MoreVertical24Regular} from "@vicons/fluent"
import UIHelper from "@/utils/UIHelper.js"

const tabContainer = ref(null)
let hiddenTabs = ref([])
const moreButtonWidth = 80

const activeTab = defineModel('value', {type:String, default:null })

const props = defineProps({
  options:{
    type:Array,
    default:[]
  },
})

const emits = defineEmits(['onSelect'])

const options = new Array(5).fill(null).map((v, index)=>{
  return {
    order:index,
    name:'Pensionerlar ' + index,
    icon:markRaw(Star16Regular),
    key:`key_${index}`,
  }
})

const dropdownOptions = computed(()=>{
  return hiddenTabs.value.map((v)=>({
    ...v,
    icon:UIHelper.renderIcon(v.icon)
  })).sort((a,b)=>a.order - b.order)
})


const updateTab = ()=>{
  if(!tabContainer.value) return

  const buttons = tabContainer.value.querySelectorAll('.tab-buttons')

  const containerWidth = Math.ceil(tabContainer.value.clientWidth)
  let usedWidth = 0

  buttons.forEach((tab)=>{

    tab.style.display = 'inline-flex'
    const key = tab.getAttribute("data-key")
    const tabWidth = Math.ceil(tab.getBoundingClientRect().width)

    const expressionWidth = usedWidth + tabWidth < containerWidth - moreButtonWidth
    tab.style.display = expressionWidth? 'inline-flex' : 'none'
    const callback = expressionWidth? removeOptionByKey : addOptionByKey
    callback(key)

    usedWidth = usedWidth + tabWidth
  })
}

const addOptionByKey = (key)=>{
  const allOptionKeys = hiddenTabs.value.map(v=>v.key)
  if(allOptionKeys.includes(key)) return
  const option = options.find((item)=>item.key === key)
  hiddenTabs.value.push(option)
}

const removeOptionByKey = (key)=>{
  hiddenTabs.value = hiddenTabs.value.filter((item)=>item.key !== key)
}

const onSelectEv = (key)=>{
    emits('onSelect', key)
}









let resizeObserver = null
let resizeTimer = null

const handleResize = ()=>{
  clearTimeout(resizeTimer)
  resizeTimer =setTimeout(updateTab(), 150)

}

onMounted(()=> {
  updateTab()
  const parent = tabContainer.value.parentElement || tabContainer.value
  resizeObserver = new ResizeObserver(() => {
    handleResize()
  })
  resizeObserver.observe(parent)
})

onBeforeUnmount(() => {
  if (resizeObserver) resizeObserver.disconnect()
  clearTimeout(resizeTimer)
})


</script>

<template>
  <div ref="tabContainer" class="w-full overflow-hidden flex h-[40px] border-b bg-surface-section border-surface-line relative">
    <template v-for="item in options" :key="item">
      <HeaderTabButton @click="onSelectEv(item.key)" :data-key="item.key">
        <n-icon size="20">
          <component :is="item.icon"/>
        </n-icon>
        {{item.name}}
      </HeaderTabButton>
    </template>

<!--    More button -->
    <template v-if="dropdownOptions.length>0">
      <n-dropdown
          trigger="click"
          :options="dropdownOptions"
          @select="onSelectEv"
          label-field="name"
      >
        <div class="min-w-[80px] w-full text-secondary cursor-pointer border-surface-line h-full right-0 bottom-0 flex justify-center items-center">
          {{$t('content.more')}}
          <n-icon size="20">
            <MoreVertical24Regular/>
          </n-icon>
        </div>
      </n-dropdown>
    </template>
  </div>
</template>
