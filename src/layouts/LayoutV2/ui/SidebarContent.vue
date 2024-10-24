<script setup>
import {navigations} from "../data/navigations"

const emits = defineEmits(['onChange', 'onOpen'])

const onClick = () => {
  emits('onChange')
}


const showPanel = ref(true)
const navigationData = ref([])
const menuIndex = ref(1)
const currentPath = ref(null)

const nextPanel = (idx)=>{
  menuIndex.value = idx
  emits('onOpen')
  showPanel.value =false
  setTimeout(()=>{
    showPanel.value = true
  },350)
}

const onChangePath = (path)=>{
  currentPath.value =path
}





const miniMenu = computed(()=>{
  return navigationData.value.map((v)=>({
    index:v.index,
    label:v.label,
    path:v.path,
    icon:v.icon,
  }))
})

const panelMenu = computed(()=>{
  let index = navigationData.value.findIndex((v=>v.index === menuIndex.value))
  return (index === -1)? [] : navigationData.value[index].children
})



onMounted(()=>{
  navigationData.value = navigations
})

</script>

<template>
  <div class="sidebar-content">
    <div class="mini-content">
      
      <div class="logo-content">
        <img src="/public/logo.png" alt="">
      </div>
      
      <template v-for="item in miniMenu" :key="item">
          <div
              :class="[item.index === menuIndex && 'active-mini-content']"
              class="main-menu-item"
              @click="nextPanel(item.index)">
            <i :class="item.icon"></i>
          </div>
      </template>

    </div>
    <div class="panel-content bg-gradient--v2">

      <transition name="slide-right" mode="out-in">
        <div v-if="showPanel">
          <div class="image-content">
            <img class="image_element" src="/public/hrm.png" alt="">
          </div>
          <template v-for="item in panelMenu" :key="item">
            <div
                @click="onChangePath(item.path)"
                class="panel-item-single"
                :class="[item.path === currentPath && 'active-panel-item-single']"
            >
              <div class="item--icon">
                <i :class="item.icon"></i>
              </div>
              <div class="item-title">
                <span>{{item.label}}</span>
              </div>
            </div>
          </template>
        </div>
      </transition>



    </div>


    <div @click="onClick" class="control-btn">
      <i class='bx bx-chevrons-left'></i>
    </div>
  </div>
</template>

<style scoped>

.slide-right-enter-active {
  transition: all 0.3s ease;
}

.slide-right-leave-active {
  transition: all 0.3s ease;
}

.slide-right-enter-from {
  transform: translateX(-20px);

  opacity: 0;
}

.slide-right-enter-to {
  transform: translateX(0px);
  opacity: 1;
}

.slide-right-leave-from {
  transform: translateX(0px);
  opacity: 1;
}
.slide-right-leave-to{
  transform: translateX(20px);
  opacity: 0;
}
</style>