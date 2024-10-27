<script setup>
import {navigations} from "../data/navigations"
import {ChevronDown12Regular} from "@vicons/fluent"
import {useRoute, useRouter} from "vue-router";
const router = useRouter()
const route = useRoute()

const emits = defineEmits(['onChange', 'onOpen'])

const onClick = () => {
  emits('onChange')
}


const showPanel = ref(true)
const menuPath = ref(null)
const currentPath = ref(null)
const collapse = ref(false)

const controlCollapse = ()=>{
  collapse.value = !collapse.value
}

const nextPanel = (path)=>{
  pushFirstMenu(path)
  menuPath.value = path
  emits('onOpen')
  showPanel.value =false
  setTimeout(()=>{
    showPanel.value = true
  },350)
}

const onChangePath = (path)=>{
  router.push(path)
}





const miniMenu = computed(()=>{
  return navigations.map((v)=>({
    index:v.index,
    label:v.label,
    path:v.path,
    icon:v.icon,
  }))
})

const panelMenu = computed(()=>{
  let index = navigations.findIndex((v=>v.path === menuPath.value))
  return (index === -1)? navigations[0].children : navigations[index].children
})

const isComboxMenu =(path)=>{
  if(route.path.includes(path)){
    menuPath.value = path
  }
  return route.path.includes(path)
}

const isCurrentPath = (path)=>{
  return route.path===path
}

const pushFirstMenu = (path)=>{
  let index = navigations.findIndex((v=>v.path === path))
  router.push(navigations[index].children[0].path)
}


</script>

<template>
  <div class="sidebar-content">
    <div class="mini-content">
      
      <div class="logo-content">
        <img src="/public/logo.png" alt="">
      </div>
      
      <template v-for="item in miniMenu" :key="item">
          <div
              :class="[isComboxMenu(item.path) && 'active-mini-content']"
              class="main-menu-item"
              @click="nextPanel(item.path)">
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






            <template v-if="item?.children && item.children.length>0">
              <div class="panel-item-multiple">
                  <div class="panel-header" @click="controlCollapse">
                    <div class="item-icon">
                      <i :class="item.icon"></i>
                    </div>
                    <div class="item-title">
                      <span>{{item.label}}</span>
                      <n-icon size="18">
                        <ChevronDown12Regular/>
                      </n-icon>
                    </div>
                  </div>
                  <div class="panel-body pl-2"
                       :style="{height:collapse? (item.children.length * 38)+'px' : '0px'}"
                  >
                    <div v-for="subMenu in item.children"
                        class="panel-item">
                      <div class="item-icon">
                        <i :class="subMenu.icon"></i>
                      </div>
                      <div class="item-title">{{subMenu.label}}</div>
                    </div>

                  </div>
              </div>
            </template>







            <template v-else>
              <div
                  @click="onChangePath(item.path)"
                  class="panel-item-single"
                  :class="[isCurrentPath(item.path) && 'active-panel-item-single']"
              >
                <div class="item-icon">
                  <i :class="item.icon"></i>
                </div>
                <div class="item-title">
                  <span>{{item.label}}</span>
                </div>
              </div>
            </template>


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