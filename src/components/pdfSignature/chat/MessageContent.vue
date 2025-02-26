<script setup>
import i18n from "@/i18n/index.js"
import {NIcon} from "naive-ui"
import {Delete16Regular, Edit16Regular} from "@vicons/fluent"
const {t} = i18n.global
const props = defineProps({
  message:{
    type:String,
    default:''
  },
  author:{
    type:Boolean,
    default:false
  },
  fullName:{
    type:String,
    default:''
  },
  avatar:{
    type:String,
    default:''
  },
  time:{
    type:String,
    default:''
  },
})

const emits = defineEmits(['onDelete'])

const showDropdown = ref(false)
const x = ref(0)
const y = ref(0)
const options = [
  {
    icon: renderIcon(Delete16Regular),
    label:t('content.delete'),
    key: "delete"
  },
]

function renderIcon(icon) {
  return () => {
    return h(NIcon, null, {
      default: () => h(icon)
    })
  }
}

const handleContextMenu=(e)=> {
  e.preventDefault();
  showDropdown.value = false;
  nextTick().then(() => {
    showDropdown.value = true;
    x.value = e.clientX;
    y.value = e.clientY;
  });
}
const onClickOutside =()=> {
  showDropdown.value = false;
}

const handleSelect =(key)=>{
  showDropdown.value = false;
  if(options[0].key === key){
    emits('onDelete')
  }
}

const initialObserver = ()=>{
  const options = {
    threshold: 0.9,
  }
  const callBack = (entries, observer)=>{
    entries.forEach((v)=>{
      // const index = v.target.getAttribute("data-index");
      console.log((Number(index)+1) + ' - '+  v.isIntersecting )
    })
  }
  const observer = new IntersectionObserver(callBack, options)
  document.querySelectorAll(".chat-message-element").forEach((el) => observer.observe(el))
}


onMounted(()=>{
  initialObserver()
})

</script>

<template>
<div class="flex w-full my-2" :class="[author && 'justify-end']">

  <template v-if="author">
    <div class="flex gap-x-2 justify-end" >

      <div>
        <div class="text-xs font-medium text-surface-600 flex justify-end"><span class="text-[12px] font-normal text-surface-400 mr-1"> {{time}} </span> {{fullName}}</div>
        <div class="w-full flex justify-end">
          <div @contextmenu="handleContextMenu($event)" class="border  max-w-[280px] text-surface-600 rounded-lg text-sm px-2 py-1 border-surface-line inline-block bg-surface-section">
            <pre class="font-poppins text-wrap">{{message}}</pre>
          </div>
        </div>
      </div>
      <div class="w-[40px] ui__avatar-border">
        <n-avatar
            class="mr-2 mt-4"
            circle
            :src="avatar"
        />
      </div>
    </div>
  </template>


  <template v-else>
    <div class="flex gap-x-2">
      <div class="w-[40px] ui__avatar-border">
        <n-avatar
            class="ml-2 mt-4"
            circle
            :src="avatar"
        />
      </div>
      <div>
        <div class="text-xs font-medium text-surface-600"> {{fullName}} <span class="text-[12px] font-normal text-surface-400">{{time}}</span></div>
        <div class="border  max-w-[280px] text-surface-600 rounded-lg text-sm px-2 py-1 border-surface-line inline-block bg-surface-section">
          <pre class="font-poppins text-wrap">{{message}}</pre>
        </div>
      </div>
    </div>
  </template>
  <n-dropdown
      placement="bottom-start"
      trigger="manual"
      :x="x"
      :y="y"
      :options="options"
      :show="showDropdown"
      :on-clickoutside="onClickOutside"
      @select="handleSelect"
  />

</div>
</template>

<style scoped>

</style>